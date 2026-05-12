import os
import psycopg2
from psycopg2.extras import RealDictCursor
from pgvector.psycopg2 import register_vector
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import uvicorn
from dotenv import load_dotenv
import boto3
import json

# Point to the actual location of the .env file in your backend folder
load_dotenv("../backend/.env")  

# Configuration
DB_HOST = os.getenv("DB_HOST", "localhost")
DB_NAME = os.getenv("DB_NAME", "asset_management") 
# The backend .env uses DB_USERNAME, not DB_USER
DB_USER = os.getenv("DB_USERNAME", "postgres") 
DB_PASSWORD = os.getenv("DB_PASSWORD", "1234") 
DB_PORT = os.getenv("DB_PORT", "5432")

# Initialize FastAPI
app = FastAPI(title="nexShop AI Brain")

# Initialize SageMaker Client
print("Initializing SageMaker client...")
sagemaker_client = boto3.client('sagemaker-runtime', region_name=os.getenv('AWS_REGION', 'us-east-1'))
SAGEMAKER_ENDPOINT_NAME = os.getenv('SAGEMAKER_ENDPOINT_NAME', 'all-minilm-l6-v2-endpoint')
print(f"Configured to use SageMaker endpoint: {SAGEMAKER_ENDPOINT_NAME}")

def get_embeddings_from_sagemaker(texts):
    if isinstance(texts, str):
        texts = [texts]
    
    # Format required by HuggingFace Inference DLC
    payload = {"inputs": texts}
    
    response = sagemaker_client.invoke_endpoint(
        EndpointName=SAGEMAKER_ENDPOINT_NAME,
        ContentType='application/json',
        Body=json.dumps(payload)
    )
    result = json.loads(response['Body'].read().decode())
    
    # Extract the [CLS] token (the 1st token) to get a 1-D sentence embedding
    # We cannot use np.array(result) because sentences of different lengths produce inhomogeneous lists.
    embeddings = []
    for sent_out in result:
        if isinstance(sent_out[0], list) and isinstance(sent_out[0][0], list):
            embeddings.append(sent_out[0][0])
        elif isinstance(sent_out[0], list):
            embeddings.append(sent_out[0])
        else:
            embeddings.append(sent_out)
            
    return embeddings

def get_db_connection():
    conn = psycopg2.connect(
        host=DB_HOST,
        database=DB_NAME,
        user=DB_USER,
        password=DB_PASSWORD,
        port=DB_PORT
    )
    # Register pgvector extension to seamlessly handle numpy arrays
    register_vector(conn)
    return conn

def sync_embeddings():
    """
    1. The Data Ingestion & Sync Function
    Fetches products with NULL embeddings, generates vectors, and updates the database.
    """
    print("Starting embedding sync...")
    conn = get_db_connection()
    cur = conn.cursor(cursor_factory=RealDictCursor)
    
    try:
        # Fetch products without embeddings
        cur.execute("SELECT id, name, description FROM products WHERE embedding IS NULL;")
        products = cur.fetchall()
        
        if not products:
            print("No products need updating.")
            return

        print(f"Found {len(products)} products without embeddings. Generating vectors...")
        
        # Load into pandas DataFrame
        df = pd.DataFrame(products)
        
        # Combine name and description for richer semantic meaning
        # Handle potential NULL descriptions safely
        df['text_to_embed'] = df['name'] + ". " + df['description'].fillna("")
        
        # Generate 384-dimensional embeddings using SageMaker endpoint
        # The encode method returns a list of numpy arrays or lists
        embeddings = get_embeddings_from_sagemaker(df['text_to_embed'].tolist())
        
        # Update the database
        update_query = "UPDATE products SET embedding = %s WHERE id = %s"
        
        for i, row in df.iterrows():
            # Thanks to pgvector.psycopg2.register_vector, we can pass the numpy array directly
            cur.execute(update_query, (embeddings[i], row['id']))
            
        conn.commit()
        print(f"Successfully updated {len(products)} products with embeddings.")
        
    except Exception as e:
        conn.rollback()
        print(f"Error during sync: {e}")
    finally:
        cur.close()
        conn.close()

class SearchRequest(BaseModel):
    query: str
    top_k: int = 3

@app.post("/search")
def semantic_search(req: SearchRequest):
    """
    2. The Semantic Search & Recommendation API
    Converts query to vector and performs vector similarity search using Cosine Distance.
    """
    if not req.query:
        raise HTTPException(status_code=400, detail="Query string is required")
        
    try:
        # Generate embedding for the search query using SageMaker
        query_vector = get_embeddings_from_sagemaker(req.query)[0]
        
        conn = get_db_connection()
        cur = conn.cursor(cursor_factory=RealDictCursor)
        
        # Format the python list as a string so PostgreSQL parses it as a vector
        vector_str = "[" + ",".join(map(str, query_vector)) + "]"
        
        # Raw SQL query using Cosine Distance operator (<=>)
        # We also calculate a similarity score (1 - cosine_distance)
        search_query = """
            SELECT id, name, description, price, category, image_url, stock_quantity,
                   1 - (embedding <=> %s) AS similarity
            FROM products
            WHERE embedding IS NOT NULL
            ORDER BY embedding <=> %s
            LIMIT %s;
        """
        
        # Pass the formatted string
        cur.execute(search_query, (vector_str, vector_str, req.top_k))
        results = cur.fetchall()
        
        return {"query": req.query, "results": results}
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
    finally:
        if 'cur' in locals():
            cur.close()
        if 'conn' in locals():
            conn.close()

if __name__ == "__main__":
    # Automatically sync any missing embeddings on startup
    sync_embeddings()
    
    # Start the FastAPI server
    print("Starting AI Brain API server on http://localhost:8000 ...")
    uvicorn.run(app, host="0.0.0.0", port=8000)

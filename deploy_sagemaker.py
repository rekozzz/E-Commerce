import os
import boto3
import json
from sagemaker.huggingface import HuggingFaceModel

# 1. Configuration
AWS_REGION = "us-east-1"
# We will tell the script exactly which model we want from HuggingFace
HUB_ENV = {
    'HF_MODEL_ID': 'sentence-transformers/all-MiniLM-L6-v2',
    'HF_TASK': 'feature-extraction' # This tells the model we want vectors/embeddings, not text generation
}

# 2. You MUST replace this with the ARN of your SageMaker IAM Role!
# It will look something like: arn:aws:iam::657588917420:role/service-role/AmazonSageMaker-ExecutionRole-2023...
IAM_ROLE_ARN = "arn:aws:iam::657588917420:role/service-role/AmazonSageMaker-ExecutionRole-20260420T111978"

print("Setting up the HuggingFace Model...")
huggingface_model = HuggingFaceModel(
    env=HUB_ENV,
    role=IAM_ROLE_ARN,
    transformers_version="4.26", # Stable version for this model
    pytorch_version="1.13",
    py_version="py39",
)

print("Deploying the endpoint to AWS SageMaker... (This can take 5-10 minutes!)")
# Deploy the model to a Serverless Endpoint or Real-Time Endpoint.
# We are using a Real-Time endpoint here (ml.t2.medium is cheap and good for testing)
predictor = huggingface_model.deploy(
    initial_instance_count=1,
    instance_type="ml.t2.medium",
    endpoint_name="all-minilm-l6-v2-endpoint"
)

print(f"Success! Your SageMaker Endpoint Name is: {predictor.endpoint_name}")
print("You can now safely close this script.")

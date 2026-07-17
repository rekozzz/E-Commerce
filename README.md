# NexShop - E-Commerce Platform

A full-stack e-commerce platform featuring AI-powered product recommendations, built with TypeScript, NestJS, React, and AWS services.

## 🎯 Overview

NexShop is a modern e-commerce solution combining a robust backend API, responsive frontend interface, and intelligent AI recommendation engine. The platform leverages AWS SageMaker for embeddings-based product recommendations and PostgreSQL with pgvector for semantic search capabilities. The entire infrastructure is hosted on AWS for scalability and reliability.

## 🏗️ Architecture

The project is organized into three main components:

### **Backend** (`/backend`)
- **Framework**: NestJS with Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT with Passport strategies (Local & JWT)
- **Security**: bcrypt for password hashing
- **Vector Database**: pgvector for semantic search
- **API Client**: Axios for external service communication
- **Hosting**: AWS EC2 instance

Key Features:
- RESTful API with JWT authentication
- Database schema management with Drizzle Kit
- Type-safe database operations
- Comprehensive error handling

### **Frontend** (`/frontend`)
- **Framework**: React 19 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS v4
- **State Management**: TanStack React Query
- **Forms**: React Hook Form with validation
- **Routing**: React Router v7
- **Icons**: Lucide React
- **HTTP Client**: Axios with JWT token management
- **Hosting**: AWS S3 with CloudFront CDN

### **AI Service** (`/ai`)
- **ML Framework**: Python with SageMaker integration
- **Model**: Hugging Face Sentence Transformers (all-MiniLM-L6-v2)
- **Task**: Feature extraction for product embeddings
- **Embeddings**: pgvector storage for semantic search
- **Deployment**: AWS ECS/ECR (Middleware between SageMaker & Backend)
- **Purpose**: Acts as a bridge between AWS SageMaker AI endpoint and EC2 backend

## ☁️ AWS Infrastructure

### **Deployment Architecture**

```
┌─────────────────────────────────────────────────────────────┐
│                        CloudFront CDN                       │
│                                                              │
│  ┌──────────────────┐         ┌──────────────────────────┐  │
│  │   S3 (Frontend)  │         │  EC2 (Backend API)       │  │
│  │  React App       │         │  NestJS Server           │  │
│  │  Static Assets   │         │  Port: 3000              │  │
│  └──────────────────┘         └──────────────────────────┘  │
│                                           │                  │
│                                           ▼                  │
│                      ┌──────────────────────────────────┐   │
│                      │    ECS/ECR (AI Middleware)       │   │
│                      │  Python Service - Bridge Layer   │   │
│                      │  • Manages SageMaker requests    │   │
│                      │  • Processes embeddings          │   │
│                      │  • Routes to Backend             │   │
│                      └──────────────────────────────────┘   │
│                                           │                  │
│                                           ▼                  │
│                      ┌──────────────────────────────────┐   │
│                      │   AWS SageMaker Endpoint         │   │
│                      │  • all-MiniLM-L6-v2 Model        │   │
│                      │  • Feature Extraction            │   │
│                      │  • Embeddings Generation         │   │
│                      └──────────────────────────────────┘   │
│                                                              │
│  ┌──────────────────────────────────────────────────────┐  │
│  │         AWS RDS PostgreSQL (Database)                │  │
│  │  • Primary Database with pgvector                    │  │
│  │  • Vector Storage for Embeddings                     │  │
│  │  • Multi-AZ for High Availability                    │  │
│  └──────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### **AWS Services Used**

| Service | Purpose | Configuration |
|---------|---------|---|
| **EC2** | Backend API hosting | NestJS application server on Linux instance |
| **S3** | Frontend static hosting | React build files, assets, and SPA serving |
| **CloudFront** | CDN & Content delivery | Caches S3 content, handles SSL/TLS |
| **RDS** | Managed PostgreSQL database | Multi-AZ, pgvector extension enabled |
| **ECS** | Container orchestration | Runs AI middleware service |
| **ECR** | Container registry | Stores Docker images for ECS tasks |
| **SageMaker** | ML model hosting | Real-time endpoint for embeddings |
| **IAM** | Access management | Role-based permissions for services |

### **Data Flow**

1. **Frontend** (S3/CloudFront) → Makes API requests to Backend (EC2)
2. **Backend** (EC2) → Processes business logic, queries RDS database
3. **AI Middleware** (ECS) → Receives requests from Backend
4. **SageMaker** → Generates embeddings via the AI Middleware
5. **Backend** → Stores embeddings in RDS with pgvector
6. **Frontend** → Receives processed data and displays results

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (for backend & frontend)
- Python 3.9+ (for AI service)
- PostgreSQL 13+ with pgvector extension (for local development)
- Docker & Docker Compose (for local development)
- AWS Account (for SageMaker deployment)
- AWS credentials configured locally
- AWS CLI configured

### Quick Start with Docker Compose (Local Development)

1. **Clone the repository**
   ```bash
   git clone https://github.com/rekozzz/E-Commerce.git
   cd E-Commerce
   ```

2. **Create environment file**
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables**
   ```env
   # Database (Local PostgreSQL)
   DB_HOST=postgres
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=your_secure_password
   DB_NAME=nexshop

   # Authentication
   JWT_SECRET=your_jwt_secret_key

   # Admin
   ADMIN_EMAIL=admin@nexshop.com
   ADMIN_PASSWORD=secure_password

   # AWS
   AWS_ACCOUNT_ID=your_account_id
   AWS_REGION=us-east-1
   ```

4. **Start services**
   ```bash
   docker-compose up -d
   ```

   This will start:
   - Backend API: http://localhost:3000
   - Frontend: http://localhost:5173
   - AI Service: http://localhost:8000
   - PostgreSQL: localhost:5432

### Backend Setup (Development)

```bash
cd backend

# Install dependencies
npm install

# Run database migrations
npm run db:push

# Start development server
npm run start:dev

# Run tests
npm test

# Run e2e tests
npm run test:e2e
```

### Frontend Setup (Development)

```bash
cd frontend

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

### AI Service Setup (Development)

```bash
cd ai

# Create Python virtual environment
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run locally
python app.py
```

## 🤖 SageMaker Deployment

Deploy the AI model to AWS SageMaker:

```bash
# Configure IAM role in deploy_sagemaker.py
# Update IAM_ROLE_ARN with your SageMaker execution role ARN

python deploy_sagemaker.py
```

This will:
- Deploy the all-MiniLM-L6-v2 model
- Create a real-time SageMaker endpoint
- Enable embeddings generation for product recommendations

## 📦 Available Scripts

### Backend
- `npm run build` - Build the application
- `npm run start` - Start production server
- `npm run start:dev` - Start development server with watch mode
- `npm run lint` - Run ESLint
- `npm run format` - Format code with Prettier
- `npm run test` - Run unit tests
- `npm run test:cov` - Generate coverage report
- `npm run test:e2e` - Run end-to-end tests
- `npm run db:push` - Apply database migrations
- `npm run db:studio` - Open Drizzle Studio for database management

### Frontend
- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

## 🔐 Security Features

- **Password Hashing**: bcrypt with salt rounds
- **JWT Authentication**: Secure token-based authentication
- **Passport Strategies**: Support for multiple authentication methods
- **Environment Variables**: Sensitive data in .env files (not committed)
- **API Validation**: class-validator for request validation
- **CORS**: Configured via Nginx / AWS Security Groups
- **HTTPS**: CloudFront handles SSL/TLS for S3
- **AWS IAM Roles**: Least privilege access for all services
- **VPC Security Groups**: Network isolation and firewall rules

## 🌐 Deployment

### Production Deployment on AWS

#### **Frontend Deployment (S3 + CloudFront)**

```bash
# Build the frontend
cd frontend
npm run build

# Deploy to S3
aws s3 sync dist/ s3://your-bucket-name/ --delete

# Invalidate CloudFront cache
aws cloudfront create-invalidation --distribution-id YOUR_DIST_ID --paths "/*"
```

#### **Backend Deployment (EC2)**

```bash
# Build the backend
cd backend
npm run build

# Connect to EC2 instance
ssh -i your-key.pem ec2-user@your-ec2-ip

# Pull latest code and restart
cd /app/backend
git pull origin main
npm install
npm run start:prod
```

#### **AI Service Deployment (ECS/ECR)**

```bash
# Push images to ECR (Windows PowerShell)
.\push-ai-to-ecr.ps1

# Or manually:
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_URI

docker build -t nexshop-ai:latest ./ai
docker tag nexshop-ai:latest YOUR_ECR_URI/nexshop-ai:latest
docker push YOUR_ECR_URI/nexshop-ai:latest

# Update ECS task definition and restart service
aws ecs update-service --cluster nexshop-cluster --service ai-service --force-new-deployment
```

### Docker
Services are containerized and pushed to AWS ECR:

```bash
# Push AI service to ECR (Windows PowerShell)
.\push-ai-to-ecr.ps1

# Push backend to ECR (Windows PowerShell)
.\push-backend-to-ecr.ps1
```

### Nginx Configuration
- Reverse proxy for backend API
- Static asset serving
- Load balancing ready
- CORS headers configured

## 📊 Technology Stack

| Layer | Technologies |
|-------|---|
| **Frontend** | React 19, TypeScript, Tailwind CSS, Vite, AWS S3, CloudFront |
| **Backend** | NestJS, Express, TypeScript, PostgreSQL, AWS EC2 |
| **Database** | PostgreSQL, pgvector, Drizzle ORM, AWS RDS |
| **AI/ML** | Python, Sentence Transformers, AWS SageMaker |
| **Infrastructure** | Docker, ECS, ECR, IAM, VPC Security Groups |
| **Authentication** | JWT, Passport, bcrypt |
| **CDN** | AWS CloudFront |

## 🗂️ Project Structure

```
E-Commerce/
├── backend/                    # NestJS API (EC2 Hosted)
│   ├── src/
│   ├── test/
│   ├── package.json
│   └── tsconfig.json
├── frontend/                   # React application (S3 Hosted)
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
├── ai/                         # Python AI service (ECS Hosted)
│   ├── app.py
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml          # Container orchestration (Local)
├── nginx.conf                  # Reverse proxy configuration
├── deploy_sagemaker.py         # SageMaker deployment script
├── push-ai-to-ecr.ps1          # AI service ECR push script
├── push-backend-to-ecr.ps1     # Backend ECR push script
└── package.json               # Root workspace configuration
```

## 🚦 Environment Variables

### Backend (EC2)
- `DB_HOST` - AWS RDS PostgreSQL endpoint
- `DB_PORT` - PostgreSQL port (default: 5432)
- `DB_USERNAME` - Database user
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name (default: nexshop)
- `JWT_SECRET` - Secret key for JWT signing
- `ADMIN_EMAIL` - Default admin email
- `ADMIN_PASSWORD` - Default admin password
- `AI_SERVICE_URL` - ECS AI middleware endpoint

### AI Service (ECS)
- `DB_HOST` - AWS RDS PostgreSQL endpoint
- `DB_PORT` - PostgreSQL port
- `DB_USERNAME` - Database user
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `AWS_REGION` - AWS region for SageMaker
- `SAGEMAKER_ENDPOINT_NAME` - Endpoint name (default: all-minilm-l6-v2-endpoint)

### Frontend (S3/CloudFront)
- `VITE_API_URL` - Backend API endpoint (EC2 URL)
- `VITE_APP_NAME` - Application name

## 📝 License

This project is licensed under the UNLICENSED license.

## 👤 Author

Created by [rekozzz](https://github.com/rekozzz)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues, questions, or suggestions, please open an [issue](https://github.com/rekozzz/E-Commerce/issues) on GitHub.

## 🔄 CI/CD & DevOps

The project includes PowerShell scripts for automated deployment to AWS services:
- `push-ai-to-ecr.ps1` - Builds and pushes AI service image to ECR
- `push-backend-to-ecr.ps1` - Builds and pushes backend image to ECR
- Manual S3 deployment available for frontend

### Infrastructure Monitoring
- CloudWatch logs for EC2, ECS, and Lambda
- CloudWatch metrics for performance monitoring
- RDS enhanced monitoring for database health
- SageMaker endpoint metrics and invocations

---

**Last Updated**: July 2026 | **Status**: Active Development | **Hosting**: AWS

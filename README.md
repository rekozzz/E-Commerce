# NexShop - E-Commerce Platform

A full-stack e-commerce platform featuring AI-powered product recommendations, built with TypeScript, NestJS, React, and AWS services.

## 🎯 Overview

NexShop is a modern e-commerce solution combining a robust backend API, responsive frontend interface, and intelligent AI recommendation engine. The platform leverages AWS SageMaker for embeddings-based product recommendations and PostgreSQL with pgvector for semantic search capabilities.

## 🏗️ Architecture

The project is organized into three main components:

### **Backend** (`/backend`)
- **Framework**: NestJS with Express
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT with Passport strategies (Local & JWT)
- **Security**: bcrypt for password hashing
- **Vector Database**: pgvector for semantic search
- **API Client**: Axios for external service communication

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

### **AI Service** (`/ai`)
- **ML Framework**: Python with SageMaker integration
- **Model**: Hugging Face Sentence Transformers (all-MiniLM-L6-v2)
- **Task**: Feature extraction for product embeddings
- **Embeddings**: pgvector storage for semantic search
- **Deployment**: AWS SageMaker real-time endpoint

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ (for backend & frontend)
- Python 3.9+ (for AI service)
- PostgreSQL 13+ with pgvector extension
- Docker & Docker Compose
- AWS Account (for SageMaker deployment)
- AWS credentials configured locally

### Quick Start with Docker Compose

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
   # Database
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
- **CORS**: Configured via Nginx
- **HTTPS**: Ready for SSL/TLS configuration

## 🌐 Deployment

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
| **Frontend** | React 19, TypeScript, Tailwind CSS, Vite |
| **Backend** | NestJS, Express, TypeScript, PostgreSQL |
| **Database** | PostgreSQL, pgvector, Drizzle ORM |
| **AI/ML** | Python, Sentence Transformers, AWS SageMaker |
| **Infrastructure** | Docker, Docker Compose, Nginx, AWS ECR |
| **Authentication** | JWT, Passport, bcrypt |

## 🗂️ Project Structure

```
E-Commerce/
├── backend/                    # NestJS API
│   ├── src/
│   ├── test/
│   ├── package.json
│   └── tsconfig.json
├── frontend/                   # React application
│   ├── src/
│   ├── public/
│   ├── package.json
│   └── tsconfig.json
├── ai/                         # Python AI service
│   ├── app.py
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml          # Container orchestration
├── nginx.conf                  # Reverse proxy configuration
├── deploy_sagemaker.py         # SageMaker deployment script
└── package.json               # Root workspace configuration
```

## 🚦 Environment Variables

### Backend
- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port (default: 5432)
- `DB_USERNAME` - Database user
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name (default: nexshop)
- `JWT_SECRET` - Secret key for JWT signing
- `ADMIN_EMAIL` - Default admin email
- `ADMIN_PASSWORD` - Default admin password
- `AI_SERVICE_URL` - URL to AI service (default: http://ai:8000)

### AI Service
- `DB_HOST` - PostgreSQL host
- `DB_PORT` - PostgreSQL port
- `DB_USERNAME` - Database user
- `DB_PASSWORD` - Database password
- `DB_NAME` - Database name
- `AWS_REGION` - AWS region for SageMaker
- `SAGEMAKER_ENDPOINT_NAME` - Endpoint name (default: all-minilm-l6-v2-endpoint)

## 📝 License

This project is licensed under the UNLICENSED license.

## 👤 Author

Created by [rekozzz](https://github.com/rekozzz)

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📞 Support

For issues, questions, or suggestions, please open an [issue](https://github.com/rekozzz/E-Commerce/issues) on GitHub.

## 🔄 CI/CD

The project includes PowerShell scripts for automated deployment to AWS ECR:
- `push-ai-to-ecr.ps1` - Builds and pushes AI service image
- `push-backend-to-ecr.ps1` - Builds and pushes backend image

---

**Last Updated**: July 2026 | **Status**: Active Development

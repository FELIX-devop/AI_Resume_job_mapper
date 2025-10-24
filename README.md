# AI Resume–Job Matching System

A complete fullstack application that uses AI and machine learning to match resumes with job descriptions. Built with React, Spring Boot, FastAPI, MongoDB, and Docker.

## 🚀 Features

- **AI-Powered Analysis**: Multiple embedding models (MiniLM, SBERT, DistilBERT) for text similarity
- **Resume Parsing**: Extract skills, experience, education, and job titles using spaCy NLP
- **Job Matching**: Calculate compatibility scores based on skills, experience, and text similarity
- **Modern UI**: Clean, responsive React frontend with Tailwind CSS
- **RESTful API**: Spring Boot backend with comprehensive endpoints
- **ML Microservice**: FastAPI service with XGBoost, LightGBM, and CatBoost models
- **Dockerized**: Complete containerized setup with Docker Compose
- **MongoDB**: Document-based storage for resumes, jobs, and evaluations

## 🏗️ Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React UI      │    │  Spring Boot    │    │   FastAPI ML    │
│   (Port 3000)   │◄──►│   (Port 8080)   │◄──►│   (Port 8000)   │
└─────────────────┘    └─────────────────┘    └─────────────────┘
                                │
                                ▼
                       ┌─────────────────┐
                       │    MongoDB      │
                       │   (Port 27017)  │
                       └─────────────────┘
```

## 🛠️ Tech Stack

### Frontend
- React 18 with React Router
- Tailwind CSS for styling
- Axios for API calls
- React Dropzone for file uploads
- Lucide React for icons

### Backend
- Spring Boot 3.2 with Java 17
- Spring Data MongoDB
- Spring WebFlux for HTTP client
- Maven for dependency management

### ML Service
- FastAPI with Python 3.9
- spaCy for NLP processing
- Sentence Transformers for embeddings
- XGBoost, LightGBM, CatBoost for ML models
- PyMuPDF and python-docx for document parsing

### Database
- MongoDB 7.0 with authentication
- Document-based collections for resumes, jobs, models

### DevOps
- Docker and Docker Compose
- Multi-stage builds for optimization
- Health checks and restart policies

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose
- Git

### 1. Clone and Start
```bash
git clone <repository-url>
cd Resum_Job_matching
docker-compose up --build
```

### 2. Train ML Models
```bash
# Access ML service container
docker exec -it resume-matcher-ml-service bash

# Train models
python train.py
```

### 3. Access Applications
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080
- ML Service: http://localhost:8000
- MongoDB: localhost:27017

## 📋 API Endpoints

### Resume Management
- `POST /api/uploadResume` - Upload and analyze resume
- `GET /api/resumes/{id}` - Get resume by ID
- `GET /api/resumes` - List all resumes
- `GET /api/resumes/domain/{domain}` - Get resumes by domain

### Job Management
- `POST /api/jobs` - Create new job
- `GET /api/jobs` - List all jobs
- `GET /api/jobs/{id}` - Get job by ID
- `GET /api/jobs/domain/{domain}` - Get jobs by domain

### ML Service
- `POST /evaluate` - Evaluate resume against job
- `POST /train` - Train ML models
- `GET /models` - List available models
- `GET /health` - Health check

## 🎯 Usage

### 1. Upload Resume
1. Navigate to http://localhost:3000/upload
2. Upload PDF/DOCX resume file
3. Enter job description
4. Select job domain
5. Click "Analyze Resume"

### 2. View Results
- Match percentage and recommendation
- Detailed skill analysis
- Experience and education matching
- Best model used for analysis

### 3. Admin Dashboard
- View system statistics
- Monitor model performance
- Upload job taxonomy
- Export data

## 🔧 Configuration

### Environment Variables
```yaml
# Backend
SPRING_DATA_MONGODB_URI=mongodb://admin:password123@mongodb:27017/resume_matcher
ML_SERVICE_URL=http://ml-service:8000

# ML Service
MONGODB_URL=mongodb://admin:password123@mongodb:27017/resume_matcher
PYTHONUNBUFFERED=1

# Frontend
REACT_APP_API_URL=http://localhost:8080
REACT_APP_ML_SERVICE_URL=http://localhost:8000
```

### ML Model Configuration
```python
CONFIG = {
    "thresholds": {
        "strong_match": 0.8,
        "good_match": 0.6,
        "weak_match": 0.4
    },
    "weights": {
        "cosine_similarity": 0.4,
        "skill_match": 0.3,
        "experience_match": 0.2,
        "education_match": 0.1
    }
}
```

## 🧪 Testing

### Run Tests
```bash
# Backend tests
cd backend
./mvnw test

# ML service tests
cd ml-service
python -m pytest test_main.py

# Frontend tests
cd frontend
npm test
```

### Sample Data
- `sample_data/train.csv` - Training data for ML models
- `sample_data/jobTaxonomy.json` - Job taxonomy and skills
- `sample_data/init-mongo.js` - MongoDB initialization

## 📊 Model Performance

### Embedding Models
- **MiniLM**: Fast, lightweight transformer model
- **SBERT**: High-quality sentence embeddings
- **DistilBERT**: Distilled BERT for efficiency

### ML Models
- **XGBoost**: Gradient boosting for structured data
- **LightGBM**: Light gradient boosting machine
- **CatBoost**: Categorical boosting for mixed data types

### Scoring Algorithm
```
finalScore = 0.4 * cosine_similarity + 
             0.3 * skill_match_ratio + 
             0.2 * experience_match_ratio + 
             0.1 * education_match_ratio
```

## 🚀 Deployment

### Production Deployment
```bash
# Build production images
docker-compose -f docker-compose.prod.yml build

# Deploy with production config
docker-compose -f docker-compose.prod.yml up -d
```

### Scaling
- Use MongoDB replica sets for high availability
- Scale ML service with multiple instances
- Use load balancer for frontend and backend

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- spaCy for NLP processing
- Sentence Transformers for embeddings
- Spring Boot and FastAPI communities
- React and Tailwind CSS teams

## 📞 Support

For support, email support@resumematcher.com or create an issue in the repository.

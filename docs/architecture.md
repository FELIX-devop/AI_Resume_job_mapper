# AI Resume-Job Matching System Architecture

## System Overview

The AI Resume-Job Matching System is a fullstack application that leverages machine learning to analyze resumes and match them with job descriptions. The system consists of four main components:

1. **Frontend (React)** - User interface for uploading resumes and viewing results
2. **Backend (Spring Boot)** - REST API for business logic and data management
3. **ML Service (FastAPI)** - Machine learning microservice for resume analysis
4. **Database (MongoDB)** - Document storage for resumes, jobs, and evaluations

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        User Interface                            │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐   │
│  │   Landing Page  │  │  Upload Resume  │  │  Results Page   │   │
│  │                 │  │                 │  │                 │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      React Frontend                             │
│                    (Port 3000)                                  │
│  • Tailwind CSS for styling                                    │
│  • React Router for navigation                                 │
│  • Axios for API communication                                 │
│  • React Dropzone for file uploads                             │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                    Spring Boot Backend                          │
│                     (Port 8080)                                │
│  • REST API endpoints                                          │
│  • File upload handling                                        │
│  • Business logic                                              │
│  • Data validation                                             │
│  • WebFlux for HTTP client                                     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                      FastAPI ML Service                         │
│                      (Port 8000)                               │
│  • Resume text extraction (PyMuPDF, python-docx)              │
│  • NLP processing (spaCy)                                      │
│  • Text embeddings (Sentence Transformers)                    │
│  • ML models (XGBoost, LightGBM, CatBoost)                   │
│  • Similarity calculations                                     │
└─────────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────────┐
│                        MongoDB Database                         │
│                      (Port 27017)                              │
│  • resumes collection                                          │
│  • jobs collection                                             │
│  • models collection                                           │
│  • evaluations collection                                      │
└─────────────────────────────────────────────────────────────────┘
```

## Data Flow

### 1. Resume Upload Process
```
User → Frontend → Backend → ML Service → Database
  ↓       ↓         ↓          ↓           ↓
Upload → Validate → Extract → Analyze → Store
```

### 2. Analysis Pipeline
```
Resume Text → NLP Processing → Feature Extraction → ML Prediction → Scoring
     ↓              ↓               ↓                ↓            ↓
  Parse Skills → Extract Entities → Create Features → Predict → Calculate Score
```

### 3. Matching Algorithm
```
Resume Features + Job Requirements → Similarity Calculation → Final Score
           ↓                              ↓                    ↓
    Skills, Experience,           Cosine Similarity,      Weighted Formula
    Education, Text               Skill Match Ratio
```

## Component Details

### Frontend (React)
- **Technology**: React 18, Tailwind CSS, React Router
- **Features**: 
  - Responsive design
  - File drag & drop
  - Real-time progress indicators
  - Results visualization
  - Admin dashboard

### Backend (Spring Boot)
- **Technology**: Spring Boot 3.2, Java 17, Maven
- **Features**:
  - RESTful API design
  - File upload handling
  - Data validation
  - Error handling
  - Health checks

### ML Service (FastAPI)
- **Technology**: FastAPI, Python 3.9, spaCy, Sentence Transformers
- **Features**:
  - Document text extraction
  - NLP entity recognition
  - Text embeddings
  - ML model training
  - Similarity calculations

### Database (MongoDB)
- **Technology**: MongoDB 7.0
- **Collections**:
  - `resumes`: Resume documents with parsed data
  - `jobs`: Job descriptions and requirements
  - `models`: Trained ML models metadata
  - `evaluations`: Analysis results

## ML Pipeline

### 1. Text Processing
```
Raw Document → Text Extraction → NLP Processing → Entity Recognition
     ↓              ↓               ↓                ↓
  PDF/DOCX → PyMuPDF/python-docx → spaCy → Skills, Experience, Education
```

### 2. Embedding Generation
```
Text → Multiple Embeddings → Similarity Calculation
 ↓           ↓                    ↓
Job Text → MiniLM, SBERT, → Cosine Similarity
Resume   DistilBERT        Scores per Model
```

### 3. Feature Engineering
```
Raw Features → Feature Engineering → ML Model Input
     ↓               ↓                    ↓
Skills, Exp, → Normalization, → [sim1, sim2, sim3,
Education     Scaling,         skill_match, exp_match,
              Encoding         edu_match, ...]
```

### 4. Model Training
```
Training Data → Model Training → Model Selection → Deployment
      ↓              ↓               ↓              ↓
   CSV Data → XGBoost, LightGBM, → Best Model → Save Models
            CatBoost Training    Selection    to Disk
```

## Scoring Algorithm

### Weighted Formula
```
finalScore = 0.4 * cosine_similarity + 
             0.3 * skill_match_ratio + 
             0.2 * experience_match_ratio + 
             0.1 * education_match_ratio
```

### Thresholds
- **Strong Match**: ≥ 80%
- **Good Match**: ≥ 60%
- **Weak Match**: ≥ 40%
- **Poor Match**: < 40%

## Deployment Architecture

### Docker Compose Setup
```yaml
services:
  frontend:    # React app on port 3000
  backend:     # Spring Boot on port 8080
  ml-service:  # FastAPI on port 8000
  mongodb:     # MongoDB on port 27017
```

### Production Considerations
- Load balancing for high availability
- MongoDB replica sets
- Horizontal scaling of ML service
- Monitoring and logging
- Security and authentication

## Security Features

- File type validation
- File size limits
- Input sanitization
- CORS configuration
- MongoDB authentication
- Docker network isolation

## Performance Optimizations

- Model caching
- Database indexing
- Connection pooling
- Async processing
- Response compression
- CDN for static assets

## Monitoring and Logging

- Health check endpoints
- Application metrics
- Error tracking
- Performance monitoring
- Log aggregation
- Alert systems

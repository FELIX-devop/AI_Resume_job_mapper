# AI Resume-Job Matching System

## Demo Instructions

### Prerequisites
- Docker and Docker Compose installed
- Git installed
- 8GB+ RAM recommended
- 10GB+ free disk space

### Quick Start (3 Commands)

1. **Clone and Start Services**
```bash
git clone <repository-url>
cd Resum_Job_matching
docker-compose up --build
```

2. **Train ML Models**
```bash
docker exec -it resume-matcher-ml-service python train.py
```

3. **Access Application**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8080/api/health
- ML Service: http://localhost:8000/health

### Demo Workflow

#### Step 1: Upload Resume
1. Navigate to http://localhost:3000
2. Click "Upload Resume"
3. Upload a PDF/DOCX resume file
4. Enter job description:
   ```
   We are looking for a Senior Full Stack Developer with 5+ years of experience in React, Node.js, Python, and MongoDB. The ideal candidate should have experience with cloud platforms like AWS and modern development practices including CI/CD, microservices architecture, and agile methodologies.
   ```
5. Select domain: "Fullstack"
6. Click "Analyze Resume"

#### Step 2: View Results
- Match percentage display
- Detailed skill analysis
- Experience and education matching
- Best model used
- Recommendation category

#### Step 3: Admin Dashboard
1. Navigate to Admin page
2. View system statistics
3. Check domain distribution
4. Monitor recent uploads

### Sample Data

#### Sample Resume Text
```
John Doe
Senior Software Engineer
john.doe@email.com | (555) 123-4567

EXPERIENCE
Senior Software Engineer | TechCorp Inc. | 2020-Present
- Developed full-stack applications using React, Node.js, and MongoDB
- Implemented CI/CD pipelines with Jenkins and Docker
- Led team of 5 developers in agile environment
- Experience with AWS cloud services

Software Engineer | StartupXYZ | 2018-2020
- Built web applications with Python, Django, and PostgreSQL
- Implemented REST APIs and microservices architecture
- Worked with Git version control and agile methodologies

EDUCATION
Bachelor of Science in Computer Science
University of Technology | 2014-2018

SKILLS
Programming: Python, JavaScript, Java, SQL
Frameworks: React, Node.js, Django, Spring Boot
Databases: MongoDB, PostgreSQL, MySQL
Cloud: AWS, Docker, Kubernetes
Tools: Git, Jenkins, Linux, VS Code
```

#### Sample Job Description
```
Senior Full Stack Developer

We are looking for a Senior Full Stack Developer with 5+ years of experience in React, Node.js, Python, and MongoDB. The ideal candidate should have experience with cloud platforms like AWS and modern development practices including CI/CD, microservices architecture, and agile methodologies.

Requirements:
- 5+ years of software development experience
- Strong proficiency in React, Node.js, Python
- Experience with MongoDB and SQL databases
- Knowledge of AWS cloud services
- Experience with Docker and Kubernetes
- Understanding of CI/CD pipelines
- Agile development experience
- Strong problem-solving skills
- Excellent communication skills

Preferred Qualifications:
- Master's degree in Computer Science
- Experience with microservices architecture
- Knowledge of DevOps practices
- Leadership experience
```

### Expected Results

#### Strong Match (80%+)
- High skill overlap
- Relevant experience
- Good education match
- High text similarity

#### Good Match (60-79%)
- Moderate skill overlap
- Some experience gaps
- Decent education match
- Moderate text similarity

#### Weak Match (40-59%)
- Limited skill overlap
- Significant experience gaps
- Poor education match
- Low text similarity

### Troubleshooting

#### Common Issues
1. **Services not starting**
   - Check Docker daemon is running
   - Ensure ports 3000, 8080, 8000, 27017 are available
   - Check system resources (RAM, disk space)

2. **ML models not loading**
   - Run `docker exec -it resume-matcher-ml-service python train.py`
   - Check ML service logs: `docker logs resume-matcher-ml-service`

3. **File upload errors**
   - Ensure file is PDF, DOCX, or TXT format
   - Check file size is under 10MB
   - Verify file is not corrupted

4. **Database connection issues**
   - Check MongoDB is running: `docker ps`
   - Verify connection string in application.yml
   - Check MongoDB logs: `docker logs resume-matcher-mongodb`

#### Performance Tips
- Use SSD storage for better I/O performance
- Allocate at least 4GB RAM to Docker
- Close unnecessary applications
- Use Chrome/Firefox for best frontend performance

### API Testing

#### Test Upload Endpoint
```bash
curl -X POST http://localhost:8080/api/uploadResume \
  -F "file=@sample_resume.pdf" \
  -F "jobText=Senior Developer position" \
  -F "domain=Fullstack"
```

#### Test Health Endpoints
```bash
# Backend health
curl http://localhost:8080/api/health

# ML service health
curl http://localhost:8000/health

# Frontend
curl http://localhost:3000
```

### Data Export

#### Export Resume Data
```bash
# Access MongoDB
docker exec -it resume-matcher-mongodb mongosh

# Switch to database
use resume_matcher

# Export resumes
db.resumes.find().pretty()

# Export jobs
db.jobs.find().pretty()
```

### Model Retraining

#### Retrain with New Data
1. Update `sample_data/train.csv` with new training data
2. Access ML service container
3. Run training script
4. Restart ML service

```bash
docker exec -it resume-matcher-ml-service bash
python train.py
docker restart resume-matcher-ml-service
```

### Scaling Demo

#### Horizontal Scaling
```bash
# Scale ML service
docker-compose up --scale ml-service=3

# Scale backend
docker-compose up --scale backend=2
```

#### Load Testing
```bash
# Install Apache Bench
sudo apt-get install apache2-utils

# Test backend
ab -n 100 -c 10 http://localhost:8080/api/health

# Test ML service
ab -n 50 -c 5 http://localhost:8000/health
```

### Security Demo

#### Authentication
- MongoDB uses admin/password123
- Services communicate over internal network
- CORS configured for frontend access

#### File Validation
- File type checking (PDF, DOCX, TXT only)
- File size limits (10MB max)
- Content validation

### Monitoring Demo

#### Health Checks
- All services have health check endpoints
- Docker health checks configured
- Automatic restart on failure

#### Logging
```bash
# View all logs
docker-compose logs -f

# View specific service logs
docker logs resume-matcher-backend
docker logs resume-matcher-ml-service
docker logs resume-matcher-frontend
docker logs resume-matcher-mongodb
```

### Cleanup

#### Stop Services
```bash
docker-compose down
```

#### Remove Volumes
```bash
docker-compose down -v
```

#### Remove Images
```bash
docker rmi resume-job-matching-frontend
docker rmi resume-job-matching-backend
docker rmi resume-job-matching-ml-service
```

### Next Steps

1. **Customize Models**: Update training data and retrain
2. **Add Features**: Implement new matching criteria
3. **Scale**: Deploy to cloud with load balancing
4. **Monitor**: Add comprehensive monitoring and alerting
5. **Secure**: Implement authentication and authorization
6. **Optimize**: Performance tuning and caching

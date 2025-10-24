// MongoDB initialization script
db = db.getSiblingDB('resume_matcher');

// Create collections
db.createCollection('resumes');
db.createCollection('jobs');
db.createCollection('models');
db.createCollection('evaluations');

// Create indexes for better performance
db.resumes.createIndex({ "createdAt": -1 });
db.resumes.createIndex({ "domain": 1 });
db.resumes.createIndex({ "evaluationResult.finalScore": -1 });

db.jobs.createIndex({ "domain": 1 });
db.jobs.createIndex({ "title": "text", "jobText": "text" });
db.jobs.createIndex({ "createdAt": -1 });

db.evaluations.createIndex({ "resumeId": 1 });
db.evaluations.createIndex({ "createdAt": -1 });

// Insert sample job data
db.jobs.insertMany([
  {
    "title": "Senior Full Stack Developer",
    "company": "TechCorp Inc.",
    "location": "San Francisco, CA",
    "domain": "Fullstack",
    "jobText": "We are looking for a Senior Full Stack Developer with 5+ years of experience in React, Node.js, Python, and MongoDB. The ideal candidate should have experience with cloud platforms like AWS and modern development practices including CI/CD, microservices architecture, and agile methodologies.",
    "requiredSkills": ["React", "Node.js", "Python", "MongoDB", "AWS", "Docker", "Kubernetes", "REST API", "GraphQL", "TypeScript"],
    "createdAt": new Date()
  },
  {
    "title": "Cloud Solutions Architect",
    "company": "CloudTech Solutions",
    "location": "Austin, TX",
    "domain": "Cloud",
    "jobText": "Seeking a Cloud Solutions Architect to design and implement scalable cloud infrastructure solutions. Requirements include expertise in AWS, Azure, Terraform, Kubernetes, and experience with DevOps practices. Strong understanding of security, monitoring, and cost optimization is essential.",
    "requiredSkills": ["AWS", "Azure", "Terraform", "Kubernetes", "Docker", "Python", "Linux", "Security", "Monitoring", "Cost Optimization"],
    "createdAt": new Date()
  },
  {
    "title": "Data Scientist",
    "company": "DataInsights Ltd.",
    "location": "New York, NY",
    "domain": "Data",
    "jobText": "Join our data science team to build machine learning models and analyze large datasets. We need someone with strong Python skills, experience with TensorFlow/PyTorch, pandas, scikit-learn, and SQL. Knowledge of statistical analysis, data visualization, and cloud platforms is required.",
    "requiredSkills": ["Python", "TensorFlow", "PyTorch", "pandas", "scikit-learn", "SQL", "Statistics", "Data Visualization", "AWS", "Jupyter"],
    "createdAt": new Date()
  },
  {
    "title": "DevOps Engineer",
    "company": "InfraTech Systems",
    "location": "Seattle, WA",
    "domain": "DevOps",
    "jobText": "We are hiring a DevOps Engineer to manage our infrastructure and deployment pipelines. The role requires expertise in Jenkins, GitLab CI, Docker, Kubernetes, monitoring tools, and scripting languages. Experience with cloud platforms and infrastructure as code is essential.",
    "requiredSkills": ["Jenkins", "GitLab CI", "Docker", "Kubernetes", "Python", "Bash", "Terraform", "AWS", "Monitoring", "Linux"],
    "createdAt": new Date()
  }
]);

print("Database initialized successfully!");
print("Collections created: resumes, jobs, models, evaluations");
print("Sample job data inserted: " + db.jobs.countDocuments() + " jobs");

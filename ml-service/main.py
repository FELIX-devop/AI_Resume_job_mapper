import os
import json
import logging
import asyncio
from typing import Dict, List, Optional, Any
from pathlib import Path
import tempfile
import pickle
import joblib
import numpy as np
import pandas as pd
from datetime import datetime
import fitz  # PyMuPDF
from docx import Document
import spacy
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import StandardScaler
import xgboost as xgb
import lightgbm as lgb
from catboost import CatBoostClassifier
from fastapi import FastAPI, File, UploadFile, Form, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize FastAPI app
app = FastAPI(title="AI Resume-Job Matching ML Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for models and data
nlp = None
embedding_models = {}
ml_models = {}
domain_to_best_model = {}
scaler = StandardScaler()
models_dir = Path("models")
models_dir.mkdir(exist_ok=True)

# Configuration
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

class EvaluationRequest(BaseModel):
    resume_text: Optional[str] = None
    job_text: str
    domain: str = "Fullstack"

class EvaluationResponse(BaseModel):
    parsed_entities: Dict[str, Any]
    similarity_scores: Dict[str, float]
    skill_match_ratio: float
    experience_match_ratio: float
    education_match_ratio: float
    final_score: float
    best_model_name: str
    matched_skills: List[str]
    missing_skills: List[str]
    recommendation: str
    feature_importances: Dict[str, float]

def load_spacy_model():
    """Load spaCy model for NLP processing"""
    global nlp
    try:
        nlp = spacy.load("en_core_web_sm")
        logger.info("spaCy model loaded successfully")
    except OSError:
        logger.warning("spaCy model not found, downloading...")
        os.system("python -m spacy download en_core_web_sm")
        nlp = spacy.load("en_core_web_sm")

def load_embedding_models():
    """Load sentence transformer models"""
    global embedding_models
    
    model_configs = {
        "minilm": "sentence-transformers/all-MiniLM-L6-v2",
        "sbert": "sentence-transformers/all-mpnet-base-v2",
        "distilbert": "sentence-transformers/distilbert-base-nli-mean-tokens"
    }
    
    for name, model_path in model_configs.items():
        try:
            embedding_models[name] = SentenceTransformer(model_path)
            logger.info(f"Loaded embedding model: {name}")
        except Exception as e:
            logger.error(f"Failed to load {name}: {e}")

def encode_text(text: str, model_name: str) -> np.ndarray:
    """Encode text using specified embedding model"""
    if model_name not in embedding_models:
        raise ValueError(f"Model {model_name} not available")
    
    return embedding_models[model_name].encode([text])[0]

def extract_text_from_pdf(file_path: str) -> str:
    """Extract text from PDF file"""
    try:
        doc = fitz.open(file_path)
        text = ""
        for page in doc:
            text += page.get_text()
        doc.close()
        return text
    except Exception as e:
        logger.error(f"Error extracting PDF text: {e}")
        return ""

def extract_text_from_docx(file_path: str) -> str:
    """Extract text from DOCX file"""
    try:
        doc = Document(file_path)
        text = ""
        for paragraph in doc.paragraphs:
            text += paragraph.text + "\n"
        return text
    except Exception as e:
        logger.error(f"Error extracting DOCX text: {e}")
        return ""

def parse_resume(text: str) -> Dict[str, Any]:
    """Parse resume text to extract entities"""
    if not nlp:
        load_spacy_model()
    
    doc = nlp(text)
    
    # Extract entities
    entities = {
        "skills": [],
        "job_titles": [],
        "companies": [],
        "education": [],
        "experience_years": 0,
        "raw_text": text
    }
    
    # Extract skills using keyword matching
    skill_keywords = [
        "python", "java", "javascript", "react", "angular", "vue", "node.js",
        "spring boot", "django", "flask", "fastapi", "express", "mongodb",
        "postgresql", "mysql", "redis", "docker", "kubernetes", "aws", "azure",
        "gcp", "terraform", "jenkins", "git", "linux", "sql", "nosql",
        "machine learning", "deep learning", "tensorflow", "pytorch",
        "pandas", "numpy", "scikit-learn", "data analysis", "statistics",
        "agile", "scrum", "devops", "ci/cd", "microservices", "rest api",
        "graphql", "typescript", "html", "css", "bootstrap", "tailwind"
    ]
    
    text_lower = text.lower()
    for skill in skill_keywords:
        if skill in text_lower:
            entities["skills"].append(skill.title())
    
    # Extract job titles using NER
    for ent in doc.ents:
        if ent.label_ == "PERSON":
            continue
        elif "engineer" in ent.text.lower() or "developer" in ent.text.lower():
            entities["job_titles"].append(ent.text)
        elif ent.label_ == "ORG":
            entities["companies"].append(ent.text)
        elif "university" in ent.text.lower() or "college" in ent.text.lower():
            entities["education"].append(ent.text)
    
    # Extract experience years using regex patterns
    import re
    exp_patterns = [
        r'(\d+)\+?\s*years?\s*(?:of\s*)?experience',
        r'experience\s*:\s*(\d+)\+?\s*years?',
        r'(\d+)\+?\s*years?\s*in\s*software'
    ]
    
    for pattern in exp_patterns:
        matches = re.findall(pattern, text_lower)
        if matches:
            entities["experience_years"] = max([int(m) for m in matches])
            break
    
    return entities

def calculate_skill_match_ratio(resume_skills: List[str], job_skills: List[str]) -> float:
    """Calculate skill match ratio between resume and job requirements"""
    if not job_skills:
        return 0.0
    
    resume_skills_lower = [s.lower() for s in resume_skills]
    job_skills_lower = [s.lower() for s in job_skills]
    
    matched = sum(1 for skill in job_skills_lower if any(skill in rs for rs in resume_skills_lower))
    return matched / len(job_skills_lower)

def calculate_similarity_scores(resume_text: str, job_text: str) -> Dict[str, float]:
    """Calculate similarity scores using different embedding models"""
    scores = {}
    
    for model_name in embedding_models.keys():
        try:
            resume_embedding = encode_text(resume_text, model_name)
            job_embedding = encode_text(job_text, model_name)
            
            # Reshape for cosine similarity
            resume_embedding = resume_embedding.reshape(1, -1)
            job_embedding = job_embedding.reshape(1, -1)
            
            similarity = cosine_similarity(resume_embedding, job_embedding)[0][0]
            scores[model_name] = float(similarity)
        except Exception as e:
            logger.error(f"Error calculating similarity for {model_name}: {e}")
            scores[model_name] = 0.0
    
    return scores

def load_ml_models():
    """Load trained ML models"""
    global ml_models, domain_to_best_model, scaler
    
    try:
        # Load domain to best model mapping
        domain_file = models_dir / "domain_to_best_model.json"
        if domain_file.exists():
            with open(domain_file, 'r') as f:
                domain_to_best_model = json.load(f)
        
        # Load scaler
        scaler_file = models_dir / "scaler.pkl"
        if scaler_file.exists():
            scaler = joblib.load(scaler_file)
        
        # Load ML models
        for model_name in ["xgboost", "lightgbm", "catboost"]:
            model_file = models_dir / f"{model_name}_model.pkl"
            if model_file.exists():
                ml_models[model_name] = joblib.load(model_file)
                logger.info(f"Loaded ML model: {model_name}")
        
    except Exception as e:
        logger.error(f"Error loading ML models: {e}")

def predict_best_model(domain: str, features: np.ndarray) -> str:
    """Predict the best embedding model for given domain and features"""
    if domain in domain_to_best_model:
        return domain_to_best_model[domain]
    
    # Fallback to highest scoring embedding model
    if embedding_models:
        return list(embedding_models.keys())[0]
    
    return "minilm"

def calculate_final_score(similarity_scores: Dict[str, float], 
                         skill_match: float, 
                         exp_match: float, 
                         edu_match: float) -> float:
    """Calculate final matching score using weighted formula"""
    # Use the best similarity score
    best_similarity = max(similarity_scores.values()) if similarity_scores else 0.0
    
    # Weighted formula
    final_score = (
        CONFIG["weights"]["cosine_similarity"] * best_similarity +
        CONFIG["weights"]["skill_match"] * skill_match +
        CONFIG["weights"]["experience_match"] * exp_match +
        CONFIG["weights"]["education_match"] * edu_match
    )
    
    return min(1.0, max(0.0, final_score))

def get_recommendation(score: float) -> str:
    """Get recommendation based on score"""
    if score >= CONFIG["thresholds"]["strong_match"]:
        return "Strong Match"
    elif score >= CONFIG["thresholds"]["good_match"]:
        return "Good Match"
    elif score >= CONFIG["thresholds"]["weak_match"]:
        return "Weak Match"
    else:
        return "Poor Match"

@app.on_event("startup")
async def startup_event():
    """Initialize models on startup"""
    logger.info("Starting ML service...")
    load_spacy_model()
    load_embedding_models()
    load_ml_models()
    logger.info("ML service ready!")

@app.post("/evaluate", response_model=EvaluationResponse)
async def evaluate_resume(
    file: Optional[UploadFile] = File(None),
    resume_text: Optional[str] = Form(None),
    job_text: str = Form(...),
    domain: str = Form("Fullstack")
):
    """Evaluate resume against job description"""
    try:
        # Extract resume text
        if file:
            # Save uploaded file temporarily
            with tempfile.NamedTemporaryFile(delete=False, suffix=f".{file.filename.split('.')[-1]}") as tmp_file:
                content = await file.read()
                tmp_file.write(content)
                tmp_file_path = tmp_file.name
            
            # Extract text based on file type
            if file.filename.endswith('.pdf'):
                resume_text = extract_text_from_pdf(tmp_file_path)
            elif file.filename.endswith('.docx'):
                resume_text = extract_text_from_docx(tmp_file_path)
            else:
                raise HTTPException(status_code=400, detail="Unsupported file type")
            
            # Clean up temp file
            os.unlink(tmp_file_path)
        
        if not resume_text:
            raise HTTPException(status_code=400, detail="No resume text provided")
        
        # Parse resume
        parsed_entities = parse_resume(resume_text)
        
        # Calculate similarity scores
        similarity_scores = calculate_similarity_scores(resume_text, job_text)
        
        # Extract job skills (simple keyword extraction)
        job_skills = []
        job_text_lower = job_text.lower()
        skill_keywords = [
            "python", "java", "javascript", "react", "angular", "vue", "node.js",
            "spring boot", "django", "flask", "fastapi", "express", "mongodb",
            "postgresql", "mysql", "redis", "docker", "kubernetes", "aws", "azure"
        ]
        
        for skill in skill_keywords:
            if skill in job_text_lower:
                job_skills.append(skill.title())
        
        # Calculate match ratios
        skill_match_ratio = calculate_skill_match_ratio(parsed_entities["skills"], job_skills)
        
        # Simple experience and education matching
        experience_match_ratio = min(1.0, parsed_entities["experience_years"] / 5.0)  # Normalize to 5 years
        education_match_ratio = 0.8 if parsed_entities["education"] else 0.3  # Simple binary match
        
        # Calculate final score
        final_score = calculate_final_score(
            similarity_scores, 
            skill_match_ratio, 
            experience_match_ratio, 
            education_match_ratio
        )
        
        # Determine best model
        best_model_name = predict_best_model(domain, np.array([final_score]))
        
        # Get matched and missing skills
        matched_skills = [skill for skill in job_skills if skill.lower() in [s.lower() for s in parsed_entities["skills"]]]
        missing_skills = [skill for skill in job_skills if skill.lower() not in [s.lower() for s in parsed_entities["skills"]]]
        
        # Get recommendation
        recommendation = get_recommendation(final_score)
        
        # Feature importances (simplified)
        feature_importances = {
            "cosine_similarity": CONFIG["weights"]["cosine_similarity"],
            "skill_match": CONFIG["weights"]["skill_match"],
            "experience_match": CONFIG["weights"]["experience_match"],
            "education_match": CONFIG["weights"]["education_match"]
        }
        
        return EvaluationResponse(
            parsed_entities=parsed_entities,
            similarity_scores=similarity_scores,
            skill_match_ratio=skill_match_ratio,
            experience_match_ratio=experience_match_ratio,
            education_match_ratio=education_match_ratio,
            final_score=final_score,
            best_model_name=best_model_name,
            matched_skills=matched_skills,
            missing_skills=missing_skills,
            recommendation=recommendation,
            feature_importances=feature_importances
        )
        
    except Exception as e:
        logger.error(f"Error in evaluation: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/train")
async def train_models():
    """Train ML models using sample data"""
    try:
        # Generate sample training data
        sample_data = generate_sample_training_data()
        
        # Prepare features and labels
        X = sample_data[['cosine_sim_minilm', 'cosine_sim_sbert', 'skill_match_ratio', 
                        'experience_match_ratio', 'education_match_ratio']].values
        y = sample_data['label'].values
        
        # Scale features
        X_scaled = scaler.fit_transform(X)
        
        # Train models
        models = {}
        
        # XGBoost
        xgb_model = xgb.XGBClassifier(random_state=42)
        xgb_model.fit(X_scaled, y)
        models['xgboost'] = xgb_model
        
        # LightGBM
        lgb_model = lgb.LGBMClassifier(random_state=42)
        lgb_model.fit(X_scaled, y)
        models['lightgbm'] = lgb_model
        
        # CatBoost
        cat_model = CatBoostClassifier(random_state=42, verbose=False)
        cat_model.fit(X_scaled, y)
        models['catboost'] = cat_model
        
        # Save models
        for name, model in models.items():
            joblib.dump(model, models_dir / f"{name}_model.pkl")
        
        # Save scaler
        joblib.dump(scaler, models_dir / "scaler.pkl")
        
        # Determine best model per domain (simplified)
        domain_to_best_model = {
            "Fullstack": "xgboost",
            "Cloud": "lightgbm", 
            "Data": "catboost",
            "DevOps": "xgboost"
        }
        
        with open(models_dir / "domain_to_best_model.json", 'w') as f:
            json.dump(domain_to_best_model, f)
        
        # Update global variables
        ml_models.update(models)
        
        return {"message": "Models trained successfully", "models": list(models.keys())}
        
    except Exception as e:
        logger.error(f"Error training models: {e}")
        raise HTTPException(status_code=500, detail=str(e))

def generate_sample_training_data() -> pd.DataFrame:
    """Generate sample training data for model training"""
    np.random.seed(42)
    n_samples = 300
    
    data = {
        'cosine_sim_minilm': np.random.uniform(0.3, 0.9, n_samples),
        'cosine_sim_sbert': np.random.uniform(0.2, 0.8, n_samples),
        'skill_match_ratio': np.random.uniform(0.1, 1.0, n_samples),
        'experience_match_ratio': np.random.uniform(0.0, 1.0, n_samples),
        'education_match_ratio': np.random.uniform(0.0, 1.0, n_samples),
        'label': np.random.randint(0, 2, n_samples)
    }
    
    return pd.DataFrame(data)

@app.get("/models")
async def get_models():
    """Get available models"""
    return {
        "embedding_models": list(embedding_models.keys()),
        "ml_models": list(ml_models.keys()),
        "domain_mapping": domain_to_best_model
    }

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {"status": "healthy", "models_loaded": len(embedding_models) > 0}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)

import pytest
import asyncio
from fastapi.testclient import TestClient
from main import app
import tempfile
import os

client = TestClient(app)

def test_health_check():
    """Test health check endpoint"""
    response = client.get("/health")
    assert response.status_code == 200
    data = response.json()
    assert "status" in data
    assert data["status"] == "healthy"

def test_models_endpoint():
    """Test models endpoint"""
    response = client.get("/models")
    assert response.status_code == 200
    data = response.json()
    assert "embedding_models" in data
    assert "ml_models" in data
    assert "domain_mapping" in data

def test_evaluate_with_text():
    """Test evaluation endpoint with text input"""
    response = client.post(
        "/evaluate",
        data={
            "resume_text": "Software Engineer with 5 years of experience in Python, React, and MongoDB. Bachelor's degree in Computer Science.",
            "job_text": "We are looking for a Full Stack Developer with experience in Python, React, and MongoDB. 3+ years of experience required.",
            "domain": "Fullstack"
        }
    )
    assert response.status_code == 200
    data = response.json()
    
    # Check required fields
    required_fields = [
        "parsed_entities", "similarity_scores", "skill_match_ratio",
        "experience_match_ratio", "education_match_ratio", "final_score",
        "best_model_name", "matched_skills", "missing_skills", "recommendation",
        "feature_importances"
    ]
    
    for field in required_fields:
        assert field in data, f"Missing field: {field}"
    
    # Check data types
    assert isinstance(data["final_score"], float)
    assert 0 <= data["final_score"] <= 1
    assert isinstance(data["matched_skills"], list)
    assert isinstance(data["missing_skills"], list)
    assert isinstance(data["recommendation"], str)

def test_evaluate_with_file():
    """Test evaluation endpoint with file upload"""
    # Create a temporary text file
    with tempfile.NamedTemporaryFile(mode='w', suffix='.txt', delete=False) as tmp_file:
        tmp_file.write("Software Engineer with 5 years of experience in Python, React, and MongoDB.")
        tmp_file_path = tmp_file.name
    
    try:
        with open(tmp_file_path, 'rb') as f:
            response = client.post(
                "/evaluate",
                files={"file": ("resume.txt", f, "text/plain")},
                data={
                    "job_text": "We are looking for a Full Stack Developer with experience in Python, React, and MongoDB.",
                    "domain": "Fullstack"
                }
            )
        
        assert response.status_code == 200
        data = response.json()
        assert "final_score" in data
        assert isinstance(data["final_score"], float)
        
    finally:
        os.unlink(tmp_file_path)

def test_train_models():
    """Test model training endpoint"""
    response = client.post("/train")
    assert response.status_code == 200
    data = response.json()
    assert "message" in data
    assert "models" in data
    assert isinstance(data["models"], list)

def test_evaluate_invalid_input():
    """Test evaluation with invalid input"""
    # Test without resume text or file
    response = client.post(
        "/evaluate",
        data={
            "job_text": "We are looking for a developer.",
            "domain": "Fullstack"
        }
    )
    assert response.status_code == 400

def test_evaluate_missing_job_text():
    """Test evaluation with missing job text"""
    response = client.post(
        "/evaluate",
        data={
            "resume_text": "Software Engineer with Python experience.",
            "domain": "Fullstack"
        }
    )
    assert response.status_code == 422  # Validation error

if __name__ == "__main__":
    pytest.main([__file__])

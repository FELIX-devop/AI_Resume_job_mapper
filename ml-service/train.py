import pandas as pd
import numpy as np
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import xgboost as xgb
import lightgbm as lgb
from catboost import CatBoostClassifier
import joblib
import json
from pathlib import Path

def generate_training_data():
    """Generate comprehensive training data for resume-job matching"""
    np.random.seed(42)
    n_samples = 500
    
    # Generate realistic feature distributions
    data = {
        # Embedding similarity scores (correlated with domain)
        'cosine_sim_minilm': np.random.beta(2, 3, n_samples),  # Skewed towards lower values
        'cosine_sim_sbert': np.random.beta(2, 3, n_samples),
        'cosine_sim_distilbert': np.random.beta(2, 3, n_samples),
        
        # Skill matching features
        'skill_match_ratio': np.random.beta(3, 2, n_samples),  # Skewed towards higher values
        'required_skills_count': np.random.poisson(8, n_samples),
        'resume_skills_count': np.random.poisson(12, n_samples),
        
        # Experience matching
        'experience_match_ratio': np.random.beta(2, 2, n_samples),
        'years_experience': np.random.exponential(3, n_samples),
        'required_years': np.random.exponential(4, n_samples),
        
        # Education matching
        'education_match_ratio': np.random.choice([0.3, 0.8, 1.0], n_samples, p=[0.2, 0.6, 0.2]),
        'has_relevant_degree': np.random.choice([0, 1], n_samples, p=[0.3, 0.7]),
        
        # Text features
        'resume_length': np.random.normal(2000, 500, n_samples),
        'job_description_length': np.random.normal(1500, 300, n_samples),
        
        # Domain features (one-hot encoded)
        'domain_fullstack': np.random.choice([0, 1], n_samples, p=[0.7, 0.3]),
        'domain_cloud': np.random.choice([0, 1], n_samples, p=[0.8, 0.2]),
        'domain_data': np.random.choice([0, 1], n_samples, p=[0.8, 0.2]),
        'domain_devops': np.random.choice([0, 1], n_samples, p=[0.9, 0.1]),
    }
    
    # Create DataFrame
    df = pd.DataFrame(data)
    
    # Generate labels based on realistic criteria
    labels = []
    for _, row in df.iterrows():
        score = 0
        
        # Base score from similarity
        score += row['cosine_sim_minilm'] * 0.3
        score += row['cosine_sim_sbert'] * 0.3
        
        # Skill matching weight
        score += row['skill_match_ratio'] * 0.2
        
        # Experience weight
        score += row['experience_match_ratio'] * 0.1
        
        # Education weight
        score += row['education_match_ratio'] * 0.1
        
        # Domain bonus
        if row['domain_fullstack'] and row['skill_match_ratio'] > 0.6:
            score += 0.1
        elif row['domain_cloud'] and row['skill_match_ratio'] > 0.7:
            score += 0.1
        elif row['domain_data'] and row['skill_match_ratio'] > 0.8:
            score += 0.1
        elif row['domain_devops'] and row['skill_match_ratio'] > 0.8:
            score += 0.1
        
        # Add some noise
        score += np.random.normal(0, 0.05)
        
        # Convert to binary label
        label = 1 if score > 0.5 else 0
        labels.append(label)
    
    df['label'] = labels
    
    return df

def train_models():
    """Train multiple ML models and select the best one"""
    # Generate training data
    df = generate_training_data()
    
    # Prepare features
    feature_columns = [col for col in df.columns if col != 'label']
    X = df[feature_columns]
    y = df['label']
    
    # Split data
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)
    
    # Train models
    models = {}
    results = {}
    
    # XGBoost
    xgb_model = xgb.XGBClassifier(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        random_state=42
    )
    xgb_model.fit(X_train, y_train)
    xgb_pred = xgb_model.predict(X_test)
    xgb_acc = accuracy_score(y_test, xgb_pred)
    
    models['xgboost'] = xgb_model
    results['xgboost'] = {
        'accuracy': xgb_acc,
        'feature_importance': dict(zip(feature_columns, xgb_model.feature_importances_))
    }
    
    # LightGBM
    lgb_model = lgb.LGBMClassifier(
        n_estimators=100,
        max_depth=6,
        learning_rate=0.1,
        random_state=42
    )
    lgb_model.fit(X_train, y_train)
    lgb_pred = lgb_model.predict(X_test)
    lgb_acc = accuracy_score(y_test, lgb_pred)
    
    models['lightgbm'] = lgb_model
    results['lightgbm'] = {
        'accuracy': lgb_acc,
        'feature_importance': dict(zip(feature_columns, lgb_model.feature_importances_))
    }
    
    # CatBoost
    cat_model = CatBoostClassifier(
        iterations=100,
        depth=6,
        learning_rate=0.1,
        random_state=42,
        verbose=False
    )
    cat_model.fit(X_train, y_train)
    cat_pred = cat_model.predict(X_test)
    cat_acc = accuracy_score(y_test, cat_pred)
    
    models['catboost'] = cat_model
    results['catboost'] = {
        'accuracy': cat_acc,
        'feature_importance': dict(zip(feature_columns, cat_model.feature_importances_))
    }
    
    # Select best model per domain
    domain_to_best_model = {}
    domains = ['fullstack', 'cloud', 'data', 'devops']
    
    for domain in domains:
        domain_col = f'domain_{domain}'
        if domain_col in feature_columns:
            # Filter data for this domain
            domain_mask = X_train[domain_col] == 1
            if domain_mask.sum() > 10:  # Ensure enough samples
                domain_X = X_train[domain_mask]
                domain_y = y_train[domain_mask]
                
                # Test each model on domain-specific data
                domain_results = {}
                for name, model in models.items():
                    domain_pred = model.predict(domain_X)
                    domain_acc = accuracy_score(domain_y, domain_pred)
                    domain_results[name] = domain_acc
                
                # Select best model for this domain
                best_model = max(domain_results, key=domain_results.get)
                domain_to_best_model[domain.title()] = best_model
            else:
                # Fallback to overall best model
                best_model = max(results, key=lambda k: results[k]['accuracy'])
                domain_to_best_model[domain.title()] = best_model
    
    # Save models and results
    models_dir = Path("models")
    models_dir.mkdir(exist_ok=True)
    
    for name, model in models.items():
        joblib.dump(model, models_dir / f"{name}_model.pkl")
    
    # Save domain mapping
    with open(models_dir / "domain_to_best_model.json", 'w') as f:
        json.dump(domain_to_best_model, f, indent=2)
    
    # Save training results
    with open(models_dir / "training_results.json", 'w') as f:
        json.dump(results, f, indent=2)
    
    # Save training data for reference
    df.to_csv(models_dir / "training_data.csv", index=False)
    
    print("Model training completed!")
    print(f"Best models per domain: {domain_to_best_model}")
    print("Model accuracies:")
    for name, result in results.items():
        print(f"  {name}: {result['accuracy']:.3f}")
    
    return models, results, domain_to_best_model

if __name__ == "__main__":
    train_models()

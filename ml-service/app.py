"""
FastAPI server for job recommendations using SentenceTransformers
"""
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict
import numpy as np
import pickle
import os
import hashlib
import time
from functools import lru_cache
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
import re

# AWS S3 support (optional)
try:
    import boto3
    from botocore.exceptions import ClientError
    S3_AVAILABLE = True
except ImportError:
    S3_AVAILABLE = False
    print("Warning: boto3 not available. S3 download will be skipped.")

# Google Cloud Storage support (optional)
try:
    from google.cloud import storage
    from google.oauth2 import service_account
    GCS_AVAILABLE = True
except ImportError:
    GCS_AVAILABLE = False
    print("Warning: google-cloud-storage not available. GCS download will be skipped.")

app = FastAPI(title="CareerNetwork ML Service", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # In production, specify your frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for model and data
model = None
job_embeddings = None
jobs_df = None
jobs_index = None
course_embeddings = None
courses_df = None

# Cache simple pour les recommandations (cache en mémoire)
recommendation_cache: Dict[str, tuple] = {}
CACHE_TTL = int(os.getenv("CACHE_TTL_SECONDS", 3600))  # 1 heure par défaut

# Request/Response models
class UserCV(BaseModel):
    skills: str
    experience: str
    education: str
    location: str
    contract_type: Optional[str] = ""
    languages: Optional[str] = ""
    certifications: Optional[str] = ""

class JobRecommendation(BaseModel):
    job_id: Optional[str] = None
    job_role: Optional[str] = None
    company: str
    location: str
    skills_description: str
    score: float
    explanation: Optional[str] = None  # Explication de la recommandation
    matching_skills: Optional[List[str]] = None  # Compétences correspondantes
    missing_skills: Optional[List[str]] = None  # Compétences manquantes
    skill_match_percentage: Optional[float] = None  # Pourcentage de correspondance

class RecommendationFilters(BaseModel):
    location: Optional[str] = None
    salary_min: Optional[float] = None
    salary_max: Optional[float] = None
    contract_type: Optional[str] = None
    experience_level: Optional[str] = None  # "junior", "mid", "senior"
    company_size: Optional[str] = None  # "startup", "small", "medium", "large"

class RecommendationResponse(BaseModel):
    recommendations: List[JobRecommendation]
    message: str
    total_found: Optional[int] = None
    filters_applied: Optional[Dict] = None

class CertificationRecommendation(BaseModel):
    title: str
    description: str
    provider: Optional[str] = None
    level: Optional[str] = None
    skills_covered: Optional[List[str]] = None
    score: float
    relevance_explanation: Optional[str] = None

class CertificationRecommendationResponse(BaseModel):
    recommendations: List[CertificationRecommendation]
    message: str
    skill_gap: Optional[List[str]] = None
    total_found: Optional[int] = None

def download_from_s3(bucket_name: str, s3_key: str, local_path: str):
    """Télécharger un fichier depuis S3"""
    if not S3_AVAILABLE:
        print(f"S3 not available, skipping download of {s3_key}")
        return False
    
    try:
        s3 = boto3.client('s3')
        # Créer le dossier parent si nécessaire
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        s3.download_file(bucket_name, s3_key, local_path)
        print(f"✓ Downloaded {s3_key} to {local_path}")
        return True
    except ClientError as e:
        print(f"✗ Error downloading {s3_key}: {e}")
        return False
    except Exception as e:
        print(f"✗ Unexpected error downloading {s3_key}: {e}")
        return False

def download_model_from_s3(bucket_name: str, model_prefix: str = "models/all-MiniLM-L6-v2/"):
    """Télécharger tous les fichiers du modèle depuis S3"""
    if not S3_AVAILABLE:
        return False
    
    try:
        s3 = boto3.client('s3')
        model_path = "models/all-MiniLM-L6-v2"
        os.makedirs(model_path, exist_ok=True)
        
        print(f"Downloading model from S3: s3://{bucket_name}/{model_prefix}...")
        
        # Lister et télécharger tous les fichiers du modèle
        paginator = s3.get_paginator('list_objects_v2')
        downloaded = 0
        
        for page in paginator.paginate(Bucket=bucket_name, Prefix=model_prefix):
            for obj in page.get('Contents', []):
                key = obj['Key']
                # Extraire le nom de fichier relatif
                relative_path = key.replace(model_prefix, "")
                if relative_path:  # Ignorer les dossiers
                    local_file = os.path.join(model_path, relative_path)
                    local_dir = os.path.dirname(local_file)
                    if local_dir:
                        os.makedirs(local_dir, exist_ok=True)
                    
                    s3.download_file(bucket_name, key, local_file)
                    downloaded += 1
        
        if downloaded > 0:
            print(f"✓ Downloaded {downloaded} model files from S3")
            return True
        else:
            print("⚠ No model files found in S3")
            return False
            
    except ClientError as e:
        print(f"✗ Error downloading model from S3: {e}")
        return False
    except Exception as e:
        print(f"✗ Unexpected error downloading model: {e}")
        return False

def download_data_from_s3(bucket_name: str):
    """Télécharger embeddings et index depuis S3"""
    if not S3_AVAILABLE:
        return False
    
    os.makedirs("data", exist_ok=True)
    
    embeddings_downloaded = download_from_s3(
        bucket_name, 
        "data/job_embeddings.npy", 
        "data/job_embeddings.npy"
    )
    
    index_downloaded = download_from_s3(
        bucket_name, 
        "data/jobs_index.pkl", 
        "data/jobs_index.pkl"
    )
    
    return embeddings_downloaded and index_downloaded

def load_courses_data():
    """Load course/certification data"""
    global course_embeddings, courses_df
    
    try:
        course_embeddings_path = os.getenv("COURSE_EMBEDDINGS_PATH", "data/course_embeddings.npy")
        course_index_path = os.getenv("COURSE_INDEX_PATH", "data/courses_index.pkl")
        
        # Try to download from GCS first
        gcs_bucket = os.getenv("GCS_BUCKET_NAME")
        if gcs_bucket and GCS_AVAILABLE:
            download_from_gcs(gcs_bucket, "data/course_embeddings.npy", course_embeddings_path)
            download_from_gcs(gcs_bucket, "data/courses_index.pkl", course_index_path)
        
        if os.path.exists(course_embeddings_path) and os.path.exists(course_index_path):
            course_embeddings = np.load(course_embeddings_path)
            with open(course_index_path, "rb") as f:
                courses_df = pickle.load(f)
            print(f"✓ Loaded {len(courses_df)} courses and embeddings of shape {course_embeddings.shape}")
        else:
            print("⚠ Course data not found. Certification recommendations will not be available.")
            print("   Run load_courses.py to prepare course data.")
            courses_df = pd.DataFrame()
            course_embeddings = np.array([])
    except Exception as e:
        print(f"Error loading course data: {e}")
        courses_df = pd.DataFrame()
        course_embeddings = np.array([])

def load_model_and_data():
    """Load the SentenceTransformer model and job embeddings"""
    global model, job_embeddings, jobs_df, jobs_index
    
    try:
        # Load model
        model_path = os.getenv("MODEL_PATH", "models/all-MiniLM-L6-v2")
        if not os.path.exists(model_path):
            print(f"Model not found at {model_path}, downloading...")
            model = SentenceTransformer('all-MiniLM-L6-v2')
            os.makedirs("models", exist_ok=True)
            model.save(model_path)
        else:
            model = SentenceTransformer(model_path)
        
        # Load embeddings and job index
        embeddings_path = os.getenv("EMBEDDINGS_PATH", "data/job_embeddings.npy")
        index_path = os.getenv("INDEX_PATH", "data/jobs_index.pkl")
        
        if os.path.exists(embeddings_path) and os.path.exists(index_path):
            job_embeddings = np.load(embeddings_path)
            with open(index_path, "rb") as f:
                jobs_df = pickle.load(f)
            print(f"Loaded {len(jobs_df)} jobs and embeddings of shape {job_embeddings.shape}")
        else:
            print(f"Warning: Embeddings or index not found at {embeddings_path} or {index_path}")
            print("Please run the initialization script first: python ml-service/init_model.py")
            jobs_df = pd.DataFrame()
            job_embeddings = np.array([])
        
    except Exception as e:
        print(f"Error loading model or data: {e}")
        model = None
        job_embeddings = None
        jobs_df = None

def get_gcs_client():
    """Get Google Cloud Storage client"""
    if not GCS_AVAILABLE:
        return None
    
    # Try to use service account key if provided
    service_account_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if service_account_path and os.path.exists(service_account_path):
        from google.oauth2 import service_account
        credentials = service_account.Credentials.from_service_account_file(service_account_path)
        return storage.Client(credentials=credentials)
    else:
        # Use default credentials (Cloud Run uses service account automatically)
        return storage.Client()

def download_from_gcs(bucket_name: str, gcs_path: str, local_path: str):
    """Télécharger un fichier depuis Google Cloud Storage"""
    if not GCS_AVAILABLE:
        print(f"GCS not available, skipping download of {gcs_path}")
        return False
    
    try:
        client = get_gcs_client()
        if not client:
            return False
        
        bucket = client.bucket(bucket_name)
        blob = bucket.blob(gcs_path)
        
        # Créer le dossier parent si nécessaire
        os.makedirs(os.path.dirname(local_path), exist_ok=True)
        
        blob.download_to_filename(local_path)
        print(f"✓ Downloaded gs://{bucket_name}/{gcs_path} to {local_path}")
        return True
    except Exception as e:
        print(f"✗ Error downloading {gcs_path}: {e}")
        return False

def download_model_from_gcs(bucket_name: str, model_prefix: str = "models/all-MiniLM-L6-v2/"):
    """Télécharger tous les fichiers du modèle depuis GCS"""
    if not GCS_AVAILABLE:
        return False
    
    try:
        client = get_gcs_client()
        if not client:
            return False
        
        bucket = client.bucket(bucket_name)
        model_path = "models/all-MiniLM-L6-v2"
        os.makedirs(model_path, exist_ok=True)
        
        print(f"Downloading model from GCS: gs://{bucket_name}/{model_prefix}...")
        
        # Lister et télécharger tous les fichiers du modèle
        blobs = bucket.list_blobs(prefix=model_prefix)
        downloaded = 0
        
        for blob in blobs:
            if blob.name.endswith('/'):
                continue  # Skip directories
            
            # Extraire le nom de fichier relatif
            relative_path = blob.name.replace(model_prefix, "")
            local_file = os.path.join(model_path, relative_path)
            local_dir = os.path.dirname(local_file)
            if local_dir:
                os.makedirs(local_dir, exist_ok=True)
            
            blob.download_to_filename(local_file)
            downloaded += 1
        
        if downloaded > 0:
            print(f"✓ Downloaded {downloaded} model files from GCS")
            return True
        else:
            print("⚠ No model files found in GCS")
            return False
            
    except Exception as e:
        print(f"✗ Error downloading model from GCS: {e}")
        return False

def download_data_from_gcs(bucket_name: str):
    """Télécharger embeddings et index depuis GCS"""
    if not GCS_AVAILABLE:
        return False
    
    os.makedirs("data", exist_ok=True)
    
    embeddings_downloaded = download_from_gcs(
        bucket_name, 
        "data/job_embeddings.npy", 
        "data/job_embeddings.npy"
    )
    
    index_downloaded = download_from_gcs(
        bucket_name, 
        "data/jobs_index.pkl", 
        "data/jobs_index.pkl"
    )
    
    return embeddings_downloaded and index_downloaded

# ==================== FONCTIONS UTILITAIRES POUR AMÉLIORATIONS ====================

def extract_skills(text: str) -> List[str]:
    """Extraire les compétences d'un texte"""
    if not text:
        return []
    
    # Liste de compétences communes (peut être étendue)
    common_skills = [
        "python", "java", "javascript", "react", "node", "sql", "mongodb",
        "docker", "kubernetes", "aws", "azure", "gcp", "machine learning",
        "data science", "ai", "deep learning", "tensorflow", "pytorch",
        "git", "linux", "agile", "scrum", "api", "rest", "graphql"
    ]
    
    text_lower = text.lower()
    found_skills = []
    
    for skill in common_skills:
        if skill in text_lower:
            found_skills.append(skill.title())
    
    # Extraire aussi les mots en majuscules (souvent des technologies)
    words = re.findall(r'\b[A-Z][a-z]+\b', text)
    found_skills.extend([w for w in words if len(w) > 2])
    
    return list(set(found_skills))[:10]  # Limiter à 10 compétences

def generate_explanation(
    user_skills: str,
    job_skills: str,
    score: float,
    matching_skills: List[str],
    missing_skills: List[str]
) -> str:
    """Générer une explication pour une recommandation"""
    explanations = []
    
    # Score général
    if score >= 80:
        explanations.append(f"Excellent match avec {score:.0f}% de correspondance")
    elif score >= 60:
        explanations.append(f"Bon match avec {score:.0f}% de correspondance")
    else:
        explanations.append(f"Match modéré avec {score:.0f}% de correspondance")
    
    # Compétences correspondantes
    if matching_skills:
        skills_text = ", ".join(matching_skills[:5])
        explanations.append(f"Vous possédez les compétences : {skills_text}")
    
    # Compétences manquantes
    if missing_skills:
        missing_text = ", ".join(missing_skills[:3])
        explanations.append(f"Compétences à développer : {missing_text}")
    
    return ". ".join(explanations) + "."

def calculate_skill_match(user_skills: str, job_skills: str) -> tuple:
    """Calculer le pourcentage de correspondance des compétences"""
    user_skill_list = extract_skills(user_skills)
    job_skill_list = extract_skills(job_skills)
    
    if not job_skill_list:
        return [], [], 0.0
    
    matching = [s for s in user_skill_list if s.lower() in [j.lower() for j in job_skill_list]]
    missing = [s for s in job_skill_list if s.lower() not in [u.lower() for u in user_skill_list]]
    
    match_percentage = (len(matching) / len(job_skill_list) * 100) if job_skill_list else 0.0
    
    return matching[:10], missing[:10], round(match_percentage, 1)

def hash_cv(user_cv: UserCV) -> str:
    """Créer un hash du CV pour le cache"""
    cv_string = f"{user_cv.skills}|{user_cv.experience}|{user_cv.education}|{user_cv.location}"
    return hashlib.md5(cv_string.encode()).hexdigest()

def get_cached_recommendations(cache_key: str) -> Optional[RecommendationResponse]:
    """Récupérer des recommandations depuis le cache"""
    if cache_key in recommendation_cache:
        result, timestamp = recommendation_cache[cache_key]
        if time.time() - timestamp < CACHE_TTL:
            return result
        else:
            # Cache expiré, supprimer
            del recommendation_cache[cache_key]
    return None

def set_cached_recommendations(cache_key: str, result: RecommendationResponse):
    """Mettre en cache des recommandations"""
    recommendation_cache[cache_key] = (result, time.time())
    # Limiter la taille du cache (garder les 1000 plus récents)
    if len(recommendation_cache) > 1000:
        # Supprimer les plus anciens
        oldest_key = min(recommendation_cache.keys(), 
                        key=lambda k: recommendation_cache[k][1])
        del recommendation_cache[oldest_key]

def apply_filters(
    jobs_df: pd.DataFrame,
    scores: np.ndarray,
    filters: RecommendationFilters
) -> np.ndarray:
    """Appliquer des filtres aux jobs et ajuster les scores"""
    mask = np.ones(len(jobs_df), dtype=bool)
    
    # Filtre par localisation
    if filters.location:
        location_lower = filters.location.lower()
        mask = mask & jobs_df.apply(
            lambda row: location_lower in str(row.get("Location", "")).lower() or
                       location_lower in str(row.get("location", "")).lower(),
            axis=1
        )
    
    # Filtre par type de contrat
    if filters.contract_type:
        contract_lower = filters.contract_type.lower()
        mask = mask & jobs_df.apply(
            lambda row: contract_lower in str(row.get("Contract_Type", "")).lower() or
                       contract_lower in str(row.get("type", "")).lower(),
            axis=1
        )
    
    # Filtre par salaire (si disponible dans les données)
    if filters.salary_min or filters.salary_max:
        def salary_filter(row):
            salary = row.get("salary", row.get("Salary", 0))
            if isinstance(salary, (int, float)) and salary > 0:
                if filters.salary_min and salary < filters.salary_min:
                    return False
                if filters.salary_max and salary > filters.salary_max:
                    return False
            return True
        mask = mask & jobs_df.apply(salary_filter, axis=1)
    
    # Filtre par niveau d'expérience
    if filters.experience_level:
        exp_lower = filters.experience_level.lower()
        mask = mask & jobs_df.apply(
            lambda row: exp_lower in str(row.get("Job Experience", "")).lower() or
                       exp_lower in str(row.get("experience", "")).lower(),
            axis=1
        )
    
    # Appliquer le masque aux scores (mettre à 0 les jobs filtrés)
    filtered_scores = scores.copy()
    filtered_scores[~mask] = -1  # Score négatif pour exclure
    
    return filtered_scores

@app.on_event("startup")
async def startup_event():
    """Load model and data on startup"""
    # Télécharger depuis S3 si configuré
    s3_bucket = os.getenv("S3_BUCKET_NAME")
    if s3_bucket and S3_AVAILABLE:
        print(f"🔄 S3 bucket configured: {s3_bucket}")
        print("Downloading model and data from S3...")
        
        # Télécharger le modèle
        model_path = os.getenv("MODEL_PATH", "models/all-MiniLM-L6-v2")
        if not os.path.exists(model_path) or not os.path.exists(f"{model_path}/config.json"):
            download_model_from_s3(s3_bucket)
        
        # Télécharger les données
        embeddings_path = os.getenv("EMBEDDINGS_PATH", "data/job_embeddings.npy")
        index_path = os.getenv("INDEX_PATH", "data/jobs_index.pkl")
        if not os.path.exists(embeddings_path) or not os.path.exists(index_path):
            download_data_from_s3(s3_bucket)
    
    # Télécharger depuis GCS si configuré (priorité si les deux sont configurés)
    gcs_bucket = os.getenv("GCS_BUCKET_NAME")
    if gcs_bucket and GCS_AVAILABLE:
        print(f"🔄 GCS bucket configured: {gcs_bucket}")
        print("Downloading model and data from GCS...")
        
        # Télécharger le modèle
        model_path = os.getenv("MODEL_PATH", "models/all-MiniLM-L6-v2")
        if not os.path.exists(model_path) or not os.path.exists(f"{model_path}/config.json"):
            download_model_from_gcs(gcs_bucket)
        
        # Télécharger les données
        embeddings_path = os.getenv("EMBEDDINGS_PATH", "data/job_embeddings.npy")
        index_path = os.getenv("INDEX_PATH", "data/jobs_index.pkl")
        if not os.path.exists(embeddings_path) or not os.path.exists(index_path):
            download_data_from_gcs(gcs_bucket)
    
    # Charger le modèle et les données
    load_model_and_data()
    # Charger les données de certifications
    load_courses_data()
    # Charger les données de certifications
    load_courses_data()

@app.get("/")
async def root():
    """Health check endpoint"""
    return {
        "status": "ok",
        "message": "CareerNetwork ML Service is running",
        "model_loaded": model is not None,
        "jobs_count": len(jobs_df) if jobs_df is not None else 0
    }

@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "jobs_count": len(jobs_df) if jobs_df is not None else 0,
        "courses_count": len(courses_df) if courses_df is not None else 0
    }

@app.post("/api/recommend", response_model=RecommendationResponse)
async def recommend_jobs(user_cv: UserCV, top_n: int = Query(5, ge=1, le=50)):
    """
    Get job recommendations based on user CV with explanations
    
    Args:
        user_cv: User CV information
        top_n: Number of recommendations to return (default: 5)
    
    Returns:
        List of recommended jobs with similarity scores and explanations
    """
    if model is None or job_embeddings is None or jobs_df is None or len(jobs_df) == 0:
        raise HTTPException(
            status_code=503,
            detail="Model or job data not loaded. Please run the initialization script first."
        )
    
    try:
        # Vérifier le cache
        cache_key = hash_cv(user_cv) + f"|{top_n}"
        cached_result = get_cached_recommendations(cache_key)
        if cached_result:
            return cached_result
        
        # Create combined text from user CV
        cv_text = (
            f"{user_cv.skills} {user_cv.experience} {user_cv.education} "
            f"{user_cv.location} {user_cv.contract_type} "
            f"{user_cv.languages} {user_cv.certifications}"
        )
        
        # Encode user CV
        cv_emb = model.encode([cv_text], convert_to_numpy=True)
        
        # Calculate cosine similarity
        scores = cosine_similarity(cv_emb, job_embeddings).flatten()
        
        # Get top N*2 recommendations initially to filter out those with 0 matching skills
        top_idx = scores.argsort()[::-1][:top_n * 2]
        
        # Prepare results with explanations and filter out jobs with 0 matching skills
        recommendations = []
        for idx in top_idx:
            job = jobs_df.iloc[idx]
            score = round(float(scores[idx] * 100), 2)
            
            # Extraire les compétences du job
            job_skills_text = job.get("Skills/Description", job.get("description", ""))
            
            # Calculer la correspondance des compétences
            matching_skills, missing_skills, skill_match_pct = calculate_skill_match(
                user_cv.skills,
                job_skills_text
            )
            
            # Filtrer les offres avec 0 compétences correspondantes
            if not matching_skills or len(matching_skills) == 0 or skill_match_pct == 0:
                continue  # Skip jobs with no matching skills
            
            # Générer l'explication
            explanation = generate_explanation(
                user_cv.skills,
                job_skills_text,
                score,
                matching_skills,
                missing_skills
            )
            
            recommendation = JobRecommendation(
                job_id=str(job.get("_id", "")) if "_id" in job else None,
                job_role=job.get("Job_Role", job.get("title", "")),
                company=job.get("Company", job.get("company", "")),
                location=job.get("Location", job.get("location", "")),
                skills_description=job_skills_text,
                score=score,
                explanation=explanation,
                matching_skills=matching_skills if matching_skills else None,
                missing_skills=missing_skills if missing_skills else None,
                skill_match_percentage=skill_match_pct
            )
            recommendations.append(recommendation)
            
            # Limiter au nombre demandé après filtrage
            if len(recommendations) >= top_n:
                break
        
        result = RecommendationResponse(
            recommendations=recommendations,
            message=f"Found {len(recommendations)} recommendations",
            total_found=len(recommendations)
        )
        
        # Mettre en cache
        set_cached_recommendations(cache_key, result)
        
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")

@app.post("/api/recommend-filtered", response_model=RecommendationResponse)
async def recommend_jobs_filtered(
    user_cv: UserCV,
    filters: Optional[RecommendationFilters] = None,
    top_n: int = Query(5, ge=1, le=50)
):
    """
    Get job recommendations with advanced filters
    
    Args:
        user_cv: User CV information
        filters: Optional filters (location, salary, contract_type, etc.)
        top_n: Number of recommendations to return (default: 5)
    
    Returns:
        List of filtered recommended jobs with explanations
    """
    if model is None or job_embeddings is None or jobs_df is None or len(jobs_df) == 0:
        raise HTTPException(
            status_code=503,
            detail="Model or job data not loaded. Please run the initialization script first."
        )
    
    try:
        # Vérifier le cache avec filtres
        filters_str = filters.json() if filters else "no_filters"
        cache_key = hash_cv(user_cv) + f"|{top_n}|{filters_str}"
        cached_result = get_cached_recommendations(cache_key)
        if cached_result:
            return cached_result
        
        # Create combined text from user CV
        cv_text = (
            f"{user_cv.skills} {user_cv.experience} {user_cv.education} "
            f"{user_cv.location} {user_cv.contract_type} "
            f"{user_cv.languages} {user_cv.certifications}"
        )
        
        # Encode user CV
        cv_emb = model.encode([cv_text], convert_to_numpy=True)
        
        # Calculate cosine similarity
        scores = cosine_similarity(cv_emb, job_embeddings).flatten()
        
        # Appliquer les filtres si fournis
        if filters:
            scores = apply_filters(jobs_df, scores, filters)
        
        # Get top N recommendations (exclure les scores négatifs)
        valid_indices = np.where(scores >= 0)[0]
        if len(valid_indices) == 0:
            return RecommendationResponse(
                recommendations=[],
                message="No jobs found matching the filters",
                total_found=0,
                filters_applied=filters.dict() if filters else None
            )
        
        # Trier par score et prendre le top N*2 pour filtrer ensuite
        valid_scores = scores[valid_indices]
        top_valid_idx = valid_scores.argsort()[::-1][:top_n * 2]
        top_idx = valid_indices[top_valid_idx]
        
        # Prepare results with explanations and filter out jobs with 0 matching skills
        recommendations = []
        for idx in top_idx:
            job = jobs_df.iloc[idx]
            score = round(float(scores[idx] * 100), 2)
            
            # Extraire les compétences du job
            job_skills_text = job.get("Skills/Description", job.get("description", ""))
            
            # Calculer la correspondance des compétences
            matching_skills, missing_skills, skill_match_pct = calculate_skill_match(
                user_cv.skills,
                job_skills_text
            )
            
            # Filtrer les offres avec 0 compétences correspondantes
            if not matching_skills or len(matching_skills) == 0 or skill_match_pct == 0:
                continue  # Skip jobs with no matching skills
            
            # Générer l'explication
            explanation = generate_explanation(
                user_cv.skills,
                job_skills_text,
                score,
                matching_skills,
                missing_skills
            )
            
            recommendation = JobRecommendation(
                job_id=str(job.get("_id", "")) if "_id" in job else None,
                job_role=job.get("Job_Role", job.get("title", "")),
                company=job.get("Company", job.get("company", "")),
                location=job.get("Location", job.get("location", "")),
                skills_description=job_skills_text,
                score=score,
                explanation=explanation,
                matching_skills=matching_skills if matching_skills else None,
                missing_skills=missing_skills if missing_skills else None,
                skill_match_percentage=skill_match_pct
            )
            recommendations.append(recommendation)
            
            # Limiter au nombre demandé après filtrage
            if len(recommendations) >= top_n:
                break
        
        result = RecommendationResponse(
            recommendations=recommendations,
            message=f"Found {len(recommendations)} recommendations matching your filters",
            total_found=len(valid_indices),
            filters_applied=filters.dict() if filters else None
        )
        
        # Mettre en cache
        set_cached_recommendations(cache_key, result)
        
        return result
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating filtered recommendations: {str(e)}")

@app.post("/api/recommend-batch")
async def recommend_jobs_batch(user_cvs: List[UserCV], top_n: int = 5):
    """
    Get job recommendations for multiple users (batch processing)
    """
    if model is None or job_embeddings is None or jobs_df is None or len(jobs_df) == 0:
        raise HTTPException(
            status_code=503,
            detail="Model or job data not loaded. Please run the initialization script first."
        )
    
    results = []
    for user_cv in user_cvs:
        try:
            response = await recommend_jobs(user_cv, top_n)
            results.append(response.dict())
        except Exception as e:
            results.append({"error": str(e)})
    
    return {"results": results}

@app.post("/api/recommend-certifications", response_model=CertificationRecommendationResponse)
async def recommend_certifications(
    user_cv: UserCV,
    target_job_role: Optional[str] = None,
    top_n: int = Query(5, ge=1, le=20)
):
    """
    Get certification/course recommendations based on user profile and skill gaps
    
    Args:
        user_cv: User CV information
        target_job_role: Target job role (optional, used to identify skill gaps)
        top_n: Number of recommendations to return (default: 5)
    
    Returns:
        List of recommended certifications/courses with explanations
    """
    if model is None:
        raise HTTPException(
            status_code=503,
            detail="Model not loaded. Please run the initialization script first."
        )
    
    if courses_df is None or len(courses_df) == 0 or course_embeddings is None or len(course_embeddings) == 0:
        raise HTTPException(
            status_code=503,
            detail="Course data not loaded. Please run load_courses.py to prepare course data."
        )
    
    try:
        # Extract user skills
        user_skills_list = extract_skills(user_cv.skills)
        
        # If target job role is provided, find skill gaps from job recommendations
        skill_gap = []
        if target_job_role and jobs_df is not None and len(jobs_df) > 0:
            # Find a similar job to identify required skills
            job_texts = (
                jobs_df.get("Job_Role", jobs_df.get("title", "")) + " " +
                jobs_df.get("Skills/Description", jobs_df.get("description", ""))
            ).tolist()
            
            target_text = f"{target_job_role} {user_cv.skills}"
            target_emb = model.encode([target_text], convert_to_numpy=True)
            
            if job_embeddings is not None and len(job_embeddings) > 0:
                job_scores = cosine_similarity(target_emb, job_embeddings).flatten()
                best_job_idx = job_scores.argsort()[-1]
                best_job = jobs_df.iloc[best_job_idx]
                
                # Extract required skills from the job
                job_skills_text = best_job.get("Skills/Description", best_job.get("description", ""))
                job_skills_list = extract_skills(job_skills_text)
                
                # Calculate skill gap
                skill_gap = [s for s in job_skills_list if s.lower() not in [u.lower() for u in user_skills_list]]
        
        # Create user text for course recommendation
        if skill_gap:
            user_text = f"""
            Target job: {target_job_role or 'Career growth'}
            Current skills: {', '.join(user_skills_list)}
            Missing skills: {', '.join(skill_gap)}
            """
        else:
            user_text = f"""
            Current skills: {', '.join(user_skills_list)}
            Experience: {user_cv.experience}
            Education: {user_cv.education}
            """
        
        # Encode user text
        user_emb = model.encode([user_text], convert_to_numpy=True)
        
        # Calculate similarity with courses
        similarities = cosine_similarity(user_emb, course_embeddings).flatten()
        
        # Get top N recommendations
        top_idx = similarities.argsort()[-top_n:][::-1]
        
        # Prepare results
        recommendations = []
        for idx in top_idx:
            course = courses_df.iloc[idx]
            score = round(float(similarities[idx] * 100), 2)
            
            # Extract skills from course description
            course_skills = extract_skills(course.get("description", "") + " " + course.get("skills", ""))
            
            # Generate explanation
            explanation_parts = []
            if skill_gap:
                matching_gap_skills = [s for s in skill_gap if s.lower() in [c.lower() for c in course_skills]]
                if matching_gap_skills:
                    explanation_parts.append(f"Covers {len(matching_gap_skills)} of your missing skills: {', '.join(matching_gap_skills[:3])}")
            
            if course_skills:
                relevant_skills = [s for s in user_skills_list if s.lower() in [c.lower() for c in course_skills]]
                if relevant_skills:
                    explanation_parts.append(f"Builds on your existing skills: {', '.join(relevant_skills[:2])}")
            
            explanation = ". ".join(explanation_parts) if explanation_parts else f"Relevant course with {score:.0f}% match to your profile"
            
            recommendation = CertificationRecommendation(
                title=course.get("title", "Unknown Course"),
                description=course.get("description", ""),
                provider=course.get("provider"),
                level=course.get("level"),
                skills_covered=course_skills[:10] if course_skills else None,
                score=score,
                relevance_explanation=explanation
            )
            recommendations.append(recommendation)
        
        return CertificationRecommendationResponse(
            recommendations=recommendations,
            message=f"Found {len(recommendations)} certification recommendations",
            skill_gap=skill_gap[:10] if skill_gap else None,
            total_found=len(recommendations)
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating certification recommendations: {str(e)}")

@app.get("/api/cache/stats")
async def get_cache_stats():
    """Get cache statistics"""
    return {
        "cache_size": len(recommendation_cache),
        "cache_ttl_seconds": CACHE_TTL,
        "max_cache_size": 1000
    }

@app.delete("/api/cache/clear")
async def clear_cache():
    """Clear the recommendation cache"""
    global recommendation_cache
    cleared_count = len(recommendation_cache)
    recommendation_cache.clear()
    return {
        "message": "Cache cleared successfully",
        "items_cleared": cleared_count
    }

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)



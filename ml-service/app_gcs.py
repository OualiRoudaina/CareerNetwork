"""
FastAPI server for job recommendations using SentenceTransformers
Version with Google Cloud Storage support
"""
from fastapi import FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional
import numpy as np
import pickle
import os
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd

# Google Cloud Storage support
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

class RecommendationResponse(BaseModel):
    recommendations: List[JobRecommendation]
    message: str

def get_gcs_client():
    """Get Google Cloud Storage client"""
    if not GCS_AVAILABLE:
        return None
    
    # Try to use service account key if provided
    service_account_path = os.getenv("GOOGLE_APPLICATION_CREDENTIALS")
    if service_account_path and os.path.exists(service_account_path):
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

@app.on_event("startup")
async def startup_event():
    """Load model and data on startup"""
    # Télécharger depuis GCS si configuré
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
    return {"status": "healthy"}

@app.post("/api/recommend", response_model=RecommendationResponse)
async def recommend_jobs(user_cv: UserCV, top_n: int = Query(5, ge=1, le=50)):
    """
    Get job recommendations based on user CV
    
    Args:
        user_cv: User CV information
        top_n: Number of recommendations to return (default: 5)
    
    Returns:
        List of recommended jobs with similarity scores
    """
    if model is None or job_embeddings is None or jobs_df is None or len(jobs_df) == 0:
        raise HTTPException(
            status_code=503,
            detail="Model or job data not loaded. Please run the initialization script first."
        )
    
    try:
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
        
        # Get top N recommendations
        top_idx = scores.argsort()[::-1][:top_n]
        
        # Prepare results
        recommendations = []
        for idx in top_idx:
            job = jobs_df.iloc[idx]
            recommendation = JobRecommendation(
                job_id=str(job.get("_id", "")) if "_id" in job else None,
                job_role=job.get("Job_Role", job.get("title", "")),
                company=job.get("Company", job.get("company", "")),
                location=job.get("Location", job.get("location", "")),
                skills_description=job.get("Skills/Description", job.get("description", "")),
                score=round(float(scores[idx] * 100), 2)
            )
            recommendations.append(recommendation)
        
        return RecommendationResponse(
            recommendations=recommendations,
            message=f"Found {len(recommendations)} recommendations"
        )
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating recommendations: {str(e)}")

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

if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8080))
    uvicorn.run(app, host="0.0.0.0", port=port)





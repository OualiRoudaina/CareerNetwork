"""
Script to sync jobs from MongoDB with the recommendation system and upload to S3
This script:
1. Fetches jobs from MongoDB
2. Generates embeddings
3. Saves locally
4. Uploads to S3 for use by AWS App Runner
"""
import os
import sys
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
import pickle
from pymongo import MongoClient
from typing import List, Dict

# AWS S3 support
try:
    import boto3
    from botocore.exceptions import ClientError
    S3_AVAILABLE = True
except ImportError:
    S3_AVAILABLE = False
    print("Warning: boto3 not available. S3 upload will be skipped.")

def connect_mongodb():
    """Connect to MongoDB"""
    mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/careernetwork")
    if not mongo_uri:
        raise ValueError("MONGODB_URI environment variable is required")
    client = MongoClient(mongo_uri)
    db = client.get_database()
    return db

def fetch_jobs_from_mongodb(db):
    """Fetch all active jobs from MongoDB"""
    print("Fetching jobs from MongoDB...")
    jobs = list(db.jobs.find({"isActive": True}))
    print(f"Found {len(jobs)} active jobs")
    return jobs

def convert_mongodb_to_dataframe(jobs: List[Dict]):
    """Convert MongoDB jobs to pandas DataFrame"""
    if not jobs:
        print("No jobs found in MongoDB")
        return pd.DataFrame()
    
    # Convert to DataFrame
    df = pd.DataFrame(jobs)
    
    # Map MongoDB fields to expected format
    def create_job_text(row):
        skills = " ".join(row.get("skills", [])) if isinstance(row.get("skills"), list) else str(row.get("skills", ""))
        description = str(row.get("description", ""))
        experience = str(row.get("experience", ""))
        location = str(row.get("location", ""))
        job_type = str(row.get("type", ""))
        requirements = " ".join(row.get("requirements", [])) if isinstance(row.get("requirements"), list) else str(row.get("requirements", ""))
        
        return f"{skills} {description} {experience} {location} {job_type} {requirements}"
    
    df['job_text'] = df.apply(create_job_text, axis=1)
    
    # Add columns for compatibility with recommendation system
    df['_id'] = df.get('_id', '')
    df['Job_Role'] = df.get('title', '')
    df['Company'] = df.get('company', '')
    df['Location'] = df.get('location', '')
    df['Skills/Description'] = df.apply(
        lambda row: " ".join(row.get("skills", [])) + " " + str(row.get("description", "")),
        axis=1
    )
    df['Job Experience'] = df.get('experience', '')
    df['Contract_Type'] = df.get('type', '')
    
    return df

def generate_embeddings_for_jobs(df, model):
    """Generate embeddings for jobs"""
    if len(df) == 0:
        return np.array([])
    
    print("Generating embeddings...")
    embeddings = model.encode(df['job_text'].tolist(), convert_to_numpy=True)
    print(f"Generated embeddings with shape: {embeddings.shape}")
    return embeddings

def save_embeddings_and_index(embeddings, df):
    """Save embeddings and job index locally"""
    os.makedirs("data", exist_ok=True)
    
    embeddings_path = "data/job_embeddings.npy"
    index_path = "data/jobs_index.pkl"
    
    print(f"Saving embeddings to {embeddings_path}...")
    np.save(embeddings_path, embeddings)
    
    print(f"Saving job index to {index_path}...")
    with open(index_path, "wb") as f:
        pickle.dump(df, f)
    
    print("✓ Data saved locally successfully!")
    return embeddings_path, index_path

def upload_to_s3(bucket_name: str, local_path: str, s3_key: str):
    """Upload a file to S3"""
    if not S3_AVAILABLE:
        print(f"S3 not available, skipping upload of {local_path}")
        return False
    
    try:
        s3 = boto3.client('s3')
        s3.upload_file(local_path, bucket_name, s3_key)
        print(f"✓ Uploaded {local_path} to s3://{bucket_name}/{s3_key}")
        return True
    except ClientError as e:
        print(f"✗ Error uploading {local_path}: {e}")
        return False
    except Exception as e:
        print(f"✗ Unexpected error uploading {local_path}: {e}")
        return False

def upload_model_to_s3(bucket_name: str, model_path: str = "models/all-MiniLM-L6-v2"):
    """Upload model files to S3"""
    if not S3_AVAILABLE:
        print("S3 not available, skipping model upload")
        return False
    
    if not os.path.exists(model_path):
        print(f"Model path {model_path} does not exist")
        return False
    
    try:
        s3 = boto3.client('s3')
        uploaded = 0
        
        print(f"Uploading model from {model_path} to S3...")
        
        for root, dirs, files in os.walk(model_path):
            for file in files:
                local_file = os.path.join(root, file)
                # Créer la clé S3 en conservant la structure relative
                relative_path = os.path.relpath(local_file, "models")
                s3_key = f"models/{relative_path}".replace("\\", "/")
                
                s3.upload_file(local_file, bucket_name, s3_key)
                uploaded += 1
        
        if uploaded > 0:
            print(f"✓ Uploaded {uploaded} model files to S3")
            return True
        else:
            print("⚠ No model files to upload")
            return False
            
    except Exception as e:
        print(f"✗ Error uploading model: {e}")
        return False

def main():
    """Main function to sync MongoDB jobs and upload to S3"""
    print("=" * 60)
    print("Syncing MongoDB Jobs with Recommendation System")
    print("Uploading to S3 for AWS deployment")
    print("=" * 60)
    
    try:
        # Vérifier les variables d'environnement
        mongo_uri = os.getenv("MONGODB_URI")
        if not mongo_uri:
            print("✗ Error: MONGODB_URI environment variable is required")
            return 1
        
        s3_bucket = os.getenv("S3_BUCKET_NAME")
        if s3_bucket:
            print(f"✓ S3 bucket configured: {s3_bucket}")
        else:
            print("⚠ S3_BUCKET_NAME not set, skipping S3 upload")
        
        # Connect to MongoDB
        db = connect_mongodb()
        
        # Fetch jobs
        jobs = fetch_jobs_from_mongodb(db)
        
        if not jobs:
            print("No jobs found. Please add jobs to MongoDB first.")
            return 1
        
        # Convert to DataFrame
        df = convert_mongodb_to_dataframe(jobs)
        
        # Load model
        model_path = os.getenv("MODEL_PATH", "models/all-MiniLM-L6-v2")
        if not os.path.exists(model_path):
            print(f"Model not found at {model_path}, downloading...")
            model = SentenceTransformer('all-MiniLM-L6-v2')
            os.makedirs("models", exist_ok=True)
            model.save(model_path)
        else:
            print(f"Loading model from {model_path}...")
            model = SentenceTransformer(model_path)
        
        # Generate embeddings
        embeddings = generate_embeddings_for_jobs(df, model)
        
        # Save locally
        embeddings_path, index_path = save_embeddings_and_index(embeddings, df)
        
        # Upload to S3 if configured
        if s3_bucket and S3_AVAILABLE:
            print("\n" + "=" * 60)
            print("Uploading to S3...")
            print("=" * 60)
            
            # Upload embeddings and index
            upload_to_s3(s3_bucket, embeddings_path, "data/job_embeddings.npy")
            upload_to_s3(s3_bucket, index_path, "data/jobs_index.pkl")
            
            # Upload model if it doesn't exist in S3 (optionnel, peut être fait une seule fois)
            upload_model = os.getenv("UPLOAD_MODEL_TO_S3", "false").lower() == "true"
            if upload_model:
                upload_model_to_s3(s3_bucket, model_path)
            else:
                print("⚠ Model upload skipped (set UPLOAD_MODEL_TO_S3=true to upload)")
        
        print("\n" + "=" * 60)
        print("✓ Sync completed successfully!")
        print("=" * 60)
        print(f"Total jobs synced: {len(df)}")
        print(f"Embeddings shape: {embeddings.shape}")
        if s3_bucket:
            print(f"✓ Data uploaded to S3 bucket: {s3_bucket}")
        print("\nThe recommendation system is now ready to use your MongoDB jobs.")
        
    except Exception as e:
        print(f"\n✗ Error during sync: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())





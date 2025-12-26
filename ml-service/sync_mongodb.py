"""
Script to sync jobs from MongoDB with the recommendation system
This allows using your own job database instead of Kaggle data
"""
import os
import sys
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
import pickle
from pymongo import MongoClient
from typing import List, Dict

def connect_mongodb():
    """Connect to MongoDB"""
    mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/careernetwork")
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
    # Create job_text similar to Kaggle dataset format
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
    df['_id'] = df.get('_id', '')  # Keep MongoDB ID
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
    """Save embeddings and job index"""
    os.makedirs("data", exist_ok=True)
    
    embeddings_path = "data/job_embeddings.npy"
    index_path = "data/jobs_index.pkl"
    
    print(f"Saving embeddings to {embeddings_path}...")
    np.save(embeddings_path, embeddings)
    
    print(f"Saving job index to {index_path}...")
    with open(index_path, "wb") as f:
        pickle.dump(df, f)
    
    print("✓ Data saved successfully!")

def main():
    """Main function to sync MongoDB jobs"""
    print("=" * 60)
    print("Syncing MongoDB Jobs with Recommendation System")
    print("=" * 60)
    
    try:
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
        
        # Save everything
        save_embeddings_and_index(embeddings, df)
        
        print("\n" + "=" * 60)
        print("✓ Sync completed successfully!")
        print("=" * 60)
        print(f"Total jobs synced: {len(df)}")
        print(f"Embeddings shape: {embeddings.shape}")
        print("\nThe recommendation system is now ready to use your MongoDB jobs.")
        
    except Exception as e:
        print(f"\n✗ Error during sync: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())


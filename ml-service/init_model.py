"""
Script to initialize the job recommendation model
Downloads data from Kaggle, creates embeddings, and saves them
"""
import pandas as pd
import numpy as np
from sentence_transformers import SentenceTransformer
import pickle
import os

# Try to import kaggle API
try:
    import kaggle
    KAGGLE_AVAILABLE = True
except ImportError:
    KAGGLE_AVAILABLE = False
    print("Warning: kaggle package not installed. Install with: pip install kaggle")

def download_and_prepare_data():
    """Download dataset from Kaggle and prepare it"""
    if not KAGGLE_AVAILABLE:
        raise ImportError("Kaggle API not available. Please install kaggle package: pip install kaggle")
    
    print("Downloading dataset from Kaggle...")
    
    # Download the dataset
    dataset_name = "anandhuh/data-science-jobs-in-india"
    download_path = "data/kaggle_datasets/jobs"
    os.makedirs(download_path, exist_ok=True)
    
    kaggle.api.dataset_download_files(dataset_name, path=download_path, unzip=True)
    print(f"Dataset downloaded to: {download_path}")
    
    # Find CSV files
    csv_files = [f for f in os.listdir(download_path) if f.endswith('.csv')]
    print(f"CSV files found: {csv_files}")
    
    if not csv_files:
        raise FileNotFoundError("No CSV files found in the downloaded dataset")
    
    # Load the main CSV
    df = pd.read_csv(os.path.join(download_path, csv_files[0]))
    print(f"Loaded {len(df)} jobs from dataset")
    
    # Add missing columns if they don't exist
    for col in ["Contract_Type", "Languages", "Certifications", "Education_Level"]:
        if col not in df.columns:
            df[col] = ""
            print(f"Added missing column: {col}")
    
    return df

def create_job_text(df):
    """Create combined text for embeddings"""
    print("Creating combined job text...")
    
    # Create combined text from all relevant columns
    df['job_text'] = (
        df['Skills/Description'].fillna("") + " " +
        df['Job Experience'].fillna("") + " " +
        df['Location'].fillna("") + " " +
        df['Contract_Type'].fillna("") + " " +
        df['Languages'].fillna("") + " " +
        df['Certifications'].fillna("") + " " +
        df['Education_Level'].fillna("")
    )
    
    return df

def generate_embeddings(df):
    """Generate embeddings for all jobs"""
    print("Loading SentenceTransformer model...")
    model = SentenceTransformer('all-MiniLM-L6-v2')
    
    print("Generating embeddings (this may take a while)...")
    job_embeddings = model.encode(df['job_text'].tolist(), convert_to_numpy=True)
    
    print(f"Generated embeddings with shape: {job_embeddings.shape}")
    
    return model, job_embeddings

def save_model_and_data(model, embeddings, df):
    """Save model, embeddings, and job index"""
    # Create directories
    os.makedirs("models", exist_ok=True)
    os.makedirs("data", exist_ok=True)
    
    # Save model
    model_path = "models/all-MiniLM-L6-v2"
    print(f"Saving model to {model_path}...")
    model.save(model_path)
    
    # Save embeddings
    embeddings_path = "data/job_embeddings.npy"
    print(f"Saving embeddings to {embeddings_path}...")
    np.save(embeddings_path, embeddings)
    
    # Save job index
    index_path = "data/jobs_index.pkl"
    print(f"Saving job index to {index_path}...")
    with open(index_path, "wb") as f:
        pickle.dump(df, f)
    
    print("✓ Model, embeddings, and index saved successfully!")

def main():
    """Main function to initialize the model"""
    print("=" * 60)
    print("Initializing Job Recommendation Model")
    print("=" * 60)
    
    try:
        # Step 1: Download and prepare data
        df = download_and_prepare_data()
        
        # Step 2: Create combined job text
        df = create_job_text(df)
        
        # Step 3: Generate embeddings
        model, embeddings = generate_embeddings(df)
        
        # Step 4: Save everything
        save_model_and_data(model, embeddings, df)
        
        print("\n" + "=" * 60)
        print("✓ Initialization completed successfully!")
        print("=" * 60)
        print(f"Total jobs processed: {len(df)}")
        print(f"Embeddings shape: {embeddings.shape}")
        print("\nYou can now start the FastAPI server with:")
        print("  python ml-service/app.py")
        print("  or")
        print("  uvicorn ml-service.app:app --reload")
        
    except Exception as e:
        print(f"\n✗ Error during initialization: {e}")
        import traceback
        traceback.print_exc()
        return 1
    
    return 0

if __name__ == "__main__":
    exit(main())









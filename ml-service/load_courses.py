"""
Script to load and prepare course/certification data for recommendations
This script can be run to prepare course data from various sources
"""
import pandas as pd
import numpy as np
import pickle
import os
import zipfile
from sentence_transformers import SentenceTransformer
from typing import List, Dict

# Try to import kaggle API
KAGGLE_AVAILABLE = False
try:
    # Import kaggle module but catch authentication errors
    import sys
    import os
    
    # Check if kaggle.json exists before importing
    kaggle_dir = os.path.expanduser("~/.kaggle")
    kaggle_json = os.path.join(kaggle_dir, "kaggle.json")
    
    if os.path.exists(kaggle_json):
        try:
            import kaggle
            KAGGLE_AVAILABLE = True
        except Exception as e:
            print(f"Warning: Could not initialize Kaggle API: {e}")
            print("   Continuing without Kaggle datasets...")
    else:
        print("Warning: Kaggle API credentials not configured.")
        print("   To use Kaggle datasets, configure credentials:")
        print("   1. Go to https://www.kaggle.com/settings -> API")
        print("   2. Create a new API token (downloads kaggle.json)")
        print("   3. Place kaggle.json in ~/.kaggle/ (or C:\\Users\\YourUsername\\.kaggle\\ on Windows)")
        print("   4. Set permissions: chmod 600 ~/.kaggle/kaggle.json")
        print("   Continuing without Kaggle datasets...")
except ImportError:
    print("Warning: kaggle package not installed. Install with: pip install kaggle")
    print("   Continuing without Kaggle datasets...")

def load_courses_from_kaggle():
    """Load courses from Kaggle datasets"""
    courses = []
    
    if not KAGGLE_AVAILABLE:
        print("Warning: Kaggle API not available. Skipping Kaggle dataset download.")
        return courses
    
    try:
        # Dataset 1: Coursera Course Details
        dataset_name = 'anusreemohanan/coursera-course-details'
        download_path = 'data/kaggle_datasets/coursera'
        os.makedirs(download_path, exist_ok=True)
        
        # Check if dataset already exists
        csv_files = [f for f in os.listdir(download_path) if f.endswith('.csv')]
        if not csv_files:
            print("Downloading Coursera course details from Kaggle...")
            # Download dataset
            kaggle.api.dataset_download_files(dataset_name, path=download_path, unzip=True)
            print(f"Coursera dataset downloaded to: {download_path}")
            # Re-check for CSV files after download
            csv_files = [f for f in os.listdir(download_path) if f.endswith('.csv')]
        else:
            print(f"Using existing Coursera dataset from {download_path}")
        
        # Find CSV files in the dataset
        if csv_files:
            # Try different encodings
            csv_path = os.path.join(download_path, csv_files[0])
            encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252']
            coursera_df = None
            for encoding in encodings:
                try:
                    coursera_df = pd.read_csv(csv_path, encoding=encoding)
                    print(f"Loaded {len(coursera_df)} Coursera courses (encoding: {encoding})")
                    break
                except (UnicodeDecodeError, UnicodeError):
                    continue
            
            if coursera_df is None:
                print(f"Warning: Could not read CSV file with any encoding. Skipping Coursera dataset.")
            else:
                # Map columns based on actual Coursera CSV structure: Institute, Link, Coursename, Skills, Rating, Review, Level, Type, Duration, Platform
                for _, row in coursera_df.iterrows():
                    title = row.get("Coursename") or row.get("course_title") or row.get("Course Name") or row.get("title")
                    skills = row.get("Skills") or row.get("skills") or row.get("course_skills") or ""
                    level = row.get("Level") or row.get("course_level") or row.get("level") or ""
                    provider = row.get("Institute") or row.get("course_organization") or row.get("Organization") or "Coursera"
                    rating = row.get("Rating", "")
                    review = row.get("Review", "")
                    duration = row.get("Duration", "")
                    
                    # Create description from available fields
                    desc_parts = []
                    if pd.notna(skills) and str(skills).strip() and str(skills).strip() != "NA":
                        desc_parts.append(f"Skills: {skills}")
                    if pd.notna(level) and str(level).strip():
                        desc_parts.append(f"Level: {level.strip()}")
                    if pd.notna(rating) and str(rating).strip():
                        desc_parts.append(f"Rating: {rating}")
                    if pd.notna(duration) and str(duration).strip():
                        desc_parts.append(f"Duration: {duration.strip()}")
                    
                    desc = ". ".join(desc_parts) if desc_parts else f"{title}. Skills: {skills}. Level: {level}."
                    
                    if pd.notna(title) and str(title).strip():
                        courses.append({
                            "title": str(title).strip(),
                            "description": str(desc).strip(),
                            "provider": str(provider).strip() if pd.notna(provider) else "Coursera",
                            "level": str(level).strip() if pd.notna(level) and str(level).strip() else None,
                            "skills": str(skills).strip() if pd.notna(skills) and str(skills).strip() != "NA" else ""
                        })
        else:
            print("Warning: No CSV files found in Coursera dataset")
    except Exception as e:
        print(f"Warning: Could not load Coursera dataset: {e}")
    
    try:
        # Dataset 2: General Courses
        dataset_name = 'kararhaitham/courses'
        download_path = 'data/kaggle_datasets/courses'
        os.makedirs(download_path, exist_ok=True)
        
        # Check if dataset already exists
        csv_files = [f for f in os.listdir(download_path) if f.endswith('.csv')]
        json_files = [f for f in os.listdir(download_path) if f.endswith('.json')]
        
        if not csv_files and not json_files:
            print("Downloading general courses from Kaggle...")
            # Download dataset
            kaggle.api.dataset_download_files(dataset_name, path=download_path, unzip=True)
            print(f"General courses dataset downloaded to: {download_path}")
            # Re-check for files after download
            csv_files = [f for f in os.listdir(download_path) if f.endswith('.csv')]
            json_files = [f for f in os.listdir(download_path) if f.endswith('.json')]
        else:
            print(f"Using existing general courses dataset from {download_path}")
        
        # Find CSV/JSON files in the dataset
        
        if csv_files:
            # Try different encodings
            csv_path = os.path.join(download_path, csv_files[0])
            encodings = ['utf-8', 'latin-1', 'iso-8859-1', 'cp1252']
            courses_df = None
            for encoding in encodings:
                try:
                    courses_df = pd.read_csv(csv_path, encoding=encoding)
                    print(f"Loaded {len(courses_df)} general courses from CSV (encoding: {encoding})")
                    break
                except (UnicodeDecodeError, UnicodeError):
                    continue
            
            if courses_df is None:
                print(f"Warning: Could not read CSV file with any encoding. Trying JSON files...")
            else:
                for _, row in courses_df.iterrows():
                    title = row.get("course_title") or row.get("title") or row.get("name") or row.get("Course Title")
                    desc = row.get("description") or row.get("course_description") or row.get("Description") or ""
                    skills = row.get("skills") or row.get("Skills") or row.get("course_skills") or ""
                    level = row.get("level") or row.get("Level") or row.get("course_level") or ""
                    provider = row.get("provider") or row.get("Provider") or row.get("organization") or "Unknown"
                    
                    if pd.notna(title) and str(title).strip():
                        if not desc or pd.isna(desc):
                            desc = f"{title}. Skills: {skills}. Level: {level}."
                        else:
                            desc = f"{desc}. Skills: {skills}. Level: {level}."
                        
                        courses.append({
                            "title": str(title).strip(),
                            "description": str(desc).strip(),
                            "provider": str(provider).strip() if pd.notna(provider) else "Unknown",
                            "level": str(level).strip() if pd.notna(level) and str(level).strip() else None,
                            "skills": str(skills).strip() if pd.notna(skills) else ""
                        })
        elif json_files:
            courses_df = pd.read_json(os.path.join(download_path, json_files[0]))
            print(f"Loaded {len(courses_df)} general courses from JSON")
            
            for _, row in courses_df.iterrows():
                title = row.get("course_title") or row.get("title") or row.get("name")
                desc = row.get("description") or row.get("course_description") or ""
                skills = row.get("skills") or row.get("course_skills") or ""
                level = row.get("level") or row.get("course_level") or ""
                provider = row.get("provider") or row.get("organization") or "Unknown"
                
                if pd.notna(title) and str(title).strip():
                    if not desc or pd.isna(desc):
                        desc = f"{title}. Skills: {skills}. Level: {level}."
                    else:
                        desc = f"{desc}. Skills: {skills}. Level: {level}."
                    
                    courses.append({
                        "title": str(title).strip(),
                        "description": str(desc).strip(),
                        "provider": str(provider).strip() if pd.notna(provider) else "Unknown",
                        "level": str(level).strip() if pd.notna(level) and str(level).strip() else None,
                        "skills": str(skills).strip() if pd.notna(skills) else ""
                    })
        else:
            print("Warning: No CSV or JSON files found in general courses dataset")
    except Exception as e:
        print(f"Warning: Could not load general courses dataset: {e}")
    
    return courses

def load_courses_from_sources():
    """Load courses from various sources and create a unified dataset"""
    courses = []
    
    # Try to load from Kaggle datasets first
    print("=" * 60)
    print("Loading courses from Kaggle datasets...")
    print("=" * 60)
    kaggle_courses = load_courses_from_kaggle()
    courses.extend(kaggle_courses)
    
    # Source 1: Local Coursera CSV (if available)
    coursera_path = os.getenv("COURSERA_DATA_PATH", "data/coursera.csv")
    if os.path.exists(coursera_path):
        try:
            print(f"Loading local Coursera data from {coursera_path}...")
            coursera_df = pd.read_csv(coursera_path, encoding='latin-1')
            for _, row in coursera_df.iterrows():
                title = row.get("Coursename")
                skills = row.get("Skills", "")
                level = row.get("Level", "")
                
                if pd.notna(title):
                    description = f"{title}. Skills taught: {skills}. Level: {level}."
                    courses.append({
                        "title": str(title),
                        "description": description,
                        "provider": "Coursera",
                        "level": str(level) if pd.notna(level) else None,
                        "skills": str(skills) if pd.notna(skills) else ""
                    })
        except Exception as e:
            print(f"Warning: Could not load local Coursera data: {e}")
    
    # Source 2: Local combined courses dataset (if available)
    combined_path = os.getenv("COMBINED_COURSES_PATH", "data/combined_courses.json")
    if os.path.exists(combined_path):
        try:
            print(f"Loading local combined courses from {combined_path}...")
            combined_df = pd.read_json(combined_path)
            for _, row in combined_df.iterrows():
                title = row.get("course_title")
                desc = row.get("description", "")
                
                if pd.notna(title):
                    courses.append({
                        "title": str(title),
                        "description": str(desc) if pd.notna(desc) else str(title),
                        "provider": row.get("provider", "Unknown"),
                        "level": row.get("level"),
                        "skills": ""
                    })
        except Exception as e:
            print(f"Warning: Could not load local combined courses data: {e}")
    
    # Remove duplicates based on title
    if courses:
        seen_titles = set()
        unique_courses = []
        for course in courses:
            title_lower = course["title"].lower().strip()
            if title_lower not in seen_titles:
                seen_titles.add(title_lower)
                unique_courses.append(course)
        courses = unique_courses
        print(f"Removed duplicates. Total unique courses: {len(courses)}")
    
    # Source 3: Manual course list (fallback)
    if len(courses) == 0:
        print("No course data files found. Creating sample courses...")
        courses = create_sample_courses()
    
    return pd.DataFrame(courses)

def create_sample_courses():
    """Create sample courses for testing"""
    sample_courses = [
        {
            "title": "Machine Learning Specialization",
            "description": "Learn machine learning algorithms, neural networks, and deep learning. Skills: Python, TensorFlow, Scikit-learn, Neural Networks",
            "provider": "Coursera",
            "level": "Intermediate",
            "skills": "Python, Machine Learning, Deep Learning, TensorFlow"
        },
        {
            "title": "AWS Certified Solutions Architect",
            "description": "Learn AWS cloud architecture and design. Skills: AWS, Cloud Computing, Architecture, Security",
            "provider": "AWS",
            "level": "Professional",
            "skills": "AWS, Cloud Computing, Architecture"
        },
        {
            "title": "Google Data Analytics Professional Certificate",
            "description": "Learn data analysis with SQL, R, and Tableau. Skills: SQL, R, Tableau, Data Analysis, Statistics",
            "provider": "Google",
            "level": "Beginner",
            "skills": "SQL, R, Tableau, Data Analysis"
        },
        {
            "title": "Full Stack Web Development",
            "description": "Build web applications with React, Node.js, and MongoDB. Skills: JavaScript, React, Node.js, MongoDB, Express",
            "provider": "Various",
            "level": "Intermediate",
            "skills": "JavaScript, React, Node.js, MongoDB"
        },
        {
            "title": "Python for Data Science",
            "description": "Master Python for data analysis and visualization. Skills: Python, Pandas, NumPy, Matplotlib, Data Science",
            "provider": "Various",
            "level": "Beginner",
            "skills": "Python, Pandas, NumPy, Data Science"
        }
    ]
    return sample_courses

def generate_course_embeddings(courses_df: pd.DataFrame, model: SentenceTransformer):
    """Generate embeddings for courses"""
    if len(courses_df) == 0:
        return np.array([])
    
    # Create combined text for each course
    course_texts = (
        courses_df["title"] + ". " + courses_df["description"]
    ).tolist()
    
    print(f"Generating embeddings for {len(course_texts)} courses...")
    embeddings = model.encode(course_texts, convert_to_numpy=True, show_progress_bar=True)
    print(f"Generated embeddings with shape: {embeddings.shape}")
    
    return embeddings

def save_courses_data(courses_df: pd.DataFrame, embeddings: np.ndarray, embeddings_path: str, index_path: str):
    """Save courses data and embeddings"""
    os.makedirs(os.path.dirname(embeddings_path), exist_ok=True)
    
    print(f"Saving course embeddings to {embeddings_path}...")
    np.save(embeddings_path, embeddings)
    
    print(f"Saving course index to {index_path}...")
    with open(index_path, "wb") as f:
        pickle.dump(courses_df, f)
    
    print("Course data saved successfully!")

def main():
    """Main function to load and prepare courses"""
    print("=" * 60)
    print("Loading Course/Certification Data")
    print("=" * 60)
    
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
    
    # Load courses
    courses_df = load_courses_from_sources()
    print(f"Loaded {len(courses_df)} courses")
    
    if len(courses_df) == 0:
        print("No courses found. Exiting.")
        return 1
    
    # Warn if only sample courses are loaded
    if len(courses_df) == 5 and not KAGGLE_AVAILABLE:
        print("\n" + "!" * 60)
        print("WARNING: Only sample courses (5) are loaded!")
        print("To load real datasets from Kaggle:")
        print("  1. Go to https://www.kaggle.com/settings -> API")
        print("  2. Create a new API token (downloads kaggle.json)")
        print("  3. Place kaggle.json in C:\\Users\\YourUsername\\.kaggle\\")
        print("  4. Run this script again to download real datasets")
        print("!" * 60 + "\n")
    
    # Generate embeddings
    embeddings = generate_course_embeddings(courses_df, model)
    
    # Save data
    embeddings_path = os.getenv("COURSE_EMBEDDINGS_PATH", "data/course_embeddings.npy")
    index_path = os.getenv("COURSE_INDEX_PATH", "data/courses_index.pkl")
    save_courses_data(courses_df, embeddings, embeddings_path, index_path)
    
    print("\n" + "=" * 60)
    print("[OK] Course data preparation completed!")
    print("=" * 60)
    print(f"Total courses: {len(courses_df)}")
    print(f"Embeddings shape: {embeddings.shape}")
    
    return 0

if __name__ == "__main__":
    exit(main())


#!/bin/bash

# Script to start the ML service

echo "Starting CareerNetwork ML Service..."

# Check if virtual environment exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate virtual environment
source venv/bin/activate

# Install dependencies if needed
if [ ! -f "venv/.installed" ]; then
    echo "Installing dependencies..."
    pip install -r requirements.txt
    touch venv/.installed
fi

# Check if model and data exist
if [ ! -f "data/job_embeddings.npy" ] || [ ! -f "data/jobs_index.pkl" ]; then
    echo "Warning: Model or data files not found!"
    echo "Please run one of the following:"
    echo "  python ml-service/init_model.py  (for Kaggle dataset)"
    echo "  python ml-service/sync_mongodb.py  (for MongoDB jobs)"
    read -p "Do you want to initialize now? (y/n) " -n 1 -r
    echo
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        python init_model.py
    fi
fi

# Start the server
echo "Starting FastAPI server..."
uvicorn app:app --host 0.0.0.0 --port 8000 --reload









@echo off
REM Script to start the ML service on Windows

echo Starting CareerNetwork ML Service...

REM Check if virtual environment exists
if not exist "venv" (
    echo Creating virtual environment...
    python -m venv venv
)

REM Activate virtual environment
call venv\Scripts\activate.bat

REM Install dependencies if needed
if not exist "venv\.installed" (
    echo Installing dependencies...
    pip install -r requirements.txt
    type nul > venv\.installed
)

REM Check if model and data exist
if not exist "data\job_embeddings.npy" (
    echo Warning: Model or data files not found!
    echo Please run one of the following:
    echo   python ml-service\init_model.py  (for Kaggle dataset)
    echo   python ml-service\sync_mongodb.py  (for MongoDB jobs)
    pause
)

REM Start the server
echo Starting FastAPI server...
uvicorn app:app --host 0.0.0.0 --port 8000 --reload









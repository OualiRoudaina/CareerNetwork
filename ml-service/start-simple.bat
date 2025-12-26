@echo off
REM Script simple pour démarrer le service ML

echo Installation des dependances Python...
pip install -r requirements.txt

echo.
echo Demarrage du service ML...
python -m uvicorn app:app --reload --port 8000









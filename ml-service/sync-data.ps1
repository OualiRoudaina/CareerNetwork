# Script pour synchroniser les donnees MongoDB vers GCS
# Ce script prepare les donnees pour le service ML deploye

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SYNCHRONISATION DES DONNEES ML" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Verifier que Python est installe
Write-Host "[STEP 1] Verification de Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "[OK] $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Python n'est pas installe" -ForegroundColor Red
    Write-Host "   Installez Python 3.11 depuis https://www.python.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Verifier les dependances
Write-Host "[STEP 2] Verification des dependances..." -ForegroundColor Yellow
try {
    python -c "import pymongo, sentence_transformers, pandas, numpy" 2>$null
    Write-Host "[OK] Dependances de base installees" -ForegroundColor Green
} catch {
    Write-Host "[WARNING] Certaines dependances manquent" -ForegroundColor Yellow
    Write-Host "   Installation des dependances..." -ForegroundColor Gray
    pip install pymongo sentence-transformers pandas numpy scikit-learn
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Erreur lors de l'installation" -ForegroundColor Red
        exit 1
    }
}

# Verifier google-cloud-storage
try {
    python -c "import google.cloud.storage" 2>$null
    Write-Host "[OK] google-cloud-storage installe" -ForegroundColor Green
} catch {
    Write-Host "[WARNING] google-cloud-storage manquant" -ForegroundColor Yellow
    Write-Host "   Installation..." -ForegroundColor Gray
    pip install google-cloud-storage
}

Write-Host ""

# Configurer les variables d'environnement
Write-Host "[STEP 3] Configuration des variables d'environnement..." -ForegroundColor Yellow

# Encoder le mot de passe pour MongoDB (le + doit etre encode en %2B)
# Le + dans le mot de passe doit etre remplace par %2B
$env:MONGODB_URI = "mongodb+srv://roudaina:04062002Rr%2B@cluster0.lqatepg.mongodb.net/career-network"
$env:GCS_BUCKET_NAME = "careerlink-ml-models"
$env:MODEL_PATH = "models/all-MiniLM-L6-v2"
$env:EMBEDDINGS_PATH = "data/job_embeddings.npy"
$env:INDEX_PATH = "data/jobs_index.pkl"
$env:UPLOAD_MODEL_TO_GCS = "false"  # Le modele est deja dans GCS

Write-Host "[OK] Variables configurees" -ForegroundColor Green
Write-Host "   MONGODB_URI: Configure" -ForegroundColor Gray
Write-Host "   GCS_BUCKET_NAME: $env:GCS_BUCKET_NAME" -ForegroundColor Gray
Write-Host ""

# Executer la synchronisation
Write-Host "[STEP 4] Synchronisation des donnees..." -ForegroundColor Yellow
Write-Host "   Cela peut prendre quelques minutes..." -ForegroundColor Gray
Write-Host ""

python sync_mongodb_gcs.py

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[SUCCESS] Synchronisation terminee avec succes !" -ForegroundColor Green
    Write-Host ""
    Write-Host "Les donnees sont maintenant disponibles pour le service ML." -ForegroundColor Cyan
    Write-Host "Le service ML va automatiquement les charger au prochain redemarrage." -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Pour forcer le rechargement, redemarrez le service ML:" -ForegroundColor Yellow
    Write-Host "   .\redeply.ps1" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "[ERROR] Erreur lors de la synchronisation" -ForegroundColor Red
    Write-Host "   Verifiez les logs ci-dessus pour plus de details" -ForegroundColor Gray
    exit 1
}

Write-Host ""

# Script PowerShell pour corriger l'upload du modele incomplet

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Correction de l'upload du modele" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Le probleme: Seulement 2 fichiers du modele ont ete uploades." -ForegroundColor Yellow
Write-Host "Il manque le fichier principal (model.safetensors ou pytorch_model.bin)" -ForegroundColor Yellow
Write-Host ""

# Verifier le modele local
$MODEL_PATH = "models/all-MiniLM-L6-v2"

Write-Host "1. Verification du modele local..." -ForegroundColor Yellow
if (-not (Test-Path $MODEL_PATH)) {
    Write-Host "   [X] Le modele local n'existe pas" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Telechargement du modele depuis HuggingFace..." -ForegroundColor Yellow
    python -c "from sentence_transformers import SentenceTransformer; print('Downloading model...'); model = SentenceTransformer('all-MiniLM-L6-v2'); print('Saving model...'); model.save('models/all-MiniLM-L6-v2'); print('Model saved!')"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   [X] Erreur lors du telechargement" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "   [OK] Le modele local existe" -ForegroundColor Green
}

Write-Host ""
Write-Host "2. Verification des fichiers du modele local..." -ForegroundColor Yellow

# Fichiers essentiels
$requiredFiles = @(
    "config.json",
    "config_sentence_transformers.json",
    "modules.json",
    "tokenizer.json",
    "tokenizer_config.json",
    "vocab.txt",
    "special_tokens_map.json"
)

# Fichier principal du modele (au moins un des deux)
$modelFiles = @("model.safetensors", "pytorch_model.bin")

$allPresent = $true
foreach ($file in $requiredFiles) {
    $filePath = Join-Path $MODEL_PATH $file
    if (Test-Path $filePath) {
        Write-Host "   [OK] $file" -ForegroundColor Green
    } else {
        Write-Host "   [X] $file - MANQUANT" -ForegroundColor Red
        $allPresent = $false
    }
}

$modelFileFound = $false
foreach ($file in $modelFiles) {
    $filePath = Join-Path $MODEL_PATH $file
    if (Test-Path $filePath) {
        Write-Host "   [OK] $file (fichier principal)" -ForegroundColor Green
        $modelFileFound = $true
        break
    }
}

if (-not $modelFileFound) {
    Write-Host "   [X] Aucun fichier principal trouve (model.safetensors ou pytorch_model.bin)" -ForegroundColor Red
    Write-Host ""
    Write-Host "   Le modele local est incomplet. Telechargement complet..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $MODEL_PATH -ErrorAction SilentlyContinue
    python -c "from sentence_transformers import SentenceTransformer; print('Downloading complete model...'); model = SentenceTransformer('all-MiniLM-L6-v2'); print('Saving model...'); model.save('models/all-MiniLM-L6-v2'); print('Model saved!')"
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "   [X] Erreur lors du telechargement" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "3. Comptage des fichiers du modele local..." -ForegroundColor Yellow
$fileCount = (Get-ChildItem -Path $MODEL_PATH -Recurse -File).Count
Write-Host "   Total: $fileCount fichiers" -ForegroundColor Gray

if ($fileCount -lt 10) {
    Write-Host "   [!] Attention: Le modele semble incomplet (moins de 10 fichiers)" -ForegroundColor Yellow
    Write-Host "   Re-telechargement du modele complet..." -ForegroundColor Yellow
    Remove-Item -Recurse -Force $MODEL_PATH -ErrorAction SilentlyContinue
    python -c "from sentence_transformers import SentenceTransformer; print('Downloading complete model...'); model = SentenceTransformer('all-MiniLM-L6-v2'); print('Saving model...'); model.save('models/all-MiniLM-L6-v2'); print('Model saved!')"
    $fileCount = (Get-ChildItem -Path $MODEL_PATH -Recurse -File).Count
    Write-Host "   Nouveau total: $fileCount fichiers" -ForegroundColor Gray
}

Write-Host ""
Write-Host "4. Upload du modele complet vers GCS..." -ForegroundColor Yellow
Write-Host "   (Cela peut prendre quelques minutes)" -ForegroundColor Gray

$env:MONGODB_URI = "mongodb+srv://roudaina:04062002Rr%2B@cluster0.lqatepg.mongodb.net/career-network"
$env:GCS_BUCKET_NAME = "careerlink-ml-models"
$env:MODEL_PATH = "models/all-MiniLM-L6-v2"
$env:UPLOAD_MODEL_TO_GCS = "true"

python sync_mongodb_gcs.py

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[OK] Upload termine!" -ForegroundColor Green
    Write-Host ""
    Write-Host "5. Verification dans GCS..." -ForegroundColor Yellow
    gcloud storage ls "gs://careerlink-ml-models/models/all-MiniLM-L6-v2/" --recursive | Measure-Object -Line
    $gcsFileCount = (gcloud storage ls "gs://careerlink-ml-models/models/all-MiniLM-L6-v2/" --recursive 2>&1 | Where-Object { $_ -notmatch "^gs://" -and $_ -match "\." }).Count
    Write-Host "   Fichiers dans GCS: $gcsFileCount" -ForegroundColor Gray
    Write-Host ""
    Write-Host "6. Redemarrage du service..." -ForegroundColor Yellow
    Write-Host "   Executez: .\update-service-env.ps1" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "[OK] Termine! Redemarrez le service maintenant." -ForegroundColor Green
} else {
    Write-Host ""
    Write-Host "[X] Erreur lors de l'upload" -ForegroundColor Red
    exit 1
}


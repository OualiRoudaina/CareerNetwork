# Script PowerShell pour uploader le modele manuellement avec gcloud

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Upload manuel du modele vers GCS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$MODEL_PATH = "models/all-MiniLM-L6-v2"
$GCS_BUCKET = "careerlink-ml-models"
$GCS_PREFIX = "gs://$GCS_BUCKET/models/all-MiniLM-L6-v2/"

if (-not (Test-Path $MODEL_PATH)) {
    Write-Host "[X] Le modele local n'existe pas" -ForegroundColor Red
    exit 1
}

Write-Host "Upload du dossier complet du modele..." -ForegroundColor Yellow
Write-Host "Source: $MODEL_PATH" -ForegroundColor Gray
Write-Host "Destination: $GCS_PREFIX" -ForegroundColor Gray
Write-Host ""
Write-Host "Cela peut prendre plusieurs minutes..." -ForegroundColor Yellow
Write-Host ""

# Upload recursif de tout le dossier
# Note: Utiliser le chemin complet avec wildcard pour Windows
$sourcePath = (Resolve-Path $MODEL_PATH).Path
gcloud storage cp -r "$sourcePath\*" "$GCS_PREFIX"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[OK] Upload termine!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Verification..." -ForegroundColor Yellow
    gcloud storage ls "$GCS_PREFIX" --recursive | Select-Object -First 10
    Write-Host ""
    Write-Host "Redemarrez le service: .\update-service-env.ps1" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "[X] Erreur lors de l'upload" -ForegroundColor Red
    exit 1
}


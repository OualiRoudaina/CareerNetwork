# Script pour uploader uniquement model.safetensors avec meilleure gestion

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Upload de model.safetensors uniquement" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$MODEL_PATH = "models/all-MiniLM-L6-v2"
$GCS_BUCKET = "careerlink-ml-models"
$GCS_DEST = "gs://$GCS_BUCKET/models/all-MiniLM-L6-v2/model.safetensors"

# Chercher model.safetensors
$modelFile = Get-ChildItem -Path $MODEL_PATH -Recurse -Filter "model.safetensors" -ErrorAction SilentlyContinue

if (-not $modelFile) {
    Write-Host "[X] model.safetensors non trouve dans $MODEL_PATH" -ForegroundColor Red
    exit 1
}

$fileSize = [math]::Round($modelFile.Length / 1MB, 2)
Write-Host "Fichier: $($modelFile.FullName)" -ForegroundColor Gray
Write-Host "Taille: $fileSize MB" -ForegroundColor Gray
Write-Host "Destination: $GCS_DEST" -ForegroundColor Gray
Write-Host ""
Write-Host "Upload en cours..." -ForegroundColor Yellow
Write-Host "(Cela peut prendre 2-5 minutes selon votre connexion)" -ForegroundColor Gray
Write-Host ""

# Utiliser gcloud storage cp avec affichage de progression
$startTime = Get-Date

# Essayer avec gcloud storage cp (plus robuste)
Write-Host "Methode: gcloud storage cp" -ForegroundColor Cyan
gcloud storage cp "$($modelFile.FullName)" "$GCS_DEST"

$endTime = Get-Date
$duration = $endTime - $startTime

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[OK] Upload termine avec succes!" -ForegroundColor Green
    Write-Host "Temps: $($duration.TotalSeconds) secondes" -ForegroundColor Gray
    Write-Host ""
    
    # Verifier
    Write-Host "Verification..." -ForegroundColor Yellow
    $check = gcloud storage ls "$GCS_DEST" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] model.safetensors present dans GCS" -ForegroundColor Green
        Write-Host ""
        Write-Host "Prochaines etapes:" -ForegroundColor Yellow
        Write-Host "  1. Uploader les autres fichiers: .\upload-missing-files.ps1" -ForegroundColor Cyan
        Write-Host "  2. Redemarrer le service: .\update-service-env.ps1" -ForegroundColor Cyan
    } else {
        Write-Host "  [!] Verification echouee, mais upload semble reussi" -ForegroundColor Yellow
    }
} else {
    Write-Host ""
    Write-Host "[X] Erreur lors de l'upload" -ForegroundColor Red
    Write-Host "Temps ecoule: $($duration.TotalSeconds) secondes" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Solutions possibles:" -ForegroundColor Yellow
    Write-Host "  1. Verifiez votre connexion internet" -ForegroundColor Gray
    Write-Host "  2. Reessayez: .\upload-model-safetensors-only.ps1" -ForegroundColor Cyan
    Write-Host "  3. Ou utilisez l'interface web GCS pour uploader manuellement" -ForegroundColor Gray
    exit 1
}


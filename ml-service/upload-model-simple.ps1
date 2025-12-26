# Script PowerShell simple pour uploader le modele vers GCS

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Upload du modele vers GCS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$MODEL_PATH = "models/all-MiniLM-L6-v2"
$GCS_BUCKET = "careerlink-ml-models"
$GCS_DEST = "gs://$GCS_BUCKET/models/all-MiniLM-L6-v2/"

if (-not (Test-Path $MODEL_PATH)) {
    Write-Host "[X] Le modele local n'existe pas: $MODEL_PATH" -ForegroundColor Red
    exit 1
}

Write-Host "Source: $MODEL_PATH" -ForegroundColor Gray
Write-Host "Destination: $GCS_DEST" -ForegroundColor Gray
Write-Host ""
Write-Host "Upload en cours (cela peut prendre plusieurs minutes)..." -ForegroundColor Yellow
Write-Host ""

# Utiliser le chemin absolu
$absoluteModelPath = (Resolve-Path $MODEL_PATH).Path

try {
    # Upload recursif - gcloud gère automatiquement les gros fichiers
    # Utiliser le chemin absolu et ajouter /* pour uploader le contenu
    Write-Host "Chemin absolu: $absoluteModelPath" -ForegroundColor Gray
    gcloud storage cp -r "$absoluteModelPath\*" "$GCS_DEST"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "[OK] Upload termine avec succes!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Verification des fichiers..." -ForegroundColor Yellow
        
        # Vérifier que model.safetensors est présent
        $check = gcloud storage ls "$GCS_DEST**/model.safetensors" 2>&1
        if ($LASTEXITCODE -eq 0) {
            Write-Host "  [OK] model.safetensors present" -ForegroundColor Green
        } else {
            Write-Host "  [!] model.safetensors non trouve, verification..." -ForegroundColor Yellow
            gcloud storage ls "$GCS_DEST" --recursive | Select-Object -First 5
        }
        
        Write-Host ""
        Write-Host "Prochaines etapes:" -ForegroundColor Yellow
        Write-Host "  1. Redemarrez le service: .\update-service-env.ps1" -ForegroundColor Cyan
        Write-Host "  2. Attendez 1-2 minutes" -ForegroundColor Gray
        Write-Host "  3. Testez: curl https://careerlink-ml-service-456628805798.us-central1.run.app/" -ForegroundColor Cyan
    } else {
        Write-Host ""
        Write-Host "[X] Erreur lors de l'upload" -ForegroundColor Red
        Write-Host "   Verifiez votre connexion internet et reessayez" -ForegroundColor Yellow
        exit 1
    }
} catch {
    Write-Host ""
    Write-Host "[X] Erreur: $_" -ForegroundColor Red
    exit 1
}


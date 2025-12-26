# Script PowerShell pour redemarrer le service Cloud Run
# Cela force le service a telecharger les nouveaux fichiers depuis GCS

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Redemarrage du service Cloud Run" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$SERVICE_NAME = "careerlink-ml-service"
$REGION = "us-central1"
$PROJECT = "careerlink-482320"

Write-Host "Service: $SERVICE_NAME" -ForegroundColor Yellow
Write-Host "Region: $REGION" -ForegroundColor Yellow
Write-Host "Project: $PROJECT" -ForegroundColor Yellow
Write-Host ""

# Option 1: Redemarrer en mettant a jour une variable d'environnement (force un redemarrage)
Write-Host "Redemarrage du service..." -ForegroundColor Yellow
gcloud run services update $SERVICE_NAME `
  --region $REGION `
  --project $PROJECT `
  --update-env-vars "RESTART_TIMESTAMP=$(Get-Date -Format 'yyyyMMddHHmmss')"

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[OK] Service redemarre avec succes!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Le service va maintenant:" -ForegroundColor Yellow
    Write-Host "  1. Telecharger le modele depuis GCS" -ForegroundColor Gray
    Write-Host "  2. Telecharger les embeddings depuis GCS" -ForegroundColor Gray
    Write-Host "  3. Charger le modele et les donnees" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Attendez 1-2 minutes puis testez:" -ForegroundColor Yellow
    Write-Host "  curl https://careerlink-ml-service-456628805798.us-central1.run.app/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Vous devriez voir:" -ForegroundColor Yellow
    Write-Host '  {"status":"ok","model_loaded":true,"jobs_count":2}' -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "[X] Erreur lors du redemarrage" -ForegroundColor Red
    exit 1
}


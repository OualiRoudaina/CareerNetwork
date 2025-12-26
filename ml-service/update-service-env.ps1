# Script PowerShell pour mettre a jour les variables d'environnement du service Cloud Run
# Cela force aussi un redemarrage du service

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Mise a jour du service Cloud Run" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$SERVICE_NAME = "careerlink-ml-service"
$REGION = "us-central1"
$PROJECT = "careerlink-482320"

Write-Host "Service: $SERVICE_NAME" -ForegroundColor Yellow
Write-Host "Region: $REGION" -ForegroundColor Yellow
Write-Host "Project: $PROJECT" -ForegroundColor Yellow
Write-Host ""

# Variables d'environnement necessaires
$ENV_VARS = @(
    "MONGODB_URI=mongodb+srv://roudaina:04062002Rr%2B@cluster0.lqatepg.mongodb.net/career-network",
    "GCS_BUCKET_NAME=careerlink-ml-models",
    "MODEL_PATH=models/all-MiniLM-L6-v2",
    "EMBEDDINGS_PATH=data/job_embeddings.npy",
    "INDEX_PATH=data/jobs_index.pkl",
    "CACHE_TTL_SECONDS=3600",
    "RESTART_TIMESTAMP=$(Get-Date -Format 'yyyyMMddHHmmss')"
)

$ENV_VARS_STRING = $ENV_VARS -join ","

Write-Host "Mise a jour des variables d'environnement..." -ForegroundColor Yellow
Write-Host "Variables:" -ForegroundColor Gray
foreach ($var in $ENV_VARS) {
    Write-Host "  $var" -ForegroundColor DarkGray
}
Write-Host ""

gcloud run services update $SERVICE_NAME `
  --region $REGION `
  --project $PROJECT `
  --set-env-vars $ENV_VARS_STRING

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[OK] Service mis a jour avec succes!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Le service va maintenant redemarrer et:" -ForegroundColor Yellow
    Write-Host "  1. Telecharger le modele depuis GCS" -ForegroundColor Gray
    Write-Host "  2. Telecharger les embeddings depuis GCS" -ForegroundColor Gray
    Write-Host "  3. Charger le modele et les donnees" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Attendez 1-2 minutes puis testez:" -ForegroundColor Yellow
    Write-Host "  curl https://careerlink-ml-service-456628805798.us-central1.run.app/" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Vous devriez voir:" -ForegroundColor Yellow
    Write-Host '  {"status":"ok","model_loaded":true,"jobs_count":2}' -ForegroundColor Gray
    Write-Host ""
    Write-Host "Pour voir les logs du service:" -ForegroundColor Yellow
    Write-Host "  gcloud run services logs read $SERVICE_NAME --region $REGION --project $PROJECT" -ForegroundColor Cyan
} else {
    Write-Host ""
    Write-Host "[X] Erreur lors de la mise a jour" -ForegroundColor Red
    exit 1
}


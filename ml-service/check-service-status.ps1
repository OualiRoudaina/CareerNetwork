# Script PowerShell pour diagnostiquer le service Cloud Run

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Diagnostic du service Cloud Run" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$SERVICE_NAME = "careerlink-ml-service"
$REGION = "us-central1"
$PROJECT = "careerlink-482320"
$SERVICE_URL = "https://careerlink-ml-service-456628805798.us-central1.run.app"

Write-Host "1. Test du health check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$SERVICE_URL/" -Method GET -UseBasicParsing -TimeoutSec 10
    $healthData = $response.Content | ConvertFrom-Json
    Write-Host "   Status: $($healthData.status)" -ForegroundColor Gray
    Write-Host "   Model loaded: $($healthData.model_loaded)" -ForegroundColor $(if ($healthData.model_loaded) { "Green" } else { "Red" })
    Write-Host "   Jobs count: $($healthData.jobs_count)" -ForegroundColor Gray
    Write-Host ""
    
    if (-not $healthData.model_loaded) {
        Write-Host "[!] Le modele n'est pas charge!" -ForegroundColor Red
        Write-Host ""
    }
} catch {
    Write-Host "   [X] Erreur lors du test: $_" -ForegroundColor Red
    Write-Host ""
}

Write-Host "2. Verification des fichiers dans GCS..." -ForegroundColor Yellow
$files = @(
    "data/job_embeddings.npy",
    "data/jobs_index.pkl",
    "models/all-MiniLM-L6-v2/config.json"
)

foreach ($file in $files) {
    $result = gcloud storage ls "gs://careerlink-ml-models/$file" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   [OK] $file" -ForegroundColor Green
    } else {
        Write-Host "   [X] $file - MANQUANT" -ForegroundColor Red
    }
}
Write-Host ""

Write-Host "3. Recuperation des logs recents..." -ForegroundColor Yellow
Write-Host "   (Dernieres 30 lignes)" -ForegroundColor Gray
Write-Host ""
gcloud run services logs read $SERVICE_NAME --region $REGION --project $PROJECT --limit 30
Write-Host ""

Write-Host "4. Verification des variables d'environnement..." -ForegroundColor Yellow
$envVars = gcloud run services describe $SERVICE_NAME --region $REGION --project $PROJECT --format="value(spec.template.spec.containers[0].env)" 2>&1
if ($envVars) {
    Write-Host "   Variables configurees:" -ForegroundColor Gray
    $envVars | ForEach-Object {
        if ($_ -match "GCS_BUCKET_NAME|MODEL_PATH|EMBEDDINGS_PATH|INDEX_PATH") {
            Write-Host "     $_" -ForegroundColor Cyan
        }
    }
} else {
    Write-Host "   [X] Impossible de recuperer les variables" -ForegroundColor Red
}
Write-Host ""

Write-Host "5. Recommendations pour resoudre le probleme:" -ForegroundColor Yellow
Write-Host ""
Write-Host "   Si le modele n'est pas charge:" -ForegroundColor Gray
Write-Host "   a. Verifiez que les fichiers sont bien dans GCS (etape 2)" -ForegroundColor Gray
Write-Host "   b. Redemarrez le service: .\update-service-env.ps1" -ForegroundColor Gray
Write-Host "   c. Verifiez les logs (etape 3) pour voir les erreurs" -ForegroundColor Gray
Write-Host ""
Write-Host "   Si les fichiers manquent dans GCS:" -ForegroundColor Gray
Write-Host "   a. Relancez la synchronisation: .\sync-data.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "   Si le service n'a pas les permissions GCS:" -ForegroundColor Gray
Write-Host "   a. Verifiez que le service account a les permissions Storage Object Viewer" -ForegroundColor Gray
Write-Host "   b. Commande: gcloud projects add-iam-policy-binding $PROJECT --member='serviceAccount:PROJECT_NUMBER-compute@developer.gserviceaccount.com' --role='roles/storage.objectViewer'" -ForegroundColor Gray
Write-Host ""


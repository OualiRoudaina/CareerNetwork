# Script de redéploiement du service ML sur Google Cloud Run
# Ce script redéploie le service avec les dernières modifications

Write-Host "[DEPLOY] Redéploiement du service ML sur Google Cloud Run..." -ForegroundColor Cyan
Write-Host ""

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "app.py")) {
    Write-Host "[ERROR] app.py non trouvé. Assurez-vous d'être dans le répertoire ml-service" -ForegroundColor Red
    exit 1
}

# Vérifier que Dockerfile existe
if (-not (Test-Path "Dockerfile")) {
    if (Test-Path "Dockerfile.gcp") {
        Write-Host "[INFO] Copie de Dockerfile.gcp vers Dockerfile..." -ForegroundColor Yellow
        Copy-Item Dockerfile.gcp Dockerfile -Force
    } else {
        Write-Host "[ERROR] Dockerfile non trouvé" -ForegroundColor Red
        exit 1
    }
}

Write-Host "[OK] Fichiers vérifiés" -ForegroundColor Green
Write-Host ""

# Option 1: Déploiement direct (plus rapide, utilise le cache Docker)
Write-Host "[OPTION 1] Déploiement direct avec --source (recommandé)" -ForegroundColor Cyan
Write-Host "   Cette méthode utilise le cache Docker et est plus rapide" -ForegroundColor Gray
Write-Host ""

$choice = Read-Host "Choisissez une option (1 pour direct, 2 pour Cloud Build, ou appuyez sur Entree pour direct)"

if ($choice -eq "2") {
    # Option 2: Build avec Cloud Build puis déployer
    Write-Host ""
    Write-Host "[BUILD] Etape 1: Build avec Cloud Build..." -ForegroundColor Cyan
    gcloud builds submit --config=cloudbuild.yaml --project=careerlink-482320
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Erreur lors du build" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
    Write-Host "[DEPLOY] Etape 2: Deploiement sur Cloud Run..." -ForegroundColor Cyan
    gcloud run deploy careerlink-ml-service `
      --image gcr.io/careerlink-482320/careerlink-ml-service:latest `
      --platform managed `
      --region us-central1 `
      --allow-unauthenticated `
      --memory 4Gi `
      --cpu 2 `
      --timeout 300 `
      --max-instances 10 `
      --service-account=ml-service-sa@careerlink-482320.iam.gserviceaccount.com `
      --project=careerlink-482320 `
      --set-env-vars "MONGODB_URI=mongodb+srv://roudaina:04062002Rr+@cluster0.lqatepg.mongodb.net/career-network,GCS_BUCKET_NAME=careerlink-ml-models,MODEL_PATH=models/all-MiniLM-L6-v2,EMBEDDINGS_PATH=data/job_embeddings.npy,INDEX_PATH=data/jobs_index.pkl,CACHE_TTL_SECONDS=3600"
} else {
    # Option 1: Déploiement direct
    Write-Host "[DEPLOY] Deploiement direct sur Cloud Run..." -ForegroundColor Cyan
    Write-Host "   Cela peut prendre 5-10 minutes..." -ForegroundColor Gray
    Write-Host ""
    
    gcloud run deploy careerlink-ml-service `
      --source . `
      --platform managed `
      --region us-central1 `
      --allow-unauthenticated `
      --memory 4Gi `
      --cpu 2 `
      --timeout 300 `
      --max-instances 10 `
      --service-account=ml-service-sa@careerlink-482320.iam.gserviceaccount.com `
      --project=careerlink-482320 `
      --set-env-vars "MONGODB_URI=mongodb+srv://roudaina:04062002Rr+@cluster0.lqatepg.mongodb.net/career-network,GCS_BUCKET_NAME=careerlink-ml-models,MODEL_PATH=models/all-MiniLM-L6-v2,EMBEDDINGS_PATH=data/job_embeddings.npy,INDEX_PATH=data/jobs_index.pkl,CACHE_TTL_SECONDS=3600"
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "[SUCCESS] Deploiement reussi !" -ForegroundColor Green
    Write-Host ""
    
    # Récupérer l'URL du service
    Write-Host "[INFO] Recuperation de l'URL du service..." -ForegroundColor Cyan
    $url = gcloud run services describe careerlink-ml-service `
      --region us-central1 `
      --project=careerlink-482320 `
      --format 'value(status.url)'
    
    Write-Host ""
    Write-Host "[URL] URL du service: $url" -ForegroundColor Green
    Write-Host ""
    Write-Host "[TEST] Test du service..." -ForegroundColor Cyan
    try {
        $response = Invoke-WebRequest -Uri "$url/health" -UseBasicParsing -TimeoutSec 10
        if ($response.StatusCode -eq 200) {
            Write-Host "[OK] Service operationnel !" -ForegroundColor Green
            Write-Host "   Reponse: $($response.Content)" -ForegroundColor Gray
        }
    } catch {
        Write-Host "[WARNING] Le service est deploye mais peut prendre quelques secondes pour demarrer" -ForegroundColor Yellow
        Write-Host "   Reessayez dans 30 secondes: curl $url/health" -ForegroundColor Gray
    }
    
    Write-Host ""
    Write-Host "[NOTE] N'oubliez pas de mettre a jour ML_SERVICE_URL dans votre application Next.js si necessaire" -ForegroundColor Yellow
} else {
    Write-Host ""
    Write-Host "[ERROR] Erreur lors du deploiement" -ForegroundColor Red
    Write-Host "   Verifiez les logs ci-dessus pour plus de details" -ForegroundColor Gray
    exit 1
}


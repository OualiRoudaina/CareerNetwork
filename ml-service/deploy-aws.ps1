# Script de déploiement pour AWS App Runner (PowerShell)
# Ce script prépare et déploie le service ML sur AWS

$ErrorActionPreference = "Stop"

Write-Host "==========================================" -ForegroundColor Cyan
Write-Host "CareerNetwork ML Service - AWS Deployment" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan

# Vérifier les variables d'environnement requises
if (-not $env:MONGODB_URI) {
    Write-Host "✗ Error: MONGODB_URI environment variable is required" -ForegroundColor Red
    exit 1
}

if (-not $env:S3_BUCKET_NAME) {
    Write-Host "⚠ Warning: S3_BUCKET_NAME not set. S3 upload will be skipped." -ForegroundColor Yellow
}

# Étape 1: Synchroniser MongoDB et générer les embeddings
Write-Host "`n[1/3] Synchronizing MongoDB jobs..." -ForegroundColor Green
python sync_mongodb_s3.py

if ($LASTEXITCODE -ne 0) {
    Write-Host "✗ Error during MongoDB sync" -ForegroundColor Red
    exit 1
}

# Étape 2: Build Docker image (optionnel)
if ($env:BUILD_DOCKER -eq "true") {
    Write-Host "`n[2/3] Building Docker image..." -ForegroundColor Green
    docker build -t careernetwork-ml-service:latest .
    Write-Host "✓ Docker image built successfully" -ForegroundColor Green
} else {
    Write-Host "`n[2/3] Skipping Docker build (set BUILD_DOCKER=true to build)" -ForegroundColor Yellow
}

# Étape 3: Instructions pour App Runner
Write-Host "`n[3/3] Deployment instructions:" -ForegroundColor Green
Write-Host "`nNext steps:" -ForegroundColor Yellow
Write-Host "1. Push your code to GitHub:"
Write-Host "   git add ."
Write-Host "   git commit -m 'Prepare for AWS deployment'"
Write-Host "   git push origin main"
Write-Host ""
Write-Host "2. Go to AWS Console > App Runner > Create service"
Write-Host "3. Connect your GitHub repository"
Write-Host "4. Configure:"
Write-Host "   - Build type: Docker"
Write-Host "   - Dockerfile path: ml-service/Dockerfile"
Write-Host "   - Port: 8000"
Write-Host "   - CPU: 2 vCPU"
Write-Host "   - Memory: 4 GB"
Write-Host ""
Write-Host "5. Set environment variables:"
Write-Host "   MONGODB_URI=$env:MONGODB_URI"
Write-Host "   S3_BUCKET_NAME=$env:S3_BUCKET_NAME"
Write-Host "   MODEL_PATH=models/all-MiniLM-L6-v2"
Write-Host "   EMBEDDINGS_PATH=data/job_embeddings.npy"
Write-Host "   INDEX_PATH=data/jobs_index.pkl"
Write-Host "   PORT=8000"
Write-Host ""
Write-Host "6. Create IAM role with S3 read access"
Write-Host "7. Deploy!"

Write-Host "`n✓ Deployment preparation complete!" -ForegroundColor Green





# Script pour preparer les donnees de certifications et deployer
# Ce script prepare les donnees, les upload vers GCS, puis redepoie le service

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PREPARATION ET DEPLOIEMENT" -ForegroundColor Cyan
Write-Host "  CERTIFICATIONS ML" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Etape 1: Preparer les donnees de certifications
Write-Host "[ETAPE 1] Preparation des donnees de certifications..." -ForegroundColor Yellow
Write-Host ""

try {
    python load_courses.py
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Erreur lors de la preparation des donnees" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "[OK] Donnees de certifications preparees" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Erreur: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Etape 2: Verifier que les fichiers existent
Write-Host "[ETAPE 2] Verification des fichiers..." -ForegroundColor Yellow

$courseEmbeddings = "data/course_embeddings.npy"
$courseIndex = "data/courses_index.pkl"

if (-not (Test-Path $courseEmbeddings)) {
    Write-Host "[ERROR] $courseEmbeddings non trouve" -ForegroundColor Red
    exit 1
}

if (-not (Test-Path $courseIndex)) {
    Write-Host "[ERROR] $courseIndex non trouve" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Fichiers de certifications trouves" -ForegroundColor Green
Write-Host ""

# Etape 3: Upload vers GCS
Write-Host "[ETAPE 3] Upload vers Google Cloud Storage..." -ForegroundColor Yellow
Write-Host ""

$bucketName = "careerlink-ml-models"

try {
    # Verifier que gcloud est installe
    $gcloudCheck = gcloud --version 2>$null
    if (-not $gcloudCheck) {
        Write-Host "[ERROR] gcloud CLI n'est pas installe" -ForegroundColor Red
        Write-Host "   Installez Google Cloud SDK depuis https://cloud.google.com/sdk" -ForegroundColor Yellow
        exit 1
    }
    
    Write-Host "Upload de course_embeddings.npy..." -ForegroundColor Gray
    gsutil cp $courseEmbeddings gs://$bucketName/data/course_embeddings.npy
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Erreur lors de l'upload des embeddings" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "Upload de courses_index.pkl..." -ForegroundColor Gray
    gsutil cp $courseIndex gs://$bucketName/data/courses_index.pkl
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Erreur lors de l'upload de l'index" -ForegroundColor Red
        exit 1
    }
    
    Write-Host "[OK] Donnees uploades vers GCS" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Erreur lors de l'upload: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Verifiez que vous etes authentifie avec gcloud: gcloud auth login" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Etape 4: Redeployer le service
Write-Host "[ETAPE 4] Redeploiement du service ML..." -ForegroundColor Yellow
Write-Host ""

$deployChoice = Read-Host "Voulez-vous redepoyer le service maintenant ? (O/N)"

if ($deployChoice -eq "O" -or $deployChoice -eq "o" -or $deployChoice -eq "Y" -or $deployChoice -eq "y") {
    Write-Host ""
    Write-Host "Lancement du script de deploiement..." -ForegroundColor Cyan
    & .\redeply.ps1
} else {
    Write-Host ""
    Write-Host "[INFO] Redeploiement ignore" -ForegroundColor Yellow
    Write-Host "   Vous pouvez redepoyer plus tard avec: .\redeply.ps1" -ForegroundColor Gray
}

Write-Host ""
Write-Host "[SUCCESS] Processus termine !" -ForegroundColor Green
Write-Host ""
Write-Host "Prochaines etapes:" -ForegroundColor Cyan
Write-Host "  1. Redemarrer le service ML (si pas deja fait)" -ForegroundColor Gray
Write-Host "  2. Tester les recommandations sur /certifications" -ForegroundColor Gray
Write-Host ""


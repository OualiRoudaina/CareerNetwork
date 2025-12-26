# Script de test du modele ML avec Python (sans Docker)
# Teste le service ML directement avec uvicorn

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST DU MODELE ML (Python Direct)" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Python est installé
Write-Host "[STEP 1] Verification de Python..." -ForegroundColor Yellow
try {
    $pythonVersion = python --version 2>&1
    Write-Host "[OK] $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "[ERROR] Python n'est pas installe" -ForegroundColor Red
    Write-Host "   Installez Python 3.11 depuis https://www.python.org/" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Vérifier que les dépendances sont installées
Write-Host "[STEP 2] Verification des dependances..." -ForegroundColor Yellow
try {
    python -c "import fastapi, uvicorn, sentence_transformers" 2>$null
    Write-Host "[OK] Dependances installees" -ForegroundColor Green
} catch {
    Write-Host "[WARNING] Certaines dependances manquent" -ForegroundColor Yellow
    Write-Host "   Installation des dependances..." -ForegroundColor Gray
    pip install -r requirements-gcp.txt
    if ($LASTEXITCODE -ne 0) {
        Write-Host "[ERROR] Erreur lors de l'installation" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""

# Vérifier que les fichiers nécessaires existent
Write-Host "[STEP 3] Verification des fichiers..." -ForegroundColor Yellow

$requiredFiles = @("app.py", "requirements-gcp.txt")
$missingFiles = @()

foreach ($file in $requiredFiles) {
    if (-not (Test-Path $file)) {
        $missingFiles += $file
    }
}

if ($missingFiles.Count -gt 0) {
    Write-Host "[ERROR] Fichiers manquants: $($missingFiles -join ', ')" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Tous les fichiers sont presents" -ForegroundColor Green
Write-Host ""

# Vérifier si le port 8080 est disponible, sinon utiliser 8081
Write-Host "[STEP 4] Verification du port disponible..." -ForegroundColor Yellow

$port = 8080
$portAvailable = $false

# Tester les ports de 8080 à 8090
for ($p = 8080; $p -le 8090; $p++) {
    try {
        $listener = [System.Net.Sockets.TcpListener]::new([System.Net.IPAddress]::Any, $p)
        $listener.Start()
        $listener.Stop()
        $port = $p
        $portAvailable = $true
        Write-Host "[OK] Port $port disponible" -ForegroundColor Green
        break
    } catch {
        Write-Host "[INFO] Port $p deja utilise, test du port suivant..." -ForegroundColor Gray
    }
}

if (-not $portAvailable) {
    Write-Host "[ERROR] Aucun port disponible entre 8080-8090" -ForegroundColor Red
    Write-Host "   Fermez les autres services ou modifiez le port manuellement" -ForegroundColor Yellow
    exit 1
}

# Vérifier si le service est déjà en cours d'exécution sur ce port
try {
    $response = Invoke-WebRequest -Uri "http://localhost:$port/health" -UseBasicParsing -TimeoutSec 2 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200) {
        Write-Host "[INFO] Le service est deja en cours d'execution sur http://localhost:$port" -ForegroundColor Green
        Write-Host ""
        Write-Host "Vous pouvez maintenant tester avec:" -ForegroundColor Cyan
        Write-Host "  .\test-model-simple.ps1" -ForegroundColor Gray
        Write-Host "   (ou modifiez le port dans test-model-simple.ps1 si necessaire)" -ForegroundColor Gray
        exit 0
    }
} catch {
    Write-Host "[INFO] Le service n'est pas en cours, demarrage..." -ForegroundColor Yellow
}

Write-Host ""

# Démarrer le service en arrière-plan
Write-Host "[STEP 5] Demarrage du service ML..." -ForegroundColor Yellow
Write-Host "   Le service sera accessible sur http://localhost:$port" -ForegroundColor Gray
Write-Host "   Appuyez sur Ctrl+C pour arreter" -ForegroundColor Gray
Write-Host ""

# Définir les variables d'environnement
$env:PORT = $port.ToString()
$env:MONGODB_URI = "mongodb+srv://roudaina:04062002Rr+@cluster0.lqatepg.mongodb.net/career-network"
$env:GCS_BUCKET_NAME = "careerlink-ml-models"
$env:MODEL_PATH = "models/all-MiniLM-L6-v2"
$env:EMBEDDINGS_PATH = "data/job_embeddings.npy"
$env:INDEX_PATH = "data/jobs_index.pkl"
$env:CACHE_TTL_SECONDS = "3600"

Write-Host "[INFO] Variables d'environnement configurees" -ForegroundColor Gray
Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  SERVICE EN COURS D'EXECUTION" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Le service demarre... Cela peut prendre 1-2 minutes" -ForegroundColor Yellow
Write-Host "pour charger le modele et les embeddings." -ForegroundColor Yellow
Write-Host ""
Write-Host "Dans un autre terminal, executez:" -ForegroundColor Cyan
Write-Host "  .\test-model-simple.ps1" -ForegroundColor Gray
Write-Host ""
Write-Host "Ou testez manuellement avec:" -ForegroundColor Cyan
Write-Host "  curl http://localhost:$port/health" -ForegroundColor Gray
Write-Host ""

# Sauvegarder le port dans un fichier pour les autres scripts
$port | Out-File -FilePath ".port" -Encoding ASCII -NoNewline

# Démarrer uvicorn
python -m uvicorn app:app --host 0.0.0.0 --port $port


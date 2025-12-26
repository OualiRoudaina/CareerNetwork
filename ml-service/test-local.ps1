# Script de test local du service ML avant deploiement
# Ce script permet de tester le service localement avec Docker

Write-Host "[TEST] Test local du service ML..." -ForegroundColor Cyan
Write-Host ""

# Vérifier que nous sommes dans le bon répertoire
if (-not (Test-Path "app.py")) {
    Write-Host "[ERROR] app.py non trouvé. Assurez-vous d'être dans le répertoire ml-service" -ForegroundColor Red
    exit 1
}

# Vérifier que Dockerfile existe
if (-not (Test-Path "Dockerfile.gcp")) {
    Write-Host "[ERROR] Dockerfile.gcp non trouvé" -ForegroundColor Red
    exit 1
}

Write-Host "[STEP 1] Construction de l'image Docker..." -ForegroundColor Yellow
Write-Host "   Cela peut prendre 10-15 minutes la première fois..." -ForegroundColor Gray
Write-Host ""

docker build -f Dockerfile.gcp -t careerlink-ml-service:local .

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Erreur lors de la construction de l'image" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[OK] Image construite avec succès" -ForegroundColor Green
Write-Host ""

# Vérifier si un conteneur existe déjà et l'arrêter
$existingContainer = docker ps -a --filter "name=careerlink-ml-test" --format "{{.ID}}"
if ($existingContainer) {
    Write-Host "[INFO] Arrêt du conteneur existant..." -ForegroundColor Yellow
    docker stop careerlink-ml-test 2>$null
    docker rm careerlink-ml-test 2>$null
}

Write-Host "[STEP 2] Démarrage du conteneur local..." -ForegroundColor Yellow
Write-Host "   Le service sera accessible sur http://localhost:8080" -ForegroundColor Gray
Write-Host ""

# Démarrer le conteneur en arrière-plan
docker run -d `
  --name careerlink-ml-test `
  -p 8080:8080 `
  -e PORT=8080 `
  -e MONGODB_URI="mongodb+srv://roudaina:04062002Rr+@cluster0.lqatepg.mongodb.net/career-network" `
  -e GCS_BUCKET_NAME="careerlink-ml-models" `
  -e MODEL_PATH="models/all-MiniLM-L6-v2" `
  -e EMBEDDINGS_PATH="data/job_embeddings.npy" `
  -e INDEX_PATH="data/jobs_index.pkl" `
  -e CACHE_TTL_SECONDS=3600 `
  careerlink-ml-service:local

if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Erreur lors du démarrage du conteneur" -ForegroundColor Red
    exit 1
}

Write-Host "[OK] Conteneur démarré" -ForegroundColor Green
Write-Host ""
Write-Host "[INFO] Attente du démarrage du service (30 secondes)..." -ForegroundColor Yellow
Start-Sleep -Seconds 30

Write-Host ""
Write-Host "[STEP 3] Test du health check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "[OK] Health check réussi !" -ForegroundColor Green
        Write-Host "   Réponse: $($response.Content)" -ForegroundColor Gray
    }
} catch {
    Write-Host "[WARNING] Le service peut prendre plus de temps à démarrer" -ForegroundColor Yellow
    Write-Host "   Vérifiez les logs avec: docker logs careerlink-ml-test" -ForegroundColor Gray
}

Write-Host ""
Write-Host "[STEP 4] Test de l'endpoint de recommandation..." -ForegroundColor Yellow

$testBody = @{
    skills = "Python, Machine Learning, Data Analysis"
    experience = "6 months internship in data analytics"
    education = "Bachelor in Computer Science"
    location = "Paris, France"
    contract_type = "Full-time"
    languages = "English, French"
    certifications = "AWS, Google Data Analytics"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/recommend?top_n=5" `
        -Method POST `
        -Body $testBody `
        -ContentType "application/json" `
        -UseBasicParsing `
        -TimeoutSec 30
    
    if ($response.StatusCode -eq 200) {
        $data = $response.Content | ConvertFrom-Json
        Write-Host "[OK] Test de recommandation réussi !" -ForegroundColor Green
        Write-Host "   Nombre de recommandations: $($data.recommendations.Count)" -ForegroundColor Gray
        
        # Vérifier que les recommandations ont des compétences correspondantes
        $hasMatchingSkills = $false
        foreach ($rec in $data.recommendations) {
            if ($rec.matching_skills -and $rec.matching_skills.Count -gt 0) {
                $hasMatchingSkills = $true
                Write-Host "   - $($rec.job_role) chez $($rec.company): $($rec.matching_skills.Count) compétences correspondantes" -ForegroundColor Gray
            }
        }
        
        if (-not $hasMatchingSkills) {
            Write-Host "[WARNING] Aucune recommandation n'a de compétences correspondantes" -ForegroundColor Yellow
            Write-Host "   Cela peut indiquer un problème avec le filtrage" -ForegroundColor Yellow
        } else {
            Write-Host "[OK] Le filtrage des compétences fonctionne correctement !" -ForegroundColor Green
        }
    }
} catch {
    Write-Host "[ERROR] Erreur lors du test de recommandation: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "   Vérifiez les logs avec: docker logs careerlink-ml-test" -ForegroundColor Gray
}

Write-Host ""
Write-Host "[INFO] Commandes utiles:" -ForegroundColor Cyan
Write-Host "   - Voir les logs: docker logs careerlink-ml-test" -ForegroundColor Gray
Write-Host "   - Voir les logs en temps réel: docker logs -f careerlink-ml-test" -ForegroundColor Gray
Write-Host "   - Arrêter le conteneur: docker stop careerlink-ml-test" -ForegroundColor Gray
Write-Host "   - Supprimer le conteneur: docker rm careerlink-ml-test" -ForegroundColor Gray
Write-Host ""
Write-Host "[NOTE] Le service est accessible sur http://localhost:8080" -ForegroundColor Yellow
Write-Host "   Vous pouvez tester avec Postman ou curl" -ForegroundColor Gray
Write-Host ""


# Script de test du modele ML localement
# Teste le service ML avec des donnees de test pour verifier le filtrage

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST DU MODELE ML" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que le service est en cours d'exécution
Write-Host "[STEP 1] Verification du service local..." -ForegroundColor Yellow

try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:8080/health" -UseBasicParsing -TimeoutSec 5
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "[OK] Service accessible sur http://localhost:8080" -ForegroundColor Green
    }
} catch {
    Write-Host "[ERROR] Le service n'est pas accessible sur http://localhost:8080" -ForegroundColor Red
    Write-Host ""
    Write-Host "Demarrez d'abord le service avec:" -ForegroundColor Yellow
    Write-Host "  .\test-local.ps1" -ForegroundColor Gray
    Write-Host "  ou" -ForegroundColor Gray
    Write-Host "  docker run -d --name careerlink-ml-test -p 8080:8080 careerlink-ml-service:local" -ForegroundColor Gray
    exit 1
}

Write-Host ""

# Test 1: Candidat avec compétences Python
Write-Host "[TEST 1] Candidat avec competences Python/ML..." -ForegroundColor Cyan
Write-Host ""

$test1 = @{
    skills = "Python, Machine Learning, Data Science, TensorFlow, Pandas, NumPy"
    experience = "2 years as Data Scientist, worked on ML projects"
    education = "Master in Computer Science, specialization in AI"
    location = "Paris, France"
    contract_type = "Full-time"
    languages = "English, French"
    certifications = "AWS Machine Learning, Google AI"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/recommend?top_n=5" `
        -Method POST `
        -Body $test1 `
        -ContentType "application/json" `
        -UseBasicParsing `
        -TimeoutSec 30
    
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "  Resultat: $($data.recommendations.Count) recommandations" -ForegroundColor Gray
    
    $hasMatching = $false
    $noMatching = 0
    
    foreach ($rec in $data.recommendations) {
        if ($rec.matching_skills -and $rec.matching_skills.Count -gt 0) {
            $hasMatching = $true
            Write-Host "  [OK] $($rec.job_role) - $($rec.matching_skills.Count) competences correspondantes" -ForegroundColor Green
        } else {
            $noMatching++
            Write-Host "  [PROBLEME] $($rec.job_role) - 0 competences correspondantes" -ForegroundColor Red
        }
    }
    
    if ($noMatching -gt 0) {
        Write-Host ""
        Write-Host "  [ALERTE] $noMatching offre(s) avec 0 competences correspondantes trouvee(s)!" -ForegroundColor Red
        Write-Host "  Le filtrage ne fonctionne pas correctement" -ForegroundColor Red
    } else {
        Write-Host ""
        Write-Host "  [SUCCESS] Toutes les recommandations ont des competences correspondantes" -ForegroundColor Green
    }
    
} catch {
    Write-Host "  [ERROR] $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: Candidat avec compétences différentes
Write-Host "[TEST 2] Candidat avec competences Marketing..." -ForegroundColor Cyan
Write-Host ""

$test2 = @{
    skills = "Marketing, Social Media, Content Creation, SEO, Google Analytics"
    experience = "3 years in digital marketing"
    education = "Bachelor in Marketing"
    location = "Lyon, France"
    contract_type = "Full-time"
    languages = "English, French"
    certifications = "Google Ads, Facebook Marketing"
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/recommend?top_n=5" `
        -Method POST `
        -Body $test2 `
        -ContentType "application/json" `
        -UseBasicParsing `
        -TimeoutSec 30
    
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "  Resultat: $($data.recommendations.Count) recommandations" -ForegroundColor Gray
    
    $hasMatching = $false
    $noMatching = 0
    
    foreach ($rec in $data.recommendations) {
        if ($rec.matching_skills -and $rec.matching_skills.Count -gt 0) {
            $hasMatching = $true
            Write-Host "  [OK] $($rec.job_role) - $($rec.matching_skills.Count) competences correspondantes" -ForegroundColor Green
        } else {
            $noMatching++
            Write-Host "  [PROBLEME] $($rec.job_role) - 0 competences correspondantes" -ForegroundColor Red
        }
    }
    
    if ($noMatching -gt 0) {
        Write-Host ""
        Write-Host "  [ALERTE] $noMatching offre(s) avec 0 competences correspondantes trouvee(s)!" -ForegroundColor Red
    } else {
        Write-Host ""
        Write-Host "  [SUCCESS] Toutes les recommandations ont des competences correspondantes" -ForegroundColor Green
    }
    
} catch {
    Write-Host "  [ERROR] $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: Candidat avec très peu de compétences
Write-Host "[TEST 3] Candidat avec peu de competences..." -ForegroundColor Cyan
Write-Host ""

$test3 = @{
    skills = "Excel"
    experience = "1 year internship"
    education = "Bachelor"
    location = "Paris, France"
    contract_type = "Full-time"
    languages = "French"
    certifications = ""
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:8080/api/recommend?top_n=5" `
        -Method POST `
        -Body $test3 `
        -ContentType "application/json" `
        -UseBasicParsing `
        -TimeoutSec 30
    
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "  Resultat: $($data.recommendations.Count) recommandations" -ForegroundColor Gray
    
    if ($data.recommendations.Count -eq 0) {
        Write-Host "  [OK] Aucune recommandation (normal avec peu de competences)" -ForegroundColor Green
    } else {
        $noMatching = 0
        foreach ($rec in $data.recommendations) {
            if ($rec.matching_skills -and $rec.matching_skills.Count -gt 0) {
                Write-Host "  [OK] $($rec.job_role) - $($rec.matching_skills.Count) competences correspondantes" -ForegroundColor Green
            } else {
                $noMatching++
                Write-Host "  [PROBLEME] $($rec.job_role) - 0 competences correspondantes" -ForegroundColor Red
            }
        }
        
        if ($noMatching -gt 0) {
            Write-Host ""
            Write-Host "  [ALERTE] $noMatching offre(s) avec 0 competences correspondantes!" -ForegroundColor Red
        }
    }
    
} catch {
    Write-Host "  [ERROR] $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESUME DES TESTS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Si vous voyez des offres avec 0 competences correspondantes," -ForegroundColor Yellow
Write-Host "le filtrage ne fonctionne pas correctement." -ForegroundColor Yellow
Write-Host ""
Write-Host "Verifiez:" -ForegroundColor Yellow
Write-Host "  1. Que le code dans app.py filtre bien les offres avec 0 matching_skills" -ForegroundColor Gray
Write-Host "  2. Que la fonction calculate_skill_match fonctionne correctement" -ForegroundColor Gray
Write-Host "  3. Les logs du service: docker logs careerlink-ml-test" -ForegroundColor Gray
Write-Host ""


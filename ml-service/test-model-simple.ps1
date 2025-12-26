# Script de test simple du modele (sans demarrer le service)
# Utilise le service deja en cours d'execution

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST DU MODELE ML" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Détecter le port utilisé
$port = 8080
if (Test-Path ".port") {
    $port = [int](Get-Content ".port" -Raw).Trim()
}

# Vérifier que le service est accessible
Write-Host "[STEP 1] Verification du service sur le port $port..." -ForegroundColor Yellow

try {
    $healthResponse = Invoke-WebRequest -Uri "http://localhost:$port/health" -UseBasicParsing -TimeoutSec 5
    if ($healthResponse.StatusCode -eq 200) {
        Write-Host "[OK] Service accessible sur http://localhost:$port" -ForegroundColor Green
    }
} catch {
    Write-Host "[ERROR] Le service n'est pas accessible sur http://localhost:$port" -ForegroundColor Red
    Write-Host ""
    Write-Host "Demarrez d'abord le service avec:" -ForegroundColor Yellow
    Write-Host "  .\test-model-python.ps1" -ForegroundColor Gray
    Write-Host "  (dans un terminal separe)" -ForegroundColor Gray
    Write-Host ""
    Write-Host "Ou verifiez que le service tourne sur un autre port" -ForegroundColor Yellow
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
    $response = Invoke-WebRequest -Uri "http://localhost:$port/api/recommend?top_n=5" `
        -Method POST `
        -Body $test1 `
        -ContentType "application/json" `
        -UseBasicParsing `
        -TimeoutSec 30
    
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "  Resultat: $($data.recommendations.Count) recommandations" -ForegroundColor Gray
    Write-Host ""
    
    $hasMatching = $false
    $noMatching = 0
    
    foreach ($rec in $data.recommendations) {
        if ($rec.matching_skills -and $rec.matching_skills.Count -gt 0) {
            $hasMatching = $true
            $skillsList = $rec.matching_skills -join ", "
            Write-Host "  [OK] $($rec.job_role) chez $($rec.company)" -ForegroundColor Green
            Write-Host "       Competences: $skillsList" -ForegroundColor Gray
            Write-Host "       Score: $($rec.score)%, Match: $($rec.skill_match_percentage)%" -ForegroundColor Gray
            Write-Host ""
        } else {
            $noMatching++
            Write-Host "  [PROBLEME] $($rec.job_role) chez $($rec.company)" -ForegroundColor Red
            Write-Host "           0 competences correspondantes!" -ForegroundColor Red
            Write-Host ""
        }
    }
    
    if ($noMatching -gt 0) {
        Write-Host "  [ALERTE] $noMatching offre(s) avec 0 competences correspondantes trouvee(s)!" -ForegroundColor Red
        Write-Host "  Le filtrage ne fonctionne PAS correctement" -ForegroundColor Red
        Write-Host ""
    } else {
        Write-Host "  [SUCCESS] Toutes les recommandations ont des competences correspondantes" -ForegroundColor Green
        Write-Host ""
    }
    
} catch {
    Write-Host "  [ERROR] $($_.Exception.Message)" -ForegroundColor Red
    Write-Host ""
}

# Test 2: Vérification du filtrage
Write-Host "[TEST 2] Verification du filtrage (candidat avec competences rares)..." -ForegroundColor Cyan
Write-Host ""

$test2 = @{
    skills = "COBOL, Fortran, Assembly"
    experience = "Senior developer"
    education = "Computer Science"
    location = "Paris, France"
    contract_type = "Full-time"
    languages = "English"
    certifications = ""
} | ConvertTo-Json

try {
    $response = Invoke-WebRequest -Uri "http://localhost:$port/api/recommend?top_n=10" `
        -Method POST `
        -Body $test2 `
        -ContentType "application/json" `
        -UseBasicParsing `
        -TimeoutSec 30
    
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "  Resultat: $($data.recommendations.Count) recommandations" -ForegroundColor Gray
    Write-Host ""
    
    if ($data.recommendations.Count -eq 0) {
        Write-Host "  [OK] Aucune recommandation (normal avec des competences rares)" -ForegroundColor Green
        Write-Host "  Le filtrage fonctionne correctement" -ForegroundColor Green
    } else {
        $noMatching = 0
        foreach ($rec in $data.recommendations) {
            if ($rec.matching_skills -and $rec.matching_skills.Count -gt 0) {
                Write-Host "  [OK] $($rec.job_role) - $($rec.matching_skills.Count) competences" -ForegroundColor Green
            } else {
                $noMatching++
                Write-Host "  [PROBLEME] $($rec.job_role) - 0 competences" -ForegroundColor Red
            }
        }
        
        if ($noMatching -gt 0) {
            Write-Host ""
            Write-Host "  [ALERTE] $noMatching offre(s) avec 0 competences trouvee(s)!" -ForegroundColor Red
            Write-Host "  Le filtrage ne fonctionne PAS" -ForegroundColor Red
        }
    }
    
} catch {
    Write-Host "  [ERROR] $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  RESUME" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Si vous voyez des offres avec 0 competences correspondantes," -ForegroundColor Yellow
Write-Host "le filtrage ne fonctionne pas correctement." -ForegroundColor Yellow
Write-Host ""
Write-Host "Verifiez le code dans app.py (lignes ~570-604)" -ForegroundColor Gray
Write-Host ""


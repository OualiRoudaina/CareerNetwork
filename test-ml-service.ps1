# Script pour tester directement le service ML deploye

$mlServiceUrl = "https://careerlink-ml-service-456628805798.us-central1.run.app"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  TEST DU SERVICE ML DEPLOYE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "[TEST 1] Health Check..." -ForegroundColor Yellow
try {
    $healthResponse = Invoke-WebRequest -Uri "$mlServiceUrl/health" -UseBasicParsing -TimeoutSec 10
    Write-Host "[OK] Service accessible" -ForegroundColor Green
    Write-Host "   Status: $($healthResponse.StatusCode)" -ForegroundColor Gray
    Write-Host "   Response: $($healthResponse.Content)" -ForegroundColor Gray
} catch {
    Write-Host "[ERROR] Service non accessible: $($_.Exception.Message)" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "[TEST 2] Test de recommandation..." -ForegroundColor Yellow

$testBody = @{
    skills = "Python, Machine Learning, Data Science"
    experience = "2 years as Data Scientist"
    education = "Master in Computer Science"
    location = "Paris, France"
    contract_type = "Full-time"
    languages = "English, French"
    certifications = "AWS ML"
} | ConvertTo-Json

Write-Host "Request body:" -ForegroundColor Gray
Write-Host $testBody -ForegroundColor Gray
Write-Host ""

try {
    $response = Invoke-WebRequest -Uri "$mlServiceUrl/api/recommend?top_n=5" `
        -Method POST `
        -Body $testBody `
        -ContentType "application/json" `
        -UseBasicParsing `
        -TimeoutSec 30
    
    Write-Host "[OK] Requete reussie" -ForegroundColor Green
    Write-Host "   Status: $($response.StatusCode)" -ForegroundColor Gray
    Write-Host ""
    
    $data = $response.Content | ConvertFrom-Json
    
    Write-Host "Response:" -ForegroundColor Cyan
    Write-Host "  Total recommendations: $($data.recommendations.Count)" -ForegroundColor Gray
    Write-Host ""
    
    if ($data.recommendations.Count -eq 0) {
        Write-Host "[WARNING] Aucune recommandation retournee!" -ForegroundColor Yellow
        Write-Host "Full response:" -ForegroundColor Gray
        Write-Host ($response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 10) -ForegroundColor Gray
    } else {
        Write-Host "Premiere recommandation:" -ForegroundColor Cyan
        $first = $data.recommendations[0]
        Write-Host "  job_id: $($first.job_id)" -ForegroundColor Gray
        Write-Host "  job_role: $($first.job_role)" -ForegroundColor Gray
        Write-Host "  company: $($first.company)" -ForegroundColor Gray
        Write-Host "  score: $($first.score)" -ForegroundColor Gray
        Write-Host "  skill_match_percentage: $($first.skill_match_percentage)" -ForegroundColor Gray
        Write-Host "  matching_skills: $($first.matching_skills -join ', ')" -ForegroundColor Gray
        Write-Host ""
        
        if ($first.skill_match_percentage -eq $null -or $first.skill_match_percentage -eq 0) {
            Write-Host "[PROBLEME] skill_match_percentage est null ou 0!" -ForegroundColor Red
        }
        
        if ($first.matching_skills -eq $null -or $first.matching_skills.Count -eq 0) {
            Write-Host "[PROBLEME] matching_skills est vide!" -ForegroundColor Red
        }
    }
    
} catch {
    Write-Host "[ERROR] Erreur lors de la requete: $($_.Exception.Message)" -ForegroundColor Red
    if ($_.Exception.Response) {
        $reader = New-Object System.IO.StreamReader($_.Exception.Response.GetResponseStream())
        $responseBody = $reader.ReadToEnd()
        Write-Host "Response body: $responseBody" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan


# Script pour configurer les credentials Kaggle
# Usage: .\setup-kaggle-credentials.ps1

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  CONFIGURATION KAGGLE API" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Token API fourni
$apiKey = "KGAT_9087a57e1bd98b83400e15cde92ade9e"

# Demander le username
Write-Host "Entrez votre nom d'utilisateur Kaggle:" -ForegroundColor Yellow
$username = Read-Host

if ([string]::IsNullOrWhiteSpace($username)) {
    Write-Host "[ERROR] Le nom d'utilisateur ne peut pas etre vide" -ForegroundColor Red
    exit 1
}

# Creer le dossier .kaggle
$kaggleDir = "$env:USERPROFILE\.kaggle"
if (-not (Test-Path $kaggleDir)) {
    New-Item -ItemType Directory -Path $kaggleDir -Force | Out-Null
    Write-Host "[OK] Dossier cree: $kaggleDir" -ForegroundColor Green
}

# Creer le fichier kaggle.json
$kaggleJson = Join-Path $kaggleDir "kaggle.json"
$config = @{
    username = $username
    key = $apiKey
} | ConvertTo-Json

$config | Out-File -FilePath $kaggleJson -Encoding UTF8 -Force

Write-Host ""
Write-Host "[OK] Fichier kaggle.json cree avec succes!" -ForegroundColor Green
Write-Host "   Emplacement: $kaggleJson" -ForegroundColor Gray
Write-Host ""

# Tester la configuration
Write-Host "Test de la configuration Kaggle..." -ForegroundColor Yellow
try {
    $testResult = python -c "import kaggle; kaggle.api.authenticate(); print('SUCCESS')" 2>&1
    if ($testResult -match "SUCCESS") {
        Write-Host "[OK] Configuration Kaggle valide!" -ForegroundColor Green
        Write-Host ""
        Write-Host "Vous pouvez maintenant executer:" -ForegroundColor Cyan
        Write-Host "   python load_courses.py" -ForegroundColor Gray
    } else {
        Write-Host "[WARNING] La configuration semble correcte mais le test a echoue" -ForegroundColor Yellow
        Write-Host "   Verifiez que le package kaggle est installe: pip install kaggle" -ForegroundColor Gray
    }
} catch {
    Write-Host "[WARNING] Impossible de tester la configuration automatiquement" -ForegroundColor Yellow
    Write-Host "   Vous pouvez tester manuellement avec:" -ForegroundColor Gray
    Write-Host "   python -c `"import kaggle; kaggle.api.authenticate()`"" -ForegroundColor Gray
}

Write-Host ""


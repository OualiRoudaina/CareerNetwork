# Script pour mettre a jour ML_SERVICE_URL dans Next.js
# Apres le deploiement du service ML

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  MISE A JOUR ML_SERVICE_URL" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# URL du service deploye (utilisez celle de gcloud)
$serviceUrl = "https://careerlink-ml-service-slrubnamcq-uc.a.run.app"

Write-Host "[INFO] URL du service ML: $serviceUrl" -ForegroundColor Yellow
Write-Host ""

# Verifier que nous sommes a la racine du projet
if (-not (Test-Path "package.json")) {
    Write-Host "[ERROR] Vous devez etre a la racine du projet (ou package.json est present)" -ForegroundColor Red
    exit 1
}

# Chemin du fichier .env.local
$envFile = ".env.local"

Write-Host "[STEP 1] Verification du fichier .env.local..." -ForegroundColor Yellow

# Creer le fichier s'il n'existe pas
if (-not (Test-Path $envFile)) {
    Write-Host "[INFO] Creation du fichier .env.local..." -ForegroundColor Gray
    New-Item -Path $envFile -ItemType File -Force | Out-Null
}

Write-Host "[OK] Fichier .env.local trouve" -ForegroundColor Green
Write-Host ""

# Lire le contenu actuel
$content = Get-Content $envFile -Raw -ErrorAction SilentlyContinue

if (-not $content) {
    $content = ""
}

Write-Host "[STEP 2] Mise a jour de ML_SERVICE_URL..." -ForegroundColor Yellow

# Verifier si ML_SERVICE_URL existe deja
if ($content -match "ML_SERVICE_URL\s*=") {
    # Remplacer l'ancienne valeur
    $content = $content -replace "ML_SERVICE_URL\s*=.*", "ML_SERVICE_URL=$serviceUrl"
    Write-Host "[INFO] ML_SERVICE_URL mis a jour" -ForegroundColor Gray
} else {
    # Ajouter la nouvelle ligne
    if ($content -and -not $content.EndsWith("`n")) {
        $content += "`n"
    }
    $content += "ML_SERVICE_URL=$serviceUrl`n"
    Write-Host "[INFO] ML_SERVICE_URL ajoute" -ForegroundColor Gray
}

# Sauvegarder
$content | Out-File -FilePath $envFile -Encoding UTF8 -NoNewline

Write-Host "[OK] Fichier .env.local mis a jour" -ForegroundColor Green
Write-Host ""

# Afficher le contenu
Write-Host "[STEP 3] Contenu du fichier .env.local:" -ForegroundColor Yellow
Write-Host "----------------------------------------" -ForegroundColor Gray
Get-Content $envFile | ForEach-Object {
    if ($_ -match "ML_SERVICE_URL") {
        Write-Host $_ -ForegroundColor Green
    } else {
        Write-Host $_ -ForegroundColor Gray
    }
}
Write-Host "----------------------------------------" -ForegroundColor Gray
Write-Host ""

# Tester le service
Write-Host "[STEP 4] Test du service ML..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$serviceUrl/health" -UseBasicParsing -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "[OK] Service accessible et operationnel" -ForegroundColor Green
        Write-Host "   Reponse: $($response.Content)" -ForegroundColor Gray
    }
} catch {
    Write-Host "[WARNING] Impossible de tester le service: $($_.Exception.Message)" -ForegroundColor Yellow
    Write-Host "   Verifiez que l'URL est correcte" -ForegroundColor Gray
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  PROCHAINES ETAPES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "1. Redemarrer l'application Next.js:" -ForegroundColor Yellow
Write-Host "   - Arretez avec Ctrl+C" -ForegroundColor Gray
Write-Host "   - Redemarrez avec: npm run dev" -ForegroundColor Gray
Write-Host ""
Write-Host "2. Tester les recommandations dans l'application" -ForegroundColor Yellow
Write-Host ""
Write-Host "3. Si vous deployez sur Vercel, ajoutez ML_SERVICE_URL dans:" -ForegroundColor Yellow
Write-Host "   Settings > Environment Variables" -ForegroundColor Gray
Write-Host ""
Write-Host "[SUCCESS] Configuration terminee !" -ForegroundColor Green
Write-Host ""


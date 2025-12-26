# Script pour uploader uniquement les fichiers manquants

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Upload des fichiers manquants" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$MODEL_PATH = "models/all-MiniLM-L6-v2"
$GCS_BUCKET = "careerlink-ml-models"
$GCS_PREFIX = "gs://$GCS_BUCKET/models/all-MiniLM-L6-v2/"

if (-not (Test-Path $MODEL_PATH)) {
    Write-Host "[X] Le modele local n'existe pas" -ForegroundColor Red
    exit 1
}

$absoluteModelPath = (Resolve-Path $MODEL_PATH).Path
$allFiles = Get-ChildItem -Path $absoluteModelPath -Recurse -File

Write-Host "Recherche des fichiers manquants..." -ForegroundColor Yellow
Write-Host ""

$missing = @()
foreach ($file in $allFiles) {
    $relativePath = $file.FullName.Replace($absoluteModelPath + "\", "").Replace("\", "/")
    $gcsPath = "$GCS_PREFIX$relativePath"
    
    $exists = gcloud storage ls "$gcsPath" 2>&1 | Where-Object { $_ -match "gs://" }
    if (-not $exists) {
        $missing += $file
    }
}

if ($missing.Count -eq 0) {
    Write-Host "[OK] Tous les fichiers sont deja dans GCS!" -ForegroundColor Green
    exit 0
}

Write-Host "Fichiers a uploader: $($missing.Count)" -ForegroundColor Yellow
Write-Host ""

$uploaded = 0
$failed = 0

foreach ($file in $missing) {
    $relativePath = $file.FullName.Replace($absoluteModelPath + "\", "").Replace("\", "/")
    $gcsPath = "$GCS_PREFIX$relativePath"
    
    $fileSize = [math]::Round($file.Length / 1MB, 2)
    Write-Host "  Upload: $relativePath ($fileSize MB)" -ForegroundColor Gray
    
    gcloud storage cp "$($file.FullName)" "$gcsPath" 2>&1 | Out-Null
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "    [OK]" -ForegroundColor Green
        $uploaded++
    } else {
        Write-Host "    [X] Erreur" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Resume" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Uploades: $uploaded / $($missing.Count)" -ForegroundColor $(if ($uploaded -eq $missing.Count) { "Green" } else { "Yellow" })
Write-Host "Echoues: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($failed -eq 0) {
    Write-Host "[OK] Tous les fichiers manquants ont ete uploades!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines etapes:" -ForegroundColor Yellow
    Write-Host "  1. Redemarrez le service: .\update-service-env.ps1" -ForegroundColor Cyan
    Write-Host "  2. Attendez 1-2 minutes" -ForegroundColor Gray
    Write-Host "  3. Testez: curl https://careerlink-ml-service-456628805798.us-central1.run.app/" -ForegroundColor Cyan
} else {
    Write-Host "[!] Certains fichiers ont echoue. Reessayez." -ForegroundColor Yellow
}


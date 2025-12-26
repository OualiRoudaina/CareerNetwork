# Script PowerShell pour uploader le modele vers GCS (version robuste)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Upload du modele vers GCS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$MODEL_PATH = "models/all-MiniLM-L6-v2"
$GCS_BUCKET = "careerlink-ml-models"
$GCS_PREFIX = "gs://$GCS_BUCKET/models/all-MiniLM-L6-v2/"

if (-not (Test-Path $MODEL_PATH)) {
    Write-Host "[X] Le modele local n'existe pas: $MODEL_PATH" -ForegroundColor Red
    exit 1
}

$absoluteModelPath = (Resolve-Path $MODEL_PATH).Path
Write-Host "Source: $absoluteModelPath" -ForegroundColor Gray
Write-Host "Destination: $GCS_PREFIX" -ForegroundColor Gray
Write-Host ""

# Obtenir tous les fichiers
$allFiles = Get-ChildItem -Path $absoluteModelPath -Recurse -File
$totalFiles = $allFiles.Count
Write-Host "Fichiers a uploader: $totalFiles" -ForegroundColor Yellow
Write-Host ""

$uploaded = 0
$failed = 0

foreach ($file in $allFiles) {
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
Write-Host "Uploades: $uploaded / $totalFiles" -ForegroundColor $(if ($uploaded -eq $totalFiles) { "Green" } else { "Yellow" })
Write-Host "Echoues: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })
Write-Host ""

if ($failed -eq 0) {
    Write-Host "[OK] Tous les fichiers ont ete uploades!" -ForegroundColor Green
    Write-Host ""
    
    # Verifier que model.safetensors est present
    Write-Host "Verification..." -ForegroundColor Yellow
    $check = gcloud storage ls "$GCS_PREFIX**/model.safetensors" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] model.safetensors present dans GCS" -ForegroundColor Green
    } else {
        Write-Host "  [!] model.safetensors non trouve" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Write-Host "Prochaines etapes:" -ForegroundColor Yellow
    Write-Host "  1. Redemarrez le service: .\update-service-env.ps1" -ForegroundColor Cyan
    Write-Host "  2. Attendez 1-2 minutes" -ForegroundColor Gray
    Write-Host "  3. Testez: curl https://careerlink-ml-service-456628805798.us-central1.run.app/" -ForegroundColor Cyan
} else {
    Write-Host "[!] Certains fichiers ont echoue. Reessayez l'upload." -ForegroundColor Yellow
    exit 1
}


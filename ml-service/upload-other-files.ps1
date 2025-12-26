# Script pour uploader les autres fichiers (sans model.safetensors)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Upload des autres fichiers du modele" -ForegroundColor Cyan
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
$allFiles = Get-ChildItem -Path $absoluteModelPath -Recurse -File | Where-Object { $_.Name -ne "model.safetensors" }

Write-Host "Fichiers a uploader (sans model.safetensors): $($allFiles.Count)" -ForegroundColor Yellow
Write-Host ""

$uploaded = 0
$failed = 0

foreach ($file in $allFiles) {
    $relativePath = $file.FullName.Replace($absoluteModelPath + "\", "").Replace("\", "/")
    $gcsPath = "$GCS_PREFIX$relativePath"
    
    # Verifier si deja present
    $exists = gcloud storage ls "$gcsPath" 2>&1 | Where-Object { $_ -match "gs://" }
    if ($exists) {
        Write-Host "  [OK] $relativePath (deja present)" -ForegroundColor DarkGreen
        $uploaded++
        continue
    }
    
    $fileSize = [math]::Round($file.Length / 1KB, 2)
    Write-Host "  Upload: $relativePath ($fileSize KB)" -ForegroundColor Gray
    
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
Write-Host "Resume: $uploaded uploades, $failed echoues" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Yellow" })


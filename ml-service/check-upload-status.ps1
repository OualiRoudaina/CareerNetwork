# Script pour verifier l'etat de l'upload et completer si necessaire

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verification de l'upload" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$MODEL_PATH = "models/all-MiniLM-L6-v2"
$GCS_BUCKET = "careerlink-ml-models"
$GCS_PREFIX = "gs://$GCS_BUCKET/models/all-MiniLM-L6-v2/"

Write-Host "1. Fichiers dans GCS:" -ForegroundColor Yellow
$gcsFiles = gcloud storage ls "$GCS_PREFIX" --recursive 2>&1 | Where-Object { $_ -match "gs://" }
$gcsCount = ($gcsFiles | Measure-Object).Count
Write-Host "   Total: $gcsCount fichiers" -ForegroundColor Gray
$gcsFiles | ForEach-Object { Write-Host "   $_" -ForegroundColor DarkGray }

Write-Host ""
Write-Host "2. Fichiers locaux:" -ForegroundColor Yellow
if (Test-Path $MODEL_PATH) {
    $localFiles = Get-ChildItem -Path $MODEL_PATH -Recurse -File
    $localCount = $localFiles.Count
    Write-Host "   Total: $localCount fichiers" -ForegroundColor Gray
    
    # Verifier model.safetensors
    $modelFile = $localFiles | Where-Object { $_.Name -eq "model.safetensors" -or $_.Name -eq "pytorch_model.bin" }
    if ($modelFile) {
        $size = [math]::Round($modelFile.Length / 1MB, 2)
        Write-Host "   [OK] Fichier principal: $($modelFile.Name) ($size MB)" -ForegroundColor Green
    } else {
        Write-Host "   [X] Fichier principal manquant!" -ForegroundColor Red
    }
} else {
    Write-Host "   [X] Modele local non trouve" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "3. Fichiers manquants dans GCS:" -ForegroundColor Yellow

$missing = @()
foreach ($file in $localFiles) {
    $relativePath = $file.FullName.Replace((Resolve-Path $MODEL_PATH).Path + "\", "").Replace("\", "/")
    $gcsPath = "$GCS_PREFIX$relativePath"
    
    $exists = gcloud storage ls "$gcsPath" 2>&1 | Where-Object { $_ -match "gs://" }
    if (-not $exists) {
        $missing += $file
        Write-Host "   [X] $relativePath" -ForegroundColor Red
    }
}

Write-Host ""
if ($missing.Count -eq 0) {
    Write-Host "[OK] Tous les fichiers sont dans GCS!" -ForegroundColor Green
} else {
    Write-Host "[!] $($missing.Count) fichiers manquent dans GCS" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Pour completer l'upload:" -ForegroundColor Yellow
    Write-Host "  .\upload-model-final.ps1" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "Ou uploader seulement les fichiers manquants:" -ForegroundColor Yellow
    Write-Host "  .\upload-missing-files.ps1" -ForegroundColor Cyan
}


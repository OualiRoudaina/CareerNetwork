# Script PowerShell pour uploader le modele vers GCS en utilisant gcloud (plus robuste pour les gros fichiers)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Upload du modele vers GCS" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$MODEL_PATH = "models/all-MiniLM-L6-v2"
$GCS_BUCKET = "careerlink-ml-models"
$GCS_PREFIX = "models/all-MiniLM-L6-v2/"

if (-not (Test-Path $MODEL_PATH)) {
    Write-Host "[X] Le modele local n'existe pas: $MODEL_PATH" -ForegroundColor Red
    Write-Host "    Telechargez d'abord le modele avec fix-model-upload.ps1" -ForegroundColor Yellow
    exit 1
}

Write-Host "1. Verification du modele local..." -ForegroundColor Yellow
$fileCount = (Get-ChildItem -Path $MODEL_PATH -Recurse -File).Count
Write-Host "   Fichiers trouves: $fileCount" -ForegroundColor Gray

# Verifier que model.safetensors existe
$modelFile = Get-ChildItem -Path $MODEL_PATH -Recurse -Filter "model.safetensors" -ErrorAction SilentlyContinue
if (-not $modelFile) {
    $modelFile = Get-ChildItem -Path $MODEL_PATH -Recurse -Filter "pytorch_model.bin" -ErrorAction SilentlyContinue
}

if (-not $modelFile) {
    Write-Host "   [X] Fichier principal du modele non trouve!" -ForegroundColor Red
    Write-Host "   Executez d'abord: .\fix-model-upload.ps1" -ForegroundColor Yellow
    exit 1
}

$fileSize = [math]::Round($modelFile.Length / 1MB, 2)
Write-Host "   [OK] Fichier principal trouve: $($modelFile.Name) ($fileSize MB)" -ForegroundColor Green
Write-Host ""

Write-Host "2. Upload du modele vers GCS..." -ForegroundColor Yellow
Write-Host "   (Cela peut prendre plusieurs minutes pour les gros fichiers)" -ForegroundColor Gray
Write-Host ""

# Utiliser gcloud storage cp qui est plus robuste pour les gros fichiers
$uploaded = 0
$failed = 0

Get-ChildItem -Path $MODEL_PATH -Recurse -File | ForEach-Object {
    $localFile = $_.FullName
    $relativePath = $_.FullName.Replace((Resolve-Path $MODEL_PATH).Path + "\", "").Replace("\", "/")
    $gcsPath = "$GCS_PREFIX$relativePath"
    
    Write-Host "   Upload: $relativePath" -ForegroundColor Gray
    
    # Utiliser gcloud storage cp (retry automatique par défaut)
    gcloud storage cp "$localFile" "gs://$GCS_BUCKET/$gcsPath"
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "     [OK]" -ForegroundColor Green
        $uploaded++
    } else {
        Write-Host "     [X] Erreur" -ForegroundColor Red
        $failed++
    }
}

Write-Host ""
Write-Host "3. Resume de l'upload..." -ForegroundColor Yellow
Write-Host "   Uploades: $uploaded" -ForegroundColor $(if ($uploaded -gt 0) { "Green" } else { "Red" })
Write-Host "   Echoues: $failed" -ForegroundColor $(if ($failed -eq 0) { "Green" } else { "Red" })

if ($failed -gt 0) {
    Write-Host ""
    Write-Host "[!] Certains fichiers ont echoue. Reessayez l'upload." -ForegroundColor Yellow
    exit 1
}

Write-Host ""
Write-Host "4. Verification dans GCS..." -ForegroundColor Yellow
$gcsFiles = gcloud storage ls "gs://$GCS_BUCKET/$GCS_PREFIX" --recursive 2>&1 | Where-Object { $_ -match "gs://" }
$gcsCount = ($gcsFiles | Measure-Object).Count
Write-Host "   Fichiers dans GCS: $gcsCount" -ForegroundColor Gray

# Verifier que model.safetensors est present
$modelInGCS = gcloud storage ls "gs://$GCS_BUCKET/$GCS_PREFIX**/model.safetensors" 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "   [OK] model.safetensors present dans GCS" -ForegroundColor Green
} else {
    $modelInGCS = gcloud storage ls "gs://$GCS_BUCKET/$GCS_PREFIX**/pytorch_model.bin" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "   [OK] pytorch_model.bin present dans GCS" -ForegroundColor Green
    } else {
        Write-Host "   [X] Fichier principal du modele manquant dans GCS!" -ForegroundColor Red
        exit 1
    }
}

Write-Host ""
Write-Host "[OK] Upload termine avec succes!" -ForegroundColor Green
Write-Host ""
Write-Host "5. Prochaines etapes:" -ForegroundColor Yellow
Write-Host "   a. Redemarrez le service: .\update-service-env.ps1" -ForegroundColor Cyan
Write-Host "   b. Attendez 1-2 minutes" -ForegroundColor Gray
Write-Host "   c. Testez: curl https://careerlink-ml-service-456628805798.us-central1.run.app/" -ForegroundColor Cyan
Write-Host ""


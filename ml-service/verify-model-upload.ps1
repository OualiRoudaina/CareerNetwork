# Script PowerShell pour verifier que tous les fichiers du modele sont dans GCS

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Verification de l'upload du modele" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$GCS_BUCKET = "careerlink-ml-models"
$MODEL_PREFIX = "models/all-MiniLM-L6-v2/"

Write-Host "Fichiers requis pour le modele SentenceTransformer:" -ForegroundColor Yellow
Write-Host ""

# Fichiers essentiels pour SentenceTransformer
$requiredFiles = @(
    "config.json",
    "config_sentence_transformers.json",
    "modules.json",
    "tokenizer.json",
    "tokenizer_config.json",
    "vocab.txt",
    "special_tokens_map.json"
)

# Fichiers optionnels mais importants
$importantFiles = @(
    "model.safetensors",
    "pytorch_model.bin",
    "1_Pooling/config.json",
    "2_Normalize/config.json"
)

Write-Host "Fichiers essentiels:" -ForegroundColor Cyan
$missingEssential = @()
foreach ($file in $requiredFiles) {
    $gcsPath = "$MODEL_PREFIX$file"
    $result = gcloud storage ls "gs://$GCS_BUCKET/$gcsPath" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] $file" -ForegroundColor Green
    } else {
        Write-Host "  [X] $file - MANQUANT" -ForegroundColor Red
        $missingEssential += $file
    }
}
Write-Host ""

Write-Host "Fichiers importants:" -ForegroundColor Cyan
$missingImportant = @()
foreach ($file in $importantFiles) {
    $gcsPath = "$MODEL_PREFIX$file"
    $result = gcloud storage ls "gs://$GCS_BUCKET/$gcsPath" 2>&1
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] $file" -ForegroundColor Green
    } else {
        Write-Host "  [!] $file - MANQUANT (peut etre necessaire)" -ForegroundColor Yellow
        $missingImportant += $file
    }
}
Write-Host ""

# Lister tous les fichiers du modele dans GCS
Write-Host "Tous les fichiers du modele dans GCS:" -ForegroundColor Cyan
gcloud storage ls "gs://$GCS_BUCKET/$MODEL_PREFIX" --recursive
Write-Host ""

if ($missingEssential.Count -gt 0) {
    Write-Host "[!] ATTENTION: Fichiers essentiels manquants!" -ForegroundColor Red
    Write-Host "   Vous devez re-uploader le modele complet." -ForegroundColor Yellow
    Write-Host ""
    Write-Host "   Solution:" -ForegroundColor Yellow
    Write-Host "   1. Assurez-vous que le modele est complet localement" -ForegroundColor Gray
    Write-Host "   2. Relancez: .\sync-data.ps1" -ForegroundColor Gray
    Write-Host "   3. Ou manuellement: python sync_mongodb_gcs.py" -ForegroundColor Gray
    Write-Host "      (avec UPLOAD_MODEL_TO_GCS=true)" -ForegroundColor Gray
} elseif ($missingImportant.Count -gt 0) {
    Write-Host "[!] Certains fichiers importants manquent, mais le modele peut fonctionner." -ForegroundColor Yellow
    Write-Host "   Si le service ne fonctionne pas, re-uploadez le modele complet." -ForegroundColor Yellow
} else {
    Write-Host "[OK] Tous les fichiers essentiels sont presents!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Si le service ne fonctionne toujours pas:" -ForegroundColor Yellow
    Write-Host "  1. Verifiez les logs: .\check-service-status.ps1" -ForegroundColor Gray
    Write-Host "  2. Redemarrez le service: .\update-service-env.ps1" -ForegroundColor Gray
    Write-Host "  3. Verifiez les permissions GCS du service account" -ForegroundColor Gray
}


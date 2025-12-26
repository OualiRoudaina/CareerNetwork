# Workflow complet: Test local puis deploiement
# Ce script automatise le processus de test et deploiement

param(
    [switch]$SkipTest,
    [switch]$SkipDeploy,
    [string]$DeployMethod = "direct"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  WORKFLOW ML SERVICE" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Étape 1: Test local (sauf si --SkipTest)
if (-not $SkipTest) {
    Write-Host "[ETAPE 1] Test local du service..." -ForegroundColor Yellow
    Write-Host ""
    
    if (Test-Path "test-local.ps1") {
        & .\test-local.ps1
        
        if ($LASTEXITCODE -ne 0) {
            Write-Host ""
            Write-Host "[ERROR] Les tests locaux ont echoue" -ForegroundColor Red
            Write-Host "   Corrigez les erreurs avant de deployer" -ForegroundColor Yellow
            Write-Host "   Ou utilisez -SkipTest pour ignorer les tests" -ForegroundColor Gray
            exit 1
        }
        
        Write-Host ""
        $continue = Read-Host "Les tests sont passes. Voulez-vous continuer avec le deploiement ? (O/N)"
        if ($continue -ne "O" -and $continue -ne "o" -and $continue -ne "Y" -and $continue -ne "y") {
            Write-Host "[INFO] Deploiement annule" -ForegroundColor Yellow
            exit 0
        }
        Write-Host ""
    } else {
        Write-Host "[WARNING] Script test-local.ps1 non trouve, passage au deploiement..." -ForegroundColor Yellow
    }
} else {
    Write-Host "[INFO] Tests locaux ignores (--SkipTest)" -ForegroundColor Yellow
    Write-Host ""
}

# Étape 2: Déploiement (sauf si --SkipDeploy)
if (-not $SkipDeploy) {
    Write-Host "[ETAPE 2] Deploiement sur Cloud Run..." -ForegroundColor Yellow
    Write-Host ""
    
    if ($DeployMethod -eq "build") {
        Write-Host "[INFO] Methode: Cloud Build" -ForegroundColor Cyan
        $choice = "2"
    } else {
        Write-Host "[INFO] Methode: Deploiement direct" -ForegroundColor Cyan
        $choice = "1"
    }
    
    # Exécuter le script de déploiement avec le choix automatique
    if (Test-Path "redeply.ps1") {
        # Modifier temporairement le script pour accepter le choix automatiquement
        $scriptContent = Get-Content "redeply.ps1" -Raw
        
        # Remplacer la ligne Read-Host par le choix automatique
        $scriptContent = $scriptContent -replace 'Read-Host "Choisissez une option.*"', "`$choice = `"$choice`""
        
        # Créer un script temporaire
        $tempScript = "redeply-temp.ps1"
        $scriptContent | Out-File -FilePath $tempScript -Encoding UTF8
        
        try {
            & .\$tempScript
        } finally {
            # Nettoyer le script temporaire
            if (Test-Path $tempScript) {
                Remove-Item $tempScript -Force
            }
        }
    } else {
        Write-Host "[ERROR] Script redeply.ps1 non trouve" -ForegroundColor Red
        exit 1
    }
} else {
    Write-Host "[INFO] Deploiement ignore (--SkipDeploy)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[SUCCESS] Workflow termine !" -ForegroundColor Green
Write-Host ""


# Commandes utilisées - Résumé de la session

## 1. Configuration Kaggle

### Installation du package kaggle
```powershell
pip install kaggle
```

### Configuration des credentials Kaggle
```powershell
# Création du dossier .kaggle
$kaggleDir = "$env:USERPROFILE\.kaggle"
New-Item -ItemType Directory -Path $kaggleDir -Force

# Création du fichier kaggle.json avec le token
python -c "import json; import os; kaggle_dir = os.path.expanduser('~/.kaggle'); kaggle_json = os.path.join(kaggle_dir, 'kaggle.json'); config = {'username': 'oualiroudaina', 'key': 'KGAT_9087a57e1bd98b83400e15cde92ade9e'}; json.dump(config, open(kaggle_json, 'w'), indent=2)"
```

### Vérification de la configuration Kaggle
```powershell
python -c "import kaggle; kaggle.api.authenticate(); print('[OK] Configuration Kaggle valide!')"
```

## 2. Chargement des cours depuis Kaggle

### Exécution du script de chargement
```powershell
cd ml-service
python load_courses.py
```

### Vérification des cours chargés
```powershell
python -c "import pickle; df = pickle.load(open('data/courses_index.pkl', 'rb')); print(f'Nombre de cours: {len(df)}')"
```

## 3. Upload vers Google Cloud Storage

### Upload des fichiers de cours
```powershell
cd ml-service
gsutil cp data/course_embeddings.npy gs://careerlink-ml-models/data/course_embeddings.npy
gsutil cp data/courses_index.pkl gs://careerlink-ml-models/data/courses_index.pkl
```

### Script automatique (alternative)
```powershell
cd ml-service
.\prepare-and-deploy-certs.ps1
```

## 4. Déploiement du service ML

### Redéploiement du service
```powershell
cd ml-service
.\redeply.ps1
```

## 5. Configuration Next.js

### Mise à jour de ML_SERVICE_URL
```powershell
# Mise à jour manuelle dans .env.local
$serviceUrl = "https://careerlink-ml-service-slrubnamcq-uc.a.run.app"
$envFile = ".env.local"
$content = Get-Content $envFile -Raw -ErrorAction SilentlyContinue
if ($content -match "ML_SERVICE_URL\s*=") {
    $content = $content -replace "ML_SERVICE_URL\s*=.*", "ML_SERVICE_URL=$serviceUrl"
} else {
    $content += "ML_SERVICE_URL=$serviceUrl`n"
}
$content | Out-File -FilePath $envFile -Encoding UTF8 -NoNewline
```

### Vérification de la configuration
```powershell
Get-Content .env.local | Select-String "ML_SERVICE_URL"
```

## 6. Test du service ML

### Health check
```powershell
curl https://careerlink-ml-service-slrubnamcq-uc.a.run.app/health
```

### Test avec PowerShell
```powershell
Invoke-WebRequest -Uri "https://careerlink-ml-service-slrubnamcq-uc.a.run.app/health" -UseBasicParsing
```

## 7. Nettoyage des fichiers .md

### Suppression des fichiers .md inutiles
```powershell
# Supprimer tous les .md sauf README.md
Get-ChildItem -Path . -Filter "*.md" -Recurse | Where-Object { $_.Name -ne "README.md" -and $_.FullName -notlike "*ml-service\README.md" } | Remove-Item -Force

# Supprimer les .md à la racine (sauf README.md)
Get-ChildItem -Path . -Filter "*.md" -File | Where-Object { $_.Name -ne "README.md" } | Remove-Item -Force
```

## Résumé des fichiers modifiés/créés

### Fichiers modifiés:
- `ml-service/requirements.txt` - Ajout de `kaggle>=1.5.16`
- `ml-service/load_courses.py` - Correction pour utiliser `kaggle.api` au lieu de `kagglehub`
- `ml-service/init_model.py` - Correction pour utiliser `kaggle.api`
- `update-ml-url.ps1` - Mise à jour avec la nouvelle URL
- `.env.local` - Ajout de `ML_SERVICE_URL`

### Fichiers créés:
- `C:\Users\ouali\.kaggle\kaggle.json` - Configuration Kaggle
- `ml-service/data/course_embeddings.npy` - Embeddings des cours (6505 cours)
- `ml-service/data/courses_index.pkl` - Index des cours

### Résultat final:
- ✅ 6505 cours chargés depuis Kaggle
- ✅ Service ML déployé et opérationnel
- ✅ Next.js configuré avec la nouvelle URL
- ✅ Projet nettoyé (52+ fichiers .md supprimés)


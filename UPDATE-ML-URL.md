# 🔄 Mettre à jour l'URL du Service ML

## ✅ Service ML Déployé

**URL du service :** `https://careerlink-ml-service-456628805798.us-central1.run.app`

## 📝 Mettre à jour dans Next.js

### 1. Créer/Mettre à jour `.env.local`

À la racine du projet (même niveau que `package.json`), créez ou modifiez le fichier `.env.local` :

```env
# Service ML (URL du service déployé sur Cloud Run)
ML_SERVICE_URL=https://careerlink-ml-service-456628805798.us-central1.run.app
```

### 2. Redémarrer l'application Next.js

```powershell
# Arrêter l'application (Ctrl+C)
# Puis redémarrer
npm run dev
```

### 3. Vérifier que l'URL est bien utilisée

L'application Next.js utilisera automatiquement cette URL dans `pages/api/recommend.ts`.

## ⚠️ Important : Synchroniser les Données

Avant de pouvoir utiliser les recommandations, vous devez synchroniser les données MongoDB vers GCS :

```powershell
cd ml-service

# Installer les dépendances si nécessaire
pip install -r requirements-gcp.txt

# Configurer les variables d'environnement
$env:MONGODB_URI="mongodb+srv://roudaina:04062002Rr+@cluster0.lqatepg.mongodb.net/career-network"
$env:GCS_BUCKET_NAME="careerlink-ml-models"
$env:UPLOAD_MODEL_TO_GCS="true"

# Exécuter la synchronisation
python sync_mongodb_gcs.py
```

Cette commande va :
- ✅ Télécharger le modèle SentenceTransformer
- ✅ Synchroniser les jobs depuis MongoDB
- ✅ Générer les embeddings
- ✅ Uploader tout vers GCS

## 🧪 Tester les Recommandations

Une fois la synchronisation terminée, testez les recommandations dans votre application Next.js.





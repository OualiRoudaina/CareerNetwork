# CareerNetwork ML Service

Service d'intelligence artificielle pour les recommandations d'emploi basé sur SentenceTransformers.

## 🚀 Installation

### 1. Installer les dépendances Python

```bash
pip install -r ml-service/requirements.txt
```

### 2. Configuration Kaggle (pour télécharger le dataset)

Si vous voulez utiliser le dataset Kaggle, vous devez configurer vos credentials Kaggle:

1. Créez un compte sur [Kaggle](https://www.kaggle.com/)
2. Téléchargez votre fichier `kaggle.json` depuis Account > API
3. Placez-le dans `~/.kaggle/kaggle.json` (Linux/Mac) ou `C:\Users\<username>\.kaggle\kaggle.json` (Windows)

### 3. Initialiser le modèle

#### Option A: Utiliser le dataset Kaggle

```bash
python ml-service/init_model.py
```

Cette commande va:
- Télécharger le dataset depuis Kaggle
- Créer les embeddings pour tous les jobs
- Sauvegarder le modèle et les données

#### Option B: Utiliser vos jobs MongoDB

```bash
# Définir l'URI MongoDB
export MONGODB_URI="mongodb://localhost:27017/careernetwork"

# Synchroniser les jobs
python ml-service/sync_mongodb.py
```

Cette commande va:
- Récupérer tous les jobs actifs depuis MongoDB
- Créer les embeddings
- Sauvegarder les données

## 🏃 Démarrer le serveur

### Mode développement (avec rechargement automatique)

```bash
uvicorn ml-service.app:app --reload --port 8000
```

### Mode production

```bash
python ml-service/app.py
```

Le serveur sera accessible sur `http://localhost:8000`

## 📡 API Endpoints

### Health Check

```bash
GET http://localhost:8000/health
```

### Obtenir des recommandations

```bash
POST http://localhost:8000/api/recommend
Content-Type: application/json

{
  "skills": "Python, Machine Learning, Data Analysis",
  "experience": "6 months internship in data analytics",
  "education": "Bachelor in Computer Science",
  "location": "Bangalore, India",
  "contract_type": "Internship",
  "languages": "English, Hindi",
  "certifications": "AWS, Google Data Analytics"
}
```

### Réponse

```json
{
  "recommendations": [
    {
      "job_id": null,
      "job_role": "Data Scientist",
      "company": "Tech Corp",
      "location": "Bangalore, India",
      "skills_description": "Python, ML, Data Analysis",
      "score": 85.42
    }
  ],
  "message": "Found 5 recommendations"
}
```

## 🔄 Synchronisation avec MongoDB

Pour mettre à jour les recommandations avec les nouveaux jobs de MongoDB:

```bash
python ml-service/sync_mongodb.py
```

Vous pouvez automatiser cela avec un cron job ou une tâche planifiée.

## 🐳 Docker (Optionnel)

Créer un `Dockerfile`:

```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY ml-service/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY ml-service/ .

EXPOSE 8000

CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8000"]
```

## 📝 Notes

- Le modèle `all-MiniLM-L6-v2` sera téléchargé automatiquement lors de la première utilisation
- Les embeddings sont sauvegardés dans `data/job_embeddings.npy`
- L'index des jobs est sauvegardé dans `data/jobs_index.pkl`
- Le modèle est sauvegardé dans `models/all-MiniLM-L6-v2`

## 🔧 Configuration

Vous pouvez configurer le service via des variables d'environnement (voir `.env.example`):

- `PORT`: Port du serveur (défaut: 8000)
- `MODEL_PATH`: Chemin vers le modèle (défaut: `models/all-MiniLM-L6-v2`)
- `EMBEDDINGS_PATH`: Chemin vers les embeddings (défaut: `data/job_embeddings.npy`)
- `INDEX_PATH`: Chemin vers l'index (défaut: `data/jobs_index.pkl`)
- `MONGODB_URI`: URI MongoDB pour la synchronisation









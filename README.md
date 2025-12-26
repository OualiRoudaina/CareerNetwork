# CareerNetwork - Plateforme de mise en relation intelligente

Application web moderne développée avec Next.js et MongoDB permettant aux étudiants et jeunes diplômés de créer leur profil, consulter des offres d'emploi et recevoir des recommandations IA basées sur leurs compétences.

## 🚀 Fonctionnalités

### 1. Authentification
- Inscription / Connexion avec email + mot de passe
- Authentification sécurisée avec NextAuth
- Protection des routes

### 2. Gestion du profil
- Formulaire pour remplir ses compétences, études, expériences
- Upload du CV (lien URL pour l'instant)
- Mise à jour du profil en temps réel

### 3. Offres d'emploi
- Liste complète des offres stockées dans MongoDB
- Filtrage avancé par mots-clés, lieu, expérience, type de contrat
- Page de détails pour chaque offre

### 4. Recommandations IA
- Bouton "Trouver mes offres" qui analyse le profil utilisateur
- **Service ML intégré** avec SentenceTransformers pour des recommandations intelligentes
- Similarité sémantique basée sur les embeddings pour un matching précis
- Affichage dynamique des offres recommandées avec scores de pertinence

### 5. Interface Admin
- Tableau de bord avec gestion des utilisateurs
- Gestion des offres d'emploi
- Statistiques et logs

## 🛠️ Technologies utilisées

- **Next.js 14** - Framework React
- **TypeScript** - Typage statique
- **MongoDB** + **Mongoose** - Base de données
- **NextAuth** - Authentification
- **Tailwind CSS** - Styling
- **React Hook Form** - Gestion des formulaires
- **FastAPI** - Service ML pour les recommandations
- **SentenceTransformers** - Modèle d'embeddings sémantiques
- **scikit-learn** - Calcul de similarité cosinus

## 📦 Installation

1. **Cloner le repository**
```bash
git clone <url-du-repo>
cd CareerNetwork
```

2. **Installer les dépendances**
```bash
npm install
```

3. **Configurer les variables d'environnement**

Créer un fichier `.env.local` à la racine du projet :
```env
# MongoDB
MONGODB_URI=mongodb://localhost:27017/career-network
# ou pour MongoDB Atlas: mongodb+srv://username:password@cluster.mongodb.net/career-network

# NextAuth
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key-here-generate-with-openssl-rand-base64-32

# JWT Secret (optionnel)
JWT_SECRET=your-jwt-secret-here

# Service ML (optionnel, pour les recommandations IA)
ML_SERVICE_URL=http://localhost:8000
```

**Pour générer NEXTAUTH_SECRET :**
```bash
openssl rand -base64 32
```

4. **Démarrer MongoDB**

Assurez-vous que MongoDB est démarré sur votre machine, ou utilisez MongoDB Atlas.

5. **Lancer l'application**
```bash
npm run dev
```

L'application sera accessible sur [http://localhost:3000](http://localhost:3000)

## 📁 Structure du projet

```
CareerNetwork/
├── components/          # Composants réutilisables
│   ├── Navbar.tsx
│   ├── Footer.tsx
│   ├── JobCard.tsx
│   ├── ProfileForm.tsx
│   ├── Loader.tsx
│   └── Alert.tsx
├── lib/                # Utilitaires
│   ├── mongodb.ts      # Connexion MongoDB
│   ├── auth.ts         # Fonctions d'authentification
│   └── getServerSession.ts
├── models/             # Modèles Mongoose
│   ├── User.ts
│   └── Job.ts
├── pages/              # Pages Next.js
│   ├── api/            # API Routes
│   │   ├── auth/
│   │   ├── profile/
│   │   ├── jobs/
│   │   ├── recommend.ts
│   │   └── admin/
│   ├── index.tsx       # Accueil
│   ├── login.tsx
│   ├── register.tsx
│   ├── profile.tsx
│   ├── jobs/
│   ├── recommendations.tsx
│   └── admin.tsx
├── styles/             # Styles globaux
│   └── globals.css
├── types/              # Types TypeScript
│   └── next-auth.d.ts
├── ml-service/         # Service ML Python
│   ├── app.py         # Serveur FastAPI
│   ├── init_model.py  # Initialisation du modèle
│   ├── sync_mongodb.py # Synchronisation MongoDB
│   └── requirements.txt
└── package.json
```

## 🔐 Créer un compte administrateur

Pour créer un compte administrateur, vous pouvez utiliser MongoDB directement ou créer un script de migration :

```javascript
// scripts/createAdmin.js
const mongoose = require('mongoose');
const User = require('../models/User');
const { hashPassword } = require('../lib/auth');

async function createAdmin() {
  await mongoose.connect(process.env.MONGODB_URI);
  const hashedPassword = await hashPassword('admin-password');
  await User.create({
    email: 'admin@example.com',
    password: hashedPassword,
    name: 'Admin',
    role: 'admin',
    profile: { skills: [], education: [], experience: [] }
  });
  console.log('Admin créé !');
  process.exit(0);
}

createAdmin();
```

## 🤖 Service ML de Recommandation

Le système de recommandation utilise un service Python FastAPI avec SentenceTransformers pour des recommandations intelligentes basées sur la similarité sémantique.

### Installation du service ML

1. **Installer les dépendances Python:**
```bash
pip install -r ml-service/requirements.txt
```

2. **Initialiser le modèle avec vos jobs MongoDB:**
```bash
export MONGODB_URI="mongodb://localhost:27017/careernetwork"
python ml-service/sync_mongodb.py
```

3. **Démarrer le service ML:**
```bash
cd ml-service
uvicorn app:app --reload --port 8000
```

4. **Configurer Next.js:**
Ajoutez dans `.env.local`:
```env
ML_SERVICE_URL=http://localhost:8000
```

📖 **Documentation complète:** Voir [INTEGRATION_ML.md](INTEGRATION_ML.md) et [QUICK_START_ML.md](QUICK_START_ML.md)

## 🎨 Personnalisation

- **Couleurs** : Modifiez `tailwind.config.ts` pour changer le thème
- **Dark Mode** : Déjà implémenté via Tailwind CSS
- **Composants** : Tous les composants sont dans `/components`

## 📝 Scripts disponibles

- `npm run dev` - Démarrer le serveur de développement
- `npm run build` - Build de production
- `npm start` - Démarrer le serveur de production
- `npm run lint` - Lancer ESLint

## 🐛 Dépannage

### Erreur de connexion MongoDB
- Vérifiez que MongoDB est démarré
- Vérifiez la variable `MONGODB_URI` dans `.env.local`

### Erreur NextAuth
- Vérifiez que `NEXTAUTH_SECRET` est défini
- Vérifiez que `NEXTAUTH_URL` correspond à votre URL

### Erreurs TypeScript
- Vérifiez que tous les types sont correctement importés
- Vérifiez la configuration dans `tsconfig.json`

## 📄 Licence

Ce projet est développé pour CareerNetwork.

## 👥 Auteur

Développé pour la plateforme CareerNetwork - Mise en relation intelligente entre étudiants et entreprises.


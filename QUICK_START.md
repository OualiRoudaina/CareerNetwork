# 🚀 Guide de démarrage rapide - CareerNetwork

## Étape 1 : Installer les dépendances

```bash
npm install
```

## Étape 2 : Configurer les variables d'environnement

1. Copiez le fichier `env.example` vers `.env.local` :
```bash
cp env.example .env.local
```

2. Éditez `.env.local` et configurez vos variables :

```env
# MongoDB - Remplacez par votre URI MongoDB
MONGODB_URI=mongodb://localhost:27017/career-network

# NextAuth - Générez une clé secrète
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=votre-clé-secrète-ici

# JWT Secret (optionnel)
JWT_SECRET=votre-jwt-secret-ici
```

**Pour générer NEXTAUTH_SECRET :**
```bash
# Sur Windows PowerShell
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Maximum 256 }))

# Sur Linux/Mac
openssl rand -base64 32
```

## Étape 3 : Démarrer MongoDB

### Option A : MongoDB Local
Assurez-vous que MongoDB est installé et démarré sur votre machine :
```bash
# Vérifier si MongoDB est démarré
# Sur Windows, vérifiez dans les services
```

### Option B : MongoDB Atlas (Cloud - Gratuit)
1. Créez un compte sur [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Créez un cluster gratuit
3. Créez un utilisateur de base de données
4. Obtenez votre URI de connexion (format : `mongodb+srv://username:password@cluster.mongodb.net/career-network`)
5. Mettez à jour `MONGODB_URI` dans `.env.local`

## Étape 4 : Lancer l'application

```bash
npm run dev
```

L'application sera accessible sur : **http://localhost:3000**

## 🎯 Première utilisation

1. **Créer un compte** : Allez sur http://localhost:3000/register
2. **Se connecter** : Utilisez vos identifiants sur http://localhost:3000/login
3. **Remplir votre profil** : Ajoutez vos compétences, formations et expériences
4. **Voir les offres** : Consultez les offres d'emploi disponibles
5. **Recevoir des recommandations** : Cliquez sur "Trouver mes offres" pour les recommandations IA

## 🔧 Créer un compte administrateur

Pour créer un compte administrateur, vous pouvez :

1. **Via MongoDB directement** : Modifiez le rôle d'un utilisateur en `admin`
2. **Via le code** : Créez un script temporaire pour créer un admin

Exemple de script pour créer un admin :
```javascript
// Créer un fichier createAdmin.mjs
import mongoose from 'mongoose';
import User from './models/User.js';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';

dotenv.config({ path: '.env.local' });

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const hashedPassword = await bcrypt.hash('admin123', 12);
    await User.create({
      email: 'admin@careernetwork.com',
      password: hashedPassword,
      name: 'Admin',
      role: 'admin',
      profile: { skills: [], education: [], experience: [] }
    });
    console.log('✅ Admin créé avec succès !');
    console.log('Email: admin@careernetwork.com');
    console.log('Mot de passe: admin123');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erreur:', error);
    process.exit(1);
  }
}

createAdmin();
```

## 📝 Vérification

✅ L'application démarre sans erreur  
✅ Vous pouvez vous inscrire et vous connecter  
✅ Vous pouvez créer votre profil  
✅ La page des offres d'emploi fonctionne  
✅ La page des recommandations fonctionne  

## 🐛 Problèmes courants

### Erreur : "MONGODB_URI is not defined"
➡️ Vérifiez que le fichier `.env.local` existe et contient `MONGODB_URI`

### Erreur : "NEXTAUTH_SECRET is missing"
➡️ Vérifiez que `NEXTAUTH_SECRET` est défini dans `.env.local`

### Erreur de connexion MongoDB
➡️ Vérifiez que MongoDB est démarré ou que votre URI MongoDB Atlas est correcte

### Port 3000 déjà utilisé
➡️ Changez le port dans `package.json` ou arrêtez le processus utilisant le port 3000

## 📚 Commandes utiles

```bash
npm run dev      # Démarre le serveur de développement
npm run build    # Build pour la production
npm start        # Démarre le serveur de production
npm run lint     # Vérifie le code avec ESLint
```


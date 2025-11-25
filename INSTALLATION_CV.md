# Installation - Système de CV PDF Multi-étapes

## Dépendances à installer

Pour utiliser le nouveau système de formulaire multi-étapes et de génération de CV PDF, vous devez installer les dépendances suivantes :

```bash
npm install jspdf
```

**Note:** `jspdf-autotable` n'est pas nécessaire pour cette implémentation, mais vous pouvez l'ajouter si vous souhaitez des tableaux plus avancés dans le PDF.

## Fonctionnalités

### Formulaire Multi-étapes

Le nouveau formulaire `MultiStepCVForm` remplace l'ancien `ProfileForm` et permet de remplir le profil en 6 étapes :

1. **Informations personnelles** : Nom, email, téléphone, adresse, photo, résumé
2. **Compétences** : Liste de compétences techniques et professionnelles
3. **Éducation** : Diplômes, écoles, années, domaines d'étude
4. **Expérience professionnelle** : Postes, entreprises, dates, descriptions
5. **Langues** : Langues parlées avec niveaux
6. **Certifications & Projets** : Certifications obtenues et projets réalisés

### Génération de CV PDF

Une fois toutes les étapes complétées, l'utilisateur peut générer un CV PDF standardisé qui inclut toutes les informations saisies. Le PDF est généré côté client pour de meilleures performances.

## Structure des données

Le modèle `User` a été mis à jour pour inclure tous les nouveaux champs :

- Informations personnelles complètes (téléphone, adresse, ville, pays, code postal, photo, résumé)
- Langues avec niveaux
- Certifications avec dates
- Projets avec technologies et URLs

## Utilisation

1. L'utilisateur accède à la page `/profile`
2. Il remplit le formulaire étape par étape
3. Il peut enregistrer à tout moment pour sauvegarder ses données
4. À la dernière étape, il peut générer son CV PDF

## API Endpoints

### PUT `/api/profile`
Met à jour le profil utilisateur avec toutes les nouvelles données.

### POST `/api/profile/generate-pdf`
Récupère les données du profil pour la génération PDF (génération côté client).

## Notes techniques

- La génération PDF utilise `jsPDF` côté client pour éviter les problèmes de SSR
- Le PDF est téléchargé automatiquement après génération
- Le format est standardisé pour faciliter l'extraction de données
- Toutes les données sont sauvegardées dans MongoDB




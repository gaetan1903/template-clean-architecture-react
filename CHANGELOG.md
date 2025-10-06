# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [1.0.0] - 2025-10-06

### ✨ Ajouté

#### Architecture
- Architecture Clean Architecture complète avec 3 couches (Domain, Data, Presentation)
- Séparation stricte des responsabilités
- Pattern Either Monad pour la gestion d'erreurs
- Dependency Injection via constructeurs

#### Configuration
- Configuration Vite + React 18 + TypeScript 5
- Configuration Redux Toolkit 2
- Configuration Material-UI v6
- Configuration React Router v6
- Path aliases (@, @core, @features)
- Support SASS/SCSS

#### Core Services
- AxiosService : Singleton pour les appels HTTP avec intercepteurs
- LocalStorageService : Singleton pour la gestion du localStorage
- AppError : Classe d'erreur personnalisée
- PaginatedArray : Type générique pour la pagination

#### Feature Users (Exemple complet)
- **Domain Layer**
  - UserEntity : Entité métier avec getter fullName
  - IUsersRepository : Interface du repository
  - IUsersUseCase : Interface du use case
  - UsersUseCase : Logique métier avec validation (email, champs requis)

- **Data Layer**
  - UserModel : DTO avec fromJson/toJson
  - UsersDataSource : Appels API (CRUD complet)
  - UsersRepository : Implémentation du repository avec gestion token

- **Presentation Layer**
  - HomePage : Page d'accueil avec présentation du template
  - UsersPage : Page liste avec recherche et pagination
  - usersSlice : Redux slice avec état complet
  - usersProvider : 5 AsyncThunks (getUsers, getUserById, create, update, delete)

#### Documentation
- README.md : Documentation complète (structure, usage, patterns)
- .github/copilot-instructions.md : Guide de 1400+ lignes
  - Architecture expliquée en détail
  - Guide d'ajout de fonctionnalités (10 étapes)
  - Guide de modification
  - Conventions de code
  - Exemples pratiques complets
  - Checklist et debugging
- DEPLOYMENT.md : Guide de déploiement sur GitHub
- QUICKSTART.md : Guide de démarrage rapide
- TEMPLATE_CONTENT.md : Description du contenu du template
- CONTRIBUTING.md : Guide de contribution
- LICENSE : Licence MIT

#### Fichiers de configuration
- package.json : Dépendances et scripts
- tsconfig.json : Configuration TypeScript stricte
- vite.config.ts : Configuration Vite avec aliases
- .env.example : Variables d'environnement exemple
- .gitignore : Fichiers à ignorer

### 🎨 Style et UI
- Theme Material-UI personnalisable
- CssBaseline pour la cohérence
- Styles SCSS globaux
- Composants Material-UI (Container, Typography, Button, Card, etc.)

### 🔧 Outils de développement
- ESLint configuration
- Scripts npm (dev, build, preview, lint)
- Hot Module Replacement (HMR)

### 📚 Patterns et bonnes pratiques
- Either monad pour gestion d'erreurs
- Singleton pattern pour services
- Repository pattern
- UseCase pattern
- Provider pattern (Redux)
- Types stricts TypeScript
- Naming conventions cohérentes

---

## [Unreleased]

### 🚀 Prévu
- Tests unitaires avec Vitest
- Tests d'intégration
- Storybook pour les composants
- CI/CD avec GitHub Actions
- Docker configuration
- API mocking avec MSW

---

**Note**: Les versions suivent le format MAJOR.MINOR.PATCH
- MAJOR : Changements incompatibles avec les versions précédentes
- MINOR : Ajout de fonctionnalités rétro-compatibles
- PATCH : Corrections de bugs rétro-compatibles

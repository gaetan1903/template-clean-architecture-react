# Changelog

Toutes les modifications notables de ce projet seront documentées dans ce fichier.

Le format est basé sur [Keep a Changelog](https://keepachangelog.com/fr/1.0.0/),
et ce projet adhère au [Semantic Versioning](https://semver.org/lang/fr/).

## [2.0.0] - 2026-05-08

### Ajoute

#### Tests
- Integration de **Vitest 4** + `@vitest/coverage-v8` + `@testing-library/react` + `jsdom`
- `src/test/setup.ts` : fichier de setup global avec `@testing-library/jest-dom`
- `UsersUseCase.test.ts` : 19 tests couvrant toutes les validations metier (getUsers, getUserById, createUser, updateUser, deleteUser)
- `UsersRepository.test.ts` : 11 tests couvrant le pattern try/catch -> Either avec mock du DataSource
- Scripts : `bun test` (watch), `bun run test:run` (run once), `bun run test:coverage` (rapport lcov)
- Coverage configure sur `domain/` et `data/` uniquement (couches testables sans UI)

#### Docker
- `Dockerfile` : build multi-stage (`node:22-alpine` + Bun pour le build, `nginx:1.27-alpine` pour le runtime)
- `nginx/default.conf` : gzip, cache immutable sur `/assets/`, SPA fallback sur `index.html`
- `.dockerignore` : exclusion de `node_modules`, `dist`, `.env`, `.git`

#### Documentation IA
- `AGENTS.md` a la racine : reconnu par VS Code Copilot, Claude et OpenAI Codex — pointe vers `copilot-instructions.md`

### Modifie

#### Runtime / Package Manager
- Migration de **npm** vers **Bun** comme package manager et runtime
- Ajout de `packageManager: "bun@1.3.12"` dans `package.json`
- Scripts npm migres vers Bun (`bun dev`, `bun run build`, `bun preview`)
- Ajout de `.npmrc` avec `engine-strict=true`
- `bun.lock` genere (remplace `package-lock.json`)

#### Stack UI
- Migration de Material-UI (MUI) v6 vers **HeroUI v3**
- Migration de SASS/SCSS vers **Tailwind CSS v4** (via `@tailwindcss/vite`)
- Suppression de `@emotion/react`, `@emotion/styled`, `sass`
- Ajout de `framer-motion` (peer dependency HeroUI)

#### Framework
- Migration de **React 18** vers **React 19**
- Suppression de `HeroUIProvider` (non requis en HeroUI v3)

#### TypeScript
- Suppression de `baseUrl` dans `tsconfig.json` (deprecated en TypeScript 7)
- Les `paths` utilisent desormais des chemins relatifs (`"./src/*"`)

#### Pages et composants
- `LoginPage` : migrate vers `Card`, `CardHeader`, `CardContent`, `InputGroup`, `Button`, `Spinner`
- `HomePage` : migrate vers `Button`, `Chip`
- `UsersPage` : migrate vers `Card`, `CardContent`, `InputGroup`, `Button`, `Chip`, `Pagination` (compound), `Spinner`
- `ErrorBoundary` : migrate vers `Button` HeroUI
- `NotFoundPage` : migrate vers `Button` HeroUI

#### Configuration
- `vite.config.ts` : ajout du plugin `@tailwindcss/vite` + configuration du test runner Vitest (jsdom, setupFiles, coverage)
- `index.scss` renomme en `index.css`, contenu remplace par `@import "tailwindcss"` et `@import "@heroui/styles/dist/index.css"`
- `copilot-instructions.md` : mise a jour stack technique (React 19, HeroUI v3, Tailwind CSS v4, Bun), renommage template generique (suppression "Tambatra"), version 6.1

### Corrige

#### Bug UseCase
- `UsersUseCase.getUsers` : la condition `filters.page && filters.page < 1` ne rejetait pas `page: 0` (0 est falsy en JS) — corrige en `filters.page !== undefined && filters.page < 1`

---

## [1.0.0] - 2025-10-06

### Ajoute

#### Architecture
- Architecture Clean Architecture complete avec 3 couches (Domain, Data, Presentation)
- Separation stricte des responsabilites
- Pattern Either Monad pour la gestion d'erreurs
- Dependency Injection via constructeurs

#### Configuration
- Configuration Vite + React 18 + TypeScript 5
- Configuration Zustand 5
- Configuration Material-UI v6
- Configuration React Router v6
- Path aliases (@, @core, @features)
- Support SASS/SCSS

#### Core Services
- AxiosService : Singleton pour les appels HTTP avec intercepteurs
- TokenService : Singleton pour la gestion du localStorage (JWT)
- AppError : Classe d'erreur personnalisee
- PaginatedArray : Type generique pour la pagination

#### Feature Users (Exemple complet)
- **Domain Layer**
  - UserEntity : Interface entite metier + fonctions utilitaires
  - IUsersRepository : Interface du repository
  - IUsersUseCase : Interface du use case
  - UsersUseCase : Logique metier avec validation (email, champs requis)

- **Data Layer**
  - UserModel : DTO avec schema Zod, fromJson/toJson
  - UsersDataSource : Appels API CRUD complet
  - UsersRepository : Implementation avec try/catch -> Either

- **Presentation Layer**
  - HomePage : Page d'accueil avec presentation du template
  - UsersPage : Page liste avec recherche et pagination
  - usersStore : Zustand store avec CRUD complet

#### Documentation
- README.md : Documentation complete (structure, usage, patterns)
- .github/copilot-instructions.md : Guide detaille architecture + conventions
- CONTRIBUTING.md : Guide de contribution
- LICENSE : Licence MIT

#### Fichiers de configuration
- package.json : Dependances et scripts
- tsconfig.json : Configuration TypeScript stricte
- vite.config.ts : Configuration Vite avec aliases
- .env.example : Variables d'environnement exemple
- .gitignore : Fichiers a ignorer

---

## [Unreleased]

### Prevu
- Tests d'integration (MSW pour le mock API)
- Storybook pour les composants HeroUI custom
- Variables d'environnement typees avec Zod au demarrage
- Internationalisation (react-i18next)
- Pre-commit hooks (husky + lint-staged)

---

**Note** : Les versions suivent le format MAJOR.MINOR.PATCH
- MAJOR : Changements incompatibles avec les versions precedentes
- MINOR : Ajout de fonctionnalites retro-compatibles
- PATCH : Corrections de bugs retro-compatibles


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

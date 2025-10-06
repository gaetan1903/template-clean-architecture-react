# 🏗️ Clean Architecture React TypeScript Template

Un template complet basé sur les principes de **Clean Architecture** pour créer des applications React + TypeScript robustes, maintenables et scalables.

## 🌟 Caractéristiques

- ⚛️ **React 18** avec TypeScript
- ⚡ **Vite** pour un build ultra-rapide
- 🎨 **Material-UI v6** pour l'interface utilisateur
- 🔄 **Redux Toolkit** pour la gestion d'état
- 🧭 **React Router v6** pour le routing
- 🌐 **Axios** pour les appels HTTP
- ✅ **Either Monad** (@sweet-monads/either) pour la gestion d'erreurs
- 💅 **SASS/SCSS** pour le styling
- 🏛️ **Clean Architecture** avec séparation stricte des couches

## 📁 Structure du projet

```
src/
├── core/                    # Configuration globale et services partagés
│   ├── services/           # Services globaux (axios, localStorage)
│   ├── types/              # Types TypeScript partagés
│   ├── guards/             # Guards de routing (PrivateRoute)
│   ├── contexts/           # Contexts React
│   └── components/         # Composants réutilisables
│
└── features/               # Features organisées par domaine métier
    └── users/              # Exemple de feature complète
        ├── data/
        │   ├── datasources/    # Appels API
        │   ├── DTO/           # Mapping API ↔ Entity
        │   └── repositories/  # Implémentation des repositories
        ├── domain/
        │   ├── entities/      # Entités métier
        │   ├── repositories/  # Interfaces des repositories
        │   └── usecases/      # Logique métier
        └── presentation/
            ├── components/    # Composants React
            ├── pages/         # Pages
            └── redux/         # Redux (slices, providers)
```

## 🚀 Démarrage rapide

### 1. Utiliser ce template

Cliquez sur le bouton **"Use this template"** sur GitHub ou clonez le repository :

```bash
git clone https://github.com/gaetan1903/template-clean-architecture-react.git mon-projet
cd mon-projet
```

### 2. Installer les dépendances

```bash
npm install
```

### 3. Configurer les variables d'environnement

Créez un fichier `.env` à la racine du projet :

```env
VITE_API_BASE_URL=http://localhost:3000
VITE_APP_NAME=Mon Application
```

### 4. Lancer le serveur de développement

```bash
npm run dev
```

L'application sera accessible sur `http://localhost:5173`

## 📚 Architecture Clean Architecture

Ce template implémente la **Clean Architecture** avec 3 couches distinctes :

### 1. **Domain Layer** (Couche Domaine)
- **Rôle**: Logique métier pure, indépendante de tout framework
- **Contient**: Entités, interfaces de repositories, use cases
- **Règle**: Aucune dépendance externe (ni React, ni Axios, etc.)

### 2. **Data Layer** (Couche Données)
- **Rôle**: Implémentation de l'accès aux données
- **Contient**: DataSources (API), DTO (mapping), implémentation des repositories
- **Règle**: Implémente les interfaces définies dans le domain

### 3. **Presentation Layer** (Couche Présentation)
- **Rôle**: Interface utilisateur et interactions
- **Contient**: Composants React, pages, Redux (slices, providers)
- **Règle**: Utilise les use cases pour interagir avec le métier

## 🛠️ Guide d'utilisation

### Créer une nouvelle feature

1. **Créez la structure de dossiers** :
```bash
src/features/ma-feature/
├── data/
│   ├── datasources/
│   ├── DTO/
│   └── repositories/
├── domain/
│   ├── entities/
│   ├── repositories/
│   └── usecases/
└── presentation/
    ├── components/
    ├── pages/
    └── redux/
```

2. **Suivez le guide étape par étape** dans `.github/copilot-instructions.md`

### Exemple : Feature "Users"

Le template inclut une feature complète `users` comme exemple :

- ✅ Entity : `UserEntity`
- ✅ DTO : `UserModel` avec mapping API ↔ Entity
- ✅ Repository : Interface + Implémentation
- ✅ DataSource : Appels API avec Axios
- ✅ UseCase : Logique métier
- ✅ Redux : Slice + Provider
- ✅ Component : Exemple d'utilisation

## 📖 Documentation

### Instructions GitHub Copilot

Le fichier `.github/copilot-instructions.md` contient :
- 📋 Guide complet d'ajout de fonctionnalités (10 étapes)
- 🔄 Guide de modification de fonctionnalités
- 📜 Conventions de code
- 🎓 Exemples pratiques
- 🚀 Checklist complète

### Patterns et bonnes pratiques

#### Gestion d'erreurs avec Either

```typescript
// Dans le UseCase
async getUser(id: string): Promise<Either<AppError, UserEntity>> {
    try {
        const result = await this.repository.getUserById(id);
        return right(result);
    } catch (error) {
        return left(new AppError("Erreur", "000", error));
    }
}

// Dans le Provider Redux
export const getUserProvider = createAsyncThunk(
    'users/getUser',
    async (id: string, { rejectWithValue }) => {
        const result = await useCase.getUser(id);
        return result.mapRight(data => data)
            .mapLeft(error => rejectWithValue(error.message))
            .value;
    }
);
```

#### Gestion des tokens

```typescript
// Toujours utiliser LocalStorageService
const token = this.localStorageService.getAccessToken();
if (!token) {
    return left(new AppError("Session expirée", "401", "expired"));
}
```

#### Redux State Pattern

```typescript
interface FeatureState {
    loading: boolean;
    error: string | null;
    success: string | null;
    items: EntityType[] | null;
}
```

## 🧪 Scripts disponibles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Preview du build
npm run preview

# Linting
npm run lint
```

## 📦 Dépendances principales

| Package | Version | Description |
|---------|---------|-------------|
| react | ^18.2.0 | Framework UI |
| typescript | ^5.2.2 | TypeScript |
| vite | ^5.4.10 | Build tool |
| @reduxjs/toolkit | ^2.2.7 | State management |
| @mui/material | ^6.1.6 | UI components |
| axios | ^1.7.9 | HTTP client |
| @sweet-monads/either | ^3.3.1 | Either monad |
| react-router-dom | ^6.22.2 | Routing |

## 🎯 Cas d'usage

Ce template est parfait pour :

- ✅ Applications d'entreprise
- ✅ Dashboards complexes
- ✅ Applications CRUD
- ✅ SaaS platforms
- ✅ Projets nécessitant une architecture solide et maintenable

## 🤝 Contribution

Les contributions sont les bienvenues ! N'hésitez pas à :

1. Fork le projet
2. Créer une branche (`git checkout -b feature/amazing-feature`)
3. Commit vos changements (`git commit -m 'Add amazing feature'`)
4. Push vers la branche (`git push origin feature/amazing-feature`)
5. Ouvrir une Pull Request

## 📄 License

MIT License - voir le fichier [LICENSE](LICENSE) pour plus de détails.

---

**Créé avec ❤️ pour la communauté des développeurs**

**Besoin d'aide ?** Consultez la [documentation complète](.github/copilot-instructions.md)

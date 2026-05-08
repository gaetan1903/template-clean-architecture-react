# Clean Architecture React TypeScript Template

Template React 19 + TypeScript base sur les principes de **Clean Architecture** pour creer des applications robustes, maintenables et scalables.

## Stack technique

| Categorie | Technologie |
|-----------|-------------|
| Framework | React 19 + TypeScript 7 |
| Runtime / Package Manager | **Bun** |
| Build | Vite 7 |
| State | Zustand 5 avec middleware `devtools` |
| UI | HeroUI v3 |
| Routing | React Router DOM v6 |
| HTTP | Axios (singleton + interceptors auto-token) |
| Erreurs | `@sweet-monads/either` (Either monad) |
| Validation | Zod 4 |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite`) |

## Structure du projet

```
src/
+-- core/
|   +-- services/           # authService, tokenService, axiosService, axiosInterceptor
|   +-- store/              # Stores Zustand globaux (authStore)
|   +-- types/              # Types partages (AuthTypes, AppError, PaginatedArray)
|   +-- hooks/              # Hooks reutilisables (useAuth)
|   +-- utils/              # Utilitaires partages (validators)
|   +-- components/         # PrivateRoute, ErrorBoundary, NotFoundPage
|
+-- features/
    +-- auth/               # Authentification (LoginPage)
    +-- users/              # Feature exemple -- 3 couches Clean Architecture
        +-- data/
        |   +-- datasources/    # Appels HTTP (Axios, pas de token manuel)
        |   +-- DTO/            # Mapping API <-> Entity + validation Zod
        |   +-- repositories/   # Implementation des contrats domain -> Either
        +-- domain/
        |   +-- entities/       # Interfaces entites metier
        |   +-- repositories/   # Interfaces (contrats)
        |   +-- types/          # Types params (filters, create, update)
        |   +-- usecases/       # Logique metier + validation
        +-- presentation/
            +-- pages/          # Pages React
            +-- store/          # Zustand store de la feature
```

## Demarrage rapide

```bash
# Cloner
git clone https://github.com/gaetan1903/template-clean-architecture-react.git mon-projet
cd mon-projet

# Installer (Bun requis)
bun install

# Configurer (copier et adapter)
cp .env.example .env

# Lancer
bun dev
```

L'application sera accessible sur `http://localhost:5173`

## Architecture -- 3 couches par feature

### Domain Layer
Logique metier pure, aucune dependance externe. Contient les entites (interfaces), interfaces de repositories, types et use cases.

### Data Layer
Acces aux donnees. Contient les DataSources (appels HTTP via Axios), les DTOs (mapping + validation Zod), et l'implementation des repositories qui convertissent les exceptions en `Either<AppError, T>`.

### Presentation Layer
Interface utilisateur. Contient les composants React, les pages, et un Zustand store par feature qui appelle les use cases.

**Flux de donnees** : `Composant -> Store Zustand -> UseCase -> Repository -> DataSource -> API`

## Authentification

Le template inclut un systeme d'authentification complet :

- **AuthService** (singleton) : login, logout, refresh token, validation
- **TokenService** : stockage/lecture/validation JWT via localStorage
- **AxiosInterceptor** : injection automatique du Bearer token, retry 401, refresh queue
- **authStore** (Zustand) : state global d'authentification
- **useAuth** (hook) : wrapper ergonomique retournant des `Either`
- **PrivateRoute** : guard de routes avec redirection vers `/login`
- **ErrorBoundary** : capture des erreurs React runtime

```typescript
const { isAuthenticated, user, login, logout, isLoading } = useAuth();

const handleLogin = async () => {
    const result = await login(email, password);
    if (result.isRight()) {
        navigate('/dashboard');
    } else {
        setError(result.value.message);
    }
};
```

## Gestion d'erreurs -- Either monad

Les erreurs sont gerees avec `@sweet-monads/either` a travers toutes les couches :

| Couche | Pattern |
|--------|---------|
| DataSource | `throw new AppError(...)` |
| Repository | `try/catch` -> `right()` / `left()` |
| UseCase | Validation metier -> `left()`, sinon delegue au repository |
| Store Zustand | `if (result.isLeft()) set({ error: result.value.message })` |

## Validation des donnees -- Zod

Chaque DTO valide les donnees API avec un schema Zod. Les erreurs de validation sont converties en `AppError` avec le code `VALIDATION_ERROR` et les details Zod accessibles via `error.details.zodErrors`.

## UI -- HeroUI v3 + Tailwind CSS v4

Le template utilise **HeroUI v3** comme bibliotheque de composants et **Tailwind CSS v4** pour le styling.

Composants HeroUI utilises : `Button`, `Card`, `CardHeader`, `CardContent`, `InputGroup`, `Chip`, `Pagination`, `Spinner`.

Variantes de Button : `primary`, `secondary`, `outline`, `ghost`, `danger`.

Configuration Tailwind automatique via le plugin Vite `@tailwindcss/vite` -- aucun fichier `tailwind.config.js` requis.

## Creer une nouvelle feature

Suivez le guide detaille dans [.github/copilot-instructions.md](.github/copilot-instructions.md) qui couvre les 8 etapes :

1. **Entity** -- interface + fonctions utilitaires
2. **DTO** -- schema Zod + `fromJson`/`toJson`
3. **Repository interface** -- contrat domain
4. **DataSource** -- appels HTTP
5. **Repository** -- implementation avec `Either`
6. **UseCase** -- logique metier
7. **Zustand Store** -- state management
8. **Composant React** -- UI

## Scripts

```bash
bun dev           # Serveur de developpement
bun run build     # Build de production (tsc + vite)
bun preview       # Preview du build
bun lint          # Linting ESLint
```

## Contribution

1. Fork le projet
2. Creer une branche (`git checkout -b feature/ma-feature`)
3. Commit (`git commit -m 'Add ma feature'`)
4. Push (`git push origin feature/ma-feature`)
5. Ouvrir une Pull Request

## License

MIT -- voir [LICENSE](LICENSE)

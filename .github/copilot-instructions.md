# Instructions Copilot - Clean Architecture React Template

> **REGLES ABSOLUES :**
> 1. **JAMAIS** de token en parametre de DataSource/Repository -- l'AxiosInterceptor gere automatiquement le Bearer token
> 2. **TOUJOURS** utiliser `Either<AppError, T>` pour les retours d'erreur (sauf dans les DataSources qui throw)
> 3. **TOUJOURS** valider les donnees API avec Zod dans les DTOs
> 4. **JAMAIS** de court-circuit dans les dependances : `Component -> Store -> UseCase -> Repository -> DataSource -> API`
> 5. **TOUJOURS** utiliser Zustand pour le state management
> 6. **JAMAIS** acceder directement a `localStorage` -- utiliser `TokenService` ou `AuthService`
> 7. **JAMAIS** d'emojis dans les messages utilisateur, les logs, ni les commentaires de code

---

## Vue d'ensemble

**Clean Architecture React Template** -- React 19 + TypeScript, Vite, Clean Architecture.

### Stack technique
| Categorie | Technologie |
|-----------|-------------|
| Framework | React 19 + TypeScript |
| Build | Vite |
| State | **Zustand** avec middleware `devtools` |
| UI | **HeroUI v3** |
| Routing | React Router DOM v6 |
| HTTP | Axios (singleton + interceptors auto-token) |
| Erreurs | `@sweet-monads/either` (Either monad) |
| Validation | Zod |
| Styling | **Tailwind CSS v4** (via `@tailwindcss/vite`) |

### Structure du projet
```
src/
+-- core/                    # Configuration globale et services partages
|   +-- services/           # authService, tokenService, axiosService, axiosInterceptor
|   +-- store/              # Stores Zustand globaux (authStore)
|   +-- types/              # Types partages (AuthTypes, AppError, PaginatedArray)
|   +-- hooks/              # Hooks reutilisables (useAuth)
|   +-- utils/              # Utilitaires partages (validators)
|   +-- components/         # PrivateRoute, ErrorBoundary, NotFoundPage
|
+-- features/               # Features organisees par domaine metier
    +-- auth/               # Authentification (LoginPage)
    +-- [feature-name]/     # Chaque feature = 3 couches (data/domain/presentation)
```

---

## Architecture Clean Architecture -- 3 couches par feature

### 1. Domain Layer (logique metier pure)
```
domain/
+-- entities/          # Entites metier (interfaces + fonctions utilitaires)
+-- repositories/      # Interfaces (contrats) -- prefixe I
+-- types/             # Types specifiques au domaine
+-- usecases/          # Logique metier + validation
```
**Regles** : Aucune dependance externe (pas d'axios, react, zustand). Logique metier pure + Either monad. Entites = interfaces (pas de classes, compatibles Zustand).

### 2. Data Layer (acces aux donnees)
```
data/
+-- datasources/       # Appels HTTP (pas de token en parametre !)
+-- DTO/               # Mapping API <-> Entity + validation Zod
+-- repositories/      # Implementation des contrats domain, try/catch -> Either
```
**Regles** : Axios sans token manuel (interceptor auto). Zod dans chaque DTO. Repository = try/catch -> `right()`/`left()`.

### 3. Presentation Layer (UI)
```
presentation/
+-- components/        # Composants React specifiques
+-- pages/             # Pages principales
+-- store/             # Zustand store de la feature
+-- utils/             # Utilitaires de presentation
```
**Regles** : Zustand store unique par feature. Appelle les UseCases via le store. Pas de logique metier dans cette couche.

---

## Structure complete d'une feature

```
features/[feature-name]/
+-- data/
|   +-- datasources/[Feature]DataSource.ts       # Interface + Implementation HTTP
|   +-- DTO/[Entity]Model.ts                     # Zod schema + fromJson/toJson
|   +-- repositories/[Feature]Repository.ts      # Implementation -> Either
+-- domain/
|   +-- entities/[Entity].ts                     # Interface entite + fonctions utilitaires
|   +-- repositories/I[Feature]Repository.ts     # Interface contrat
|   +-- types/[Feature]DomainTypes.ts            # Types params (filters, create, update)
|   +-- usecases/
|       +-- I[Feature]UseCase.ts                 # Interface UseCase
|       +-- [Feature]UseCase.ts                  # Implementation + validation metier
+-- presentation/
    +-- components/[ComponentName]/[ComponentName].tsx
    +-- pages/[PageName]/[PageName].tsx
    +-- store/[feature]Store.ts                  # Zustand store (1 seul fichier)
```

---

## Patterns par couche -- Exemples de reference

> Les exemples ci-dessous sont alignes sur le code reel du projet (feature `users`).
> Adapter les noms d'entites et champs pour chaque nouvelle feature.

### Entite (Domain) -- Interface obligatoire

**Fichier** : `domain/entities/[Entity].ts`

```typescript
export interface UserEntity {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string | null;       // Nullable avec | null
    role: string;
    createdAt: Date;
    updatedAt: Date;
}

// Fonctions utilitaires (pas de methodes sur l'interface)
export const getFullName = (user: UserEntity): string => {
    return `${user.firstName} ${user.lastName}`;
};
```

> **Interfaces obligatoires** -- Les classes perdent leurs getters/methodes apres serialisation Zustand. Utiliser des interfaces + fonctions utilitaires.

### DTO avec validation Zod (Data)

**Fichier** : `data/DTO/[Entity]Model.ts`

```typescript
import { z } from 'zod';
import { UserEntity } from '../../domain/entities/UserEntity';
import { AppError } from '../../../../core/types/AppError';

// Schema Zod -- messages d'erreur personnalises
const UserApiSchema = z.object({
    id: z.string().uuid("ID doit etre un UUID valide"),
    first_name: z.string().min(1, "Le prenom est requis"),
    last_name: z.string().min(1, "Le nom est requis"),
    email: z.string().email("Format d'email invalide"),
    phone: z.string().nullable().optional(),
    role: z.enum(['ADMIN', 'USER', 'MODERATOR']),
    created_at: z.string().datetime("Date de creation invalide"),
    updated_at: z.string().datetime("Date de mise a jour invalide"),
});

// Schema creation -- deriver via omit + extend, ne pas dupliquer les champs
const CreateUserApiSchema = UserApiSchema
    .omit({ id: true, created_at: true, updated_at: true })
    .extend({ password: z.string().min(6, "Mot de passe minimum 6 caracteres") });

export type UserApiType = z.infer<typeof UserApiSchema>;
export type CreateUserApiType = z.infer<typeof CreateUserApiSchema>;

export class UserModel {
    // Retourner un objet litteral -- compatible Zustand
    static fromJson(json: unknown): UserEntity {
        try {
            const data = UserApiSchema.parse(json);
            return {
                id: data.id,
                firstName: data.first_name,       // snake_case API -> camelCase Entity
                lastName: data.last_name,
                email: data.email,
                phone: data.phone ?? null,
                role: data.role,
                createdAt: new Date(data.created_at),
                updatedAt: new Date(data.updated_at),
            };
        } catch (error) {
            if (error instanceof z.ZodError) {
                const message = error.issues
                    .map((err: z.ZodIssue) => `${err.path.join('.')}: ${err.message}`)
                    .join(', ');
                throw new AppError(`Donnees invalides: ${message}`, "VALIDATION_ERROR",
                    { zodErrors: error.issues, receivedData: json });
            }
            throw error;
        }
    }

    // toJson valide le format de sortie avec Zod
    static toJson(entity: UserEntity): UserApiType {
        return UserApiSchema.parse({
            id: entity.id,
            first_name: entity.firstName,
            last_name: entity.lastName,
            email: entity.email,
            phone: entity.phone,
            role: entity.role,
            created_at: entity.createdAt.toISOString(),
            updated_at: entity.updatedAt.toISOString(),
        });
    }

    static validateCreateData(data: unknown): CreateUserApiType {
        // Meme pattern try/catch -> AppError pour chaque methode de validation
        return CreateUserApiSchema.parse(data);
    }

    static validateUpdateData(data: unknown): Partial<CreateUserApiType> {
        return CreateUserApiSchema.partial().parse(data);
    }
}
```

### Domain Types

**Fichier** : `domain/types/[Feature]DomainTypes.ts`

```typescript
export interface GetUsersFiltersParams {
    page?: number;
    search?: string;
    status?: string;
    role?: string;
}

export interface CreateUserDataParams {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role?: string;
    phoneNumber?: string;
    status?: string;
}

export interface UpdateUserDataParams {
    firstName?: string;
    lastName?: string;
    email?: string;
    password?: string;
    role?: string;
    phoneNumber?: string;
    status?: string;
}

export interface GetUserByIdParams { id: string; }
export interface DeleteUserParams { id: string; }
```

### Interface Repository (Domain)

**Fichier** : `domain/repositories/I[Feature]Repository.ts`

```typescript
export interface IUsersRepository {
    getUsers(filters: GetUsersFiltersParams): Promise<Either<AppError, PaginatedArray<UserEntity>>>;
    getUserById(params: GetUserByIdParams): Promise<Either<AppError, UserEntity>>;
    createUser(data: CreateUserDataParams): Promise<Either<AppError, boolean>>;
    updateUser(id: string, data: UpdateUserDataParams): Promise<Either<AppError, boolean>>;
    deleteUser(params: DeleteUserParams): Promise<Either<AppError, boolean>>;
}
```

### DataSource (Data) -- PAS de token en parametre

**Fichier** : `data/datasources/[Feature]DataSource.ts`

```typescript
export interface IUsersDataSource {
    getUsers(filters: GetUsersFiltersParams): Promise<PaginatedArray<UserEntity>>;
    getUserById(params: GetUserByIdParams): Promise<UserEntity>;
    createUser(data: CreateUserDataParams): Promise<boolean>;
    updateUser(id: string, data: UpdateUserDataParams): Promise<boolean>;
    deleteUser(params: DeleteUserParams): Promise<boolean>;
}

export class UsersDataSource implements IUsersDataSource {
    private axiosService = AxiosService.getInstance();

    async getUsers(filters: GetUsersFiltersParams): Promise<PaginatedArray<UserEntity>> {
        const endpoint = '/api/users'
            + `?page=${filters.page || 1}`
            + (filters.search ? `&search=${encodeURIComponent(filters.search)}` : '')
            + (filters.status ? `&status=${encodeURIComponent(filters.status)}` : '')
            + (filters.role ? `&role=${encodeURIComponent(filters.role)}` : '');

        try {
            const response = await this.axiosService.get(endpoint);  // Pas de headers manuels !
            if (!response.data) throw new AppError('Empty response', "001", 'data is empty');

            return new PaginatedArray(
                response.data.data.map((item: any) => UserModel.fromJson(item)),
                response.data.meta.totalPages,
                response.data.meta.currentPage,
                response.data.meta.totalItems
            );
        } catch (error) {
            if (error instanceof AppError) throw error;
            let _error = error as any;
            if (_error?.name === 'AxiosError') {
                throw new AppError(_error.response?.data?.message || 'Erreur API', "001", _error.response?.data);
            }
            throw new AppError('Error', "000", error);
        }
    }
    // Meme pattern try/catch pour toutes les methodes CRUD
}
```

### Repository (Data) -- try/catch -> Either

**Fichier** : `data/repositories/[Feature]Repository.ts`

```typescript
export class UsersRepository implements IUsersRepository {
    constructor(private dataSource: IUsersDataSource) {}

    async getUsers(filters: GetUsersFiltersParams): Promise<Either<AppError, PaginatedArray<UserEntity>>> {
        try {
            return right(await this.dataSource.getUsers(filters));
        } catch (error) {
            if (error instanceof AppError) return left(error);
            return left(new AppError("Une erreur s'est produite", "000", error));
        }
    }
    // Meme pattern pour toutes les methodes :
    // try { return right(await this.dataSource.xxx()); }
    // catch { return left(error instanceof AppError ? error : new AppError(...)); }
}
```

### UseCase (Domain) -- validation metier + delegation

**Fichier** : `domain/usecases/[Feature]UseCase.ts`

```typescript
import { isValidEmail } from '../../../../core/utils/validators';

export class UsersUseCase implements IUsersUseCase {
    constructor(private repository: IUsersRepository) {}

    async getUsers(filters: GetUsersFiltersParams): Promise<Either<AppError, PaginatedArray<UserEntity>>> {
        if (filters.page && filters.page < 1) {
            return left(new AppError("Page invalide", "400", "validation"));
        }
        if (filters.status && !['ACTIVE', 'INACTIVE', 'SUSPENDED'].includes(filters.status)) {
            return left(new AppError("Statut de filtre invalide", "400", "validation"));
        }
        return await this.repository.getUsers(filters);
    }

    async createUser(data: CreateUserDataParams): Promise<Either<AppError, boolean>> {
        // Validations metier detaillees
        if (!data.firstName || !data.lastName) {
            return left(new AppError("Nom et prenom requis", "400", "validation"));
        }
        if (!data.email || !isValidEmail(data.email)) {
            return left(new AppError("Email invalide", "400", "validation"));
        }
        if (!data.password || data.password.length < 6) {
            return left(new AppError("Mot de passe doit contenir au moins 6 caracteres", "400", "validation"));
        }
        return await this.repository.createUser(data);
    }
    // Meme pattern pour update, delete, getUserById...
}
```

> Toujours importer `isValidEmail` depuis `core/utils/validators.ts`.

### Zustand Store (Presentation) -- 1 seul fichier par feature

**Fichier** : `presentation/store/[feature]Store.ts`

```typescript
// Chaine de dependances Clean Architecture
const dataSource = new UsersDataSource();
const repository = new UsersRepository(dataSource);
const useCase = new UsersUseCase(repository);

interface UsersState {
    loading: boolean;
    error: string | null;
    success: string | null;
    users: PaginatedArray<UserEntity> | null;
    currentUser: UserEntity | null;

    // CRUD complet
    getUsers: (filters: GetUsersFiltersParams) => Promise<void>;
    getUserById: (params: GetUserByIdParams) => Promise<void>;
    createUser: (data: CreateUserDataParams) => Promise<void>;
    updateUser: (id: string, data: UpdateUserDataParams) => Promise<void>;
    deleteUser: (params: DeleteUserParams) => Promise<void>;

    clearSuccess: () => void;
    clearError: () => void;
    clearCurrentUser: () => void;
    resetUsersState: () => void;
}

export const useUsersStore = create<UsersState>()(
    devtools(
        (set) => ({
            ...initialState,

            getUsers: async (filters) => {
                set({ loading: true, error: null }, false, 'users/getUsers/pending');
                const result = await useCase.getUsers(filters);

                if (result.isLeft()) {
                    set({ loading: false, error: result.value.message }, false, 'users/getUsers/rejected');
                } else {
                    set({ loading: false, users: result.value }, false, 'users/getUsers/fulfilled');
                }
            },
            // Meme pattern Either pour toutes les actions CRUD
        }),
        { name: 'UsersStore' }
    )
);
```

### Composant React (Presentation)

```typescript
const UsersPage: React.FC = () => {
    const { users, loading, error, success, getUsers, clearSuccess, clearError } = useUsersStore();
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => { getUsers({ page: currentPage }); }, [currentPage, getUsers]);

    // Auto-clear messages apres 3s
    useEffect(() => { if (success) setTimeout(() => clearSuccess(), 3000); }, [success, clearSuccess]);
    useEffect(() => { if (error) setTimeout(() => clearError(), 3000); }, [error, clearError]);

    if (loading && !users) return <CircularProgress />;

    return (
        <div>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            {users?.data.map(user => (
                <div key={user.id}>{getFullName(user)}</div>
            ))}

            {users && <Pagination count={users.totalPages} page={currentPage}
                onChange={(_, page) => setCurrentPage(page)} />}
        </div>
    );
};
```

---

## Guide de modification

### Modifier une Entite existante
1. Mettre a jour l'interface Entity (`domain/entities/`)
2. Mettre a jour le schema Zod + `fromJson`/`toJson` dans le DTO (`data/DTO/`)
3. Mettre a jour les composants qui affichent la nouvelle propriete

> Le Store Zustand n'a pas besoin de changer si c'est juste un nouveau champ sur l'entite.

### Ajouter une methode (ex: archiveUser)
1. Ajouter dans **l'interface Repository** (`domain/repositories/I[Feature]Repository.ts`)
2. Ajouter dans **le DataSource** -- interface + implementation (`data/datasources/`)
3. Implementer dans **le Repository** avec try/catch -> Either (`data/repositories/`)
4. Ajouter dans **le UseCase** avec validation metier (`domain/usecases/`)
5. Ajouter l'action dans **le Store Zustand** (`presentation/store/`)
6. Appeler depuis **le composant**

### Modifier un endpoint API
Seul le **DataSource** change. Les autres couches restent inchangees.

---

## Conventions de code

### Naming
| Type | Convention | Exemple |
|------|-----------|---------|
| Fichiers entites/DTO | PascalCase | `UserEntity.ts`, `UserModel.ts` |
| Fichiers stores | camelCase | `usersStore.ts` |
| Composants React | PascalCase | `UsersList.tsx` |
| Classes | PascalCase | `UserEntity`, `UsersDataSource` |
| Interfaces | I + PascalCase | `IUsersRepository`, `IUsersDataSource` |
| Zustand hooks | use...Store | `useUsersStore` |
| Variables | camelCase | `currentUser` |
| Constantes | UPPER_SNAKE | `BASE_URL` |

### Ordre des imports
```typescript
// 1. Libs externes
import React, { useEffect } from 'react';
import { Button } from '@mui/material';

// 2. Core (types, services)
import { AppError } from '../../../../core/types/AppError';

// 3. Domain (entites, types)
import { UserEntity } from '../../domain/entities/UserEntity';

// 4. Stores Zustand
import { useUsersStore } from '../../store/usersStore';

// 5. Composants locaux + styles
import { UserCard } from '../UserCard/UserCard';
import './UsersPage.scss';
```

---

## Authentification

### Architecture auth
- **AuthService** (singleton) : login, logout, refreshToken, getValidToken, isAuthenticated, getCurrentUser
- **TokenService** : stockage/lecture/validation JWT via localStorage
- **AxiosInterceptor** : injection automatique du Bearer token + retry 401 avec refresh queue
- **authStore** (Zustand) : state global d'authentification
- **useAuth** (hook) : wrapper ergonomique pour les composants, retourne Either

### Utilisation dans les composants
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

### Routes protegees -- PrivateRoute
`src/core/components/PrivateRoute.tsx` -- Verifie `isAuthenticated` via `authStore`. Redirige vers `/login` avec preservation de l'URL d'origine.

```typescript
<Route path="/users" element={
    <PrivateRoute><UsersPage /></PrivateRoute>
} />
```

### ErrorBoundary
`src/core/components/ErrorBoundary.tsx` -- Capture les erreurs React runtime. Enveloppe le `<Router>` dans `routes.tsx`.

### Pourquoi pas de token dans les DataSources ?
L'**AxiosInterceptor** :
1. Intercepte chaque requete -> ajoute `Authorization: Bearer <token>`
2. Si 401 -> refresh automatique du token
3. Si refresh echoue -> logout + redirection `/login`
4. Les requetes concurrentes sont mises en queue pendant le refresh

---

## Hooks de presentation

Les hooks de presentation encapsulent la logique d'etat locale des composants : formulaires, filtres, pagination, redirections. Ils vivent dans `presentation/hooks/` au sein de chaque feature.

### Quand creer un hook de presentation ?
- L'etat local depasse 2-3 variables liees (`search` + `role` + `status` = un seul hook filtres)
- La logique de transformation / validation locale se repete
- Une sequence d'actions (valider -> appeler store -> rediriger) merite d'etre isolee

### Regles des hooks de presentation
| Regle | Description |
|-------|-------------|
| **Appelle le store** | Les hooks de presentation appellent uniquement les actions Zustand, jamais les UseCases ou Repositories directement |
| **Pas de logique metier** | La validation metier reste dans les UseCases ; les hooks ne font que de la validation UI (champs vides, format affichage) |
| **Etat local uniquement** | L'etat partage entre plusieurs composants va dans le store Zustand, pas dans un hook |
| **Retourne un objet typé** | Toujours typer le retour avec une interface `UseXxxReturn` |
| **Prefixe `use`** | Respecter la convention React pour les hooks |

### Structure type d'un hook de presentation

```
presentation/
+-- hooks/
|   +-- useLoginForm.ts          # Etat formulaire + validation locale + appel store
|   +-- useRedirectAfterAuth.ts  # Logique de redirection post-login
|   +-- useUsersFilters.ts       # Etat des filtres (draft) + applyFilters/resetFilters
|   +-- usePagination.ts         # Page courante + goToPage/goToNext/goToPrevious
```

### Exemple : hook de formulaire

**Fichier** : `presentation/hooks/useLoginForm.ts`

```typescript
interface UseLoginFormReturn {
    email: string;
    password: string;
    error: string | null;
    isLoading: boolean;
    setEmail: (v: string) => void;
    setPassword: (v: string) => void;
    submit: () => Promise<boolean>;
    reset: () => void;
}

export const useLoginForm = (): UseLoginFormReturn => {
    const { login, isLoading, error: authError, clearError } = useAuth();
    const [form, setForm] = useState({ email: '', password: '', localError: null as string | null });

    const setEmail = (v: string) => { clearError(); setForm((f) => ({ ...f, email: v, localError: null })); };
    const setPassword = (v: string) => { clearError(); setForm((f) => ({ ...f, password: v, localError: null })); };

    const submit = async (): Promise<boolean> => {
        if (!form.email.trim() || !form.password.trim()) {
            setForm((f) => ({ ...f, localError: 'Email et mot de passe requis' }));
            return false;
        }
        const result = await login(form.email, form.password);
        return result.isRight();
    };

    const reset = () => { clearError(); setForm({ email: '', password: '', localError: null }); };

    // Priorite : erreur locale > erreur store
    const error = form.localError ?? authError;

    return { email: form.email, password: form.password, error, isLoading, setEmail, setPassword, submit, reset };
};
```

### Exemple : hook de filtres

**Fichier** : `presentation/hooks/useUsersFilters.ts`

```typescript
interface UseUsersFiltersReturn {
    search: string;
    role: string;
    status: string;
    setSearch: (value: string) => void;
    setRole: (value: string) => void;
    setStatus: (value: string) => void;
    applyFilters: (page?: number) => void;  // Envoie les filtres au store
    resetFilters: () => void;               // Vide les filtres + recharge page 1
    activeFilters: GetUsersFiltersParams;   // Filtres appliques (sans champs vides)
}

export const useUsersFilters = (): UseUsersFiltersReturn => {
    const getUsers = useUsersStore((s) => s.getUsers);
    const [search, setSearch] = useState('');
    const [role, setRole] = useState('');
    const [status, setStatus] = useState('');

    // N'inclure que les filtres non vides pour ne pas polluer l'URL / la requete
    const activeFilters: GetUsersFiltersParams = {
        ...(search.trim() && { search: search.trim() }),
        ...(role && { role }),
        ...(status && { status }),
    };

    const applyFilters = (page = 1) => getUsers({ page, ...activeFilters });

    const resetFilters = () => {
        setSearch(''); setRole(''); setStatus('');
        getUsers({ page: 1 });
    };

    return { search, role, status, setSearch, setRole, setStatus, applyFilters, resetFilters, activeFilters };
};
```

### Exemple : hook de pagination

**Fichier** : `presentation/hooks/usePagination.ts`

```typescript
// Accepte les filtres actifs pour les conserver lors des changements de page
export const usePagination = (activeFilters: GetUsersFiltersParams = {}): UsePaginationReturn => {
    const users = useUsersStore((s) => s.users);
    const getUsers = useUsersStore((s) => s.getUsers);
    const [currentPage, setCurrentPage] = useState(1);
    const totalPages = users?.totalPages ?? 1;

    const goToPage = (page: number) => {
        const clamped = Math.max(1, Math.min(page, totalPages));
        setCurrentPage(clamped);
        getUsers({ page: clamped, ...activeFilters });
    };

    return {
        currentPage, totalPages,
        goToPage,
        goToNext: () => goToPage(currentPage + 1),
        goToPrevious: () => goToPage(currentPage - 1),
        isFirstPage: currentPage === 1,
        isLastPage: currentPage >= totalPages,
    };
};
```

### Utilisation dans la page

```typescript
const UsersPage = () => {
    const { users, loading, error, success, getUsers } = useUsersStore();

    const { search, setSearch, applyFilters, resetFilters, activeFilters } = useUsersFilters();
    const { currentPage, totalPages, goToPage, goToNext, goToPrevious, isFirstPage, isLastPage } =
        usePagination(activeFilters);

    // 1 seul useEffect pour le chargement initial
    useEffect(() => { getUsers({ page: 1 }); }, []); // eslint-disable-line react-hooks/exhaustive-deps

    const handleSearch = () => applyFilters(1);
    // ...
};
```

---

## Patterns Zustand

### Structure type d'un state
```typescript
interface FeatureState {
    loading: boolean;
    dialogLoading: boolean;        // Pour les modals
    error: string | null;
    success: string | null;
    items: PaginatedArray<Entity> | null;
    currentItem: Entity | null;
}
```

### Pattern Either dans les actions
```typescript
// TOUJOURS ce pattern dans les actions Zustand :
actionName: async (params) => {
    set({ loading: true, error: null }, false, 'feature/action/pending');
    const result = await useCase.actionName(params);

    if (result.isLeft()) {
        set({ loading: false, error: result.value.message }, false, 'feature/action/rejected');
    } else {
        set({ loading: false, data: result.value }, false, 'feature/action/fulfilled');
    }
},
```

### Invalidation apres mutation
```typescript
// Apres create/update/delete, invalider la liste :
set({ success: "Cree avec succes !", items: null });
// Puis dans le composant :
await createItem(data);
getItems({ page: currentPage });  // Rechargement
```

### Acceder au store hors React
```typescript
// Dans init.ts ou services :
useAuthStore.getState().checkAuth();
```

---

## Gestion d'erreurs

### Pattern Either -- resume
| Methode | Signification |
|---------|---------------|
| `right(data)` | Succes |
| `left(new AppError(...))` | Erreur |
| `result.isLeft()` | Tester si erreur |
| `result.isRight()` | Tester si succes |
| `result.value` | Acceder a la donnee (apres test) |

### Ou utiliser Either ?
| Couche | Utilise Either ? | Comment |
|--------|-----------------|---------|
| DataSource | Non | `throw new AppError(...)` |
| Repository | Oui | `try/catch` -> `right()`/`left()` |
| UseCase | Oui | Validation -> `left()`, sinon delegue au repo |
| Store | Consomme | `if (result.isLeft()) set({ error })` |

### AppError
```typescript
new AppError(message: string, code: string, details?: any)
// Codes courants : "000" (inconnu), "001" (API), "400" (validation), "401" (auth), "VALIDATION_ERROR" (Zod)
```

---

## Notes importantes

### Messages utilisateur
- **Success** : Messages clairs et positifs -- `"Utilisateur cree avec succes !"`
- **Error** : Messages comprehensibles -- `"Une erreur est survenue lors de la creation"`
- Toujours auto-clear apres 3 secondes -- via `setTimeout` dans le **store** (pas dans le composant)
- Jamais d'emojis dans les messages

### Regles core/services
| Regle | Description |
|-------|-------------|
| **Singleton** | `private static instance` + `getInstance()` obligatoire pour les services partages |
| **localStorage** | Uniquement dans `TokenService` (tokens auth) et `ThemeService` (theme). Nulle part ailleurs |
| **Either obligatoire** | Toutes les methodes publiques faillibles retournent `Either<AppError, T>` |
| **Instanciation au module level** | Les services utilises dans un store sont instancies une fois en dehors du `create()` (pas dans chaque action) |
| **Pas de logique UI** | Seul `AxiosInterceptor` est autorise a toucher `window.location` |

### Regles HeroUI v3
- **Pas de prop `as`** sur `Button` -- HeroUI v3 ne supporte pas le polymorphisme via `as`. Utiliser un `<a>` natif stylie pour les liens externes
- **Import CSS** : `@import "@heroui/styles/css"` (NON `@heroui/styles/dist/index.css`)
- **Pas de `HeroUIProvider`** requis en v3
- **Dark mode** via classe `.dark` sur `<html>` -- gere par `ThemeService` + `themeStore`
- **Liens externes** : `<a href="..." target="_blank" rel="noopener noreferrer" className="...">` au lieu de `<Button as="a">`

### Regles hooks Zustand
- **Selectionner individuellement** les valeurs et actions : `useStore((s) => s.value)` -- evite les re-renders inutiles
- **Ne pas** faire `const state = useStore()` -- retourne un nouvel objet a chaque render
- **Les actions Zustand sont stables** -- pas besoin de `useCallback` pour les wrapper
- **`useStore.getState()`** pour lire le state hors React (services, callbacks asynchrones)

### Pattern auto-clear messages (store, pas composant)
```typescript
// Dans le store -- apres set({ error })
setTimeout(() => set({ error: null }, false, 'feature/auto/clearError'), 3000);

// Dans le composant -- rien, juste afficher
{error && <div>{error}</div>}
```

### Utilitaires partages
`src/core/utils/validators.ts` -- Fonctions de validation reutilisables (`isValidEmail`, `isNotEmpty`). Toujours importer depuis ce fichier au lieu de dupliquer dans les UseCases/Services.

### Types nullables
```typescript
// BON
phone: string | null;
const phone = json.phone ?? null;

// MAUVAIS -- || convertit '' en null
const phone = json.phone || null;
```

### Performance
- `PaginatedArray<T>` pour les listes volumineuses
- Invalider les listes (`set items: null`) apres mutations
- Selectionner individuellement dans les hooks Zustand (voir ci-dessus)

### Initialisation de l'app
```typescript
// main.tsx -- appeler initializeApp() avant le render
import { initializeApp } from './core/init';
initializeApp();
```

`initializeApp()` configure l'AxiosInterceptor et verifie l'auth au demarrage.

---

## Debugging

### Zustand DevTools
Les stores utilisent le middleware `devtools` avec des action names explicites :
`'users/getUsers/pending'`, `'users/getUsers/fulfilled'`, `'users/getUsers/rejected'`
Auto-clear : `'users/auto/clearError'`, `'users/auto/clearSuccess'`

### Erreurs courantes

| Erreur | Cause | Solution |
|--------|-------|----------|
| `Cannot read property 'map' of null` | Liste non chargee | Utiliser `data?.map()` |
| Token null / 401 | Session expiree | `useAuth()` + verifier `isAuthenticated` |
| `Donnees invalides` (Zod) | API renvoie des donnees hors schema | Verifier le schema Zod, inspecter `error.details.zodErrors` |
| `Either<...> not assignable` | Oubli de consommer l'Either | Utiliser `if (result.isLeft())` |
| `Property 'as' does not exist on Button` | HeroUI v3 pas de polymorphisme | Utiliser `<a>` natif stylie |
| `Missing specifier in @heroui/styles` | Mauvais chemin CSS | Utiliser `@heroui/styles/css` |

---

## Checklist nouvelle feature

- [ ] **Entity** : `domain/entities/[Entity].ts`
- [ ] **DTO + Zod** : `data/DTO/[Entity]Model.ts`
- [ ] **Domain Types** : `domain/types/[Feature]DomainTypes.ts`
- [ ] **Repository Interface** : `domain/repositories/I[Feature]Repository.ts`
- [ ] **UseCase Interface** : `domain/usecases/I[Feature]UseCase.ts`
- [ ] **UseCase Impl** : `domain/usecases/[Feature]UseCase.ts`
- [ ] **DataSource** : `data/datasources/[Feature]DataSource.ts`
- [ ] **Repository Impl** : `data/repositories/[Feature]Repository.ts`
- [ ] **Zustand Store** : `presentation/store/[feature]Store.ts`
- [ ] **Hooks de presentation** : `presentation/hooks/` (filtres, pagination, formulaire si besoin)
- [ ] **Page/Composant** : `presentation/pages/` ou `presentation/components/`

---

**Version** : 6.3
**Derniere mise a jour** : Mai 2026 -- Section hooks de presentation (useLoginForm, useRedirectAfterAuth, useUsersFilters, usePagination), refactoring LoginPage + UsersPage
**Mainteneur** : Contributeurs du template

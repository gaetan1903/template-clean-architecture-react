# Instructions Copilot - Tambatra UI

## 🎯 Vue d'ensemble du projet

**Tambatra UI** est une application React + TypeScript utilisant Vite comme bundler. Le projet suit une architecture **Clean Architecture** avec une séparation stricte des responsabilités.

### Technologies principales
- **Framework**: React 18 avec TypeScript
- **Build Tool**: Vite
- **State Management**: Redux Toolkit (@reduxjs/toolkit)
- **UI Library**: Material-UI (MUI) v6
- **Routing**: React Router DOM v6
- **HTTP Client**: Axios
- **Error Handling**: @sweet-monads/either (Either monad)
- **Validation**: Zod pour la validation des schemas API
- **Styling**: SASS/SCSS

### Structure du projet
```
src/
├── core/                    # Configuration globale et services partagés
│   ├── services/           # Services globaux (authService, tokenService, axiosService)
│   ├── types/              # Types TypeScript partagés (AuthTypes, AppError)
│   ├── hooks/              # Hooks React réutilisables (useAuth)
│   ├── guards/             # Guards de routing (PrivateRoute)
│   ├── contexts/           # Contexts React
│   └── components/         # Composants réutilisables
│
└── features/               # Features organisées par domaine métier
    ├── dashboard/
    ├── home/
    ├── users/
    └── auth/               # Feature d'authentification
```

---

## 🏗️ Architecture Clean Architecture

Le projet implémente la **Clean Architecture** avec 3 couches distinctes pour chaque feature :

### 1. **Domain Layer** (Couche Domaine)
**Rôle**: Logique métier pure, indépendante de tout framework

```
domain/
├── entities/           # Entités métier (modèles de données)
├── repositories/       # Interfaces de repositories (contrats)
└── usecases/          # Cas d'utilisation (logique métier)
```

**Règles**:
- ❌ Pas de dépendances externes (axios, react, etc.)
- ✅ Uniquement de la logique métier pure
- ✅ Définit les interfaces/contrats
- ✅ Utilise Either monad pour la gestion d'erreurs

### 2. **Data Layer** (Couche Données)
**Rôle**: Implémentation de l'accès aux données

```
data/
├── datasources/        # Communication avec l'API (appels HTTP)
├── DTO/               # Data Transfer Objects (mapping API ↔ Entity)
└── repositories/      # Implémentation des repositories
```

**Règles**:
- ✅ Implémente les interfaces définies dans domain
- ✅ Gère les appels HTTP via Axios avec intercepteurs automatiques
- ✅ Transforme les données API en entités avec validation Zod
- ✅ Utilise AuthService pour la gestion des tokens (plus de LocalStorageService direct)
- ✅ Valide toutes les données d'API avec Zod avant conversion en entités

### 3. **Presentation Layer** (Couche Présentation)
**Rôle**: Interface utilisateur et interaction

```
presentation/
├── components/         # Composants React spécifiques à la feature
├── pages/             # Pages/Vues principales
├── redux/             # Redux Toolkit (slices, providers)
└── utils/             # Utilitaires de présentation
```

**Règles**:
- ✅ Utilise React et MUI
- ✅ Communique via Redux Toolkit
- ✅ Appelle les UseCases
- ❌ Pas de logique métier complexe

---

## 📂 Structure des features

Chaque feature (dashboard, home, portfolio) suit la même structure :

```
features/[feature-name]/
│
├── data/
│   ├── datasources/
│   │   └── [feature]DataSource.ts          # Interface + Implémentation des appels API
│   ├── DTO/
│   │   ├── [entity]Model.ts                # Mapping API ↔ Entity
│   │   └── ...
│   └── repositories/
│       └── [feature]Repositories.ts         # Implémentation du repository
│
├── domain/
│   ├── entities/
│   │   ├── [entity].ts                      # Entités métier
│   │   └── ...
│   ├── repositories/
│   │   └── i[feature]Repositories.ts        # Interface du repository
│   └── usecases/
│       ├── I[Feature]UseCase.ts             # Interface du UseCase
│       └── [Feature]UseCase.ts              # Implémentation du UseCase
│
└── presentation/
    ├── components/
    │   └── [ComponentName]/
    │       ├── [ComponentName].tsx
    │       └── [ComponentName].scss (optionnel)
    ├── pages/
    │   └── [PageName]/
    │       ├── [PageName].tsx
    │       └── [PageName].scss (optionnel)
    └── redux/
        ├── [feature]Slice.ts                # Redux slice (state + reducers)
        ├── [feature]Provider.ts             # AsyncThunk providers
        └── .gitkeep
```

---

## ➕ Guide d'ajout de fonctionnalités

### Étape 1: Créer l'Entité (Domain Layer)

**Fichier**: `src/features/[feature]/domain/entities/[entityName].ts`

```typescript
// Exemple: userCandidat.ts
export class UserCandidatEntity {
    constructor(
        public id: string,
        public firstName: string,
        public lastName: string,
        public email: string,
        public phoneNumber: string | null,
        public status: string,
        // ... autres propriétés
    ) {}
}
```

**Points clés**:
- Classes avec constructeur explicite
- Types TypeScript stricts
- Pas de logique, juste des données
- Propriétés publiques pour faciliter l'accès

---

### Étape 2: Créer le DTO (Data Layer)

**Fichier**: `src/features/[feature]/data/DTO/[entityName]Model.ts`

```typescript
import { [EntityName]Entity } from "../../domain/entities/[entityName]";

export class [EntityName]Model {
    static fromJson(json: any): [EntityName]Entity {
        return new [EntityName]Entity(
            json.id,
            json.first_name,           // Mapping snake_case → camelCase
            json.last_name,
            json.email,
            json.phone_number ?? null, // Gestion des valeurs nullables
            json.status,
            // ... mapping des autres propriétés
        );
    }

    static toJson(entity: [EntityName]Entity): any {
        return {
            id: entity.id,
            first_name: entity.firstName,  // Mapping camelCase → snake_case
            last_name: entity.lastName,
            email: entity.email,
            phone_number: entity.phoneNumber,
            status: entity.status,
            // ... mapping inverse
        };
    }
}
```

**Points clés**:
- Méthodes statiques `fromJson` et `toJson`
- Mapping entre format API et format Entity
- Gestion des valeurs nullables avec `??`
- Transformation des noms de propriétés (snake_case ↔ camelCase)

---

### Étape 2.5: Validation Zod dans les DTOs (Recommandé)

**Objectif**: Sécuriser et valider toutes les données d'API avec Zod

#### **Template DTO avec Zod**

```typescript
import { z } from 'zod';
import { [EntityName]Entity } from "../../domain/entities/[entityName]";
import { AppError } from '../../../../core/types/AppError';

// Schéma API principal
const [EntityName]ApiSchema = z.object({
    id: z.string().uuid(),
    first_name: z.string().min(1).max(100),
    last_name: z.string().min(1).max(100),
    email: z.string().email(),
    phone_number: z.string().nullable().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE', 'PENDING']),
    created_at: z.string().datetime(),
    updated_at: z.string().datetime()
});

// Schéma pour création (sans id/dates)
const Create[EntityName]ApiSchema = [EntityName]ApiSchema
    .omit({ id: true, created_at: true, updated_at: true })
    .extend({ password: z.string().min(6) });

// Types générés
export type [EntityName]ApiType = z.infer<typeof [EntityName]ApiSchema>;
export type Create[EntityName]ApiType = z.infer<typeof Create[EntityName]ApiSchema>;

export class [EntityName]Model {
    static fromJson(json: unknown): [EntityName]Entity {
        try {
            const data = [EntityName]ApiSchema.parse(json);
            return new [EntityName]Entity(
                data.id, data.first_name, data.last_name, data.email,
                data.phone_number ?? null, data.status,
                new Date(data.created_at), new Date(data.updated_at)
            );
        } catch (error) {
            if (error instanceof z.ZodError) {
                const message = error.issues.map((err: z.ZodIssue) => 
                    `${err.path.join('.')}: ${err.message}`).join(', ');
                throw new AppError(`Données invalides: ${message}`, "VALIDATION_ERROR", 
                    { zodErrors: error.issues, receivedData: json });
            }
            throw error;
        }
    }

    static validateCreateData(data: unknown): Create[EntityName]ApiType {
        return Create[EntityName]ApiSchema.parse(data);
    }

    static validateUpdateData(data: unknown): Partial<Create[EntityName]ApiType> {
        return Create[EntityName]ApiSchema.partial().parse(data);
    }
}
```

#### **Utilisation dans DataSource**

```typescript
// Validation automatique
const entities = response.data.map(item => [EntityName]Model.fromJson(item));

// Validation avant envoi
async create[EntityName](token: string, data: CreateUserDataParams): Promise<boolean> {
    const validatedData = [EntityName]Model.validateCreateData(data);
    const response = await this.axiosService.post('/api/[entities]', validatedData, {
        headers: { Authorization: `Bearer ${token}` }
    });
    return response.status === 201;
}
```

#### **Gestion des erreurs**

```typescript
try {
    const entity = [EntityName]Model.fromJson(apiData);
    return right(entity);
} catch (error) {
    if (error instanceof AppError && error.code === "VALIDATION_ERROR") {
        return left(error);
    }
    return left(new AppError("Erreur inconnue", "000", error));
}
```

#### **Avantages**
- ✅ Validation automatique des données d'API
- ✅ Types TypeScript générés automatiquement  
- ✅ Messages d'erreur détaillés pour debugging
- ✅ Protection contre les données malformées

---

### Étape 3: Créer l'interface Repository (Domain Layer)

**Fichier**: `src/features/[feature]/domain/repositories/i[Feature]Repositories.ts`

<!-- markdownlint-disable -->
```typescript
import { Either } from "@sweet-monads/either";
import { AppError } from "../../../../core/types/AppError";
import { [EntityName]Entity } from "../entities/[entityName]";

export interface I[Feature]Repository {
    get[EntityName]s(filters: GetUsersFiltersParams): Promise<Either<AppError, [EntityName]Entity[]>>;
    get[EntityName]ById(params: GetUserByIdParams): Promise<Either<AppError, [EntityName]Entity>>;
    create[EntityName](data: CreateUserDataParams): Promise<Either<AppError, boolean>>;
    update[EntityName](id: string, data: UpdateUserDataParams): Promise<Either<AppError, boolean>>;
    delete[EntityName](params: DeleteUserParams): Promise<Either<AppError, boolean>>;
}
```
<!-- markdownlint-restore -->

**Points clés**:
- Utilisation de `Either<AppError, T>` pour la gestion d'erreurs
- Méthodes asynchrones (Promise)
- Définition des contrats uniquement (pas d'implémentation)

---

### Étape 4: Implémenter le DataSource (Data Layer)

**Fichier**: `src/features/[feature]/data/datasources/[feature]DataSource.ts`

```typescript
import AxiosService from "../../../../core/services/axiosSerive";
import { AppError } from "../../../../core/types/AppError";
import { [EntityName]Entity } from "../../domain/entities/[entityName]";
import { [EntityName]Model } from "../DTO/[entityName]Model";

export interface I[Feature]DataSource {
    get[EntityName]s(token: string, filters: GetUsersFiltersParams): Promise<[EntityName]Entity[]>;
    get[EntityName]ById(token: string, params: GetUserByIdParams): Promise<[EntityName]Entity>;
    create[EntityName](token: string, data: CreateUserDataParams): Promise<boolean>;
    update[EntityName](token: string, id: string, data: UpdateUserDataParams): Promise<boolean>;
    delete[EntityName](token: string, params: DeleteUserParams): Promise<boolean>;
}

export class [Feature]DataSource implements I[Feature]DataSource {
    private axiosService = AxiosService.getInstance();

    async get[EntityName]s(token: string, filters: any): Promise<[EntityName]Entity[]> {
        // Construction de l'URL avec query params
        const endpoint = '/v1/[resource]/all'
            + (filters.query ? `?search=${filters.query}` : '?1')
            + (filters.status ? `&filter.status=${filters.status}` : '');

        try {
            const response = await this.axiosService.get(endpoint, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            if (!response.data) {
                throw new AppError('Empty response', "001", '[entity] data is empty');
            }

            // Mapping des données API vers Entités
            return response.data.map((item: any) => 
                [EntityName]Model.fromJson(item) as [EntityName]Entity
            );
        } catch (error) {
            let _error = error as any;
            if (_error instanceof Object && _error.name == 'AxiosError') {
                throw new AppError(_error.response.data.message, "001", _error.response.data);
            }
            throw new AppError('Error', "000", error);
        }
    }

    // Méthode POST/PUT/PATCH/DELETE
    async create[EntityName](token: string, data: any): Promise<boolean> {
        try {
            const response = await this.axiosService.post('/v1/[resource]/add', data, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            return response && response.status === 201;
        } catch (error) {
            // ... gestion d'erreurs similaire
        }
    }
}
```

**Points clés**:
- Singleton `AxiosService.getInstance()`
- Gestion du token Bearer
- Construction dynamique des query params
- Gestion des erreurs avec try/catch
- Mapping via DTO Model
- Status codes HTTP appropriés

---

### Étape 5: Implémenter le Repository (Data Layer)

**Fichier**: `src/features/[feature]/data/repositories/[feature]Repositories.ts`

```typescript
import { Either, left, right } from "@sweet-monads/either";
import { AppError } from "../../../../core/types/AppError";
import { I[Feature]DataSource } from "../datasources/[feature]DataSource";
import { I[Feature]Repository } from "../../domain/repositories/i[Feature]Repositories";
import AuthService from "../../../../core/services/authService";
import { [EntityName]Entity } from "../../domain/entities/[entityName]";

export class [Feature]Repository implements I[Feature]Repository {
    private dataSource: I[Feature]DataSource;
    private authService = AuthService.getInstance();

    constructor(dataSource: I[Feature]DataSource) {
        this.dataSource = dataSource;
    }

    async get[EntityName]s(filters: GetUsersFiltersParams): Promise<Either<AppError, [EntityName]Entity[]>> {
        try {
            // Récupération du token via AuthService
            const tokenResult = await this.authService.getValidToken();
            if (tokenResult.isLeft()) {
                return left(tokenResult.value);
            }

            // Appel au DataSource
            const entities = await this.dataSource.get[EntityName]s(tokenResult.value, filters);
            
            // Succès: retourne Right
            return right(entities);
        } catch (error) {
            // Erreur: retourne Left
            if (error instanceof AppError) {
                return left(error);
            }
            return left(new AppError("Une erreur s'est produite", "000", error));
        }
    }

    // ... autres méthodes suivant le même pattern
}
```

**Points clés**:
- Injection des dépendances via constructeur
- Récupération du token via LocalStorageService
- Pattern Either: `right()` pour succès, `left()` pour erreur
- Propagation des erreurs AppError
- Pas de logique métier, juste orchestration

---

### Étape 6: Créer le UseCase (Domain Layer)

**Fichier**: `src/features/[feature]/domain/usecases/[Feature]UseCase.ts`

```typescript
import { Either } from "@sweet-monads/either";
import { AppError } from "../../../../core/types/AppError";
import { I[Feature]Repository } from "../repositories/i[Feature]Repositories";
import { I[Feature]UseCase } from "./I[Feature]UseCase";
import { [EntityName]Entity } from "../entities/[entityName]";

export class [Feature]UseCase implements I[Feature]UseCase {
    private repository: I[Feature]Repository;

    constructor(repository: I[Feature]Repository) {
        this.repository = repository;
    }

    async get[EntityName]s(filters: any): Promise<Either<AppError, [EntityName]Entity[]>> {
        // Logique métier si nécessaire
        // Ex: validation des filtres, transformation, règles métier
        
        // Filtre des status SUSPENDU → disabled
        if (filters.status.includes('SUSPENDU')) {
            filters.status = filters.status.filter((s: string) => s !== 'SUSPENDU');
            filters.disabled = true;
        }

        // Délégation au repository
        return await this.repository.get[EntityName]s(filters);
    }

    async create[EntityName](data: any): Promise<Either<AppError, boolean>> {
        // Validation des données
        if (!data.name || data.name.trim() === '') {
            return left(new AppError("Le nom est requis", "400", "validation_error"));
        }

        // Règles métier
        // Ex: calculs, vérifications, transformations

        return await this.repository.create[EntityName](data);
    }
}
```

**Points clés**:
- Contient la **logique métier**
- Validation des données entrantes
- Application des règles métier
- Transformation des données si nécessaire
- Délègue au repository pour les opérations

---

### Étape 7: Créer le Redux Provider (Presentation Layer)

**Fichier**: `src/features/[feature]/presentation/redux/[feature]Provider.ts`

```typescript
import { createAsyncThunk } from "@reduxjs/toolkit";
import { [Feature]UseCase } from "../../domain/usecases/[Feature]UseCase";
import { [Feature]Repository } from "../../data/repositories/[feature]Repositories";
import { [Feature]DataSource } from "../../data/datasources/[feature]DataSource";
import LocalStorageService from "../../../../core/services/localStorageService";

// Initialisation de la chaîne de dépendances (plus besoin de LocalStorageService)
const dataSource = new [Feature]DataSource();
const repository = new [Feature]Repository(dataSource);
const useCase = new [Feature]UseCase(repository);

// AsyncThunk pour récupérer les données
export const get[EntityName]sProvider = createAsyncThunk(
    '[feature]/get[EntityName]s',
    async (filters: GetUsersFiltersParams, { rejectWithValue }) => {
        const result = await useCase.get[EntityName]s(filters);
        
        return result.mapRight(data => data)
            .mapLeft(error => rejectWithValue(error.message))
            .value;
    }
);

// AsyncThunk pour créer une entité
export const create[EntityName]Provider = createAsyncThunk(
    '[feature]/create[EntityName]',
    async (data: CreateUserDataParams, { rejectWithValue }) => {
        const result = await useCase.create[EntityName](data);
        
        return result.mapRight(success => success)
            .mapLeft(error => rejectWithValue(error.message))
            .value;
    }
);

// ... autres providers (update, delete, etc.)
```

**Points clés**:
- Utilisation de `createAsyncThunk` de Redux Toolkit
- Initialisation de la chaîne: DataSource → Repository → UseCase
- Mapping Either vers résultat Redux (mapRight/mapLeft)
- Gestion des erreurs avec `rejectWithValue`
- Naming convention: `[feature]/[action]`

---

### Étape 8: Créer le Redux Slice (Presentation Layer)

**Fichier**: `src/features/[feature]/presentation/redux/[feature]Slice.ts`

```typescript
import { createSlice } from "@reduxjs/toolkit";
import { [EntityName]Entity } from "../../domain/entities/[entityName]";
import { 
    get[EntityName]sProvider, 
    create[EntityName]Provider,
    // ... autres providers
} from "./[feature]Provider";

// Définition du state
interface [Feature]State {
    loading: boolean;
    error: string | null;
    success: string | null;
    [entityName]s: [EntityName]Entity[] | null;
    // ... autres données
}

// État initial
const initialState: [Feature]State = {
    loading: false,
    error: null,
    success: null,
    [entityName]s: null,
};

// Création du slice
const [feature]Slice = createSlice({
    name: '[feature]',
    initialState,
    reducers: {
        // Reducers synchrones
        clearSuccess: (state) => {
            state.success = null;
        },
        clearError: (state) => {
            state.error = null;
        },
        reset[Feature]State: (state) => {
            Object.assign(state, initialState);
        }
    },
    extraReducers: (builder) => {
        // Gestion du provider get[EntityName]s
        builder
            .addCase(get[EntityName]sProvider.pending, (state) => {
                state.loading = true;
                state.error = null;
                state.[entityName]s = null;
            })
            .addCase(get[EntityName]sProvider.fulfilled, (state, action) => {
                state.loading = false;
                state.[entityName]s = action.payload;
            })
            .addCase(get[EntityName]sProvider.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Une erreur est survenue';
            })
            
            // Gestion du provider create[EntityName]
            .addCase(create[EntityName]Provider.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(create[EntityName]Provider.fulfilled, (state) => {
                state.loading = false;
                state.success = "[EntityName] créé avec succès !";
                // Optionnel: invalider la liste pour forcer un rechargement
                state.[entityName]s = null;
            })
            .addCase(create[EntityName]Provider.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Une erreur est survenue';
            });
            
        // ... autres extraReducers
    }
});

// Export des actions et reducer
export const { clearSuccess, clearError, reset[Feature]State } = [feature]Slice.actions;
export const [feature]Reducer = [feature]Slice.reducer;
```

**Points clés**:
- Type strict pour le state
- État initial bien défini
- Reducers synchrones pour actions simples
- `extraReducers` pour les AsyncThunks (pending/fulfilled/rejected)
- Pattern: loading → true en pending, false en fulfilled/rejected
- Messages de succès/erreur clairs
- Export des actions et reducer

---

### Étape 9: Enregistrer le Reducer dans le Store

**Fichier**: `src/core/store.ts`

```typescript
import { configureStore } from '@reduxjs/toolkit';
import { [feature]Reducer } from '../features/[feature]/presentation/redux/[feature]Slice';
// ... autres imports

export const store = configureStore({
    reducer: {
        [feature]: [feature]Reducer,
        // ... autres reducers
    },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
```

---

### Étape 10: Utiliser dans un Composant React

**Fichier**: `src/features/[feature]/presentation/components/[Component]/[Component].tsx`

```typescript
import React, { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../../../core/store';
import { 
    get[EntityName]sProvider, 
    create[EntityName]Provider 
} from '../../redux/[feature]Provider';
import { clearSuccess, clearError } from '../../redux/[feature]Slice';
import { CircularProgress, Button, Alert } from '@mui/material';

const [ComponentName]: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    
    // Sélection du state Redux
    const { 
        [entityName]s, 
        loading, 
        error, 
        success 
    } = useSelector((state: RootState) => state.[feature]);

    // Chargement initial
    useEffect(() => {
        dispatch(get[EntityName]sProvider({ /* filters */ }));
    }, [dispatch]);

    // Gestion des messages de succès
    useEffect(() => {
        if (success) {
            // Afficher un toast ou notification
            console.log(success);
            setTimeout(() => dispatch(clearSuccess()), 3000);
        }
    }, [success, dispatch]);

    // Gestion des erreurs
    useEffect(() => {
        if (error) {
            console.error(error);
            setTimeout(() => dispatch(clearError()), 3000);
        }
    }, [error, dispatch]);

    // Handler pour créer une entité
    const handleCreate = async () => {
        const data = {
            // ... données du formulaire
        };
        
        await dispatch(create[EntityName]Provider(data));
        
        // Recharger la liste après création
        dispatch(get[EntityName]sProvider({ /* filters */ }));
    };

    // Affichage du loading
    if (loading) {
        return <CircularProgress />;
    }

    return (
        <div>
            {/* Messages */}
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            {/* Liste */}
            <div>
                {[entityName]s?.map(entity => (
                    <div key={entity.id}>
                        {/* Affichage de l'entité */}
                        {entity.name}
                    </div>
                ))}
            </div>

            {/* Bouton d'action */}
            <Button onClick={handleCreate}>
                Créer
            </Button>
        </div>
    );
};

export default [ComponentName];
```

**Points clés**:
- Import des hooks Redux (`useDispatch`, `useSelector`)
- Types stricts (`AppDispatch`, `RootState`)
- Dispatch des providers dans `useEffect` ou handlers
- Gestion des états loading/error/success
- Nettoyage des messages après affichage
- Rechargement des données après modifications

---

## 🔄 Guide de modification de fonctionnalités

### Modifier une Entité existante

**Étapes**:
1. **Mettre à jour l'Entity** (`domain/entities/`)
2. **Mettre à jour le DTO** (`data/DTO/`) pour le mapping
3. **Mettre à jour le State Redux** (`presentation/redux/[feature]Slice.ts`)
4. **Mettre à jour les composants** qui utilisent l'entité

**Exemple**: Ajouter une propriété `age` à `UserCandidatEntity`

```typescript
// 1. Entity
export class UserCandidatEntity {
    constructor(
        // ... propriétés existantes
        public age: number | null,  // ✅ Nouvelle propriété
    ) {}
}

// 2. DTO
export class UserCandidatModel {
    static fromJson(json: any): UserCandidatEntity {
        return new UserCandidatEntity(
            // ... mappings existants
            json.age ?? null,  // ✅ Mapping de la nouvelle propriété
        );
    }
}

// 3. Redux State (si nécessaire de filtrer/afficher)
// Pas de modification nécessaire si c'est juste un champ de l'entité

// 4. Composant
const CandidateCard: React.FC<{ candidate: UserCandidatEntity }> = ({ candidate }) => {
    return (
        <div>
            {/* ... affichages existants */}
            <p>Âge: {candidate.age ?? 'Non renseigné'}</p>  {/* ✅ Utilisation */}
        </div>
    );
};
```

---

### Ajouter une nouvelle méthode à un UseCase

**Étapes**:
1. Ajouter la méthode dans **l'interface du Repository** (`domain/repositories/`)
2. Implémenter dans **le Repository** (`data/repositories/`)
3. Implémenter dans **le DataSource** (`data/datasources/`)
4. Ajouter la méthode dans **le UseCase** (`domain/usecases/`)
5. Créer un **Provider Redux** (`presentation/redux/`)
6. Ajouter les **extraReducers** dans le Slice
7. Utiliser dans **le composant**

**Exemple**: Ajouter une méthode pour archiver un candidat

```typescript
// 1. Interface Repository
export interface IDashRepository {
    // ... méthodes existantes
    archiveCandidate(candidateId: string): Promise<Either<AppError, boolean>>;
}

// 2. Implémentation Repository
export class DashRepository implements IDashRepository {
    async archiveCandidate(candidateId: string): Promise<Either<AppError, boolean>> {
        try {
            const token = this.localStorageService.getAccessToken();
            if (!token) {
                return left(new AppError("Session expirée", "401", "session_expired"));
            }
            const result = await this.dataSource.archiveCandidate(token, candidateId);
            return right(result);
        } catch (error) {
            if (error instanceof AppError) return left(error);
            return left(new AppError("Erreur", "000", error));
        }
    }
}

// 3. DataSource
export class DashDataSource implements IDashDataSource {
    async archiveCandidate(token: string, candidateId: string): Promise<boolean> {
        try {
            const response = await this.axiosService.post(
                `/v1/user-info/archive/${candidateId}`, 
                {},
                { headers: { Authorization: `Bearer ${token}` } }
            );
            return response && response.status === 200;
        } catch (error) {
            // ... gestion erreur
            throw error;
        }
    }
}

// 4. UseCase
export class DashUseCase implements IDashUseCase {
    async archiveCandidate(candidateId: string): Promise<Either<AppError, boolean>> {
        // Validation
        if (!candidateId) {
            return left(new AppError("ID candidat requis", "400", "validation"));
        }
        return await this.repository.archiveCandidate(candidateId);
    }
}

// 5. Provider Redux
export const archiveCandidateProvider = createAsyncThunk(
    'dash/archiveCandidate',
    async (candidateId: string, { rejectWithValue }) => {
        const result = await useCase.archiveCandidate(candidateId);
        return result.mapRight(data => data)
            .mapLeft(error => rejectWithValue(error.message))
            .value;
    }
);

// 6. Slice (extraReducers)
builder
    .addCase(archiveCandidateProvider.pending, (state) => {
        state.loading = true;
        state.error = null;
    })
    .addCase(archiveCandidateProvider.fulfilled, (state) => {
        state.loading = false;
        state.success = "Candidat archivé avec succès !";
        state.candidates = null; // Forcer rechargement
    })
    .addCase(archiveCandidateProvider.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || 'Erreur lors de l\'archivage';
    });

// 7. Utilisation dans composant
const handleArchive = async (candidateId: string) => {
    await dispatch(archiveCandidateProvider(candidateId));
    dispatch(getCandidatesProvider({ /* filters */ }));
};
```

---

### Modifier un endpoint API

**Étapes**:
1. Identifier le DataSource concerné
2. Mettre à jour l'URL et/ou les paramètres dans la méthode
3. Ajuster le mapping si la structure de réponse a changé
4. Tester la fonctionnalité

**Exemple**: Changement d'endpoint de `/v1/user-info/all` vers `/v1/users/candidates`

```typescript
// data/datasources/dashDataSource.ts

async getCandidates(token: string, filters: IFilterCandidatesParams): Promise<PaginatedArray<UserCandidatEntity>> {
    // ❌ ANCIEN
    // const endpoint = '/v1/user-info/by-role/candidate' + ...
    
    // ✅ NOUVEAU
    const endpoint = '/v1/users/candidates'
        + (filters.query ? `?search=${filters.query}` : '?1')
        + (filters.status ? `&status=${filters.status}` : '');

    const response = await this.axiosService.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` }
    });

    // Si la structure de réponse a changé, ajuster ici
    return new PaginatedArray(
        response.data.items.map((item: any) => UserCandidatModel.fromJson(item)),
        response.data.pagination.totalPages,
        response.data.pagination.currentPage,
        response.data.pagination.total,
    );
}
```

---

## 📜 Conventions de code

### Naming Conventions

| Type | Convention | Exemple |
|------|-----------|---------|
| **Fichiers** | camelCase | `userCandidatEntity.ts` |
| **Composants React** | PascalCase | `CandidateList.tsx` |
| **Classes** | PascalCase | `UserCandidatEntity` |
| **Interfaces** | PascalCase avec I- | `IDashRepository` |
| **Variables** | camelCase | `candidateList` |
| **Constantes** | UPPER_SNAKE_CASE | `BASE_URL` |
| **Redux Slices** | camelCase | `dashSlice` |
| **Redux Providers** | camelCase avec Provider suffix | `getCandidatesProvider` |

### Structure des imports

Toujours organiser les imports dans cet ordre :
```typescript
// 1. Imports externes (libraries)
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Button, CircularProgress } from '@mui/material';

// 2. Imports de types
import { RootState, AppDispatch } from '../../../../../core/store';
import { IFilterParams } from '../../../../../core/types/FilterParams';

// 3. Imports d'entités/domaine
import { UserCandidatEntity } from '../../../domain/entities/userCandidat';

// 4. Imports de Redux (providers, slices)
import { getCandidatesProvider } from '../../redux/dashProvider';
import { clearSuccess, clearError } from '../../redux/dashSlice';

// 5. Imports locaux (composants, styles)
import { CandidateCard } from '../CandidateCard/CandidateCard';
import './CandidateList.scss';
```

### Gestion d'erreurs

**Toujours utiliser le pattern Either**:
```typescript
// ✅ BON
async getCandidate(id: string): Promise<Either<AppError, UserCandidatEntity>> {
    try {
        const result = await this.repository.getCandidateById(id);
        return right(result);
    } catch (error) {
        if (error instanceof AppError) return left(error);
        return left(new AppError("Erreur inconnue", "000", error));
    }
}

// ❌ MAUVAIS (pas de Either)
async getCandidate(id: string): Promise<UserCandidatEntity> {
    return await this.repository.getCandidateById(id);
}
```

### Gestion des tokens

**Toujours récupérer le token via LocalStorageService**:
```typescript
// ✅ BON
const token = this.localStorageService.getAccessToken();
if (!token) {
    return left(new AppError("Session expirée", "401", "session_expired"));
}

// ❌ MAUVAIS (accès direct)
const token = localStorage.getItem('accessToken');
```

### Types nullables

**Utiliser `| null` et l'opérateur `??`**:
```typescript
// ✅ BON
public phoneNumber: string | null;
const phone = json.phone_number ?? null;

// Dans le composant
<p>{candidate.phoneNumber ?? 'Non renseigné'}</p>

// ❌ MAUVAIS
public phoneNumber: string;  // Peut être undefined/null implicitement
const phone = json.phone_number || null;  // '' serait converti en null
```

---

## 🗂️ État Redux et Gestion

### Structure type d'un State

```typescript
interface FeatureState {
    // États de chargement
    loading: boolean;                    // Loading global
    dialogLoading: boolean;              // Loading pour dialogs/modals
    
    // États de messages
    error: string | null;                // Message d'erreur
    success: string | null;              // Message de succès
    
    // Données principales
    items: EntityType[] | null;          // Liste simple
    paginatedItems: PaginatedArray<EntityType> | null;  // Liste paginée
    currentItem: EntityType | null;      // Item sélectionné
    
    // Données de référence (dropdowns, etc.)
    statuses: StatusEntity[] | null;
    categories: CategoryEntity[] | null;
    
    // ... autres données spécifiques
}
```

### Pattern de mise à jour

**Après une création/modification/suppression, invalider les listes**:
```typescript
.addCase(createItemProvider.fulfilled, (state) => {
    state.loading = false;
    state.success = "Item créé avec succès !";
    state.items = null;  // ✅ Force le rechargement de la liste
})
```

**Dans le composant, recharger la liste**:
```typescript
const handleCreate = async () => {
    await dispatch(createItemProvider(data));
    dispatch(getItemsProvider({ /* filters */ }));  // ✅ Rechargement
};
```

### Gestion de la pagination

```typescript
// State
interface DashState {
    jobOffers: PaginatedArray<JobOfferEntity> | null;
}

// Provider
export const getJobOffersProvider = createAsyncThunk(
    'dash/getJobOffers',
    async (filters: { page: number, ...otherFilters }, { rejectWithValue }) => {
        const result = await useCase.getJobOffers(filters);
        return result.mapRight(data => data)
            .mapLeft(error => rejectWithValue(error.message))
            .value;
    }
);

// Composant
const [currentPage, setCurrentPage] = useState(1);
const { jobOffers, loading } = useSelector((state: RootState) => state.dash);

useEffect(() => {
    dispatch(getJobOffersProvider({ page: currentPage, /* autres filtres */ }));
}, [currentPage, dispatch]);

const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage);
};

// Affichage
<Pagination 
    count={jobOffers?.totalPages || 0} 
    page={currentPage} 
    onChange={(e, page) => handlePageChange(page)} 
/>
```

---

## 🎓 Exemples pratiques

### Exemple complet: Feature "Job Offers"

#### 1. Entité
```typescript
// domain/entities/jobOffer.ts
export class JobOfferEntity {
    constructor(
        public id: string,
        public title: string,
        public description: string,
        public status: string,
        public contractType: string,
        public location: string,
        public salary: number | null,
        public createdAt: Date,
    ) {}
}
```

#### 2. DTO
```typescript
// data/DTO/jobOfferModel.ts
export class JobOfferModel {
    static fromJson(json: any): JobOfferEntity {
        return new JobOfferEntity(
            json.id,
            json.title,
            json.description,
            json.status,
            json.contract_type,
            json.location,
            json.salary ?? null,
            new Date(json.created_at),
        );
    }
}
```

#### 3. Repository Interface
```typescript
// domain/repositories/iJobOfferRepository.ts
export interface IJobOfferRepository {
    getJobOffers(filters: any): Promise<Either<AppError, PaginatedArray<JobOfferEntity>>>;
    createJobOffer(data: any): Promise<Either<AppError, boolean>>;
}
```

#### 4. DataSource
```typescript
// data/datasources/jobOfferDataSource.ts
export class JobOfferDataSource {
    private axiosService = AxiosService.getInstance();

    async getJobOffers(token: string, filters: any): Promise<PaginatedArray<JobOfferEntity>> {
        const endpoint = `/v1/job-offer/all?page=${filters.page || 1}`;
        const response = await this.axiosService.get(endpoint, {
            headers: { Authorization: `Bearer ${token}` }
        });
        
        return new PaginatedArray(
            response.data.data.map((item: any) => JobOfferModel.fromJson(item)),
            response.data.meta.totalPages,
            response.data.meta.currentPage,
            response.data.meta.totalItems,
        );
    }

    async createJobOffer(token: string, data: any): Promise<boolean> {
        const response = await this.axiosService.post('/v1/job-offer/add', data, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.status === 201;
    }
}
```

#### 5. Repository
```typescript
// data/repositories/jobOfferRepository.ts
export class JobOfferRepository implements IJobOfferRepository {
    constructor(
        private dataSource: JobOfferDataSource,
        private localStorage: ILocalStorageService
    ) {}

    async getJobOffers(filters: any): Promise<Either<AppError, PaginatedArray<JobOfferEntity>>> {
        try {
            const token = this.localStorage.getAccessToken();
            if (!token) return left(new AppError("Session expirée", "401", "expired"));
            
            const offers = await this.dataSource.getJobOffers(token, filters);
            return right(offers);
        } catch (error) {
            if (error instanceof AppError) return left(error);
            return left(new AppError("Erreur", "000", error));
        }
    }

    async createJobOffer(data: any): Promise<Either<AppError, boolean>> {
        try {
            const token = this.localStorage.getAccessToken();
            if (!token) return left(new AppError("Session expirée", "401", "expired"));
            
            const result = await this.dataSource.createJobOffer(token, data);
            return right(result);
        } catch (error) {
            if (error instanceof AppError) return left(error);
            return left(new AppError("Erreur", "000", error));
        }
    }
}
```

#### 6. UseCase
```typescript
// domain/usecases/JobOfferUseCase.ts
export class JobOfferUseCase {
    constructor(private repository: IJobOfferRepository) {}

    async getJobOffers(filters: any): Promise<Either<AppError, PaginatedArray<JobOfferEntity>>> {
        // Validation des filtres
        if (filters.page && filters.page < 1) {
            return left(new AppError("Page invalide", "400", "validation"));
        }
        
        return await this.repository.getJobOffers(filters);
    }

    async createJobOffer(data: any): Promise<Either<AppError, boolean>> {
        // Validation
        if (!data.title || data.title.trim() === '') {
            return left(new AppError("Titre requis", "400", "validation"));
        }
        
        return await this.repository.createJobOffer(data);
    }
}
```

#### 7. Redux Provider
```typescript
// presentation/redux/jobOfferProvider.ts
const dataSource = new JobOfferDataSource();
const localStorage = LocalStorageService.getInstance();
const repository = new JobOfferRepository(dataSource, localStorage);
const useCase = new JobOfferUseCase(repository);

export const getJobOffersProvider = createAsyncThunk(
    'jobOffer/getJobOffers',
    async (filters: any, { rejectWithValue }) => {
        const result = await useCase.getJobOffers(filters);
        return result.mapRight(data => data)
            .mapLeft(error => rejectWithValue(error.message))
            .value;
    }
);

export const createJobOfferProvider = createAsyncThunk(
    'jobOffer/createJobOffer',
    async (data: any, { rejectWithValue }) => {
        const result = await useCase.createJobOffer(data);
        return result.mapRight(success => success)
            .mapLeft(error => rejectWithValue(error.message))
            .value;
    }
);
```

#### 8. Redux Slice
```typescript
// presentation/redux/jobOfferSlice.ts
interface JobOfferState {
    loading: boolean;
    error: string | null;
    success: string | null;
    jobOffers: PaginatedArray<JobOfferEntity> | null;
}

const initialState: JobOfferState = {
    loading: false,
    error: null,
    success: null,
    jobOffers: null,
};

const jobOfferSlice = createSlice({
    name: 'jobOffer',
    initialState,
    reducers: {
        clearMessages: (state) => {
            state.error = null;
            state.success = null;
        }
    },
    extraReducers: (builder) => {
        builder
            .addCase(getJobOffersProvider.pending, (state) => {
                state.loading = true;
                state.error = null;
            })
            .addCase(getJobOffersProvider.fulfilled, (state, action) => {
                state.loading = false;
                state.jobOffers = action.payload;
            })
            .addCase(getJobOffersProvider.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Erreur';
            })
            .addCase(createJobOfferProvider.pending, (state) => {
                state.loading = true;
            })
            .addCase(createJobOfferProvider.fulfilled, (state) => {
                state.loading = false;
                state.success = "Offre créée avec succès !";
                state.jobOffers = null;
            })
            .addCase(createJobOfferProvider.rejected, (state, action) => {
                state.loading = false;
                state.error = action.error.message || 'Erreur';
            });
    }
});

export const { clearMessages } = jobOfferSlice.actions;
export const jobOfferReducer = jobOfferSlice.reducer;
```

#### 9. Composant
```typescript
// presentation/components/JobOfferList/JobOfferList.tsx
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState, AppDispatch } from '../../../../../core/store';
import { getJobOffersProvider, createJobOfferProvider } from '../../redux/jobOfferProvider';
import { clearMessages } from '../../redux/jobOfferSlice';
import { CircularProgress, Button, Alert, Pagination } from '@mui/material';

const JobOfferList: React.FC = () => {
    const dispatch = useDispatch<AppDispatch>();
    const { jobOffers, loading, error, success } = useSelector(
        (state: RootState) => state.jobOffer
    );
    const [currentPage, setCurrentPage] = useState(1);

    useEffect(() => {
        dispatch(getJobOffersProvider({ page: currentPage }));
    }, [currentPage, dispatch]);

    useEffect(() => {
        if (success) {
            setTimeout(() => dispatch(clearMessages()), 3000);
        }
    }, [success, dispatch]);

    const handleCreate = async () => {
        const data = {
            title: "Développeur React",
            description: "Description...",
            contractType: "CDI",
            location: "Paris",
        };
        
        await dispatch(createJobOfferProvider(data));
        dispatch(getJobOffersProvider({ page: currentPage }));
    };

    if (loading && !jobOffers) {
        return <CircularProgress />;
    }

    return (
        <div>
            {error && <Alert severity="error">{error}</Alert>}
            {success && <Alert severity="success">{success}</Alert>}

            <Button onClick={handleCreate} disabled={loading}>
                Créer une offre
            </Button>

            <div>
                {jobOffers?.data.map(offer => (
                    <div key={offer.id}>
                        <h3>{offer.title}</h3>
                        <p>{offer.description}</p>
                        <p>{offer.location} - {offer.contractType}</p>
                    </div>
                ))}
            </div>

            {jobOffers && (
                <Pagination 
                    count={jobOffers.totalPages} 
                    page={currentPage}
                    onChange={(e, page) => setCurrentPage(page)}
                />
            )}
        </div>
    );
};

export default JobOfferList;
```

---

## 🚀 Checklist pour ajouter une nouvelle fonctionnalité

- [ ] **Entité**: Créer la classe Entity dans `domain/entities/`
- [ ] **DTO**: Créer le Model avec `fromJson` et `toJson` dans `data/DTO/`
- [ ] **Validation Zod**: Ajouter les schémas Zod dans le DTO pour validation API
- [ ] **Repository Interface**: Définir les méthodes dans `domain/repositories/i[Feature]Repository.ts`
- [ ] **DataSource Interface + Implémentation**: Créer/Modifier dans `data/datasources/`
- [ ] **Repository Implémentation**: Créer/Modifier dans `data/repositories/`
- [ ] **UseCase**: Créer/Modifier dans `domain/usecases/`
- [ ] **Redux Provider**: Créer les AsyncThunks dans `presentation/redux/[feature]Provider.ts`
- [ ] **Redux Slice**: Ajouter au state et extraReducers dans `presentation/redux/[feature]Slice.ts`
- [ ] **Store**: Enregistrer le reducer dans `core/store.ts`
- [ ] **Composant**: Créer/Modifier le composant React dans `presentation/components/`

---

## 📝 Notes importantes

### Gestion des dépendances

Les dépendances doivent toujours suivre ce flux :
```
Component → Redux Provider → UseCase → Repository → DataSource → API
```

Jamais de court-circuit (ex: Component → DataSource directement)

### Gestion des tokens d'authentification

- Toujours utiliser `LocalStorageService.getInstance().getAccessToken()`
- Vérifier la présence du token avant chaque appel API
- Retourner une erreur `401` si le token est absent ou expiré

### Pattern Either

- **Right**: Succès, contient les données
- **Left**: Erreur, contient AppError

```typescript
// Vérification du résultat
result.mapRight(data => {
    console.log("Succès:", data);
    return data;
}).mapLeft(error => {
    console.error("Erreur:", error.message);
    return null;
});
```

### Gestion des tokens d'authentification

- Toujours utiliser `AuthService.getInstance().getValidToken()` au lieu de LocalStorageService
- Le token est automatiquement validé, renouvelé si nécessaire, et géré par Either monad
- Plus besoin de vérifier manuellement l'expiration ou gérer le refresh
- Les intercepteurs Axios ajoutent automatiquement le token Bearer

### Messages utilisateur

- **Success**: Messages positifs et clairs ("Candidat créé avec succès !")
- **Error**: Messages d'erreur compréhensibles ("Une erreur est survenue lors de la création")
- Toujours nettoyer les messages après 3 secondes

### Authentification avec useAuth

- Utiliser le hook `useAuth()` dans les composants pour gérer l'authentification
- Le hook fournit `isAuthenticated`, `user`, `login()`, `logout()`, et `isLoading`
- Plus besoin de gérer manuellement les tokens dans les composants
- Exemple d'utilisation :

```typescript
const { isAuthenticated, user, login, logout, isLoading } = useAuth();

// Connexion
const handleLogin = async () => {
    const result = await login(email, password);
    if (result.isRight()) {
        // Connexion réussie
        navigate('/dashboard');
    } else {
        // Erreur
        setError(result.value.message);
    }
};
```

### Performance

- Utiliser `PaginatedArray` pour les listes volumineuses
- Invalider les listes (set to `null`) après modifications pour forcer le rechargement
- Éviter les re-renders inutiles avec `React.memo` si nécessaire

---

## 🔍 Debugging

### Logs utiles

```typescript
// Dans le DataSource
console.log("Calling API:", endpoint);
console.log("Response:", response.data);

// Dans le Repository
console.log("Repository: Calling UseCase with:", params);

// Dans le Redux Provider
console.log("Provider: Result from UseCase:", result);

// Dans le Composant
console.log("Component: Current state:", { loading, error, data });
```

### Erreurs courantes

1. **"Cannot read property 'map' of null"**
   - Cause: Liste non chargée
   - Solution: Vérifier le loading state avant d'afficher `data?.map()`

2. **"Token is null"**
   - Cause: Utilisateur non authentifié ou session expirée
   - Solution: Utiliser le hook `useAuth()` et vérifier `isAuthenticated`

3. **"AuthService token errors"**
   - Cause: Token expiré ou service d'authentification non initialisé
   - Solution: Appeler `initializeApp()` au démarrage et utiliser `getValidToken()`

3. **"Type 'Either<...>' is not assignable to type '...'"**
   - Cause: Oubli de mapper Either vers valeur
   - Solution: Utiliser `.mapRight()` et `.mapLeft()`

4. **"Reducer returned undefined"**
   - Cause: Slice non enregistré dans le store
   - Solution: Ajouter le reducer dans `configureStore()`

5. **"Données [entity] invalides" (Erreurs Zod)**
   - Cause: Données d'API qui ne respectent pas le schéma Zod
   - Solution: Vérifier le schéma Zod et/ou corriger les données API
   - Debug: Utiliser `error.details.zodErrors` pour voir les détails

---

**Version**: 2.0  
**Dernière mise à jour**: Octobre 2025 - Ajout validation Zod, amélioration authentification avec AuthService, TokenService et useAuth hook  
**Mainteneur**: Équipe Tambatra

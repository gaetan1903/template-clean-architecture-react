# Validation Zod dans les DTOs - Guide d'utilisation

## 📋 Vue d'ensemble

Cette implémentation utilise **Zod** pour valider automatiquement toutes les données d'API dans les DTOs. Cela garantit la sécurité des types et la robustesse de l'application.

## 🛡️ Sécurité et avantages

### ✅ **Avantages de Zod dans les DTOs**
- **Validation automatique** : Toutes les données d'API sont validées
- **Messages d'erreur clairs** : Erreurs détaillées pour le debugging
- **Type Safety** : Types TypeScript générés automatiquement
- **Performance** : Validation côté client avant traitement
- **Sécurité** : Protection contre les données malformées

### 🚨 **Protection contre les attaques**
- **Injection de données** : Validation stricte des formats
- **Buffer overflow** : Limites de longueur sur les chaînes
- **Type confusion** : Vérification des types attendus
- **Données corrompues** : Détection des structures invalides

## 🏗️ Architecture mise en place

```
API Response (unknown) 
        ↓
   Zod Validation 
        ↓
  Validated Data → UserEntity
```

### **Couches de validation**

1. **API → DTO** : Validation des réponses serveur
2. **Client → API** : Validation avant envoi (création/mise à jour)
3. **DTO → Entity** : Conversion sécurisée

## 📝 Utilisation dans votre code

### **1. Récupération de données (automatique)**

```typescript
// Dans UsersDataSource.ts
const response = await this.axiosService.get('/api/users/123');

// ✅ Validation automatique dans UserModel.fromJson()
const user = UserModel.fromJson(response.data); // Peut lever AppError si invalide
```

### **2. Création d'utilisateur**

```typescript
// Dans UsersDataSource.ts - createUser()
const userData = {
    first_name: "Jean",
    last_name: "Dupont", 
    email: "jean@example.com",
    password: "motdepasse123",
    role: "USER"
};

// ✅ Validation avant envoi à l'API
const validatedData = UserModel.validateCreateData(userData);
const response = await this.axiosService.post('/api/users', validatedData);
```

### **3. Mise à jour d'utilisateur**

```typescript
// Dans UsersDataSource.ts - updateUser()
const updateData = {
    first_name: "Jean-Claude", // Mise à jour partielle
    email: "jeanclaude@example.com"
};

// ✅ Validation partielle (champs optionnels)
const validatedData = UserModel.validateUpdateData(updateData);
const response = await this.axiosService.put(`/api/users/${id}`, validatedData);
```

## 🔧 Schémas Zod définis

### **UserApiSchema** (réponses API)
```typescript
{
    id: UUID valide requis
    first_name: String 1-100 caractères
    last_name: String 1-100 caractères  
    email: Format email valide
    phone: String nullable/optionnel
    role: Enum ['ADMIN', 'USER', 'MODERATOR']
    created_at: DateTime ISO string
    updated_at: DateTime ISO string
}
```

### **CreateUserApiSchema** (création)
```typescript
{
    first_name: String 1-100 caractères
    last_name: String 1-100 caractères
    email: Format email valide
    phone: String nullable/optionnel  
    role: Enum ['ADMIN', 'USER', 'MODERATOR']
    password: String minimum 6 caractères
}
```

### **UpdateUserApiSchema** (mise à jour)
```typescript
{
    // Tous les champs du CreateUserApiSchema
    // mais en optionnel avec .partial()
}
```

## 🚨 Gestion des erreurs

### **Types d'erreurs Zod**

```typescript
try {
    const user = UserModel.fromJson(apiData);
} catch (error) {
    if (error instanceof AppError && error.code === "VALIDATION_ERROR") {
        // Erreur de validation Zod
        console.log("Message:", error.message);
        console.log("Détails:", error.details.zodErrors);
        console.log("Données reçues:", error.details.receivedData);
    }
}
```

### **Exemples d'erreurs typiques**

```typescript
// Email invalide
"email: Format d'email invalide"

// Rôle non autorisé  
"role: Invalid enum value. Expected 'ADMIN' | 'USER' | 'MODERATOR', received 'SUPERUSER'"

// UUID malformé
"id: ID utilisateur doit être un UUID valide"

// Champ requis manquant
"first_name: Le prénom est requis"

// Longueur dépassée
"first_name: Prénom trop long"
```

## 🎯 Cas d'usage avancés

### **1. Validation personnalisée**

```typescript
// Exemple : Ajouter une validation d'âge minimum
const UserApiSchema = z.object({
    // ... autres champs
    birth_date: z.string().datetime().refine(
        (date) => {
            const age = new Date().getFullYear() - new Date(date).getFullYear();
            return age >= 18;
        },
        { message: "L'utilisateur doit être majeur" }
    )
});
```

### **2. Validation conditionnelle**

```typescript
// Exemple : Phone requis pour les admins
const CreateUserApiSchema = z.object({
    // ... autres champs
    role: z.enum(['ADMIN', 'USER', 'MODERATOR']),
    phone: z.string().nullable().optional()
}).refine(
    (data) => data.role !== 'ADMIN' || data.phone !== null,
    {
        message: "Le téléphone est requis pour les administrateurs",
        path: ["phone"]
    }
);
```

### **3. Transformation de données**

```typescript
// Exemple : Normalisation automatique
const UserApiSchema = z.object({
    email: z.string().email().transform(email => email.toLowerCase()),
    first_name: z.string().transform(name => name.trim().toLowerCase())
});
```

## 📊 Performance et optimisation

### **Conseils de performance**
- ✅ **Validation côté client** : Évite les round-trips inutiles
- ✅ **Cache des schémas** : Zod compile les schémas automatiquement
- ✅ **Validation précoce** : Échec rapide sur données invalides
- ✅ **Messages spécifiques** : Debugging plus facile

### **Monitoring des erreurs**
```typescript
// Exemple : Logger les erreurs de validation
if (error instanceof AppError && error.code === "VALIDATION_ERROR") {
    // Envoyer à un service de monitoring
    analytics.track('validation_error', {
        endpoint: '/api/users',
        errors: error.details.zodErrors,
        timestamp: new Date().toISOString()
    });
}
```

## 🔄 Extension à d'autres DTOs

### **Template pour nouveaux DTOs**

```typescript
import { z } from 'zod';

// 1. Définir le schéma API
const EntityApiSchema = z.object({
    id: z.string().uuid(),
    // ... autres champs
});

// 2. Générer les types
export type EntityApiType = z.infer<typeof EntityApiSchema>;

// 3. Classe Model avec validation
export class EntityModel {
    static fromJson(json: unknown): EntityClass {
        const validatedData = EntityApiSchema.parse(json);
        return new EntityClass(/* mapping */);
    }
}
```

## 📚 Ressources

- **Documentation Zod** : https://zod.dev/
- **Guide AppError** : `src/core/types/AppError.ts`
- **Exemples d'usage** : `src/features/users/data/DTO/UserModel.example.ts`

---

**✅ Implémentation terminée et prête à l'utilisation !**
# Contributing to Clean Architecture React Template

Nous sommes ravis que vous envisagiez de contribuer a ce template !

## Comment contribuer

1. **Fork** le projet
2. Installez **Bun** si ce n'est pas deja fait : https://bun.sh
3. Creez votre **branche de feature** (`git checkout -b feature/AmazingFeature`)
4. **Installez les dependances** (`bun install`)
5. **Committez** vos changements (`git commit -m 'Add some AmazingFeature'`)
6. **Push** vers la branche (`git push origin feature/AmazingFeature`)
7. Ouvrez une **Pull Request**

## Standards de code

- Suivez les principes de **Clean Architecture** decrits dans [.github/copilot-instructions.md](.github/copilot-instructions.md)
- Utilisez **TypeScript** avec des types stricts
- Respectez les **conventions de nommage** du projet
- Pas d'emojis dans les messages utilisateur, les logs ou les commentaires de code
- Testez vos modifications avant de soumettre

## Stack technique du projet

| Categorie | Technologie |
|-----------|-------------|
| Framework | React 19 + TypeScript 7 |
| UI | HeroUI v3 |
| Styling | Tailwind CSS v4 |
| State | Zustand 5 |
| Erreurs | Either monad (`@sweet-monads/either`) |
| Validation | Zod 4 |

## Conventions HeroUI v3

L'API HeroUI v3 est differente de v2. Points importants :

- `variant="primary"` au lieu de `color="primary"`
- `variant="outline"` au lieu de `variant="bordered"`
- Composants form : `InputGroup` + `InputGroup.Input` (pas de `Input` standalone avec label)
- `Card` utilise `CardHeader` + `CardContent` (plus de `CardBody`)
- `Pagination` est un composant compound (navigation uniquement, sans etat interne)
- Pas de `HeroUIProvider` requis en v3

## Reporting Bugs

Si vous trouvez un bug, veuillez ouvrir une issue avec :
- Une description claire du probleme
- Les etapes pour reproduire le bug
- Le comportement attendu
- Le comportement actuel
- Votre environnement (OS, Node version, etc.)

## Suggestions de features

Pour suggerer une nouvelle fonctionnalite :
- Ouvrez une issue avec le tag "enhancement"
- Decrivez clairement la fonctionnalite
- Expliquez pourquoi elle serait utile

Merci de contribuer !

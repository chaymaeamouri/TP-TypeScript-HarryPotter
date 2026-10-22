# TP TypeScript — Hogwarts Academy 🧙‍♂️✨

**Étudiante :** Chaymae Amouri — GI 5e année — Groupe A  
**Module :** TypeScript Avancé & Programmation Orientée Objet  
**Sujet :** Gestion de l'académie de Poudlard (Hogwarts Academy)

---

## 📋 Présentation du Projet

Ce projet met en pratique les concepts avancés du système de typage de **TypeScript** et de la programmation orientée objet :
- **Generics** : Référentiel générique réutilisable (`Repository<T>`).
- **Utility Types** : `Omit`, `Pick`, `Partial`, `Record`, `Extract`, `Exclude`, `Parameters`, `ReturnType`.
- **Indexed Access Types** : `Wizard["house"]`.
- **Conditional Types & Infer** : `SpellOutput<T>`, `ArrayElement<T>`.
- **Index Signatures** : Propriétés extensibles dynamiques sur `Wizard`.
- **Custom Type Guards** : Prédicats de type `isHouse(value)` et `isWizard(value)`.
- **Method Decorators** : `@Log`, `@MeasureTime`, `@ValidateSpellPower`, `@Cache`.

---

## 🚀 Installation & Exécution

### 1. Installation des dépendances
```bash
npm install
```

### 2. Exécution du projet en mode développement (avec tsx)
```bash
npm start
```

### 3. Vérification des types (sans émission)
```bash
npm run typecheck
```

### 4. Compilation vers JavaScript (`dist/`)
```bash
npm run build
```

---

## 🛠️ Détail des 6 Exercices (TAF)

### Exercice 1 — Ajouter un nouveau sorcier (`NewWizard` & auto-ID)
- **Objectif :** Permettre l'enregistrement d'un assistant sans que l'appelant ait à fournir un identifiant `id`.
- **Solution :** Utilisation de l'utility type `NewWizard = Omit<Wizard, "id">`. La méthode `register(wizardData: NewWizard): Wizard` dans `WizardRepository` attribue automatiquement un identifiant unique auto-incrémenté.

### Exercice 2 — Filtrer les sorciers par maison (`Wizard["house"]`)
- **Objectif :** Récupérer tous les sorciers appartenant à une maison spécifique.
- **Solution :** Utilisation d'un type à accès indexé `Wizard["house"]` qui contraint le paramètre de `findByHouse(house: Wizard["house"])` à l'union stricte `House` ("Gryffindor" | "Slytherin" | "Ravenclaw" | "Hufflepuff"), interdisant toute chaîne arbitraire.

### Exercice 3 — Événements de lancement de sorts (`Extract`)
- **Objectif :** Créer un gestionnaire d'événements n'acceptant que les événements de lancement de sorts à partir de l'union discriminée `AcademyEvent`.
- **Solution :** Définition de `SpellCastEvent = Extract<AcademyEvent, { type: "spell-cast" }>` et fonction `handleSpellCast(event: SpellCastEvent): void`.

### Exercice 4 — Validation de la puissance d'un sort (`@ValidateSpellPower`)
- **Objectif :** Rejeter un sort si sa puissance (`power`) est négative.
- **Solution :** Décorateur de méthode `@ValidateSpellPower` appliqué à la méthode `add` de `SpellRepository`. Lève une exception `Error("Spell power cannot be negative")` lorsque `candidate.power < 0`.

### Exercice 5 — Décorateur de mise en cache (`@Cache`)
- **Objectif :** Mettre en cache les résultats de calculs synchrones pour une même combinaison d'arguments afin d'éviter les recalculs coûteux.
- **Solution :** Décorateur `@Cache` utilisant une `WeakMap<object, Map<string, unknown>>` pour isoler le cache par instance d'objet. Testé sur la classe `SpellCalculator` avec la méthode `calculatePower(basePower, multiplier)`.

### Exercice 6 — Renforcer le Type Guard (`isHouse` & `isWizard`)
- **Objectif :** S'assurer que la maison d'un sorcier fait partie des 4 maisons officielles de Poudlard plutôt que d'accepter n'importe quelle chaîne.
- **Solution :**
  - Prédicat de type `isHouse(value: unknown): value is House` validant la présence dans `validHouses`.
  - Prédicat de type `isWizard(value: unknown): value is Wizard` vérifiant l'ensemble des types et validant la maison avec `isHouse`. Rejette ainsi avec succès une entrée avec une fausse maison (ex. `Durmstrang`).

---

## 🗂️ Structure du Projet

```
.
├── src/
│   ├── types.ts         # Déclarations des types, interfaces, utility & conditional types
│   ├── decorators.ts    # Décorateurs @Log, @MeasureTime, @ValidateSpellPower, @Cache
│   ├── repository.ts    # Repository<T>, WizardRepository, SpellRepository
│   └── main.ts          # Démonstration et tests des 6 exercices
├── dist/                # Fichiers JavaScript compilés
├── package.json         # Dépendances et scripts npm
├── tsconfig.json        # Configuration du compilateur TypeScript
└── README.md            # Documentation complète
```

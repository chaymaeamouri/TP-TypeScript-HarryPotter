import {
  type House,
  type Wizard,
  type Spell,
  type AcademyEvent,
  type SpellCastEvent,
  type NewWizard,
  type WizardSummary,
  type WizardUpdate,
  type HousePoints,
  type SpellOutput,
  type ArrayElement,
  type AttackSpell,
  type NonHealingCategory,
  type SpellCategory,
} from "./types";

import { WizardRepository, SpellRepository } from "./repository";
import { Log, Cache } from "./decorators";

// ============================================================================
// Exercice 6 — Renforcer le Type Guard
// ============================================================================

// Étape 1 : Liste immuable des maisons valides de Poudlard et Type Guard isHouse
const validHouses: readonly House[] = [
  "Gryffindor",
  "Slytherin",
  "Ravenclaw",
  "Hufflepuff",
];

export function isHouse(value: unknown): value is House {
  return (
    typeof value === "string" &&
    validHouses.some((house) => house === value)
  );
}

// Étape 2 : Type Guard isWizard utilisant isHouse pour interdire des maisons invalides (ex. Durmstrang)
export function isWizard(value: unknown): value is Wizard {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  const candidate = value as Record<string, unknown>;

  return (
    typeof candidate.id === "number" &&
    typeof candidate.name === "string" &&
    isHouse(candidate.house) &&
    typeof candidate.level === "number" &&
    typeof candidate.active === "boolean"
  );
}

// ============================================================================
// Exercice 3 — Gestionnaire d'événements de lancement de sorts (Extract)
// ============================================================================

export function handleSpellCast(event: SpellCastEvent): void {
  console.log(`Wizard ${event.wizardId} cast ${event.spellName}`);
}

// ============================================================================
// Exercice 5 — Service avec méthode mise en cache (@Cache)
// ============================================================================

export class SpellCalculator {
  @Cache
  calculatePower(basePower: number, multiplier: number): number {
    console.log("Calculating...");
    return basePower * multiplier;
  }
}

// ============================================================================
// Service d'Académie illustrant les fonctionnalités de haut niveau
// ============================================================================

export class AcademyService {
  constructor(
    public readonly wizards: WizardRepository,
    public readonly spells: SpellRepository
  ) {}

  @Log
  castSpell(wizardId: number, spellId: number): string {
    const wizard = this.wizards.findById(wizardId);
    const spell = this.spells.findById(spellId);

    if (!wizard || !spell) {
      throw new Error("Wizard or spell not found");
    }

    return `${wizard.name} casts ${spell.name}!`;
  }

  /**
   * Exercice 1 : Enregistrer un assistant à l'aide de NewWizard
   */
  registerWizard(newWizard: NewWizard): Wizard {
    return this.wizards.register(newWizard);
  }

  /**
   * Exercice 2 : Filtrer par maison à l'aide du service
   */
  findByHouse(house: House): WizardSummary[] {
    return this.wizards
      .findByHouse(house)
      .map(({ id, name, house }) => ({ id, name, house }));
  }

  updateWizard(id: number, changes: WizardUpdate): boolean {
    return this.wizards.update(id, changes);
  }

  getSpellEvents(events: AcademyEvent[]): SpellCastEvent[] {
    return events.filter(
      (event): event is SpellCastEvent => event.type === "spell-cast"
    );
  }
}

// ============================================================================
// EXÉCUTION DES TESTS ET DÉMONSTRATIONS DU TP
// ============================================================================

console.log("=================================================");
console.log(" TP TypeScript - Hogwarts Academy");
console.log(" Chaymae Amouri - GI 5e année - Groupe A");
console.log("=================================================\n");

// ----------------------------------------------------------------------------
// Exercice 1 — Ajouter un nouveau sorcier (NewWizard & auto-id)
// ----------------------------------------------------------------------------
console.log("--- Exercice 1 : Ajouter un nouveau sorcier (NewWizard) ---");

const wizardRepo = new WizardRepository();
const spellRepo = new SpellRepository();
const academy = new AcademyService(wizardRepo, spellRepo);

// Enregistrement sans ID fourni par l'appelant via NewWizard (Omit<Wizard, "id">)
const harry = wizardRepo.register({
  name: "Harry Potter",
  house: "Gryffindor",
  level: 5,
  active: true,
  patronus: "Stag",
});

const hermione = wizardRepo.register({
  name: "Hermione Granger",
  house: "Gryffindor",
  level: 8,
  active: true,
  patronus: "Otter",
});

const draco = wizardRepo.register({
  name: "Draco Malfoy",
  house: "Slytherin",
  level: 6,
  active: true,
});

const luna = wizardRepo.register({
  name: "Luna Lovegood",
  house: "Ravenclaw",
  level: 5,
  active: true,
});

console.log("Sorcier enregistré avec ID auto :", harry);
console.log("Tous les sorciers dans le repository :", wizardRepo.getAll());
console.log();

// ----------------------------------------------------------------------------
// Exercice 2 — Filtrer les sorciers par maison (Wizard["house"])
// ----------------------------------------------------------------------------
console.log("--- Exercice 2 : Filtrer les sorciers par maison ---");

const gryffindors = wizardRepo.findByHouse("Gryffindor");
console.log("Sorciers de Gryffindor (Repository) :", gryffindors);

const slytherins = academy.findByHouse("Slytherin");
console.log("Sorciers de Slytherin (Service) :", slytherins);
console.log();

// ----------------------------------------------------------------------------
// Exercice 3 — Événements de sorts avec Extract<AcademyEvent, { type: 'spell-cast' }>
// ----------------------------------------------------------------------------
console.log("--- Exercice 3 : Événements de lancement de sorts (Extract) ---");

// Test direct du gestionnaire d'événement (Slide 67)
handleSpellCast({
  type: "spell-cast",
  wizardId: 1,
  spellName: "Expelliarmus",
});

// Test avec une liste mixte d'événements de l'académie
const events: AcademyEvent[] = [
  { type: "spell-cast", wizardId: harry.id, spellName: "Expelliarmus" },
  { type: "level-up", wizardId: hermione.id, newLevel: 9 },
  { type: "spell-cast", wizardId: hermione.id, spellName: "Lumos" },
  { type: "wizard-expelled", wizardId: draco.id },
  { type: "house-cup", winner: "Gryffindor", year: 2026 },
];

const spellEvents = academy.getSpellEvents(events);
console.log(`Événements spell-cast extraits (${spellEvents.length}) :`, spellEvents);
console.log();

// ----------------------------------------------------------------------------
// Exercice 4 — Validation de la puissance d'un sort (@ValidateSpellPower)
// ----------------------------------------------------------------------------
console.log("--- Exercice 4 : Validation de la puissance d'un sort ---");

// Sort valide (Slide 70)
spellRepo.add({
  id: 101,
  name: "Expelliarmus",
  category: "attack",
  power: 80,
});

spellRepo.add({
  id: 102,
  name: "Protego",
  category: "defense",
  power: 50,
});
console.log("Sort valide 'Protego' (power 50) ajouté avec succès.");

// Sort non valide : puissance négative (Slide 70)
try {
  console.log("Tentative d'ajout d'un sort avec une puissance négative (-10)...");
  spellRepo.add({
    id: 103,
    name: "Invalid Spell",
    category: "attack",
    power: -10,
  });
} catch (error: unknown) {
  if (error instanceof Error) {
    console.log(`[SUCCÈS DE VALIDATION] Sort rejeté avec l'erreur : "${error.message}"`);
  }
}

console.log("Sorts enregistrés :", spellRepo.getAll());
console.log();

// ----------------------------------------------------------------------------
// Exercice 5 — Décorateur de méthode avec mise en cache (@Cache)
// ----------------------------------------------------------------------------
console.log("--- Exercice 5 : Décorateur de méthode avec mise en cache ---");

const calculator = new SpellCalculator();

console.log("1er appel (10, 3) :");
console.log("Résultat :", calculator.calculatePower(10, 3));

console.log("2e appel (10, 3) [doit être en cache] :");
console.log("Résultat :", calculator.calculatePower(10, 3));

console.log("3e appel (5, 2) [nouveaux arguments] :");
console.log("Résultat :", calculator.calculatePower(5, 2));
console.log();

// ----------------------------------------------------------------------------
// Exercice 6 — Renforcement du Type Guard (isHouse & isWizard)
// ----------------------------------------------------------------------------
console.log("--- Exercice 6 : Type Guards stricts ---");

console.log(`isHouse("Gryffindor") =`, isHouse("Gryffindor")); // true
console.log(`isHouse("Durmstrang") =`, isHouse("Durmstrang")); // false

const validData: unknown = {
  id: 1,
  name: "Harry Potter",
  house: "Gryffindor",
  level: 5,
  active: true,
};

const invalidData: unknown = {
  id: 2,
  name: "Viktor",
  house: "Durmstrang",
  level: 5,
  active: true,
};

console.log("isWizard(validData)   [Gryffindor] =", isWizard(validData));   // true
console.log("isWizard(invalidData) [Durmstrang] =", isWizard(invalidData)); // false

if (isWizard(validData)) {
  console.log(`Sorcier validé : ${validData.name} de la maison ${validData.house}`);
}
console.log();

// ----------------------------------------------------------------------------
// Démonstrations complémentaires (Generics, Utility Types, Conditional Types)
// ----------------------------------------------------------------------------
console.log("--- Démonstrations complémentaires (Generics & Types avancés) ---");

// Appel de castSpell avec décorateur @Log
console.log(academy.castSpell(harry.id, 101));

// Démonstration du Record Utility Type
const points: HousePoints = {
  Gryffindor: 150,
  Slytherin: 120,
  Ravenclaw: 130,
  Hufflepuff: 110,
};
console.log("House Points (Record<House, number>) :", points);

// Vérifications de types au niveau de la compilation
type CastArguments = Parameters<AcademyService["castSpell"]>;
type CastResult = ReturnType<AcademyService["castSpell"]>;
type AttackOutput = SpellOutput<"attack">; // number
type DefenseOutput = SpellOutput<"defense">; // boolean
type HealingOutput = SpellOutput<"healing">; // string
type SpellItem = ArrayElement<Spell[]>; // Spell
type AttackSpellExample = AttackSpell;
type RemainingCategories = NonHealingCategory;
type CategoryExample = SpellCategory;

const typeExamples: [
  CastArguments,
  CastResult,
  AttackOutput,
  DefenseOutput,
  HealingOutput,
  SpellItem,
  AttackSpellExample["category"],
  RemainingCategories,
  CategoryExample
] | null = null;
void typeExamples;

console.log("\n=================================================");
console.log(" Tous les exercices et tests ont été exécutés avec succès !");
console.log("=================================================");

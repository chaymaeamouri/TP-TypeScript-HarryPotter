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

export function handleSpellCast(event: SpellCastEvent): void {
  console.log(`Wizard ${event.wizardId} cast ${event.spellName}`);
}

export class SpellCalculator {
  @Cache
  calculatePower(basePower: number, multiplier: number): number {
    console.log("Calculating...");
    return basePower * multiplier;
  }
}

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

  registerWizard(newWizard: NewWizard): Wizard {
    return this.wizards.register(newWizard);
  }

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

console.log("=================================================");
console.log(" TP TypeScript - Hogwarts Academy");
console.log(" Chaymae Amouri - GI 5e année - Groupe A");
console.log("=================================================\n");

console.log("--- Exercice 1 : Ajouter un nouveau sorcier (NewWizard) ---");

const wizardRepo = new WizardRepository();
const spellRepo = new SpellRepository();
const academy = new AcademyService(wizardRepo, spellRepo);

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

console.log("--- Exercice 2 : Filtrer les sorciers par maison ---");

const gryffindors = wizardRepo.findByHouse("Gryffindor");
console.log("Sorciers de Gryffindor (Repository) :", gryffindors);

const slytherins = academy.findByHouse("Slytherin");
console.log("Sorciers de Slytherin (Service) :", slytherins);
console.log();

console.log("--- Exercice 3 : Événements de lancement de sorts (Extract) ---");

handleSpellCast({
  type: "spell-cast",
  wizardId: 1,
  spellName: "Expelliarmus",
});

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

console.log("--- Exercice 4 : Validation de la puissance d'un sort ---");

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

console.log("--- Exercice 5 : Décorateur de méthode avec mise en cache ---");

const calculator = new SpellCalculator();

console.log("1er appel (10, 3) :");
console.log("Résultat :", calculator.calculatePower(10, 3));

console.log("2e appel (10, 3) [doit être en cache] :");
console.log("Résultat :", calculator.calculatePower(10, 3));

console.log("3e appel (5, 2) [nouveaux arguments] :");
console.log("Résultat :", calculator.calculatePower(5, 2));
console.log();

console.log("--- Exercice 6 : Type Guards stricts ---");

console.log(`isHouse("Gryffindor") =`, isHouse("Gryffindor"));
console.log(`isHouse("Durmstrang") =`, isHouse("Durmstrang"));

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

console.log("isWizard(validData)   [Gryffindor] =", isWizard(validData));
console.log("isWizard(invalidData) [Durmstrang] =", isWizard(invalidData));

if (isWizard(validData)) {
  console.log(`Sorcier validé : ${validData.name} de la maison ${validData.house}`);
}
console.log();

console.log("--- Démonstrations complémentaires (Generics & Types avancés) ---");

console.log(academy.castSpell(harry.id, 101));

const points: HousePoints = {
  Gryffindor: 150,
  Slytherin: 120,
  Ravenclaw: 130,
  Hufflepuff: 110,
};
console.log("House Points (Record<House, number>) :", points);

type CastArguments = Parameters<AcademyService["castSpell"]>;
type CastResult = ReturnType<AcademyService["castSpell"]>;
type AttackOutput = SpellOutput<"attack">;
type DefenseOutput = SpellOutput<"defense">;
type HealingOutput = SpellOutput<"healing">;
type SpellItem = ArrayElement<Spell[]>;
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

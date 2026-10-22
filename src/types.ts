export type House =
  | "Gryffindor"
  | "Slytherin"
  | "Ravenclaw"
  | "Hufflepuff";

export interface Wizard {
  id: number;
  name: string;
  house: House;
  level: number;
  active: boolean;

  // Index signature : permet des propriétés dynamiques sécurisées
  [key: string]: string | number | boolean | undefined;
}

export type SpellCategory = "attack" | "defense" | "healing";

export interface Spell {
  id: number;
  name: string;
  category: SpellCategory;
  power: number;
}

export type AcademyEvent =
  | { type: "spell-cast"; wizardId: number; spellName: string; date?: string }
  | { type: "level-up"; wizardId: number; newLevel: number }
  | { type: "wizard-expelled"; wizardId: number }
  | { type: "house-cup"; winner: House; year?: number }
  | { type: "exam"; subject: string; date?: string };

// Type conditionnel : détermine le type de retour selon la catégorie de sort
export type SpellOutput<T extends SpellCategory> =
  T extends "attack" ? number :
  T extends "defense" ? boolean :
  T extends "healing" ? string :
  never;

// Infer extrait le type d'élément d'un tableau
export type ArrayElement<T> =
  T extends (infer Item)[] ? Item : never;

// --- Utility Types ---
// Exercice 1 : Omit supprime la propriété 'id' pour permettre l'enregistrement d'un nouveau sorcier
export type NewWizard = Omit<Wizard, "id">;

// Pick sélectionne un sous-ensemble de propriétés
export type WizardSummary = Pick<Wizard, "id" | "name" | "house">;

// Partial rend toutes les propriétés modifiables / facultatives
export type WizardUpdate = Partial<Wizard>;

// Extract pour cibler une sous-branche d'une union
export type AttackSpell = Extract<Spell, { category: "attack" }>;

// Exclude pour retirer une valeur d'une union
export type NonHealingCategory = Exclude<SpellCategory, "healing">;

// Record associe chaque maison à une valeur numérique
export type HousePoints = Record<House, number>;

// Exercice 3 : Extract pour isoler uniquement les événements de type 'spell-cast'
export type SpellCastEvent = Extract<AcademyEvent, { type: "spell-cast" }>;

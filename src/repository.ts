import type { Wizard, Spell, NewWizard } from "./types";
import { Log, MeasureTime, ValidateSpellPower } from "./decorators";

/**
 * Référentiel générique réutilisable pour toute entité possédant un id numérique.
 */
export class Repository<T extends { id: number }> {
  protected items: T[] = [];
  protected nextId: number = 1;

  @Log
  add(item: T): void {
    this.items.push(item);
    if (item.id >= this.nextId) {
      this.nextId = item.id + 1;
    }
  }

  @MeasureTime
  findById(id: number): T | undefined {
    return this.items.find((item) => item.id === id);
  }

  getAll(): T[] {
    return [...this.items];
  }

  // Alias compatible findAll()
  findAll(): T[] {
    return this.getAll();
  }

  update(id: number, changes: Partial<T>): boolean {
    const item = this.findById(id);
    if (!item) return false;
    Object.assign(item, changes);
    return true;
  }

  remove(id: number): boolean {
    const index = this.items.findIndex((item) => item.id === id);
    if (index !== -1) {
      this.items.splice(index, 1);
      return true;
    }
    return false;
  }
}

/**
 * Référentiel spécialisé pour les sorciers (Wizards).
 */
export class WizardRepository extends Repository<Wizard> {
  /**
   * Exercice 1 — Ajouter un nouveau sorcier
   * Enregistre un sorcier à l'aide de NewWizard (Omit<Wizard, "id">),
   * puis lui attribue un identifiant unique automatiquement.
   */
  register(wizardData: NewWizard): Wizard {
    const wizard: Wizard = {
      ...wizardData,
      id: this.nextId++,
    } as Wizard;
    super.add(wizard);
    return wizard;
  }

  // Surcharge de add pour accepter à la fois Wizard complet ou NewWizard
  override add(item: Wizard): void;
  override add(item: NewWizard): Wizard;
  override add(item: Wizard | NewWizard): Wizard | void {
    if ("id" in item && typeof item.id === "number") {
      super.add(item as Wizard);
      return;
    }
    return this.register(item as NewWizard);
  }

  /**
   * Exercice 2 — Filtrer les sorciers par maison
   * Utilise le type à accès indexé Wizard["house"] (équivalent à House).
   */
  findByHouse(house: Wizard["house"]): Wizard[] {
    return this.getAll().filter((wizard) => wizard.house === house);
  }
}

/**
 * Référentiel spécialisé pour les sorts (Spells).
 */
export class SpellRepository extends Repository<Spell> {
  /**
   * Exercice 4 — Validation de la puissance du sort à l'aide d'un décorateur
   * Refuse tout sort dont la puissance est négative.
   */
  @ValidateSpellPower
  override add(spell: Spell): void {
    super.add(spell);
  }

  /**
   * Méthode utilitaire pour enregistrer un sort sans id préalable
   */
  register(spellData: Omit<Spell, "id">): Spell {
    const spell: Spell = {
      ...spellData,
      id: this.nextId++,
    };
    this.add(spell);
    return spell;
  }
}

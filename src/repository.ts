import type { Wizard, Spell, NewWizard } from "./types";
import { Log, MeasureTime, ValidateSpellPower } from "./decorators";

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

export class WizardRepository extends Repository<Wizard> {
  register(wizardData: NewWizard): Wizard {
    const wizard: Wizard = {
      ...wizardData,
      id: this.nextId++,
    } as Wizard;
    super.add(wizard);
    return wizard;
  }

  override add(item: Wizard): void;
  override add(item: NewWizard): Wizard;
  override add(item: Wizard | NewWizard): Wizard | void {
    if ("id" in item && typeof item.id === "number") {
      super.add(item as Wizard);
      return;
    }
    return this.register(item as NewWizard);
  }

  findByHouse(house: Wizard["house"]): Wizard[] {
    return this.getAll().filter((wizard) => wizard.house === house);
  }
}

export class SpellRepository extends Repository<Spell> {
  @ValidateSpellPower
  override add(spell: Spell): void {
    super.add(spell);
  }

  register(spellData: Omit<Spell, "id">): Spell {
    const spell: Spell = {
      ...spellData,
      id: this.nextId++,
    };
    this.add(spell);
    return spell;
  }
}

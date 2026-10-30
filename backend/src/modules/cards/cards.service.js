import { NotFoundError, ValidationError } from '../../shared/errors.js';

/**
 * Regras de consulta das cartas.
 */
export class CardService {
  #repository;

  /** @param {{ findAll: () => Promise<readonly any[]> }} repository */
  constructor(repository) {
    this.#repository = repository;
  }

  /**
   * @param {{ category?: string }} [filters]
   */
  async list({ category } = {}) {
    const cards = await this.#repository.findAll();
    if (category === undefined) return cards;

    const categories = new Set(cards.map((card) => card.cat));
    if (!categories.has(category)) {
      throw new ValidationError(`Categoria inválida: "${category}". Use: ${[...categories].join(', ')}.`);
    }
    return cards.filter((card) => card.cat === category);
  }

  /** @param {string} id */
  async getById(id) {
    const cards = await this.#repository.findAll();
    const card = cards.find((candidate) => candidate.id === id);
    if (!card) throw new NotFoundError(`Carta "${id}" não encontrada.`);
    return card;
  }

  async summary() {
    const cards = await this.#repository.findAll();
    const byCategory = {};
    for (const card of cards) byCategory[card.cat] = (byCategory[card.cat] ?? 0) + 1;
    return { total: cards.length, byCategory };
  }
}

/**
 * @typedef {object} Card
 * @property {string} id
 * @property {'desafio' | 'pergunta' | 'penalidade'} cat
 * @property {string} tipo
 * @property {string} title
 * @property {string} desc
 * @property {string} pen
 * @property {string} [ans] Resposta (cartas de pergunta).
 * @property {string} [ex]  Exemplos opcionais.
 */

/**
 * Baralho imutável com as consultas de que o jogo precisa.
 * As consultas preservam a ordem original das cartas.
 */
export class Deck {
  /** @type {readonly Card[]} */
  #cards;
  /** @type {Map<string, Card>} */
  #cardsById;

  /** @param {readonly Card[]} cards */
  constructor(cards) {
    this.#cards = Object.freeze(cards.map((card) => Object.freeze({ ...card })));
    this.#cardsById = new Map(this.#cards.map((card) => [card.id, card]));
  }

  get cards() {
    return this.#cards;
  }

  get size() {
    return this.#cards.length;
  }

  /** @param {unknown} id */
  has(id) {
    return this.#cardsById.has(/** @type {string} */ (id));
  }

  /**
   * @param {string | null} id
   * @returns {Card | null}
   */
  findById(id) {
    return this.#cardsById.get(/** @type {string} */ (id)) ?? null;
  }

  /** @param {string} category */
  countByCategory(category) {
    return this.#cards.filter((card) => card.cat === category).length;
  }

  /**
   * Cartas cujas categorias estão habilitadas nas configurações.
   * @param {Record<string, unknown>} settings
   */
  enabledCards(settings) {
    return this.#cards.filter((card) => settings[card.cat]);
  }

  /**
   * Cartas habilitadas que ainda não saíram na partida.
   * @param {Record<string, unknown>} settings
   * @param {readonly string[]} usedIds
   */
  remainingCards(settings, usedIds) {
    return this.enabledCards(settings).filter((card) => !usedIds.includes(card.id));
  }

  /**
   * Cartas habilitadas que já saíram na partida.
   * @param {Record<string, unknown>} settings
   * @param {readonly string[]} usedIds
   */
  usedEnabledCards(settings, usedIds) {
    return this.enabledCards(settings).filter((card) => usedIds.includes(card.id));
  }
}

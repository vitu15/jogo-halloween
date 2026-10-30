import { createInitialState, restoreState } from '../domain/gameState.js';
import { pickRandom } from '../shared/utils/array.js';

/**
 * @typedef {import('../domain/Deck.js').Deck} Deck
 * @typedef {import('../domain/Deck.js').Card} Card
 * @typedef {import('../domain/gameState.js').GameState} GameState
 * @typedef {import('../domain/gameState.js').Settings} Settings
 *
 * @typedef {object} GameRepository
 * @property {() => unknown} load
 * @property {(state: GameState) => void} save
 */

export const DrawOutcome = Object.freeze({
  NO_CATEGORY_ENABLED: 'no-category-enabled',
  DECK_EMPTY: 'deck-empty',
  CARD_PICKED: 'card-picked',
});

/**
 * Casos de uso de uma partida. Não conhece DOM, áudio ou animação:
 * apenas regras do jogo e persistência do estado.
 */
export class GameSession {
  #deck;
  #repository;
  #random;
  /** @type {GameState} */
  #state = createInitialState();

  /**
   * @param {{ deck: Deck, repository: GameRepository, random?: () => number }} deps
   */
  constructor({ deck, repository, random = Math.random }) {
    this.#deck = deck;
    this.#repository = repository;
    this.#random = random;
  }

  get deck() {
    return this.#deck;
  }

  /** @returns {Readonly<Settings>} */
  get settings() {
    return this.#state.settings;
  }

  get currentCard() {
    return this.#deck.findById(this.#state.current);
  }

  restore() {
    this.#state = restoreState(this.#repository.load(), (id) => this.#deck.has(id));
  }

  enabledCards() {
    return this.#deck.enabledCards(this.#state.settings);
  }

  remainingCards() {
    return this.#deck.remainingCards(this.#state.settings, this.#state.used);
  }

  progress() {
    const enabled = this.enabledCards().length;
    const used = this.#deck.usedEnabledCards(this.#state.settings, this.#state.used).length;
    return { enabled, used, remaining: enabled - used, total: this.#deck.size };
  }

  /** Há uma partida em andamento que pode ser retomada. */
  canResume() {
    const { started, used } = this.#state;
    return started && used.length > 0 && this.remainingCards().length > 0;
  }

  /** @param {Card} card */
  isCardDone(card) {
    return this.#state.done.includes(card.id);
  }

  /**
   * Sorteia a próxima carta sem alterar o estado. Use `commitDraw` para efetivá-la.
   * @returns {{ outcome: string, card?: Card }}
   */
  prepareDraw() {
    if (!this.enabledCards().length) return { outcome: DrawOutcome.NO_CATEGORY_ENABLED };
    const pool = this.remainingCards();
    if (!pool.length) return { outcome: DrawOutcome.DECK_EMPTY };
    return { outcome: DrawOutcome.CARD_PICKED, card: pickRandom(pool, this.#random) };
  }

  /** @param {Card} card */
  commitDraw(card) {
    this.#state.current = card.id;
    this.#state.used.push(card.id);
    this.#state.started = true;
    this.#save();
  }

  /**
   * Alterna a marcação "cumprida" da carta atual.
   * @returns {boolean | null} Novo estado da marcação, ou `null` se não há carta atual.
   */
  toggleCurrentDone() {
    const card = this.currentCard;
    if (!card) return null;
    const index = this.#state.done.indexOf(card.id);
    if (index < 0) this.#state.done.push(card.id);
    else this.#state.done.splice(index, 1);
    this.#save();
    return index < 0;
  }

  /** Descarta a carta atual; ela continua contando como usada. */
  discardCurrent() {
    this.#state.current = null;
    this.#save();
  }

  /**
   * Encerra a partida e devolve as estatísticas das categorias habilitadas.
   * @returns {{ used: number, done: number }}
   */
  finish() {
    const { settings, done } = this.#state;
    const stats = {
      used: this.progress().used,
      done: done.filter((id) => {
        const card = this.#deck.findById(id);
        return card && settings[card.cat];
      }).length,
    };
    this.#state.current = null;
    this.#save();
    return stats;
  }

  newGame() {
    Object.assign(this.#state, { used: [], done: [], current: null, started: true });
    this.#save();
  }

  /**
   * Habilita/desabilita uma categoria. Recusa a mudança se nenhuma carta
   * ficaria habilitada.
   * @param {string} category
   * @param {boolean} enabled
   * @returns {boolean} `true` se a mudança foi aplicada.
   */
  setCategoryEnabled(category, enabled) {
    const { settings } = this.#state;
    settings[category] = enabled;
    if (!this.enabledCards().length) {
      settings[category] = true;
      return false;
    }
    this.#save();
    return true;
  }

  /**
   * @template {keyof Settings} K
   * @param {K} key
   * @param {Settings[K]} value
   */
  updateSetting(key, value) {
    this.#state.settings[key] = value;
    this.#save();
  }

  #save() {
    this.#repository.save(this.#state);
  }
}

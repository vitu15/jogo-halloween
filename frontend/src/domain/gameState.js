/**
 * @typedef {'soft' | 'normal' | 'intense'} VisualIntensity
 *
 * @typedef {object} Settings
 * @property {boolean} desafio
 * @property {boolean} pergunta
 * @property {boolean} penalidade
 * @property {boolean} sound
 * @property {boolean} music
 * @property {number} vol      Volume da música, de 0 a 100.
 * @property {boolean} anim
 * @property {VisualIntensity} int
 *
 * @typedef {object} GameState
 * @property {Settings} settings
 * @property {string[]} used   IDs das cartas já puxadas na partida.
 * @property {string[]} done   IDs das cartas marcadas como cumpridas.
 * @property {string | null} current
 * @property {boolean} started
 */

/** @type {Readonly<Settings>} */
export const DEFAULT_SETTINGS = Object.freeze({
  desafio: true,
  pergunta: true,
  penalidade: true,
  sound: true,
  music: true,
  vol: 50,
  anim: true,
  int: 'normal',
});

/** @returns {GameState} */
export function createInitialState() {
  return {
    settings: { ...DEFAULT_SETTINGS },
    used: [],
    done: [],
    current: null,
    started: false,
  };
}

/**
 * Reconstrói o estado a partir de um snapshot salvo, descartando IDs de cartas
 * que não existem mais. Snapshots inválidos resultam no estado inicial.
 *
 * @param {unknown} snapshot
 * @param {(id: unknown) => boolean} isValidCardId
 * @returns {GameState}
 */
export function restoreState(snapshot, isValidCardId) {
  const state = createInitialState();
  if (!snapshot || typeof snapshot !== 'object') return state;

  const saved = /** @type {Partial<GameState>} */ (snapshot);
  state.settings = Object.assign({}, DEFAULT_SETTINGS, saved.settings || {});
  state.used = Array.isArray(saved.used) ? saved.used.filter(isValidCardId) : [];
  state.done = Array.isArray(saved.done) ? saved.done.filter(isValidCardId) : [];
  state.current = isValidCardId(saved.current) ? /** @type {string} */ (saved.current) : null;
  state.started = Boolean(saved.started);
  return state;
}

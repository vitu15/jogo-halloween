export const STORAGE_KEY = 'maldicao_v1';

/**
 * Persiste o estado da partida no localStorage. Quando o armazenamento não está
 * disponível (modo privado, cota esgotada), mantém o último estado em memória.
 */
export class LocalStorageGameRepository {
  #storage;
  #key;
  /** @type {string | null} */
  #memoryFallback = null;

  /**
   * @param {{ storage?: Storage | null, key?: string }} [options]
   */
  constructor({ storage = safeLocalStorage(), key = STORAGE_KEY } = {}) {
    this.#storage = storage;
    this.#key = key;
  }

  /** @returns {unknown} O snapshot salvo, ou `null` se não houver um válido. */
  load() {
    let raw = null;
    try {
      raw = this.#storage.getItem(this.#key);
    } catch {
      // Armazenamento indisponível: cai no fallback em memória.
    }
    if (!raw && this.#memoryFallback) raw = this.#memoryFallback;
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  }

  /** @param {unknown} state */
  save(state) {
    const serialized = JSON.stringify(state);
    try {
      this.#storage.setItem(this.#key, serialized);
    } catch {
      this.#memoryFallback = serialized;
    }
  }
}

function safeLocalStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

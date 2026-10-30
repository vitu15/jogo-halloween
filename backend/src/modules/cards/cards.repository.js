import { readFile } from 'node:fs/promises';

/**
 * Fonte de dados das cartas: o mesmo JSON usado pelo frontend.
 */
export class JsonCardRepository {
  #filePath;
  /** @type {Promise<readonly object[]> | null} */
  #cache = null;

  /** @param {string} filePath */
  constructor(filePath) {
    this.#filePath = filePath;
  }

  /** @returns {Promise<readonly object[]>} */
  findAll() {
    this.#cache ??= readFile(this.#filePath, 'utf8').then((raw) => Object.freeze(JSON.parse(raw)));
    return this.#cache;
  }
}

/**
 * Repositório em memória, útil para testes.
 */
export class InMemoryCardRepository {
  #cards;

  /** @param {readonly object[]} cards */
  constructor(cards) {
    this.#cards = Object.freeze([...cards]);
  }

  async findAll() {
    return this.#cards;
  }
}

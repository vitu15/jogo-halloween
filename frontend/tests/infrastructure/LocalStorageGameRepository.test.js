import { describe, expect, it } from 'vitest';

import {
  LocalStorageGameRepository,
  STORAGE_KEY,
} from '../../src/infrastructure/storage/LocalStorageGameRepository.js';

function fakeStorage() {
  const data = new Map();
  return {
    getItem: (key) => data.get(key) ?? null,
    setItem: (key, value) => data.set(key, value),
    data,
  };
}

const brokenStorage = {
  getItem() {
    throw new Error('indisponível');
  },
  setItem() {
    throw new Error('indisponível');
  },
};

describe('LocalStorageGameRepository', () => {
  it('mantém a mesma chave do jogo original (compatível com partidas salvas)', () => {
    expect(STORAGE_KEY).toBe('maldicao_v1');
  });

  it('salva e carrega o estado em JSON', () => {
    const storage = fakeStorage();
    const repository = new LocalStorageGameRepository({ storage });
    repository.save({ used: ['1'] });
    expect(JSON.parse(storage.data.get(STORAGE_KEY))).toEqual({ used: ['1'] });
    expect(repository.load()).toEqual({ used: ['1'] });
  });

  it('retorna null sem dados ou com JSON inválido', () => {
    const storage = fakeStorage();
    const repository = new LocalStorageGameRepository({ storage });
    expect(repository.load()).toBeNull();
    storage.setItem(STORAGE_KEY, '{quebrado');
    expect(repository.load()).toBeNull();
  });

  it('usa memória quando o localStorage falha', () => {
    const repository = new LocalStorageGameRepository({ storage: brokenStorage });
    repository.save({ started: true });
    expect(repository.load()).toEqual({ started: true });
  });
});

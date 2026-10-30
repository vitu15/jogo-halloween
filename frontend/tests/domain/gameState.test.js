import { describe, expect, it } from 'vitest';

import { DEFAULT_SETTINGS, createInitialState, restoreState } from '../../src/domain/gameState.js';

const isValid = (id) => ['A', 'B'].includes(id);

describe('restoreState', () => {
  it('usa o estado inicial quando não há snapshot', () => {
    expect(restoreState(null, isValid)).toEqual(createInitialState());
  });

  it('usa o estado inicial para snapshots que não são objetos', () => {
    expect(restoreState(42, isValid)).toEqual(createInitialState());
    expect(restoreState('texto', isValid)).toEqual(createInitialState());
  });

  it('mescla configurações salvas com os padrões', () => {
    const state = restoreState({ settings: { sound: false } }, isValid);
    expect(state.settings).toEqual({ ...DEFAULT_SETTINGS, sound: false });
  });

  it('descarta ids de cartas que não existem mais', () => {
    const state = restoreState({ used: ['A', 'X'], done: ['B', 'Y'], current: 'X', started: 1 }, isValid);
    expect(state.used).toEqual(['A']);
    expect(state.done).toEqual(['B']);
    expect(state.current).toBeNull();
    expect(state.started).toBe(true);
  });

  it('ignora listas malformadas', () => {
    const state = restoreState({ used: 'A', done: {} }, isValid);
    expect(state.used).toEqual([]);
    expect(state.done).toEqual([]);
  });

  it('cria estados iniciais independentes', () => {
    const a = createInitialState();
    a.settings.sound = false;
    expect(createInitialState().settings.sound).toBe(true);
  });
});

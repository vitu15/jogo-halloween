import { describe, expect, it } from 'vitest';

import { DEFAULT_SETTINGS } from '../../src/domain/gameState.js';
import { sampleDeck } from '../helpers/fixtures.js';

describe('Deck', () => {
  const deck = sampleDeck();

  it('encontra cartas por id', () => {
    expect(deck.findById('Q1')?.title).toBe('PERGUNTA UM');
    expect(deck.findById('inexistente')).toBeNull();
    expect(deck.findById(null)).toBeNull();
  });

  it('valida ids sem conversão de tipo', () => {
    expect(deck.has('D1')).toBe(true);
    expect(deck.has(1)).toBe(false);
    expect(deck.has(undefined)).toBe(false);
  });

  it('conta cartas por categoria', () => {
    expect(deck.countByCategory('desafio')).toBe(2);
    expect(deck.countByCategory('pergunta')).toBe(1);
  });

  it('filtra cartas pelas categorias habilitadas, mantendo a ordem', () => {
    const settings = { ...DEFAULT_SETTINGS, pergunta: false };
    expect(deck.enabledCards(settings).map((c) => c.id)).toEqual(['D1', 'P1', 'D2']);
  });

  it('separa cartas restantes e usadas entre as habilitadas', () => {
    const settings = { ...DEFAULT_SETTINGS, penalidade: false };
    const used = ['D1', 'P1'];
    expect(deck.remainingCards(settings, used).map((c) => c.id)).toEqual(['Q1', 'D2']);
    expect(deck.usedEnabledCards(settings, used).map((c) => c.id)).toEqual(['D1']);
  });

  it('é imutável', () => {
    expect(Object.isFrozen(deck.cards)).toBe(true);
    expect(Object.isFrozen(deck.cards[0])).toBe(true);
  });
});

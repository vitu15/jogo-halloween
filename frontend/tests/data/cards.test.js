import { describe, expect, it } from 'vitest';

import cards from '@shared/data/cards.json';

import { CATEGORY_KEYS } from '../../src/domain/categories.js';

describe('baralho oficial', () => {
  it('tem as 53 cartas do jogo', () => {
    expect(cards).toHaveLength(53);
  });

  it('tem ids únicos', () => {
    expect(new Set(cards.map((card) => card.id)).size).toBe(cards.length);
  });

  it.each(cards)('carta $id tem os campos obrigatórios', (card) => {
    expect(CATEGORY_KEYS).toContain(card.cat);
    for (const field of ['id', 'tipo', 'title', 'desc', 'pen']) {
      expect(typeof card[field]).toBe('string');
      expect(card[field].length).toBeGreaterThan(0);
    }
  });
});

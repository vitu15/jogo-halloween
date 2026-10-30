import { Deck } from '../../src/domain/Deck.js';

export const SAMPLE_CARDS = Object.freeze([
  {
    id: 'D1',
    cat: 'desafio',
    tipo: 'Desafio individual',
    title: 'DESAFIO UM',
    desc: 'Faça algo.',
    pen: 'Tome 1 shot.',
  },
  {
    id: 'Q1',
    cat: 'pergunta',
    tipo: 'Pergunta individual',
    title: 'PERGUNTA UM',
    desc: 'Quanto é 1+1?',
    ans: '2.',
    pen: 'Tome 1 shot.',
  },
  {
    id: 'P1',
    cat: 'penalidade',
    tipo: 'Penalidade de rodada',
    title: 'REGRA UM',
    desc: 'Não fale.',
    pen: 'Tome 1 shot.',
  },
  {
    id: 'D2',
    cat: 'desafio',
    tipo: 'Desafio coletivo',
    title: 'DESAFIO DOIS',
    desc: 'Todos juntos.',
    pen: 'Tome 1 shot.',
  },
]);

export function sampleDeck() {
  return new Deck(SAMPLE_CARDS);
}

export class InMemoryGameRepository {
  /** @param {unknown} [initial] */
  constructor(initial = null) {
    this.snapshot = initial;
    this.saves = 0;
  }

  load() {
    return this.snapshot;
  }

  save(state) {
    this.snapshot = JSON.parse(JSON.stringify(state));
    this.saves++;
  }
}

/** Gerador pseudoaleatório determinístico. */
export function seededRandom(seed = 1) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return (value - 1) / 2147483646;
  };
}

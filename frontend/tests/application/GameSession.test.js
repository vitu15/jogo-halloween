import { beforeEach, describe, expect, it } from 'vitest';

import { DrawOutcome, GameSession } from '../../src/application/GameSession.js';
import { InMemoryGameRepository, sampleDeck, seededRandom } from '../helpers/fixtures.js';

/** Puxa e efetiva uma carta. */
function drawCard(session) {
  const { outcome, card } = session.prepareDraw();
  expect(outcome).toBe(DrawOutcome.CARD_PICKED);
  session.commitDraw(card);
  return card;
}

describe('GameSession', () => {
  let repository;
  let session;

  beforeEach(() => {
    repository = new InMemoryGameRepository();
    session = new GameSession({ deck: sampleDeck(), repository, random: seededRandom(7) });
    session.restore();
  });

  it('não repete cartas até o baralho acabar', () => {
    const drawn = [drawCard(session), drawCard(session), drawCard(session), drawCard(session)].map((c) => c.id);
    expect(new Set(drawn).size).toBe(4);
    expect(session.prepareDraw().outcome).toBe(DrawOutcome.DECK_EMPTY);
  });

  it('prepareDraw não altera o estado', () => {
    session.prepareDraw();
    expect(session.progress().used).toBe(0);
    expect(repository.saves).toBe(0);
  });

  it('commitDraw define a carta atual, marca como usada e persiste', () => {
    const card = drawCard(session);
    expect(session.currentCard).toBe(card);
    expect(session.progress()).toEqual({ enabled: 4, used: 1, remaining: 3, total: 4 });
    expect(repository.snapshot.used).toEqual([card.id]);
    expect(repository.snapshot.started).toBe(true);
  });

  it('sorteia apenas cartas de categorias habilitadas', () => {
    session.setCategoryEnabled('desafio', false);
    session.setCategoryEnabled('penalidade', false);
    expect(drawCard(session).id).toBe('Q1');
    expect(session.prepareDraw().outcome).toBe(DrawOutcome.DECK_EMPTY);
  });

  it('não permite desabilitar todas as categorias', () => {
    expect(session.setCategoryEnabled('desafio', false)).toBe(true);
    expect(session.setCategoryEnabled('pergunta', false)).toBe(true);
    expect(session.setCategoryEnabled('penalidade', false)).toBe(false);
    expect(session.settings.penalidade).toBe(true);
  });

  it('alterna a marcação de cumprida da carta atual', () => {
    expect(session.toggleCurrentDone()).toBeNull();
    const card = drawCard(session);
    expect(session.toggleCurrentDone()).toBe(true);
    expect(session.isCardDone(card)).toBe(true);
    expect(session.toggleCurrentDone()).toBe(false);
    expect(session.isCardDone(card)).toBe(false);
  });

  it('pular descarta a carta atual, que continua contando como usada', () => {
    drawCard(session);
    session.discardCurrent();
    expect(session.currentCard).toBeNull();
    expect(session.progress().used).toBe(1);
  });

  it('finish conta apenas cartas de categorias habilitadas', () => {
    while (session.prepareDraw().outcome === DrawOutcome.CARD_PICKED) {
      drawCard(session);
      session.toggleCurrentDone();
    }
    session.setCategoryEnabled('pergunta', false);
    expect(session.finish()).toEqual({ used: 3, done: 3 });
    expect(session.currentCard).toBeNull();
  });

  it('canResume exige partida iniciada com cartas usadas e restantes', () => {
    expect(session.canResume()).toBe(false);
    drawCard(session);
    expect(session.canResume()).toBe(true);
    session.newGame();
    expect(session.canResume()).toBe(false);
  });

  it('newGame zera o progresso e mantém as configurações', () => {
    session.updateSetting('sound', false);
    drawCard(session);
    session.toggleCurrentDone();
    session.newGame();
    expect(session.progress().used).toBe(0);
    expect(session.currentCard).toBeNull();
    expect(session.settings.sound).toBe(false);
    expect(repository.snapshot).toMatchObject({ used: [], done: [], current: null, started: true });
  });

  it('restaura a partida salva', () => {
    const card = drawCard(session);
    const restored = new GameSession({ deck: sampleDeck(), repository });
    restored.restore();
    expect(restored.currentCard?.id).toBe(card.id);
    expect(restored.progress().used).toBe(1);
  });

  it('informa quando não há categoria habilitada', () => {
    const repo = new InMemoryGameRepository({ settings: { desafio: false, pergunta: false, penalidade: false } });
    const empty = new GameSession({ deck: sampleDeck(), repository: repo });
    empty.restore();
    expect(empty.prepareDraw().outcome).toBe(DrawOutcome.NO_CATEGORY_ENABLED);
  });
});

import { DrawOutcome } from '../../application/GameSession.js';
import { isRoundPenalty } from '../../domain/categories.js';
import { vibrate } from '../../infrastructure/device/haptics.js';
import { byId } from '../dom.js';
import { Modal } from '../components/ModalManager.js';
import { Screen } from '../components/ScreenNavigator.js';
import { categoryTheme } from '../theme/categoryTheme.js';

/** Tempo para a carta virada voltar ao verso antes da próxima. */
const UNFLIP_DELAY_MS = 330;
/** Bloqueio de cliques enquanto a carta termina de virar. */
const FLIP_LOCK_MS = 420;
/** Espera antes da tela final quando a última carta é pulada. */
const FINISH_AFTER_SKIP_MS = 500;

const RESTART_CONFIRMATION = Object.freeze({
  title: 'Reiniciar partida?',
  text: 'O progresso da partida atual será apagado e o baralho será embaralhado de novo.',
  confirmLabel: 'Reiniciar',
});

/**
 * Fluxo da partida: início, sorteio, pular, marcar como cumprida e fim.
 */
export class GameController {
  #session;
  #views;
  #ui;
  #sfx;
  #motion;
  #busy = false;

  /**
   * @param {{
   *   session: import('../../application/GameSession.js').GameSession,
   *   views: {
   *     home: import('../views/HomeView.js').HomeView,
   *     game: import('../views/GameView.js').GameView,
   *     end: import('../views/EndView.js').EndView,
   *   },
   *   ui: {
   *     screens: import('../components/ScreenNavigator.js').ScreenNavigator,
   *     modals: import('../components/ModalManager.js').ModalManager,
   *     confirm: import('../components/ConfirmDialog.js').ConfirmDialog,
   *     toast: import('../components/Toast.js').Toast,
   *   },
   *   sfx: import('../../infrastructure/audio/SoundEffects.js').SoundEffects,
   *   motion: import('../MotionPolicy.js').MotionPolicy,
   * }} deps
   */
  constructor({ session, views, ui, sfx, motion }) {
    this.#session = session;
    this.#views = views;
    this.#ui = ui;
    this.#sfx = sfx;
    this.#motion = motion;
  }

  bindEvents() {
    byId('btn-start').addEventListener('click', () => this.#start());
    byId('btn-rules-home').addEventListener('click', () => this.#ui.modals.open(Modal.RULES));
    byId('btn-rules').addEventListener('click', () => this.#ui.modals.open(Modal.RULES));
    byId('btn-restart').addEventListener('click', () => this.#confirmRestart());
    byId('btn-draw').addEventListener('click', () => this.#draw());
    byId('btn-ans').addEventListener('click', () => this.#toggleAnswer());
    byId('btn-done').addEventListener('click', () => this.#toggleDone());
    byId('btn-skip').addEventListener('click', () => this.#confirmSkip());
    byId('btn-again').addEventListener('click', () => this.#newGame());
    byId('btn-end-home').addEventListener('click', () => {
      this.#newGame({ keepScreen: true });
      this.#ui.screens.show(Screen.HOME);
    });
  }

  renderProgress() {
    this.#views.game.renderProgress(this.#session.progress());
    this.#views.home.renderTotal(this.#session.deck.size);
  }

  /** Reinicia a partida a partir do modal de configurações. */
  confirmRestartFromSettings() {
    this.#ui.confirm.ask({
      ...RESTART_CONFIRMATION,
      onConfirm: () => {
        this.#ui.modals.close(Modal.SETTINGS);
        this.#newGame({ keepScreen: true });
        this.#ui.screens.show(Screen.GAME);
        this.#ui.toast.show('Baralho embaralhado');
      },
    });
  }

  #start() {
    this.#sfx.tap();
    if (!this.#session.canResume()) {
      this.#newGame();
      return;
    }
    this.#ui.screens.show(Screen.GAME);
    this.renderProgress();
    const card = this.#session.currentCard;
    if (card) {
      this.#showCard(card);
      this.#views.game.flip();
    } else {
      this.#views.game.renderCard(null);
    }
  }

  #draw() {
    if (this.#busy) return;
    const { outcome, card } = this.#session.prepareDraw();
    if (outcome === DrawOutcome.NO_CATEGORY_ENABLED) {
      this.#ui.toast.show('Ative ao menos uma categoria');
      this.#ui.modals.open(Modal.SETTINGS);
      return;
    }
    if (outcome === DrawOutcome.DECK_EMPTY) {
      this.#finish();
      return;
    }

    this.#busy = true;
    const wasFlipped = this.#views.game.isFlipped();
    if (wasFlipped) {
      this.#views.game.unflip();
      this.#sfx.tap();
    }
    const delay = this.#motion.isEnabled() && wasFlipped ? UNFLIP_DELAY_MS : 0;
    setTimeout(() => this.#revealDrawnCard(card, { isFirstDraw: !wasFlipped }), delay);
  }

  /**
   * @param {import('../../domain/Deck.js').Card} card
   * @param {{ isFirstDraw: boolean }} options
   */
  #revealDrawnCard(card, { isFirstDraw }) {
    this.#session.commitDraw(card);
    this.#showCard(card);
    this.renderProgress();

    const reveal = () =>
      requestAnimationFrame(() => {
        this.#views.game.flip();
        this.#sfx.flip();
        vibrate(20);
        this.#views.game.scrollCardBodyToTop();
        if (isRoundPenalty(card)) this.#playCurse();
        setTimeout(
          () => {
            this.#busy = false;
          },
          this.#motion.isEnabled() ? FLIP_LOCK_MS : 0,
        );
      });

    if (this.#motion.isEnabled() && isFirstDraw) {
      this.#views.game.playShuffle(reveal);
      this.#sfx.shuffle();
      vibrate([15, 30, 15]);
    } else {
      reveal();
    }
  }

  #playCurse() {
    this.#sfx.curse();
    vibrate([60, 40, 90]);
    if (this.#motion.isEnabled()) this.#views.game.playCurse();
  }

  #toggleAnswer() {
    if (this.#views.game.toggleAnswer()) {
      this.#sfx.tap();
      vibrate(15);
    }
  }

  #toggleDone() {
    const card = this.#session.currentCard;
    if (!card) return;
    const isDone = this.#session.toggleCurrentDone();
    if (isDone) {
      this.#sfx.done();
      vibrate([30, 40, 30]);
      if (this.#motion.isEnabled()) {
        this.#views.game.burstSparks(categoryTheme(card.cat).accentColor, this.#session.settings.int);
      }
    }
    this.#views.game.renderDone(isDone);
  }

  #confirmSkip() {
    if (this.#busy) return;
    this.#ui.confirm.ask({
      title: 'Pular esta carta?',
      text: 'Ela será descartada e contará como usada nesta partida.',
      confirmLabel: 'Pular',
      onConfirm: () => {
        this.#session.discardCurrent();
        this.#views.game.unflip();
        this.#views.game.renderCard(null);
        if (!this.#session.remainingCards().length) {
          setTimeout(() => this.#finish(), this.#motion.isEnabled() ? FINISH_AFTER_SKIP_MS : 0);
        }
      },
    });
  }

  #confirmRestart() {
    this.#ui.confirm.ask({
      ...RESTART_CONFIRMATION,
      onConfirm: () => {
        this.#newGame({ keepScreen: true });
        this.#ui.toast.show('Baralho embaralhado');
      },
    });
  }

  #finish() {
    this.#views.end.renderStats(this.#session.finish());
    this.#ui.screens.show(Screen.END);
  }

  /** @param {{ keepScreen?: boolean }} [options] */
  #newGame({ keepScreen = false } = {}) {
    this.#session.newGame();
    this.#views.game.unflip();
    this.#views.game.renderCard(null);
    this.renderProgress();
    this.#busy = false;
    if (!keepScreen) this.#ui.screens.show(Screen.GAME);
  }

  /** @param {import('../../domain/Deck.js').Card} card */
  #showCard(card) {
    this.#views.game.renderCard(card);
    this.#views.game.renderDone(this.#session.isCardDone(card));
  }
}

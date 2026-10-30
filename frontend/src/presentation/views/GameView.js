import { CARD_BACK_SVG } from '../assets/icons.js';
import { byId } from '../dom.js';
import { renderCardFront } from '../templates/cardTemplate.js';
import { categoryTheme } from '../theme/categoryTheme.js';

const SHUFFLE_ANIMATION_MS = 520;
const CURSE_ANIMATION_MS = 650;
const SPARK_LIFETIME_MS = 950;
const SPARKS_BY_INTENSITY = Object.freeze({ soft: 8, normal: 16, intense: 30 });

/** Tela de jogo: carta, contador, botões e efeitos visuais. */
export class GameView {
  #card = byId('card');
  #stage = byId('stage');
  #flash = byId('flash');
  #drawButton = byId('btn-draw');
  #secondaryRow = byId('sec-row');
  #answerButton = byId('btn-ans');
  #doneButton = byId('btn-done');

  renderCardBack() {
    byId('card-back').innerHTML = CARD_BACK_SVG;
  }

  /**
   * Mostra a carta (ou estado vazio, se `null`). Reinicia as classes da carta.
   * @param {import('../../domain/Deck.js').Card | null} card
   */
  renderCard(card) {
    this.#card.className = `card ${card ? categoryTheme(card.cat).cssClass : ''}`;
    this.#drawButton.textContent = card ? 'Próxima carta' : 'Puxar carta';
    this.#secondaryRow.classList.toggle('on', Boolean(card));
    if (!card) return;

    byId('card-front').innerHTML = renderCardFront(card);
    this.#answerButton.style.display = card.ans ? '' : 'none';
    this.#answerButton.textContent = 'Revelar resposta';
  }

  /** @param {boolean} isDone */
  renderDone(isDone) {
    this.#card.classList.toggle('done', isDone);
    this.#doneButton.textContent = isDone ? 'Cumprida ✓' : 'Marcar como cumprida';
    this.#doneButton.classList.toggle('ok', isDone);
  }

  /** @param {{ enabled: number, used: number, remaining: number, total: number }} progress */
  renderProgress({ enabled, used, remaining, total }) {
    byId('c-big').textContent = `Usadas ${used} · Restantes ${remaining}`;
    byId('c-small').textContent =
      `${enabled}${enabled === 1 ? ' carta habilitada' : ' cartas habilitadas'} de ${total}`;
    byId('c-bar').style.width = `${enabled ? (used / enabled) * 100 : 0}%`;
  }

  isFlipped() {
    return this.#card.classList.contains('flipped');
  }

  flip() {
    this.#card.classList.add('flipped');
  }

  unflip() {
    this.#card.classList.remove('flipped');
  }

  scrollCardBodyToTop() {
    const body = this.#card.querySelector('.cbody');
    if (body) body.scrollTop = 0;
  }

  /**
   * Mostra/oculta a resposta da carta de pergunta.
   * @returns {boolean | null} `true` se a resposta ficou visível; `null` se a carta não tem resposta.
   */
  toggleAnswer() {
    const answer = byId('ans-box');
    if (!answer) return null;
    const hide = !answer.hidden;
    answer.hidden = hide;
    this.#answerButton.textContent = hide ? 'Revelar resposta' : 'Ocultar resposta';
    if (!hide) {
      const body = document.querySelector('.cbody');
      if (body) body.scrollTop = body.scrollHeight;
    }
    return !hide;
  }

  /** @param {() => void} onComplete */
  playShuffle(onComplete) {
    this.#card.classList.add('shuffle');
    setTimeout(() => {
      this.#card.classList.remove('shuffle');
      onComplete();
    }, SHUFFLE_ANIMATION_MS);
  }

  playCurse() {
    this.#flash.classList.remove('go');
    void this.#flash.offsetWidth; // força reflow para reiniciar a animação
    this.#flash.classList.add('go');
    this.#card.classList.add('curse');
    setTimeout(() => this.#card.classList.remove('curse'), CURSE_ANIMATION_MS);
  }

  /**
   * @param {string} color
   * @param {string} intensity
   */
  burstSparks(color, intensity) {
    const count = SPARKS_BY_INTENSITY[intensity] ?? SPARKS_BY_INTENSITY.normal;
    for (let i = 0; i < count; i++) {
      const spark = document.createElement('span');
      spark.className = 'spark';
      const angle = Math.random() * 6.283;
      const radius = 60 + Math.random() * 130;
      spark.style.setProperty('--dx', `${Math.cos(angle) * radius}px`);
      spark.style.setProperty('--dy', `${Math.sin(angle) * radius}px`);
      spark.style.background = color;
      spark.style.boxShadow = `0 0 8px ${color}`;
      this.#stage.appendChild(spark);
      setTimeout(() => spark.remove(), SPARK_LIFETIME_MS);
    }
  }
}

import { CARD_BACK_SVG } from '../assets/icons.js';
import { byId } from '../dom.js';

const FAN_SIZE = 3;

/** Tela inicial: leque de cartas e total do baralho. */
export class HomeView {
  renderFan() {
    const card = `<div class="mc face-back" style="position:absolute">${CARD_BACK_SVG}</div>`;
    byId('fan').innerHTML = card.repeat(FAN_SIZE);
  }

  /** @param {number} total */
  renderTotal(total) {
    byId('home-total').textContent = String(total);
  }
}

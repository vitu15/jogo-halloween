import { CATEGORY_KEYS } from '../../domain/categories.js';
import { byId } from '../dom.js';

const TOGGLE_SETTINGS = Object.freeze([...CATEGORY_KEYS, 'sound', 'anim']);

/** Modal de configurações. */
export class SettingsView {
  /** @param {string} key */
  toggle(key) {
    return /** @type {HTMLInputElement} */ (byId(`s-${key}`));
  }

  intensityButtons() {
    return /** @type {HTMLButtonElement[]} */ ([...byId('s-int').children]);
  }

  /**
   * @param {import('../../domain/gameState.js').Settings} settings
   * @param {import('../../domain/Deck.js').Deck} deck
   */
  render(settings, deck) {
    TOGGLE_SETTINGS.forEach((key) => {
      this.toggle(key).checked = Boolean(settings[key]);
    });
    this.intensityButtons().forEach((button) => {
      button.classList.toggle('on', button.dataset.v === settings.int);
    });
    CATEGORY_KEYS.forEach((key) => {
      const count = deck.countByCategory(key);
      byId(`n-${key}`).textContent = `${count}${count === 1 ? ' carta' : ' cartas'}`;
    });
  }
}

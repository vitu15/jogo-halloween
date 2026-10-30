import { CATEGORY_KEYS } from '../../domain/categories.js';
import { byId } from '../dom.js';
import { Modal } from '../components/ModalManager.js';
import { applyVisualSettings } from '../visualSettings.js';

/**
 * Modal de configurações: categorias, sons, animações e intensidade visual.
 */
export class SettingsController {
  #session;
  #view;
  #game;
  #modals;
  #toast;
  #sfx;
  #motion;

  /**
   * @param {{
   *   session: import('../../application/GameSession.js').GameSession,
   *   view: import('../views/SettingsView.js').SettingsView,
   *   game: import('./GameController.js').GameController,
   *   modals: import('../components/ModalManager.js').ModalManager,
   *   toast: import('../components/Toast.js').Toast,
   *   sfx: import('../../infrastructure/audio/SoundEffects.js').SoundEffects,
   *   motion: import('../MotionPolicy.js').MotionPolicy,
   * }} deps
   */
  constructor({ session, view, game, modals, toast, sfx, motion }) {
    this.#session = session;
    this.#view = view;
    this.#game = game;
    this.#modals = modals;
    this.#toast = toast;
    this.#sfx = sfx;
    this.#motion = motion;
  }

  render() {
    this.#view.render(this.#session.settings, this.#session.deck);
  }

  bindEvents() {
    byId('btn-set').addEventListener('click', () => {
      this.render();
      this.#modals.open(Modal.SETTINGS);
    });
    byId('btn-set-restart').addEventListener('click', () => this.#game.confirmRestartFromSettings());

    CATEGORY_KEYS.forEach((category) => {
      const toggle = this.#view.toggle(category);
      toggle.addEventListener('change', () => this.#changeCategory(category, toggle));
    });

    const sound = this.#view.toggle('sound');
    sound.addEventListener('change', () => {
      this.#session.updateSetting('sound', sound.checked);
      if (sound.checked) this.#sfx.tap();
    });

    const animations = this.#view.toggle('anim');
    animations.addEventListener('change', () => {
      this.#session.updateSetting('anim', animations.checked);
      applyVisualSettings(this.#session.settings, this.#motion);
    });

    this.#view.intensityButtons().forEach((button) => {
      button.addEventListener('click', () => {
        this.#session.updateSetting('int', /** @type {any} */ (button.dataset.v));
        applyVisualSettings(this.#session.settings, this.#motion);
        this.render();
      });
    });
  }

  /**
   * @param {string} category
   * @param {HTMLInputElement} toggle
   */
  #changeCategory(category, toggle) {
    if (!this.#session.setCategoryEnabled(category, toggle.checked)) {
      toggle.checked = true;
      this.#toast.show('Mantenha ao menos uma categoria ativa');
      return;
    }
    this.#game.renderProgress();
  }
}

import { byId } from '../dom.js';

export const Modal = Object.freeze({
  RULES: 'm-rules',
  SETTINGS: 'm-set',
  CONFIRM: 'm-conf',
});

/** Abre e fecha os modais (bottom sheets) do jogo. */
export class ModalManager {
  /** @param {string} id */
  open(id) {
    byId(id).classList.add('on');
  }

  /** @param {string} id */
  close(id) {
    byId(id).classList.remove('on');
  }

  /**
   * Fecha modais pelo botão `[data-close]`, por toque no fundo escuro e pela tecla Esc.
   */
  bindDismissals() {
    document.querySelectorAll('[data-close]').forEach((button) => {
      button.addEventListener('click', () => button.closest('.modal').classList.remove('on'));
    });
    document.querySelectorAll('.modal').forEach((modal) => {
      modal.addEventListener('click', (event) => {
        if (event.target === modal) modal.classList.remove('on');
      });
    });
    document.addEventListener('keydown', (event) => {
      if (event.key === 'Escape') {
        document.querySelectorAll('.modal.on').forEach((modal) => modal.classList.remove('on'));
      }
    });
  }
}

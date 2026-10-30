import { byId } from '../dom.js';
import { Modal } from './ModalManager.js';

/** Diálogo de confirmação reutilizável. */
export class ConfirmDialog {
  #modals;
  /** @type {(() => void) | null} */
  #onConfirm = null;

  /** @param {import('./ModalManager.js').ModalManager} modals */
  constructor(modals) {
    this.#modals = modals;
    byId('conf-yes').addEventListener('click', () => {
      this.#modals.close(Modal.CONFIRM);
      this.#onConfirm?.();
    });
    byId('conf-no').addEventListener('click', () => this.#modals.close(Modal.CONFIRM));
  }

  /**
   * @param {{ title: string, text: string, confirmLabel: string, onConfirm: () => void }} options
   */
  ask({ title, text, confirmLabel, onConfirm }) {
    byId('conf-title').textContent = title;
    byId('conf-text').textContent = text;
    byId('conf-yes').textContent = confirmLabel;
    this.#onConfirm = onConfirm;
    this.#modals.open(Modal.CONFIRM);
  }
}

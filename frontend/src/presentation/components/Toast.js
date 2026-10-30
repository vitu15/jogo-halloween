const VISIBLE_MS = 2200;

/** Mensagem curta e temporária no rodapé da tela. */
export class Toast {
  #element;
  /** @type {ReturnType<typeof setTimeout> | undefined} */
  #hideTimer;

  /** @param {HTMLElement} element */
  constructor(element) {
    this.#element = element;
  }

  /** @param {string} message */
  show(message) {
    this.#element.textContent = message;
    this.#element.classList.add('on');
    clearTimeout(this.#hideTimer);
    this.#hideTimer = setTimeout(() => this.#element.classList.remove('on'), VISIBLE_MS);
  }
}

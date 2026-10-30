/**
 * Decide se animações devem rodar: depende da configuração do jogo e da
 * preferência de movimento reduzido do sistema.
 */
export class MotionPolicy {
  #getSettings;
  #prefersReducedMotion;

  /**
   * @param {{ getSettings: () => { anim: boolean }, prefersReducedMotion: boolean }} deps
   */
  constructor({ getSettings, prefersReducedMotion }) {
    this.#getSettings = getSettings;
    this.#prefersReducedMotion = prefersReducedMotion;
  }

  isEnabled() {
    return Boolean(this.#getSettings().anim) && !this.#prefersReducedMotion;
  }
}

export function systemPrefersReducedMotion() {
  return Boolean(window.matchMedia?.('(prefers-reduced-motion: reduce)').matches);
}

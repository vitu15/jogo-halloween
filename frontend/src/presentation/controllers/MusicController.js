import { byId } from '../dom.js';

/**
 * Mostra o nome da faixa atual nas configurações.
 * @param {import('../../infrastructure/audio/MusicPlayer.js').Track} track
 */
export function renderTrackName(track) {
  const label = byId('m-name');
  if (label) label.textContent = `♪ ${track.name}`;
}

/**
 * Controles de música no modal de configurações e ciclo de vida do áudio
 * (início no primeiro toque, pausa com a aba em segundo plano).
 */
export class MusicController {
  #session;
  #player;

  /**
   * @param {{
   *   session: import('../../application/GameSession.js').GameSession,
   *   player: import('../../infrastructure/audio/MusicPlayer.js').MusicPlayer,
   * }} deps
   */
  constructor({ session, player }) {
    this.#session = session;
    this.#player = player;
  }

  bind() {
    document.addEventListener('visibilitychange', () => this.#player.handleVisibilityChange(document.hidden));
    if (!this.#player.hasTracks) return;

    const musicToggle = /** @type {HTMLInputElement} */ (byId('s-music'));
    const volume = /** @type {HTMLInputElement} */ (byId('s-vol'));
    const { music, vol } = this.#session.settings;

    byId('music-set').hidden = false;
    musicToggle.checked = Boolean(music);
    volume.value = String(vol ?? 50);

    musicToggle.addEventListener('change', () => {
      this.#session.updateSetting('music', musicToggle.checked);
      if (musicToggle.checked) this.#player.start();
      else this.#player.stop();
    });
    volume.addEventListener('input', () => {
      this.#session.updateSetting('vol', Number(volume.value));
      this.#player.applyVolume();
    });
    byId('btn-next-track').addEventListener('click', () => this.#player.skipTrack());

    // Navegadores só liberam áudio após uma interação do usuário.
    const startOnFirstTouch = () => {
      this.#player.start();
      if (this.#player.isStarted) document.removeEventListener('pointerdown', startOnFirstTouch);
    };
    document.addEventListener('pointerdown', startOnFirstTouch);
  }
}

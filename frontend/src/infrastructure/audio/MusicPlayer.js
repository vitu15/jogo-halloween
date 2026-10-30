import { shuffle } from '../../shared/utils/array.js';

/**
 * @typedef {{ name: string, src: string }} Track
 */

const DEFAULT_VOLUME_PERCENT = 50;

/**
 * Toca a trilha de fundo em ordem aleatória, sem repetir a última faixa
 * quando a playlist recomeça.
 */
export class MusicPlayer {
  #tracks;
  #isEnabled;
  #getVolumePercent;
  #onTrackLoaded;
  #random;
  #createAudio;
  /** @type {HTMLAudioElement | null} */
  #audio = null;
  /** @type {number[]} */
  #order = [];
  #index = 0;
  #started = false;

  /**
   * @param {{
   *   tracks: readonly Track[],
   *   isEnabled: () => boolean,
   *   getVolumePercent: () => number | null | undefined,
   *   onTrackLoaded?: (track: Track) => void,
   *   random?: () => number,
   *   createAudio?: () => HTMLAudioElement,
   * }} deps
   */
  constructor({
    tracks,
    isEnabled,
    getVolumePercent,
    onTrackLoaded = () => {},
    random = Math.random,
    createAudio = () => new Audio(),
  }) {
    this.#tracks = tracks;
    this.#isEnabled = isEnabled;
    this.#getVolumePercent = getVolumePercent;
    this.#onTrackLoaded = onTrackLoaded;
    this.#random = random;
    this.#createAudio = createAudio;
  }

  get hasTracks() {
    return this.#tracks.length > 0;
  }

  get isStarted() {
    return this.#started;
  }

  start() {
    if (!this.hasTracks || !this.#isEnabled() || this.#started) return;
    this.#started = true;
    if (!this.#order.length) {
      this.#order = shuffle(
        this.#tracks.map((_, i) => i),
        this.#random,
      );
      this.#index = 0;
    }
    if (!this.#audio || !this.#audio.src) this.#load();
    this.#play();
  }

  stop() {
    this.#audio?.pause();
    this.#started = false;
  }

  /** Avança para a próxima faixa (inicia a música se ainda não começou). */
  skipTrack() {
    if (!this.#order.length) {
      this.#started = false;
      this.start();
      return;
    }
    this.#next();
  }

  applyVolume() {
    if (this.#audio) this.#audio.volume = this.#volume();
  }

  /** @param {boolean} hidden */
  handleVisibilityChange(hidden) {
    if (!this.#audio) return;
    if (hidden) this.#audio.pause();
    else if (this.#started) this.#play();
  }

  #next() {
    this.#index = (this.#index + 1) % this.#order.length;
    if (this.#index === 0 && this.#tracks.length > 1) {
      const last = this.#order[this.#order.length - 1];
      do {
        this.#order = shuffle(this.#order, this.#random);
      } while (this.#order[0] === last);
    }
    this.#load();
    this.#play();
  }

  #load() {
    if (!this.#audio) {
      this.#audio = this.#createAudio();
      this.#audio.preload = 'auto';
      this.#audio.addEventListener('ended', () => this.#next());
      this.#audio.addEventListener('error', () => {
        if (this.#tracks.length > 1) this.#next();
      });
    }
    const track = this.#tracks[this.#order[this.#index]];
    this.#audio.src = track.src;
    this.#audio.volume = this.#volume();
    this.#onTrackLoaded(track);
  }

  #play() {
    if (!this.#isEnabled() || !this.#audio) return;
    const playback = this.#audio.play();
    playback?.catch?.(() => {
      this.#started = false;
    });
  }

  #volume() {
    const percent = this.#getVolumePercent() ?? DEFAULT_VOLUME_PERCENT;
    return Math.max(0, Math.min(1, percent / 100));
  }
}

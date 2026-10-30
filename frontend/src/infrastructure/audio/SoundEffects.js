/**
 * Efeitos sonoros sintetizados com Web Audio (sem arquivos de áudio).
 */
export class SoundEffects {
  #isEnabled;
  /** @type {AudioContext | null} */
  #context = null;

  /** @param {{ isEnabled: () => boolean }} deps */
  constructor({ isEnabled }) {
    this.#isEnabled = isEnabled;
  }

  shuffle() {
    for (let i = 0; i < 5; i++) {
      this.#tone({
        frequency: 180 + i * 30,
        duration: 0.07,
        type: 'triangle',
        volume: 0.07,
        slideTo: 120,
        delay: i * 0.06,
      });
    }
  }

  flip() {
    this.#tone({ frequency: 420, duration: 0.18, type: 'sine', volume: 0.12, slideTo: 720 });
  }

  curse() {
    this.#tone({ frequency: 140, duration: 0.5, type: 'sawtooth', volume: 0.1, slideTo: 60 });
    this.#tone({ frequency: 95, duration: 0.6, type: 'square', volume: 0.06, slideTo: 50, delay: 0.05 });
  }

  done() {
    this.#tone({ frequency: 523, duration: 0.12, type: 'triangle', volume: 0.14 });
    this.#tone({ frequency: 659, duration: 0.12, type: 'triangle', volume: 0.14, delay: 0.1 });
    this.#tone({ frequency: 784, duration: 0.2, type: 'triangle', volume: 0.14, delay: 0.2 });
  }

  tap() {
    this.#tone({ frequency: 300, duration: 0.06, type: 'square', volume: 0.05 });
  }

  /**
   * @param {{ frequency: number, duration: number, type?: OscillatorType,
   *           volume?: number, slideTo?: number, delay?: number }} tone
   */
  #tone({ frequency, duration, type = 'sine', volume = 0.12, slideTo, delay = 0 }) {
    if (!this.#isEnabled()) return;
    try {
      const context = this.#getContext();
      if (context.state === 'suspended') context.resume();
      const start = context.currentTime + delay;
      const oscillator = context.createOscillator();
      const gain = context.createGain();

      oscillator.type = type;
      oscillator.frequency.setValueAtTime(frequency, start);
      if (slideTo) oscillator.frequency.exponentialRampToValueAtTime(slideTo, start + duration);

      gain.gain.setValueAtTime(0.0001, start);
      gain.gain.exponentialRampToValueAtTime(volume, start + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

      oscillator.connect(gain);
      gain.connect(context.destination);
      oscillator.start(start);
      oscillator.stop(start + duration + 0.05);
    } catch {
      // Web Audio indisponível: efeitos sonoros são opcionais.
    }
  }

  #getContext() {
    this.#context ??= new (window.AudioContext || window.webkitAudioContext)();
    return this.#context;
  }
}

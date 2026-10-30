import { describe, expect, it } from 'vitest';

import { MusicPlayer } from '../../src/infrastructure/audio/MusicPlayer.js';
import { seededRandom } from '../helpers/fixtures.js';

class FakeAudio {
  src = '';
  volume = 1;
  paused = true;
  listeners = {};
  addEventListener(type, listener) {
    this.listeners[type] = listener;
  }
  play() {
    this.paused = false;
    return Promise.resolve();
  }
  pause() {
    this.paused = true;
  }
  emit(type) {
    this.listeners[type]?.();
  }
}

const TRACKS = [
  { name: 'A', src: 'a.mp3' },
  { name: 'B', src: 'b.mp3' },
  { name: 'C', src: 'c.mp3' },
];

function createPlayer({ enabled = true, volume = 50 } = {}) {
  const audio = new FakeAudio();
  const loaded = [];
  const settings = { enabled, volume };
  const player = new MusicPlayer({
    tracks: TRACKS,
    isEnabled: () => settings.enabled,
    getVolumePercent: () => settings.volume,
    onTrackLoaded: (track) => loaded.push(track.name),
    random: seededRandom(3),
    createAudio: () => audio,
  });
  return { player, audio, loaded, settings };
}

describe('MusicPlayer', () => {
  it('não toca quando a música está desligada', () => {
    const { player, audio } = createPlayer({ enabled: false });
    player.start();
    expect(player.isStarted).toBe(false);
    expect(audio.src).toBe('');
  });

  it('inicia uma faixa com o volume configurado', () => {
    const { player, audio, loaded } = createPlayer({ volume: 30 });
    player.start();
    expect(player.isStarted).toBe(true);
    expect(audio.paused).toBe(false);
    expect(audio.volume).toBeCloseTo(0.3);
    expect(loaded).toHaveLength(1);
  });

  it('toca todas as faixas antes de repetir e não repete a última ao reembaralhar', () => {
    const { player, audio, loaded } = createPlayer();
    player.start();
    for (let i = 0; i < 8; i++) audio.emit('ended');
    expect(new Set(loaded.slice(0, 3)).size).toBe(3);
    expect(new Set(loaded.slice(3, 6)).size).toBe(3);
    expect(loaded[3]).not.toBe(loaded[2]);
    expect(loaded[6]).not.toBe(loaded[5]);
  });

  it('pausa em segundo plano e retoma ao voltar', () => {
    const { player, audio } = createPlayer();
    player.start();
    player.handleVisibilityChange(true);
    expect(audio.paused).toBe(true);
    player.handleVisibilityChange(false);
    expect(audio.paused).toBe(false);
  });

  it('limita o volume entre 0 e 100%', () => {
    const { player, audio, settings } = createPlayer();
    player.start();
    settings.volume = 150;
    player.applyVolume();
    expect(audio.volume).toBe(1);
    settings.volume = null;
    player.applyVolume();
    expect(audio.volume).toBe(0.5);
  });

  it('skipTrack inicia a música se ela ainda não começou', () => {
    const { player, loaded } = createPlayer();
    player.skipTrack();
    expect(player.isStarted).toBe(true);
    player.skipTrack();
    expect(loaded).toHaveLength(2);
  });
});

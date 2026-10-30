/**
 * Raiz de composição: cria as dependências e conecta as camadas.
 * Nenhuma regra de jogo mora aqui.
 */
import './styles/main.css';

import cards from '@shared/data/cards.json';

import { GameSession } from './application/GameSession.js';
import { TRACKS } from './config/tracks.js';
import { Deck } from './domain/Deck.js';
import { MusicPlayer } from './infrastructure/audio/MusicPlayer.js';
import { SoundEffects } from './infrastructure/audio/SoundEffects.js';
import { LocalStorageGameRepository } from './infrastructure/storage/LocalStorageGameRepository.js';
import { ConfirmDialog } from './presentation/components/ConfirmDialog.js';
import { ModalManager } from './presentation/components/ModalManager.js';
import { ScreenNavigator } from './presentation/components/ScreenNavigator.js';
import { Toast } from './presentation/components/Toast.js';
import { GameController } from './presentation/controllers/GameController.js';
import { MusicController, renderTrackName } from './presentation/controllers/MusicController.js';
import { SettingsController } from './presentation/controllers/SettingsController.js';
import { byId } from './presentation/dom.js';
import { MotionPolicy, systemPrefersReducedMotion } from './presentation/MotionPolicy.js';
import { applyVisualSettings } from './presentation/visualSettings.js';
import { EndView } from './presentation/views/EndView.js';
import { GameView } from './presentation/views/GameView.js';
import { HomeView } from './presentation/views/HomeView.js';
import { SettingsView } from './presentation/views/SettingsView.js';

const deck = new Deck(cards);
const session = new GameSession({ deck, repository: new LocalStorageGameRepository() });
session.restore();

const getSettings = () => session.settings;
const motion = new MotionPolicy({ getSettings, prefersReducedMotion: systemPrefersReducedMotion() });
const sfx = new SoundEffects({ isEnabled: () => getSettings().sound });
const music = new MusicPlayer({
  tracks: TRACKS,
  isEnabled: () => getSettings().music,
  getVolumePercent: () => getSettings().vol,
  onTrackLoaded: renderTrackName,
});

const modals = new ModalManager();
const ui = {
  screens: new ScreenNavigator(),
  modals,
  confirm: new ConfirmDialog(modals),
  toast: new Toast(byId('toast')),
};
const views = { home: new HomeView(), game: new GameView(), end: new EndView() };

const game = new GameController({ session, views, ui, sfx, motion });
const settings = new SettingsController({
  session,
  view: new SettingsView(),
  game,
  modals,
  toast: ui.toast,
  sfx,
  motion,
});

modals.bindDismissals();
game.bindEvents();
settings.bindEvents();
new MusicController({ session, player: music }).bind();

applyVisualSettings(session.settings, motion);
views.home.renderFan();
views.game.renderCardBack();
settings.render();
game.renderProgress();

window.__MALDICAO__ = { cards: deck.cards, count: deck.size };

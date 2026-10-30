import { byId } from '../dom.js';

export const Screen = Object.freeze({
  HOME: 'home',
  GAME: 'game',
  END: 'end',
});

/** Alterna entre as telas do jogo (apenas uma visível por vez). */
export class ScreenNavigator {
  /** @param {string} id */
  show(id) {
    Object.values(Screen).forEach((screen) => byId(screen).classList.toggle('on', screen === id));
  }
}

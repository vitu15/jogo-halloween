import { byId } from '../dom.js';

/** Tela de fim de baralho. */
export class EndView {
  /** @param {{ used: number, done: number }} stats */
  renderStats({ used, done }) {
    byId('e-used').textContent = String(used);
    byId('e-done').textContent = String(done);
  }
}

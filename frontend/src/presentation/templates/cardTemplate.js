import { CATEGORIES, isRoundPenalty } from '../../domain/categories.js';
import { escapeHtml } from '../../shared/utils/html.js';
import { CATEGORY_ICONS, WARNING_SVG } from '../assets/icons.js';

/**
 * HTML da frente da carta.
 * @param {import('../../domain/Deck.js').Card} card
 * @returns {string}
 */
export function renderCardFront(card) {
  return [
    '<div class="done-stamp">CUMPRIDA</div>',
    `<div class="ch"><span class="num">Nº ${escapeHtml(card.id)}</span><span class="pill">${escapeHtml(CATEGORIES[card.cat].label)}</span></div>`,
    `<div class="cicon">${CATEGORY_ICONS[card.cat]}</div>`,
    `<div class="ctitle">${escapeHtml(card.title)}</div>`,
    `<div class="ctipo">${escapeHtml(card.tipo)}</div><div class="sep"></div>`,
    '<div class="cbody">',
    isRoundPenalty(card)
      ? '<div class="rule-tag">⛧ REGRA TEMPORÁRIA · AFETA OS JOGADORES DURANTE A RODADA ⛧</div>'
      : '',
    `<div class="desc">${escapeHtml(card.desc)}</div>`,
    card.ex ? `<div class="ex"><b>Exemplos:</b> ${escapeHtml(card.ex)}</div>` : '',
    card.ans ? `<div class="ans" id="ans-box" hidden><small>RESPOSTA</small>${escapeHtml(card.ans)}</div>` : '',
    '</div>',
    `<div class="pen">${WARNING_SVG}<div><small>PENALIDADE</small>${escapeHtml(card.pen)}</div></div>`,
  ].join('');
}

/* SVGs do jogo, copiados do layout original. */

/** Ícone exibido na frente da carta, por categoria. */
export const CATEGORY_ICONS = Object.freeze({
  desafio:
    '<svg viewBox="0 0 48 48"><path d="M8 10h32v14c0 9-7 16-16 16S8 33 8 24z"/><path d="M16 20q3 3 6 0M26 20q3 3 6 0"/><path d="M17 30q7 6 14 0"/></svg>',
  pergunta:
    '<svg viewBox="0 0 48 48"><path d="M3 24s8-12 21-12 21 12 21 12-8 12-21 12S3 24 3 24z"/><circle cx="24" cy="24" r="6"/><path d="M24 20v1M24 25v3" /></svg>',
  penalidade:
    '<svg viewBox="0 0 48 48"><path d="M24 4l6 10 11 1-8 8 2 11-11-5-11 5 2-11-8-8 11-1z" transform="translate(0 4) scale(.9) translate(2.6 0)"/><path d="M24 17v9M24 31v1"/></svg>',
});

/** Verso da carta (também usado no leque da tela inicial). */
export const CARD_BACK_SVG =
  '<svg viewBox="0 0 100 100" fill="none" stroke="#FF6B35" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"><path d="M62 14a34 34 0 100 62 28 28 0 01-62-31 28 28 0 0162-31z" transform="translate(18 6) scale(.9)"/><path d="M50 62l-8-6-10 3 5-9-6-7 10 1 4-8 4 8 10-1-6 7 5 9-10-3z" transform="translate(6 18) scale(.5)" stroke="#9B5DE5"/><path d="M70 70q6-8 12 0 4-6 8 0-4 2-6 8-2-4-6-4t-8-4z" stroke="#9B5DE5"/></svg><div class="bt">MALDIÇÃO</div>';

/** Ícone de alerta da faixa de penalidade. */
export const WARNING_SVG = '<svg viewBox="0 0 24 24"><path d="M12 3l10 18H2z"/><path d="M12 10v5M12 18v.5"/></svg>';

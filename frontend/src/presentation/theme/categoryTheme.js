/**
 * Aparência de cada categoria: classe CSS da carta e cor de destaque dos efeitos.
 */
const CATEGORY_THEME = Object.freeze({
  desafio: Object.freeze({ cssClass: 'cat-orange', accentColor: '#FF6B35' }),
  pergunta: Object.freeze({ cssClass: 'cat-purple', accentColor: '#9B5DE5' }),
  penalidade: Object.freeze({ cssClass: 'cat-red', accentColor: '#E63946' }),
});

/** @param {string} category */
export function categoryTheme(category) {
  return CATEGORY_THEME[category];
}

/**
 * Categorias de carta. A chave é a mesma usada em `card.cat` e nas configurações.
 */
export const CATEGORIES = Object.freeze({
  desafio: Object.freeze({ key: 'desafio', label: 'Desafio' }),
  pergunta: Object.freeze({ key: 'pergunta', label: 'Pergunta' }),
  penalidade: Object.freeze({ key: 'penalidade', label: 'Penalidade de rodada' }),
});

export const CATEGORY_KEYS = Object.freeze(Object.keys(CATEGORIES));

/** Categoria das regras temporárias que valem durante a rodada. */
export const ROUND_PENALTY_CATEGORY = CATEGORIES.penalidade.key;

/**
 * @param {{ cat: string }} card
 * @returns {boolean}
 */
export function isRoundPenalty(card) {
  return card.cat === ROUND_PENALTY_CATEGORY;
}

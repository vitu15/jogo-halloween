/**
 * Retorna uma cópia embaralhada do array (Fisher–Yates). Não altera o original.
 * @template T
 * @param {readonly T[]} items
 * @param {() => number} [random]
 * @returns {T[]}
 */
export function shuffle(items, random = Math.random) {
  const result = items.slice();
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

/**
 * Sorteia um item do array.
 * @template T
 * @param {readonly T[]} items
 * @param {() => number} [random]
 * @returns {T | undefined}
 */
export function pickRandom(items, random = Math.random) {
  return shuffle(items, random)[0];
}

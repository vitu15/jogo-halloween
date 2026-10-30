/**
 * Vibra o aparelho, quando suportado.
 * @param {number | number[]} pattern
 */
export function vibrate(pattern) {
  try {
    if (navigator.vibrate) navigator.vibrate(pattern);
  } catch {
    // Vibração é um efeito opcional.
  }
}

const HTML_ENTITIES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' };

/**
 * Escapa texto para inserção segura em HTML.
 * @param {unknown} text
 * @returns {string}
 */
export function escapeHtml(text) {
  return String(text).replace(/[&<>"]/g, (char) => HTML_ENTITIES[char]);
}

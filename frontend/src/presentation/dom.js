/**
 * @param {string} id
 * @returns {HTMLElement}
 */
export function byId(id) {
  return /** @type {HTMLElement} */ (document.getElementById(id));
}

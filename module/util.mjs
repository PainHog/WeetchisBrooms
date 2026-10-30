/**
 * WITCH & WARD — small shared helpers for the Foundry-side modules.
 */

/** Escape text for HTML (our own, so it doesn't depend on a core utility's name). */
export function esc(s) {
  return String(s ?? "").replace(/[&<>"']/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

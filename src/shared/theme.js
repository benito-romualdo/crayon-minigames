/* ── Tokens y utilidades compartidas de Crayon Games ── */

export const COLORS = [
  { name: "Rojo", body: "#e63946", tip: "#c1121f", shade: "#a4161a" },
  { name: "Azul", body: "#2196F3", tip: "#1565C0", shade: "#0D47A1" },
  { name: "Verde", body: "#4caf50", tip: "#2e7d32", shade: "#1b5e20" },
  { name: "Naranja", body: "#ff9800", tip: "#e65100", shade: "#bf360c" },
  { name: "Morado", body: "#9c27b0", tip: "#6a1b9a", shade: "#4a148c" },
  { name: "Rosa", body: "#e91e8c", tip: "#c2185b", shade: "#880e4f" },
];

export const DIR = {
  UP: { x: 0, y: -1 },
  DOWN: { x: 0, y: 1 },
  LEFT: { x: -1, y: 0 },
  RIGHT: { x: 1, y: 0 },
};

export const KEY_TO_DIR = {
  ArrowUp: DIR.UP, ArrowDown: DIR.DOWN, ArrowLeft: DIR.LEFT, ArrowRight: DIR.RIGHT,
  w: DIR.UP, W: DIR.UP, s: DIR.DOWN, S: DIR.DOWN,
  a: DIR.LEFT, A: DIR.LEFT, d: DIR.RIGHT, D: DIR.RIGHT,
};

export function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw == null ? fallback : JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function saveJSON(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* almacenamiento no disponible (modo privado, etc.) */
  }
}

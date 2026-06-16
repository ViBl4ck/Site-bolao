/* =============================================
   store.js — Wrapper de persistência via localStorage
   Serializa/desserializa JSON automaticamente.
   ============================================= */

export const store = {
  get(key) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },

  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      console.warn('[store] Falha ao salvar:', key);
    }
  },

  remove(key) {
    localStorage.removeItem(key);
  }
};

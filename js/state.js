/* =============================================
   state.js — Estado global reativo da aplicação.
   Centraliza user, predictions e settings.
   ============================================= */

import { store } from './store.js';

const defaults = {
  settings: {
    theme:    'light',
    lang:     'pt',
    volume:   0.5,
    fontSize: 'M',
    contrast: 'normal',
    motion:   'normal'
  }
};

/* Objeto mutável compartilhado entre módulos */
export const state = {
  user:         null,
  predictions:  {},
  settings:     { ...defaults.settings },
  customEvents: []
};

/* Carrega dados persistidos do localStorage */
export function initState() {
  state.user         = store.get('cravou_user') ?? null;
  state.predictions  = store.get('cravou_predictions') ?? {};
  state.customEvents = store.get('cravou_custom') ?? [];
  const saved        = store.get('cravou_settings');
  if (saved) state.settings = { ...defaults.settings, ...saved };
}

/* Persiste o usuário logado */
export function saveUser() {
  store.set('cravou_user', state.user);
}

/* Persiste todos os palpites */
export function savePredictions() {
  store.set('cravou_predictions', state.predictions);
}

/* Persiste configurações */
export function saveSettings() {
  store.set('cravou_settings', state.settings);
}

/* Persiste eventos customizados */
export function saveCustomEvents() {
  store.set('cravou_custom', state.customEvents);
}

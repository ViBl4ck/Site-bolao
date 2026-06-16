/* =============================================
   sound.js — Efeitos sonoros via Web Audio API.
   Gera tons sintéticos sem dependência de arquivo.
   ============================================= */

import { state } from './state.js';

let ctx = null;

/* Cria o AudioContext com lazy init (exige gesto do usuário) */
function getCtx() {
  if (!ctx) ctx = new (window.AudioContext || window.webkitAudioContext)();
  return ctx;
}

/* Toca um beep com frequência e duração customizáveis */
export function playBeep(freq = 880, duration = 0.08, type = 'sine') {
  const vol = state.settings.volume;
  if (vol <= 0) return;

  try {
    const ac  = getCtx();
    const osc = ac.createOscillator();
    const gain = ac.createGain();

    osc.connect(gain);
    gain.connect(ac.destination);

    osc.type = type;
    osc.frequency.setValueAtTime(freq, ac.currentTime);

    gain.gain.setValueAtTime(vol * 0.4, ac.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + duration);

    osc.start(ac.currentTime);
    osc.stop(ac.currentTime + duration);
  } catch {
    /* AudioContext bloqueado: silencioso */
  }
}

/* Click de UI (configurações) */
export function playClick() {
  playBeep(600, 0.06, 'square');
}

/* Confirmação (salvar palpite) */
export function playSuccess() {
  playBeep(880, 0.08);
  setTimeout(() => playBeep(1100, 0.1), 80);
}

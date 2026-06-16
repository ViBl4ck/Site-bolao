/* =============================================
   predictions.js — Modal de palpite e persistência.
   ============================================= */

import { state, savePredictions } from './state.js';
import { openModal, closeModal, toast } from './ui.js';
import { playSuccess } from './sound.js';
import { t } from './i18n.js';

let currentEventId = null;

/* Abre o modal preenchendo os dados do evento.
   Se o usuário já palpitou, mostra o palpite salvo. */
export function openPredictionModal(event) {
  currentEventId = event.id;

  document.getElementById('prediction-event-name').textContent =
    `${event.home} × ${event.away} — ${event.competition}`;

  const saved = state.predictions[event.id];
  document.getElementById('pred-home').value = saved ? saved.home : 0;
  document.getElementById('pred-away').value = saved ? saved.away : 0;

  /* Exibe banner de palpite já salvo */
  const savedBanner = document.getElementById('prediction-saved');
  const savedScore  = document.getElementById('prediction-saved-score');
  if (saved) {
    savedBanner.style.display = 'block';
    savedScore.textContent    = `${saved.home} × ${saved.away}`;
  } else {
    savedBanner.style.display = 'none';
  }

  openModal('modal-prediction');
}

/* Salva o palpite no estado e localStorage */
function savePrediction() {
  if (!currentEventId) return;

  const home = parseInt(document.getElementById('pred-home').value, 10);
  const away = parseInt(document.getElementById('pred-away').value, 10);

  if (isNaN(home) || isNaN(away) || home < 0 || away < 0) {
    toast('Placar inválido.', 'error');
    return;
  }

  state.predictions[currentEventId] = { home, away };
  savePredictions();

  /* Feedback visual e sonoro */
  const savedBanner = document.getElementById('prediction-saved');
  const savedScore  = document.getElementById('prediction-saved-score');
  savedBanner.style.display = 'block';
  savedScore.textContent    = `${home} × ${away}`;

  playSuccess();
  toast(t('prediction.saved'), 'success');

  setTimeout(() => {
    closeModal('modal-prediction');
    /* Re-renderiza os cards para refletir o palpite salvo */
    document.dispatchEvent(new CustomEvent('cravou:predictionchange'));
  }, 800);
}

export function initPredictions() {
  document.getElementById('btn-save-prediction')?.addEventListener('click', savePrediction);

  /* Permite salvar com Enter nos inputs de placar */
  ['pred-home', 'pred-away'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => {
      if (e.key === 'Enter') savePrediction();
    });
  });
}

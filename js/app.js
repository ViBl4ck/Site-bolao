/* =============================================
   app.js — Ponto de entrada principal.
   Inicializa todos os módulos e orquestra a UI.
   ============================================= */

import { initState, state }        from './state.js';
import { events }                  from './data.js';
import { t, apply as applyI18n }   from './i18n.js';
import { getEventStatus, calcPoints, formatCountdown } from './events.js';
import { initSidebar }             from './sidebar.js';
import { initAuth }                from './auth.js';
import { initPredictions, openPredictionModal } from './predictions.js';
import { initCarousel, rebuildCarousel } from './carousel.js';
import { renderRanking }           from './ranking.js';
import { initSettings, applySettings } from './settings.js';
import { setupModalClose, toast, openModal } from './ui.js';

/* ---- 1. INICIALIZAÇÃO ---- */
initState();
applySettings();

/* ---- 2. SETUP DOS MÓDULOS ---- */
initSidebar();
setupModalClose();
initAuth();
initPredictions();
initSettings();

/* ---- 3. RENDER INICIAL ---- */
renderAllEvents();
renderRanking();
initCarousel();
updateHeroStats();
updateFooter();

/* ---- 4. TIMERS ---- */
/* Atualiza countdowns a cada segundo */
const countdownTimer = setInterval(updateCountdowns, 1000);

/* Verifica mudanças de status a cada 30 segundos */
const statusTimer = setInterval(() => {
  renderAllEvents();
  renderRanking();
}, 30_000);

/* ---- 5. EVENTOS GLOBAIS ---- */
document.addEventListener('cravou:authchange', () => {
  renderAllEvents();
  renderRanking();
});

document.addEventListener('cravou:predictionchange', () => {
  renderAllEvents();
  renderRanking();
});

document.addEventListener('cravou:langchange', () => {
  applyI18n();
  renderAllEvents();
  renderRanking();
  rebuildCarousel();
  updateHeroStats();
});

/* ============================================
   RENDERIZAÇÃO DOS CARDS DE EVENTO
   ============================================ */

function renderAllEvents() {
  const open     = events.filter(e => getEventStatus(e) === 'open');
  const live     = events.filter(e => getEventStatus(e) === 'live');
  const finished = events.filter(e => getEventStatus(e) === 'finished');

  renderGrid('open-events-grid',     open,     'open');
  renderGrid('live-events-grid',     live,     'live');
  renderGrid('finished-events-grid', finished, 'finished');
}

function renderGrid(gridId, evList, status) {
  const grid = document.getElementById(gridId);
  if (!grid) return;

  if (evList.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="empty-state__icon">📭</div>
        Nenhum evento aqui no momento.
      </div>`;
    return;
  }

  grid.innerHTML = evList.map(ev => buildCardHTML(ev, status)).join('');

  /* Associa listeners nos botões de palpite recém-criados */
  grid.querySelectorAll('[data-event-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const ev = events.find(e => e.id === btn.dataset.eventId);
      if (!ev) return;

      if (!state.user) {
        toast('Faça login para palpitar! 👤', 'info');
        openModal('modal-auth');
        return;
      }
      openPredictionModal(ev);
    });
  });
}

function buildCardHTML(ev, status) {
  const pred   = state.predictions[ev.id];
  const points = (status === 'finished') ? calcPoints(pred, ev.result) : null;

  /* ---- Badge ---- */
  const badge = {
    open:     `<span class="badge badge--open">🟢 ${t('events.open')}</span>`,
    live:     `<span class="badge badge--live">${t('events.live')}</span>`,
    finished: `<span class="badge badge--finished">🏁 ${t('events.finished')}</span>`
  }[status];

  /* ---- Área de resultado / placar ---- */
  let resultArea = '';
  if (status === 'finished' && ev.result) {
    resultArea = `
      <div class="event-card__result">${ev.result.home} × ${ev.result.away}</div>`;
  }

  /* ---- Countdown ---- */
  let countdownArea = '';
  if (status === 'open') {
    const cd = formatCountdown(ev.startTime);
    countdownArea = `
      <p class="event-card__countdown">
        ${t('events.countdown')} <span data-countdown="${ev.id}">${cd}</span>
      </p>`;
  }

  /* ---- Palpite do usuário ---- */
  let predArea = '';
  if (state.user && pred) {
    predArea = `
      <p class="event-card__prediction">
        ${t('events.yourPred')} <strong>${pred.home} × ${pred.away}</strong>
      </p>`;
  }

  /* ---- Pontos ---- */
  let pointsArea = '';
  if (status === 'finished' && state.user && pred) {
    const labels = {
      2: t('events.exact'),
      1: t('events.result_hit'),
      0: t('events.miss')
    };
    if (points !== null) {
      pointsArea = `<p class="event-card__points event-card__points--${points}">${labels[points]}</p>`;
    }
  }

  /* ---- Botão de ação ---- */
  let actionBtn = '';
  if (status === 'open') {
    const label = pred ? `✏️ ${t('events.bet')}` : `🎯 ${t('events.bet')}`;
    actionBtn = `<button class="btn btn--primary btn--sm" data-event-id="${ev.id}">${label}</button>`;
  } else if (status === 'live') {
    actionBtn = `<button class="btn btn--outline btn--sm" disabled>${t('events.locked')}</button>`;
  }

  return `
    <article class="event-card event-card--${status}">
      <div class="event-card__header">
        <span class="event-card__competition">${ev.competition}</span>
        ${badge}
      </div>
      <div class="event-card__teams">
        <span class="event-card__team">${ev.home}</span>
        <span class="event-card__vs">×</span>
        <span class="event-card__team">${ev.away}</span>
      </div>
      ${resultArea}
      ${countdownArea}
      ${predArea}
      ${pointsArea}
      ${actionBtn ? `<div style="margin-top:auto;padding-top:var(--gap-sm)">${actionBtn}</div>` : ''}
    </article>`;
}

/* ============================================
   COUNTDOWNS
   ============================================ */

function updateCountdowns() {
  /* Atualiza os spans de countdown existentes no DOM */
  document.querySelectorAll('[data-countdown]').forEach(span => {
    const ev = events.find(e => e.id === span.dataset.countdown);
    if (!ev) return;

    const newStatus = getEventStatus(ev);
    if (newStatus !== 'open') {
      /* Status mudou: re-renderiza tudo */
      renderAllEvents();
      renderRanking();
      return;
    }
    span.textContent = formatCountdown(ev.startTime);
  });
}

/* ============================================
   HERO STATS
   ============================================ */

function updateHeroStats() {
  const open = events.filter(e => getEventStatus(e) === 'open').length;
  document.getElementById('stat-events').textContent  = events.length;
  document.getElementById('stat-players').textContent = 9; /* base fixa + pode crescer */
  document.getElementById('stat-open').textContent    = open;
}

/* ============================================
   FOOTER
   ============================================ */

function updateFooter() {
  const now  = new Date();
  const year = now.getFullYear();
  const date = now.toLocaleDateString('pt-BR', { day:'2-digit', month:'long', year:'numeric' });
  const el   = document.getElementById('footer-copy');
  if (el) el.textContent = `© ${year} Cravou · ${date}`;
}

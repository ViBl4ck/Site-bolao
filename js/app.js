/* =============================================
   app.js — Ponto de entrada principal.
   Inicializa todos os módulos e orquestra a UI.
   ============================================= */

import { initState, state }        from './state.js';
import { t, apply as applyI18n }   from './i18n.js';
import { all as allEvents, getEventStatus, calcPoints, formatCountdown } from './events.js';
import { initSidebar }             from './sidebar.js';
import { initAuth }                from './auth.js';
import { initPredictions, openPredictionModal } from './predictions.js';
import { initCarousel, rebuildCarousel } from './carousel.js';
import { renderRanking }           from './ranking.js';
import { initSettings, applySettings } from './settings.js';
import { setupModalClose, toast, openModal, teamHtml } from './ui.js';
import { Creator, initCreator, openSetResultModal } from './creator.js';
import { Profile }                 from './profile.js';
import { Api }                     from './api.js';

/* ---- 1. INICIALIZAÇÃO ---- */
initState();
applySettings();

let currentView = 'feed';

/* ---- 2. SETUP DOS MÓDULOS ---- */
initSidebar();
setupModalClose();
initAuth();
initPredictions();
initSettings();
initCreator();

/* ---- 3. CTAs "Criar Bolão" ---- */
/* Hero CTA */
document.getElementById('hero-cta')?.addEventListener('click', e => {
  e.preventDefault();
  Creator.open();
});

/* Item da sidebar "Faça sua aposta" */
document.getElementById('nav-bet')?.addEventListener('click', e => {
  e.preventDefault();
  Creator.open();
});

/* Botão da topbar */
document.getElementById('btn-create')?.addEventListener('click', () => Creator.open());

/* ---- 3c. REFRESH API ---- */
document.getElementById('btn-refresh')?.addEventListener('click', () => {
  const btn = document.getElementById('btn-refresh');
  if (btn) { btn.disabled = true; btn.classList.add('btn--spinning'); }
  loadApiEvents(true).finally(() => {
    if (btn) { btn.disabled = false; btn.classList.remove('btn--spinning'); }
  });
});

/* ---- 3b. PERFIL ---- */
/* Nome do usuário na topbar abre o perfil */
document.getElementById('topbar-profile-btn')?.addEventListener('click', () => Profile.open());

/* Evento disparado por auth.js (sidebar "Usuário") */
document.addEventListener('cravou:openprofile', () => Profile.open());

/* Rastreia a view atual para re-renderizar perfil quando necessário */
document.addEventListener('cravou:view', e => { currentView = e.detail; });

/* ---- 4. RENDER INICIAL (seed — UX instantânea) ---- */
renderAllEvents();
renderRanking();
initCarousel();
updateHeroStats();
updateFooter();

/* ---- 4b. CARREGAMENTO PROGRESSIVO DA API ---- */
loadApiEvents(false);

/* ============================================
   CARREGAMENTO DA API
   ============================================ */

async function loadApiEvents(showFeedback) {
  try {
    const evs = await Api.fetchEvents();
    state.apiEvents = evs;

    if (evs.length > 0) {
      renderAllEvents();
      rebuildCarousel();
      updateHeroStats();
      if (showFeedback) toast(t('api.updated'), 'success');
    } else {
      console.warn('[api] Nenhum evento retornado; mantendo seed.');
      if (showFeedback) toast(t('api.offline'), 'info');
    }
  } catch (err) {
    console.warn('[api] Falha ao carregar eventos da API:', err.message);
    if (showFeedback) toast(t('api.offline'), 'info');
  }
}

/* ---- 5. TIMERS ---- */
/* Atualiza countdowns a cada segundo */
setInterval(updateCountdowns, 1000);

/* Verifica mudanças de status a cada 30 segundos */
setInterval(() => {
  renderAllEvents();
  renderRanking();
}, 30_000);

/* ---- 6. EVENTOS GLOBAIS ---- */
document.addEventListener('cravou:authchange', () => {
  if (currentView === 'profile') {
    if (!state.user) Profile.close();
    else Profile.render();
  }
  renderAllEvents();
  renderRanking();
  updateHeroStats();
});

document.addEventListener('cravou:predictionchange', () => {
  if (currentView === 'profile') Profile.render();
  renderAllEvents();
  renderRanking();
});

document.addEventListener('cravou:langchange', () => {
  applyI18n();
  if (currentView === 'profile') Profile.render();
  renderAllEvents();
  renderRanking();
  rebuildCarousel();
  updateHeroStats();
});

/* ============================================
   RENDERIZAÇÃO DOS CARDS DE EVENTO
   ============================================ */

function renderAllEvents() {
  const evs      = allEvents();
  const open     = evs.filter(e => getEventStatus(e) === 'open');
  const live     = evs.filter(e => getEventStatus(e) === 'live');
  const finished = evs.filter(e => getEventStatus(e) === 'finished');

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

  /* Listeners: botões de palpite */
  grid.querySelectorAll('[data-event-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const ev = allEvents().find(e => e.id === btn.dataset.eventId);
      if (!ev) return;
      if (!state.user) {
        toast('Faça login para palpitar! 👤', 'info');
        openModal('modal-auth');
        return;
      }
      openPredictionModal(ev);
    });
  });

  /* Listeners: botões "Definir resultado" (bolões do dono) */
  grid.querySelectorAll('[data-set-result]').forEach(btn => {
    btn.addEventListener('click', () => {
      const ev = allEvents().find(e => e.id === btn.dataset.setResult);
      if (ev) openSetResultModal(ev);
    });
  });
}

function buildCardHTML(ev, status) {
  const pred   = state.predictions[ev.id];
  const points = (status === 'finished') ? calcPoints(pred, ev.result) : null;

  /* ---- Badges ---- */
  const statusBadge = {
    open:     `<span class="badge badge--open">🟢 ${t('events.open')}</span>`,
    live:     `<span class="badge badge--live">${t('events.live')}</span>`,
    finished: `<span class="badge badge--finished">🏁 ${t('events.finished')}</span>`
  }[status];

  const customBadge = ev.custom
    ? `<span class="badge badge--custom">🎲 ${t('create.customBadge')}</span>`
    : '';

  /* ---- Resultado ---- */
  let resultArea = '';
  if (status === 'finished' && ev.result) {
    resultArea = `
      <div class="event-card__result">${ev.result.home} × ${ev.result.away}</div>`;
  }

  /* ---- Countdown ---- */
  let countdownArea = '';
  if (status === 'open') {
    countdownArea = `
      <p class="event-card__countdown">
        ${t('events.countdown')}
        <span data-countdown="${ev.id}">${formatCountdown(ev.startTime)}</span>
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
  if (status === 'finished' && state.user && pred && points !== null) {
    const labels = {
      2: t('events.exact'),
      1: t('events.result_hit'),
      0: t('events.miss')
    };
    pointsArea = `<p class="event-card__points event-card__points--${points}">${labels[points]}</p>`;
  }

  /* ---- Botão de ação ---- */
  let actionBtn = '';
  if (status === 'open') {
    const label = pred ? `✏️ ${t('events.bet')}` : `🎯 ${t('events.bet')}`;
    actionBtn = `<button class="btn btn--primary btn--sm" data-event-id="${ev.id}">${label}</button>`;
  } else if (status === 'live') {
    actionBtn = `<button class="btn btn--outline btn--sm" disabled>${t('events.locked')}</button>`;
  } else if (status === 'finished' && ev.custom && !ev.result
             && state.user && ev.owner === state.user.name) {
    /* Dono pode definir resultado de bolões customizados ainda sem placar */
    actionBtn = `<button class="btn btn--outline btn--sm" data-set-result="${ev.id}">
                   🏁 ${t('create.setResult')}
                 </button>`;
  }

  return `
    <article class="event-card event-card--${status}">
      <div class="event-card__header">
        <span class="event-card__competition">${ev.competition}</span>
        <div class="event-card__badges">
          ${customBadge}
          ${statusBadge}
        </div>
      </div>
      <div class="event-card__teams">
        <span class="event-card__team">${teamHtml(ev.home, ev.hImg)}</span>
        <span class="event-card__vs">×</span>
        <span class="event-card__team">${teamHtml(ev.away, ev.aImg)}</span>
      </div>
      ${resultArea}
      ${countdownArea}
      ${predArea}
      ${pointsArea}
      ${actionBtn ? `<div class="event-card__action">${actionBtn}</div>` : ''}
    </article>`;
}

/* ============================================
   COUNTDOWNS
   ============================================ */

function updateCountdowns() {
  document.querySelectorAll('[data-countdown]').forEach(span => {
    const ev = allEvents().find(e => e.id === span.dataset.countdown);
    if (!ev) return;

    if (getEventStatus(ev) !== 'open') {
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
  const evs  = allEvents();
  const open = evs.filter(e => getEventStatus(e) === 'open').length;
  const statEvEl = document.getElementById('stat-events');
  const statOpEl = document.getElementById('stat-open');
  if (statEvEl) statEvEl.textContent = evs.length;
  if (statOpEl) statOpEl.textContent = open;
  /* Participantes: base fixa 9 + usuários cadastrados (localStorage) */
  const users = JSON.parse(localStorage.getItem('cravou_users') ?? '[]');
  const statPlEl = document.getElementById('stat-players');
  if (statPlEl) statPlEl.textContent = Math.max(9, users.length);
}

/* ============================================
   FOOTER
   ============================================ */

function updateFooter() {
  const now  = new Date();
  const year = now.getFullYear();
  const date = now.toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
  const el   = document.getElementById('footer-copy');
  if (el) el.textContent = `© ${year} Cravou · ${date}`;
}

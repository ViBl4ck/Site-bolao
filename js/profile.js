/* =============================================
   profile.js — Tela de perfil do usuário.
   Mostra estatísticas, histórico de palpites
   e bolões criados pelo usuário logado.
   ============================================= */

import { state }                       from './state.js';
import { all as allEvents, getEventStatus, calcPoints } from './events.js';
import { positionOf }                  from './ranking.js';
import { t }                           from './i18n.js';
import { toast, openModal }            from './ui.js';
import { openSetResultModal }          from './creator.js';
import { openPredictionModal }         from './predictions.js';

/* ============================================
   API PÚBLICA
   ============================================ */

export const Profile = {
  open() {
    if (!state.user) {
      toast(t('create.needLogin'), 'info');
      openModal('modal-auth');
      return;
    }
    document.getElementById('main-content').hidden = true;
    document.getElementById('profile-view').hidden = false;
    document.dispatchEvent(new CustomEvent('cravou:view', { detail: 'profile' }));
    Profile.render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  close() {
    document.getElementById('profile-view').hidden = true;
    document.getElementById('main-content').hidden = false;
    document.dispatchEvent(new CustomEvent('cravou:view', { detail: 'feed' }));
    window.scrollTo({ top: 0, behavior: 'smooth' });
  },

  render() {
    const el = document.getElementById('profile-view');
    if (!el || !state.user) return;

    const stats   = calcStats();
    const history = buildHistory();
    const boloes  = buildMyBoloes();

    el.innerHTML = buildProfileHTML(stats, history, boloes);

    /* ---- Listeners injetados pelo render ---- */

    /* Botão "← Voltar" */
    el.querySelector('#btn-profile-back')?.addEventListener('click', () => Profile.close());

    /* Botões "Definir resultado" nos Meus Bolões */
    el.querySelectorAll('[data-profile-set-result]').forEach(btn => {
      btn.addEventListener('click', () => {
        const ev = allEvents().find(e => e.id === btn.dataset.profileSetResult);
        if (ev) openSetResultModal(ev);
      });
    });

    /* Botões de palpite em eventos abertos do histórico */
    el.querySelectorAll('[data-profile-pred]').forEach(btn => {
      btn.addEventListener('click', () => {
        const ev = allEvents().find(e => e.id === btn.dataset.profilePred);
        if (ev) openPredictionModal(ev);
      });
    });
  }
};

/* ============================================
   ESTATÍSTICAS
   ============================================ */

function calcStats() {
  let pontos = 0, cravadas = 0, parciais = 0, erros = 0, resolvidos = 0, pendentes = 0;
  const evs = allEvents();

  Object.entries(state.predictions).forEach(([eventId, pred]) => {
    const ev = evs.find(e => e.id === eventId);
    if (!ev) return;

    const status = getEventStatus(ev);
    if (status === 'finished') {
      const pts = calcPoints(pred, ev.result);
      if (pts !== null) {
        resolvidos++;
        pontos  += pts;
        if (pts === 2) cravadas++;
        else if (pts === 1) parciais++;
        else erros++;
      } else {
        /* Encerrado mas sem resultado definido ainda */
        pendentes++;
      }
    } else {
      pendentes++;
    }
  });

  const aproveitamento = resolvidos > 0
    ? Math.round((pontos / (resolvidos * 2)) * 100)
    : 0;

  const posicao = positionOf(state.user.name);
  const criados = evs.filter(e => e.custom && e.owner === state.user.name).length;

  return { pontos, cravadas, parciais, erros, resolvidos, pendentes, aproveitamento, posicao, criados };
}

/* ============================================
   HISTÓRICO — ordena finished → live → open
   ============================================ */

function buildHistory() {
  const evs   = allEvents();
  const order = { finished: 0, live: 1, open: 2 };

  return Object.entries(state.predictions)
    .map(([eventId, pred]) => {
      const ev = evs.find(e => e.id === eventId);
      if (!ev) return null;
      const status = getEventStatus(ev);
      const pts    = status === 'finished' ? calcPoints(pred, ev.result) : null;
      return { ev, pred, status, pts };
    })
    .filter(Boolean)
    .sort((a, b) => order[a.status] - order[b.status]);
}

/* ============================================
   MEUS BOLÕES — eventos custom criados pelo usuário
   ============================================ */

function buildMyBoloes() {
  return allEvents()
    .filter(e => e.custom && e.owner === state.user.name)
    .sort((a, b) => b.startTime - a.startTime);
}

/* ============================================
   CONSTRUTORES DE HTML
   ============================================ */

function buildProfileHTML(stats, history, boloes) {
  const { pontos, cravadas, parciais, erros, pendentes, aproveitamento, posicao, criados } = stats;
  const initial     = state.user.name.charAt(0).toUpperCase();
  const rankBadgeHtml = posicao
    ? `<span class="profile-rank-badge">🏅 #${posicao} ${t('profile.rankBadge')}</span>`
    : '';

  return `
    <!-- ===== CABEÇALHO ===== -->
    <div class="profile-header">
      <button id="btn-profile-back" class="btn btn--outline btn--sm profile-back">
        ← ${t('profile.back')}
      </button>
      <div class="profile-identity">
        <div class="profile-avatar" aria-hidden="true">${initial}</div>
        <div class="profile-identity__info">
          <h1 class="profile-name">${state.user.name}</h1>
          ${rankBadgeHtml}
        </div>
      </div>
    </div>

    <!-- ===== GRID DE STATS ===== -->
    <div class="profile-stats" aria-label="Estatísticas">
      ${statCard('🎯', pontos,              t('profile.stPoints'))}
      ${statCard('📊', aproveitamento + '%', t('profile.stAccuracy'))}
      ${statCard('✅', cravadas,            t('profile.stExact'))}
      ${statCard('👍', parciais,            t('profile.stPartial'))}
      ${statCard('❌', erros,               t('profile.stMiss'))}
      ${statCard('⏳', pendentes,           t('profile.stPending'))}
      ${statCard('🎲', criados,             t('profile.stCreated'))}
    </div>

    <!-- ===== HISTÓRICO DE PALPITES ===== -->
    <section class="profile-section" aria-labelledby="profile-history-title">
      <h2 class="section__title" id="profile-history-title">${t('profile.history')}</h2>
      ${history.length === 0
        ? `<div class="empty-state">
             <div class="empty-state__icon">🔮</div>
             ${t('profile.emptyHistory')}
           </div>`
        : `<div class="history-list">${history.map(buildHistoryRow).join('')}</div>`
      }
    </section>

    <!-- ===== MEUS BOLÕES ===== -->
    <section class="profile-section" aria-labelledby="profile-pools-title">
      <h2 class="section__title" id="profile-pools-title">${t('profile.myPools')}</h2>
      ${boloes.length === 0
        ? `<div class="empty-state">
             <div class="empty-state__icon">📋</div>
             ${t('profile.emptyPools')}
           </div>`
        : `<div class="boloes-list">${boloes.map(buildBolaoRow).join('')}</div>`
      }
    </section>
  `;
}

function statCard(icon, value, label) {
  return `
    <div class="stat-card">
      <span class="stat-card__icon" aria-hidden="true">${icon}</span>
      <span class="stat-card__value">${value}</span>
      <span class="stat-card__label">${label}</span>
    </div>`;
}

function buildHistoryRow({ ev, pred, status, pts }) {
  const statusBadge = {
    open:     `<span class="badge badge--open">🟢 ${t('events.open')}</span>`,
    live:     `<span class="badge badge--live">${t('events.live')}</span>`,
    finished: `<span class="badge badge--finished">🏁 ${t('events.finished')}</span>`
  }[status];

  const resultHtml = status === 'finished' && ev.result
    ? `<span class="history-row__result">${t('events.result')} <strong>${ev.result.home}×${ev.result.away}</strong></span>`
    : '';

  const ptsPill = pts !== null
    ? `<span class="pts-pill pts-pill--${pts}">${
        pts === 2 ? '✅ +2' : pts === 1 ? '👍 +1' : '❌ 0'
      }</span>`
    : '';

  /* Botão de palpite para eventos ainda abertos */
  const betBtn = status === 'open'
    ? `<button class="btn btn--primary btn--sm" data-profile-pred="${ev.id}">
         ✏️ ${t('events.bet')}
       </button>`
    : '';

  return `
    <div class="history-row">
      <div class="history-row__main">
        <span class="history-row__teams">${ev.home} × ${ev.away}</span>
        <span class="history-row__comp">${ev.competition}</span>
      </div>
      <div class="history-row__details">
        ${statusBadge}
        <span class="history-row__pred">${t('profile.palpite')}: <strong>${pred.home}×${pred.away}</strong></span>
        ${resultHtml}
        ${ptsPill}
        ${betBtn}
      </div>
    </div>`;
}

function buildBolaoRow(ev) {
  const status = getEventStatus(ev);
  const statusBadge = {
    open:     `<span class="badge badge--open">🟢 ${t('events.open')}</span>`,
    live:     `<span class="badge badge--live">${t('events.live')}</span>`,
    finished: `<span class="badge badge--finished">🏁 ${t('events.finished')}</span>`
  }[status];

  const resultHtml = ev.result
    ? `<span class="history-row__result">${t('events.result')} <strong>${ev.result.home}×${ev.result.away}</strong></span>`
    : '';

  const setResultBtn = status === 'finished' && !ev.result
    ? `<button class="btn btn--outline btn--sm" data-profile-set-result="${ev.id}">
         🏁 ${t('create.setResult')}
       </button>`
    : '';

  const participants = Object.keys(state.predictions)
    .filter(id => id === ev.id).length;

  return `
    <div class="history-row">
      <div class="history-row__main">
        <span class="history-row__teams">${ev.home} × ${ev.away}</span>
        <span class="history-row__comp">${ev.competition}</span>
      </div>
      <div class="history-row__details">
        ${statusBadge}
        ${resultHtml}
        ${setResultBtn}
      </div>
    </div>`;
}

/* =============================================
   ranking.js — Ranking base + pontos do usuário.
   Mescla os pontos fixos com os calculados de palpites.
   ============================================= */

import { rankingBase }          from './data.js';
import { state }               from './state.js';
import { all as allEvents, getEventStatus, calcPoints } from './events.js';
import { t }                   from './i18n.js';

/* Calcula os pontos acumulados do usuário nos eventos encerrados (seed + custom) */
function calcUserPoints() {
  if (!state.user) return 0;

  return allEvents().reduce((total, ev) => {
    if (getEventStatus(ev) !== 'finished') return total;
    const pred = state.predictions[ev.id];
    const pts  = calcPoints(pred, ev.result);
    return total + (pts ?? 0);
  }, 0);
}

/* Retorna a tabela de ranking ordenada, com o usuário mesclado */
export function getRanking() {
  /* Cópia profunda para não mutar rankingBase */
  const table = rankingBase.map(r => ({ ...r }));

  if (state.user) {
    const eventPts = calcUserPoints();
    const idx      = table.findIndex(
      r => r.name.toLowerCase() === state.user.name.toLowerCase()
    );

    if (idx >= 0) {
      table[idx].points += eventPts;
    } else {
      table.push({ name: state.user.name, points: eventPts, isNew: true });
    }
  }

  return table.sort((a, b) => b.points - a.points);
}

/* Retorna a posição (1-based) de um usuário no ranking. Retorna null se não encontrado. */
export function positionOf(username) {
  if (!username) return null;
  const table = getRanking();
  const idx   = table.findIndex(r => r.name.toLowerCase() === username.toLowerCase());
  return idx >= 0 ? idx + 1 : null;
}

/* Renderiza o ranking no DOM */
export function renderRanking() {
  const el = document.getElementById('ranking-list');
  if (!el) return;

  const table  = getRanking();
  const medals = ['🥇', '🥈', '🥉'];

  el.innerHTML = table.map((row, i) => {
    const pos     = i + 1;
    const isMe    = state.user && row.name.toLowerCase() === state.user.name.toLowerCase();
    const medal   = medals[i] ?? '';

    return `
      <div class="ranking__row${isMe ? ' ranking__row--me' : ''}">
        <div class="ranking__pos">
          ${medal
            ? `<span class="ranking__medal">${medal}</span>`
            : `<span>${pos}°</span>`}
        </div>
        <div class="ranking__name">
          ${row.name}${isMe ? ` <small class="text-accent">(${t('ranking.you')})</small>` : ''}
        </div>
        <div class="ranking__pts">
          ${row.points}
          <span class="ranking__pts-label"> ${t('ranking.pts')}</span>
        </div>
      </div>
    `;
  }).join('');
}

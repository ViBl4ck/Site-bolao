/* =============================================
   creator.js — Feature "Faça seu Bolão".
   Cria rodadas com confrontos customizados,
   persiste em localStorage e integra com
   o ciclo de vida e pontuação existentes.
   ============================================= */

import { state }                  from './state.js';
import { addCustom, setResult }    from './events.js';
import { openModal, closeModal, toast } from './ui.js';
import { playSuccess, playClick }  from './sound.js';
import { t }                       from './i18n.js';

const MAX_ROWS = 6;

/* Categoria selecionada no formulário */
let selectedCategory = 'esportes';

/* ID do evento aguardando definição de resultado */
let pendingResultId  = null;

/* ============================================
   API PÚBLICA
   ============================================ */

export const Creator = {
  /* Verifica login → abre modal de criação */
  open() {
    if (!state.user) {
      toast(t('create.needLogin'), 'info');
      openModal('modal-auth');
      return;
    }
    resetForm();
    openModal('modal-creator');
  }
};

/* Abre modal de definição de resultado para um evento customizado */
export function openSetResultModal(ev) {
  pendingResultId = ev.id;
  const nameEl = document.getElementById('set-result-event-name');
  if (nameEl) nameEl.textContent = `${ev.home} × ${ev.away} — ${ev.competition}`;

  const homeEl = document.getElementById('set-result-home');
  const awayEl = document.getElementById('set-result-away');
  if (homeEl) homeEl.value = 0;
  if (awayEl) awayEl.value = 0;

  openModal('modal-set-result');
  homeEl?.focus();
}

/* ============================================
   INICIALIZAÇÃO — liga todos os listeners do DOM
   ============================================ */

export function initCreator() {
  /* Botões de categoria */
  document.querySelectorAll('[data-cat]').forEach(btn => {
    btn.addEventListener('click', () => {
      selectedCategory = btn.dataset.cat;
      updateCategoryUI();
      playClick();
    });
  });

  /* Adicionar linha de confronto */
  document.getElementById('creator-add-row')?.addEventListener('click', addRow);

  /* Salvar bolão */
  document.getElementById('btn-creator-save')?.addEventListener('click', save);

  /* Confirmar resultado */
  document.getElementById('btn-confirm-result')?.addEventListener('click', confirmResult);

  /* Enter nos inputs de placar do set-result */
  ['set-result-home', 'set-result-away'].forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', e => {
      if (e.key === 'Enter') confirmResult();
    });
  });
}

/* ============================================
   RESET DO FORMULÁRIO
   ============================================ */

function resetForm() {
  const nameEl = document.getElementById('creator-name');
  const errEl  = document.getElementById('creator-error');
  if (nameEl) nameEl.value = '';
  if (errEl)  errEl.textContent = '';

  selectedCategory = 'esportes';
  updateCategoryUI();

  /* Datas padrão: palpites fecham em 1h, encerra em 3h */
  const now   = new Date();
  const start = new Date(now.getTime() + 3_600_000);
  const end   = new Date(now.getTime() + 3 * 3_600_000);

  const startEl = document.getElementById('creator-start');
  const endEl   = document.getElementById('creator-end');
  if (startEl) startEl.value = toDatetimeLocal(start);
  if (endEl)   endEl.value   = toDatetimeLocal(end);

  /* Reinicia confrontos com uma linha vazia */
  const list = document.getElementById('creator-matchups');
  if (list) {
    list.innerHTML = '';
    addRow();
  }
}

/* ============================================
   LINHA DE CONFRONTO
   ============================================ */

function addRow() {
  const list = document.getElementById('creator-matchups');
  if (!list) return;

  if (list.children.length >= MAX_ROWS) {
    toast(`Máximo de ${MAX_ROWS} confrontos por rodada.`, 'info');
    return;
  }

  const row = document.createElement('div');
  row.className = 'matchup-row';
  row.innerHTML = `
    <input type="text" class="matchup-input" placeholder="${t('create.vsA')}"
           aria-label="Time A" autocomplete="off">
    <input type="text" class="matchup-emoji" value="🏠"
           aria-label="Emoji A" maxlength="2">
    <span class="matchup-vs">×</span>
    <input type="text" class="matchup-emoji" value="✈️"
           aria-label="Emoji B" maxlength="2">
    <input type="text" class="matchup-input" placeholder="${t('create.vsB')}"
           aria-label="Time B" autocomplete="off">
    <button type="button" class="matchup-remove"
            aria-label="${t('create.removeMatch')}">✕</button>
  `;

  row.querySelector('.matchup-remove').addEventListener('click', () => {
    const l = document.getElementById('creator-matchups');
    if (l && l.children.length <= 1) {
      toast('Mínimo de 1 confronto.', 'info');
      return;
    }
    row.remove();
  });

  list.appendChild(row);

  /* Foca o primeiro input da nova linha */
  row.querySelector('.matchup-input')?.focus();
}

/* ============================================
   SALVAR BOLÃO
   ============================================ */

function save() {
  const name     = (document.getElementById('creator-name')?.value ?? '').trim();
  const errEl    = document.getElementById('creator-error');
  const startVal = document.getElementById('creator-start')?.value ?? '';
  const endVal   = document.getElementById('creator-end')?.value ?? '';

  /* Validação: nome */
  if (!name) {
    if (errEl) errEl.textContent = t('create.errNoName');
    return;
  }

  /* Coleta confrontos com ambos os lados preenchidos */
  const rows     = [...document.querySelectorAll('#creator-matchups .matchup-row')];
  const matchups = rows.map(row => {
    const inputs = [...row.querySelectorAll('.matchup-input')];
    const emojis = [...row.querySelectorAll('.matchup-emoji')];
    return {
      homeTeam:  (inputs[0]?.value ?? '').trim(),
      homeEmoji: (emojis[0]?.value ?? '').trim() || '🏠',
      awayEmoji: (emojis[1]?.value ?? '').trim() || '✈️',
      awayTeam:  (inputs[1]?.value ?? '').trim()
    };
  }).filter(m => m.homeTeam && m.awayTeam);

  if (matchups.length === 0) {
    if (errEl) errEl.textContent = t('create.errNoMatch');
    return;
  }

  /* Validação: datas */
  const startTime = new Date(startVal).getTime();
  const endTime   = new Date(endVal).getTime();

  if (!startVal || !endVal || isNaN(startTime) || isNaN(endTime) || startTime >= endTime) {
    if (errEl) errEl.textContent = t('create.errDates');
    return;
  }

  /* Gera um evento compatível com o seed por confronto */
  const base = Date.now();
  matchups.forEach((m, i) => {
    addCustom({
      id:          `c_${base}_${i}`,
      home:        `${m.homeTeam} ${m.homeEmoji}`,
      away:        `${m.awayEmoji} ${m.awayTeam}`,
      competition: name,
      category:    selectedCategory,
      startTime,
      endTime,
      result:      null,
      featured:    false,
      custom:      true,
      owner:       state.user.name
    });
  });

  closeModal('modal-creator');
  playSuccess();
  toast(`${t('create.created')} "${name}" 🎯`, 'success');
  /* Re-renderiza cards, ranking e stats */
  document.dispatchEvent(new CustomEvent('cravou:authchange'));
}

/* ============================================
   DEFINIR RESULTADO
   ============================================ */

function confirmResult() {
  if (!pendingResultId) return;

  const homeScore = parseInt(document.getElementById('set-result-home')?.value ?? '0', 10);
  const awayScore = parseInt(document.getElementById('set-result-away')?.value ?? '0', 10);

  if (isNaN(homeScore) || isNaN(awayScore) || homeScore < 0 || awayScore < 0) {
    toast('Placar inválido.', 'error');
    return;
  }

  setResult(pendingResultId, homeScore, awayScore);
  closeModal('modal-set-result');
  playSuccess();
  toast('✅ Resultado definido! Pontos calculados.', 'success');
  pendingResultId = null;
  /* setResult já dispara cravou:authchange → re-render automático */
}

/* ============================================
   HELPERS
   ============================================ */

function toDatetimeLocal(date) {
  const pad = n => String(n).padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
         `T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function updateCategoryUI() {
  document.querySelectorAll('[data-cat]').forEach(btn => {
    btn.classList.toggle('settings-option--active', btn.dataset.cat === selectedCategory);
  });
}

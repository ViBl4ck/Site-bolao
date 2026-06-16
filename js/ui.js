/* =============================================
   ui.js — Helpers de interface: toasts, modais.
   ============================================= */

/* --- TEAM BADGE ---
   Retorna HTML inline do time: imagem do escudo (API) ou o nome/emoji (seed/custom).
   O onerror esconde a imagem quebrada sem deixar alt text visível. */
export function teamHtml(name, img) {
  if (!img) return name;
  const safe = name.replace(/[<>"&]/g, c => ({ '<':'&lt;', '>':'&gt;', '"':'&quot;', '&':'&amp;' }[c]));
  return `<img src="${img}" class="team-badge" loading="lazy" alt="" aria-hidden="true"
    onerror="this.style.display='none'"><span class="team-badge__name">${safe}</span>`;
}

/* --- TOASTS --- */
export function toast(msg, type = 'info', duration = 3500) {
  const container = document.getElementById('toast-container');
  if (!container) return;

  const el = document.createElement('div');
  el.className = `toast toast--${type}`;
  el.setAttribute('role', 'alert');
  el.textContent = msg;
  container.appendChild(el);

  /* Reflow → classe de visibilidade → animação de entrada */
  requestAnimationFrame(() => {
    requestAnimationFrame(() => el.classList.add('toast--visible'));
  });

  setTimeout(() => {
    el.classList.remove('toast--visible');
    el.addEventListener('transitionend', () => el.remove(), { once: true });
  }, duration);
}

/* --- MODAIS --- */
export function openModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.add('modal--open');
  document.body.classList.add('modal-open');
  /* Foca o primeiro campo interativo para acessibilidade */
  const first = modal.querySelector('input, button:not(.modal__close)');
  if (first) setTimeout(() => first.focus(), 50);
}

export function closeModal(id) {
  const modal = document.getElementById(id);
  if (!modal) return;
  modal.classList.remove('modal--open');
  document.body.classList.remove('modal-open');
}

/* Fecha qualquer modal aberto ao clicar no overlay ou em [data-close] */
export function setupModalClose() {
  document.addEventListener('click', e => {
    /* Botão com data-close="id-do-modal" */
    if (e.target.dataset.close) {
      closeModal(e.target.dataset.close);
      return;
    }
    /* Clique direto no fundo do modal (não na caixa interna) */
    if (e.target.classList.contains('modal--open')) {
      closeModal(e.target.id);
    }
  });

  /* Fechar com Escape */
  document.addEventListener('keydown', e => {
    if (e.key !== 'Escape') return;
    document.querySelectorAll('.modal--open').forEach(m => closeModal(m.id));
  });
}

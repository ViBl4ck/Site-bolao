/* =============================================
   sidebar.js — Sidebar retrátil.
   Botão ☰ abre, overlay e botão ✕ fecham.
   ============================================= */

export function initSidebar() {
  const sidebar  = document.getElementById('sidebar');
  const overlay  = document.getElementById('overlay');
  const menuBtn  = document.getElementById('menu-btn');
  const closeBtn = document.getElementById('sidebar-close');

  function open() {
    sidebar?.classList.add('sidebar--open');
    overlay?.classList.add('overlay--visible');
    menuBtn?.setAttribute('aria-expanded', 'true');
  }

  function close() {
    sidebar?.classList.remove('sidebar--open');
    overlay?.classList.remove('overlay--visible');
    menuBtn?.setAttribute('aria-expanded', 'false');
  }

  menuBtn?.addEventListener('click', open);
  closeBtn?.addEventListener('click', close);
  overlay?.addEventListener('click', close);

  /* Fechar ao clicar em links de âncora dentro da sidebar */
  sidebar?.querySelectorAll('a[href^="#"]').forEach(link => {
    link.addEventListener('click', close);
  });

  /* Fechar com Escape */
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') close();
  });
}

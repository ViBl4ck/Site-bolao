/* =============================================
   carousel.js — Carrossel rotativo dos destaques.
   Auto-avança a cada 5s, pausa no hover,
   setas ‹ › e dots clicáveis.
   ============================================= */

import { events }          from './data.js';
import { getEventStatus }  from './events.js';
import { t }               from './i18n.js';

let currentSlide   = 0;
let timer          = null;
let featuredEvents = [];

const INTERVAL = 5000;

/* ---- Cria os slides no DOM ---- */
function renderSlides() {
  const track = document.getElementById('carousel-track');
  if (!track) return;
  track.innerHTML = '';

  featuredEvents.forEach(ev => {
    const status = getEventStatus(ev);
    const slide  = document.createElement('div');
    slide.className = 'carousel__slide';

    const badgeMap = {
      open:     `<span class="badge badge--open">🟢 ${t('events.open')}</span>`,
      live:     `<span class="badge badge--live">Ao Vivo</span>`,
      finished: `<span class="badge badge--finished">🏁 ${t('events.finished')}</span>`
    };

    const resultHtml = ev.result
      ? `<div class="event-card__result">${ev.result.home} × ${ev.result.away}</div>`
      : '';

    slide.innerHTML = `
      <div class="event-card event-card--${status}">
        <div class="event-card__header">
          <span class="event-card__competition">${ev.competition}</span>
          ${badgeMap[status]}
        </div>
        <div class="event-card__teams">
          <span class="event-card__team">${ev.home}</span>
          <span class="event-card__vs">×</span>
          <span class="event-card__team">${ev.away}</span>
        </div>
        ${resultHtml}
      </div>
    `;

    track.appendChild(slide);
  });
}

/* ---- Cria os dots indicadores ---- */
function renderDots() {
  const dotsEl = document.getElementById('carousel-dots');
  if (!dotsEl) return;
  dotsEl.innerHTML = '';

  featuredEvents.forEach((_, i) => {
    const dot = document.createElement('button');
    dot.className    = `carousel__dot${i === 0 ? ' carousel__dot--active' : ''}`;
    dot.setAttribute('aria-label', `Slide ${i + 1}`);
    dot.addEventListener('click', () => goTo(i));
    dotsEl.appendChild(dot);
  });
}

/* ---- Aplica posição e atualiza dots ---- */
function updateCarousel() {
  const track = document.getElementById('carousel-track');
  if (track) track.style.transform = `translateX(-${currentSlide * 100}%)`;

  document.querySelectorAll('.carousel__dot').forEach((dot, i) => {
    dot.classList.toggle('carousel__dot--active', i === currentSlide);
  });
}

function goTo(index) {
  currentSlide = (index + featuredEvents.length) % featuredEvents.length;
  updateCarousel();
}

function next() { goTo(currentSlide + 1); }
function prev() { goTo(currentSlide - 1); }

/* ---- Timer de auto-avanço ---- */
function startTimer() {
  stopTimer();
  timer = setInterval(next, INTERVAL);
}

function stopTimer()  { clearInterval(timer); timer = null; }
function resetTimer() { startTimer(); }

/* ---- Inicialização pública ---- */
export function initCarousel() {
  featuredEvents = events.filter(e => e.featured);
  if (featuredEvents.length === 0) return;

  renderSlides();
  renderDots();
  updateCarousel();
  startTimer();

  document.getElementById('carousel-prev')?.addEventListener('click', () => {
    prev(); resetTimer();
  });

  document.getElementById('carousel-next')?.addEventListener('click', () => {
    next(); resetTimer();
  });

  const wrap = document.getElementById('carousel');
  wrap?.addEventListener('mouseenter', stopTimer);
  wrap?.addEventListener('mouseleave', startTimer);

  /* Suporte a swipe em toque */
  let touchStartX = 0;
  wrap?.addEventListener('touchstart', e => { touchStartX = e.changedTouches[0].clientX; }, { passive: true });
  wrap?.addEventListener('touchend', e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) < 40) return;
    dx < 0 ? next() : prev();
    resetTimer();
  });
}

/* Reconstrói os slides (chamado após troca de idioma) */
export function rebuildCarousel() {
  renderSlides();
}

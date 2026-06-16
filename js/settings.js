/* =============================================
   settings.js — Modal de configurações.
   Controla tema, idioma, volume, fonte e acessibilidade.
   Tudo persistido via state.saveSettings().
   ============================================= */

import { state, saveSettings } from './state.js';
import { apply as applyI18n }  from './i18n.js';
import { playClick }           from './sound.js';
import { openModal }           from './ui.js';

const FONT_SIZES = { S: '14px', M: '16px', L: '19px' };

/* Aplica as configurações atuais ao DOM */
export function applySettings(s = state.settings) {
  const html = document.documentElement;

  /* Tema */
  html.dataset.theme = s.theme;

  /* Contraste */
  html.dataset.contrast = s.contrast === 'high' ? 'high' : 'normal';

  /* Reduzir animações */
  html.dataset.motion = s.motion === 'reduce' ? 'reduce' : 'normal';

  /* Tamanho de fonte */
  html.style.setProperty('--fs', FONT_SIZES[s.fontSize] ?? '16px');

  /* Idioma */
  applyI18n();

  /* Sincroniza controles visuais do modal */
  syncModalControls(s);
}

/* Atualiza o estado visual dos botões e sliders no modal */
function syncModalControls(s) {
  /* Botões de opção — apenas os com data-setting (ignora data-cat do criador) */
  document.querySelectorAll('.settings-option[data-setting]').forEach(btn => {
    const setting = btn.dataset.setting;
    const value   = btn.dataset.value;
    const active  = String(s[setting]) === String(value);
    btn.classList.toggle('settings-option--active', active);
  });

  /* Slider de volume */
  const slider = document.getElementById('volume-slider');
  if (slider) {
    slider.value = s.volume;
    updateVolumeDisplay(s.volume);
  }

  /* Toggles de acessibilidade */
  const toggleContrast = document.getElementById('toggle-contrast');
  const toggleMotion   = document.getElementById('toggle-motion');
  if (toggleContrast) toggleContrast.checked = s.contrast === 'high';
  if (toggleMotion)   toggleMotion.checked   = s.motion   === 'reduce';
}

function updateVolumeDisplay(val) {
  const display = document.getElementById('volume-display');
  if (display) display.textContent = `${Math.round(val * 100)}%`;
}

/* Aplica e persiste uma mudança de configuração */
function changeSetting(key, value) {
  state.settings[key] = value;
  saveSettings();
  applySettings();
  playClick();

  /* Troca de idioma re-renderiza eventos e ranking */
  if (key === 'lang') {
    document.dispatchEvent(new CustomEvent('cravou:langchange'));
  }
}

/* Inicializa o modal e todos os controles */
export function initSettings() {
  applySettings();

  /* Botão de abrir modal */
  document.getElementById('btn-settings')?.addEventListener('click', () => {
    syncModalControls(state.settings);
    openModal('modal-settings');
  });

  /* Botões de opção (tema, idioma, fonte) — apenas os com data-setting */
  document.querySelectorAll('.settings-option[data-setting]').forEach(btn => {
    btn.addEventListener('click', () => {
      const { setting, value } = btn.dataset;
      if (setting) changeSetting(setting, value);
    });
  });

  /* Slider de volume */
  document.getElementById('volume-slider')?.addEventListener('input', e => {
    const vol = parseFloat(e.target.value);
    state.settings.volume = vol;
    saveSettings();
    updateVolumeDisplay(vol);
    playClick(); /* testa o volume em tempo real */
  });

  /* Toggle de alto contraste */
  document.getElementById('toggle-contrast')?.addEventListener('change', e => {
    changeSetting('contrast', e.target.checked ? 'high' : 'normal');
  });

  /* Toggle de reduzir animações */
  document.getElementById('toggle-motion')?.addEventListener('change', e => {
    changeSetting('motion', e.target.checked ? 'reduce' : 'normal');
  });
}

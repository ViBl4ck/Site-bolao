/* =============================================
   i18n.js — Internacionalização PT / EN / ES.
   Uso: marque elementos com data-i18n="chave".
   apply() re-renderiza todos os textos.
   ============================================= */

import { state } from './state.js';

export const dict = {
  pt: {
    /* Nav */
    'nav.user':       '👤 Usuário',
    'nav.games':      '🎮 Jogos',
    'nav.sports':     '⚽ Esportes',
    'nav.category':   '🏷️ Categoria',
    'nav.live':       '🔴 Ao Vivo',
    'nav.bet':        '🎯 Faça sua aposta',
    /* Hero */
    'hero.title':     'Cravou! O seu bolão definitivo.',
    'hero.subtitle':  'Palpite em esportes, jogos e eventos. Compete com seus amigos e mostre quem cravou!',
    'hero.cta':       'Faça seu Bolão 🎯',
    'hero.stat.events':  'Eventos',
    'hero.stat.players': 'Participantes',
    'hero.stat.open':    'Em aberto',
    /* Carousel */
    'carousel.title': '🌟 Destaques',
    /* Eventos */
    'events.open':       'Abertos',
    'events.live':       'Ao Vivo',
    'events.finished':   'Encerrados',
    'events.bet':        'Palpitar',
    'events.locked':     '🔒 Em andamento',
    'events.countdown':  'Começa em:',
    'events.yourPred':   'Seu palpite:',
    'events.result':     'Resultado:',
    'events.pts':        'pts',
    'events.exact':      '✅ Placar exato! +2pts',
    'events.result_hit': '👍 Resultado certo! +1pt',
    'events.miss':       '❌ Errou. +0pts',
    /* Auth */
    'auth.login':    'Entrar',
    'auth.logout':   'Sair',
    'auth.register': 'Cadastrar',
    'auth.name':     'Nome',
    'auth.email':    'E-mail',
    'auth.password': 'Senha',
    /* Prediction */
    'prediction.title': 'Seu Palpite',
    'prediction.save':  'Cravou! 🎯',
    'prediction.saved': '✅ Palpite salvo!',
    /* Ranking */
    'ranking.title': 'Ranking',
    'ranking.pts':   'pts',
    'ranking.you':   'você',
    /* Settings */
    'settings.title':       'Configurações',
    'settings.theme':       'Tema',
    'settings.light':       '☀️ Claro',
    'settings.dark':        '🌙 Escuro',
    'settings.lang':        'Idioma',
    'settings.volume':      'Volume',
    'settings.fontSize':    'Tamanho de Fonte',
    'settings.fontS':       'P',
    'settings.fontM':       'M',
    'settings.fontL':       'G',
    'settings.accessibility': 'Acessibilidade',
    'settings.contrast':    'Alto contraste',
    'settings.motion':      'Reduzir animações'
  },

  en: {
    'nav.user':       '👤 User',
    'nav.games':      '🎮 Games',
    'nav.sports':     '⚽ Sports',
    'nav.category':   '🏷️ Category',
    'nav.live':       '🔴 Live',
    'nav.bet':        '🎯 Place your bet',
    'hero.title':     'Nailed it! Your ultimate pool.',
    'hero.subtitle':  'Predict sports, games and events. Compete with friends and prove who\'s the best!',
    'hero.cta':       'Join the Pool 🎯',
    'hero.stat.events':  'Events',
    'hero.stat.players': 'Players',
    'hero.stat.open':    'Open',
    'carousel.title': '🌟 Featured',
    'events.open':       'Open',
    'events.live':       'Live',
    'events.finished':   'Finished',
    'events.bet':        'Predict',
    'events.locked':     '🔒 In progress',
    'events.countdown':  'Starts in:',
    'events.yourPred':   'Your pick:',
    'events.result':     'Result:',
    'events.pts':        'pts',
    'events.exact':      '✅ Exact score! +2pts',
    'events.result_hit': '👍 Correct result! +1pt',
    'events.miss':       '❌ Missed. +0pts',
    'auth.login':    'Sign in',
    'auth.logout':   'Sign out',
    'auth.register': 'Sign up',
    'auth.name':     'Name',
    'auth.email':    'Email',
    'auth.password': 'Password',
    'prediction.title': 'Your Prediction',
    'prediction.save':  'Lock it in! 🎯',
    'prediction.saved': '✅ Prediction saved!',
    'ranking.title': 'Ranking',
    'ranking.pts':   'pts',
    'ranking.you':   'you',
    'settings.title':       'Settings',
    'settings.theme':       'Theme',
    'settings.light':       '☀️ Light',
    'settings.dark':        '🌙 Dark',
    'settings.lang':        'Language',
    'settings.volume':      'Volume',
    'settings.fontSize':    'Font Size',
    'settings.fontS':       'S',
    'settings.fontM':       'M',
    'settings.fontL':       'L',
    'settings.accessibility': 'Accessibility',
    'settings.contrast':    'High contrast',
    'settings.motion':      'Reduce motion'
  },

  es: {
    'nav.user':       '👤 Usuario',
    'nav.games':      '🎮 Juegos',
    'nav.sports':     '⚽ Deportes',
    'nav.category':   '🏷️ Categoría',
    'nav.live':       '🔴 En Vivo',
    'nav.bet':        '🎯 Haz tu apuesta',
    'hero.title':     '¡Clavado! Tu quiniela definitiva.',
    'hero.subtitle':  'Predice deportes, juegos y eventos. Compite con amigos y demuestra quién es el mejor.',
    'hero.cta':       'Hacer mi Quiniela 🎯',
    'hero.stat.events':  'Eventos',
    'hero.stat.players': 'Participantes',
    'hero.stat.open':    'Abiertos',
    'carousel.title': '🌟 Destacados',
    'events.open':       'Abiertos',
    'events.live':       'En Vivo',
    'events.finished':   'Finalizados',
    'events.bet':        'Apostar',
    'events.locked':     '🔒 En curso',
    'events.countdown':  'Empieza en:',
    'events.yourPred':   'Tu apuesta:',
    'events.result':     'Resultado:',
    'events.pts':        'pts',
    'events.exact':      '✅ ¡Marcador exacto! +2pts',
    'events.result_hit': '👍 ¡Resultado correcto! +1pt',
    'events.miss':       '❌ Fallaste. +0pts',
    'auth.login':    'Entrar',
    'auth.logout':   'Salir',
    'auth.register': 'Registrarse',
    'auth.name':     'Nombre',
    'auth.email':    'Correo',
    'auth.password': 'Contraseña',
    'prediction.title': 'Tu Predicción',
    'prediction.save':  '¡Clavado! 🎯',
    'prediction.saved': '✅ ¡Predicción guardada!',
    'ranking.title': 'Clasificación',
    'ranking.pts':   'pts',
    'ranking.you':   'tú',
    'settings.title':       'Configuración',
    'settings.theme':       'Tema',
    'settings.light':       '☀️ Claro',
    'settings.dark':        '🌙 Oscuro',
    'settings.lang':        'Idioma',
    'settings.volume':      'Volumen',
    'settings.fontSize':    'Tamaño de Fuente',
    'settings.fontS':       'P',
    'settings.fontM':       'M',
    'settings.fontL':       'G',
    'settings.accessibility': 'Accesibilidad',
    'settings.contrast':    'Alto contraste',
    'settings.motion':      'Reducir animaciones'
  }
};

/* Retorna a tradução da chave no idioma atual */
export function t(key) {
  const lang = state.settings.lang || 'pt';
  return (dict[lang] && dict[lang][key]) || dict['pt'][key] || key;
}

/* Aplica traduções em todos os elementos [data-i18n] */
export function apply() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(el.dataset.i18n);
  });
  document.documentElement.lang =
    state.settings.lang === 'en' ? 'en' :
    state.settings.lang === 'es' ? 'es' : 'pt-BR';
}

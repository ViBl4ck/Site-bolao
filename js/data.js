/* =============================================
   data.js — Seed de eventos e ranking base.
   Timestamps relativos ao momento do carregamento
   para garantir os 3 estados (open/live/finished).
   ============================================= */

const now = Date.now();
const H   = 3_600_000; /* 1 hora em ms */

export const events = [
  {
    id:          'evt-brasil-marrocos',
    home:        'Brasil 🇧🇷',
    away:        '🇲🇦 Marrocos',
    competition: 'Copa do Mundo',
    category:    'esportes',
    startTime:   now - 4 * H,
    endTime:     now - 2 * H,
    result:      { home: 1, away: 1 },
    featured:    true
  },
  {
    id:          'evt-holanda-japao',
    home:        'Holanda 🇳🇱',
    away:        '🇯🇵 Japão',
    competition: 'Amistoso Internacional',
    category:    'esportes',
    startTime:   now - 3 * H,
    endTime:     now - 1 * H,
    result:      { home: 2, away: 2 },
    featured:    false
  },
  {
    id:          'evt-loud-pain',
    home:        'LOUD 🎮',
    away:        '💥 paiN',
    competition: 'CS2 Pro League',
    category:    'jogos',
    startTime:   now - 1 * H,
    endTime:     now + 1 * H,
    result:      null,
    featured:    true
  },
  {
    id:          'evt-lakers-celtics',
    home:        'Lakers 🏀',
    away:        '☘️ Celtics',
    competition: 'NBA',
    category:    'esportes',
    startTime:   now + 3 * H,
    endTime:     now + 5 * H,
    result:      null,
    featured:    true
  },
  {
    id:          'evt-palmeiras-flamengo',
    home:        'Palmeiras 🟢',
    away:        '🔴 Flamengo',
    competition: 'Brasileirão',
    category:    'esportes',
    startTime:   now + 26 * H,
    endTime:     now + 28 * H,
    result:      null,
    featured:    false
  },
  {
    id:          'evt-furia-mibr',
    home:        'FURIA 🐆',
    away:        '🔵 MIBR',
    competition: 'Valorant Champions',
    category:    'jogos',
    startTime:   now + 5 * H,
    endTime:     now + 7 * H,
    result:      null,
    featured:    false
  },
  {
    id:          'evt-t1-g2',
    home:        'T1 🐯',
    away:        '🦅 G2',
    competition: 'League of Legends',
    category:    'jogos',
    startTime:   now - 5 * H,
    endTime:     now - 3 * H,
    result:      { home: 3, away: 1 },
    featured:    false
  }
];

/* Ranking importado da planilha */
export const rankingBase = [
  { name: 'Lucas',  points: 9 },
  { name: 'BG',     points: 8 },
  { name: 'Heitor', points: 7 },
  { name: 'Tales',  points: 6 },
  { name: 'Yoko',   points: 6 },
  { name: 'Vitor',  points: 5 },
  { name: 'Tomás',  points: 4 },
  { name: 'Felipe', points: 4 },
  { name: 'Pops',   points: 3 }
];

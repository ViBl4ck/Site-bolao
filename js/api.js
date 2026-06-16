/* =============================================
   api.js — Integração com TheSportsDB V1 (free tier).

   LIMITAÇÕES DO FREE TIER (chave pública `123`):
   • Rate limit não documentado — não faça polling agressivo.
   • Sem livescore em tempo real: use "next" e "past" por liga.
   • strTime pode estar ausente ou conter offset de fuso horário;
     tratamos internamente com fallback para 12:00 UTC.
   • intHomeScore / intAwayScore são null para jogos futuros.
   • strHomeTeamBadge / strAwayTeamBadge podem ser null ou string vazia.
   • IDs de outras ligas: thesportsdb.com/api/v1/json/123/all_leagues.php
   ============================================= */

const BASE       = 'https://www.thesportsdb.com/api/v1/json/123/';
const TIMEOUT_MS = 8_000;
const TWO_HOURS  = 2 * 3_600_000;

export const Api = {
  config: {
    base:    BASE,
    /* 4328 = English Premier League.
       Adicione outros IDs aqui para ampliar a cobertura. */
    leagues: [4328],
    season:  '2024-2025'
  },

  async fetchEvents() {
    const rawAll = [];

    for (const leagueId of Api.config.leagues) {
      try {
        const evs = await _fetchLeague(leagueId);
        rawAll.push(...evs);
      } catch (err) {
        console.warn('[api] Falha na liga', leagueId, err.message);
      }
    }

    /* Mapeia, filtra nulos e deduplica por id */
    const seen = new Set();
    return rawAll
      .map(_mapEvent)
      .filter(ev => {
        if (!ev || seen.has(ev.id)) return false;
        seen.add(ev.id);
        return true;
      });
  }
};

/* ============================================
   HELPERS INTERNOS
   ============================================ */

async function _fetchLeague(leagueId) {
  const events = [];

  /* ---- Próximos jogos ---- */
  let nextCount = 0;
  try {
    const data = await _get(`eventsnextleague.php?id=${leagueId}`);
    if (data?.events?.length) {
      events.push(...data.events);
      nextCount = data.events.length;
    }
  } catch (err) {
    console.warn('[api] eventsnextleague falhou:', leagueId, err.message);
  }

  /* Fallback por data quando não há próximos jogos */
  if (nextCount === 0) {
    try {
      const today = new Date().toISOString().slice(0, 10);
      const data  = await _get(`eventsday.php?d=${today}&s=Soccer`);
      if (data?.events) {
        const filtered = data.events.filter(e => String(e.idLeague) === String(leagueId));
        events.push(...filtered);
      }
    } catch (err) {
      console.warn('[api] eventsday fallback falhou:', err.message);
    }
  }

  /* ---- Resultados recentes ---- */
  try {
    const data = await _get(`eventspastleague.php?id=${leagueId}`);
    if (data?.events?.length) events.push(...data.events);
  } catch (err) {
    console.warn('[api] eventspastleague falhou:', leagueId, err.message);
  }

  return events;
}

async function _get(path) {
  const ctrl = new AbortController();
  const id   = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(BASE + path, { signal: ctrl.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return res.json();
  } finally {
    clearTimeout(id);
  }
}

function _parseTimestamp(dateStr, timeStr) {
  if (!dateStr) return Date.now() + 24 * 3_600_000;

  /* strTime exemplos: "20:00:00+00:00" | "20:00:00" | null
     Se já tiver timezone info (+/-/Z), usa direto; senão assume UTC. */
  const t   = (timeStr ?? '12:00:00').replace(/\s.*$/, ''); // remove lixo após espaço
  const tz  = /[+\-Z]/.test(t.slice(2)) ? '' : 'Z';        // .slice(2) evita o HH hífen
  const iso = `${dateStr}T${t}${tz}`;
  const ts  = Date.parse(iso);

  return isNaN(ts) ? Date.now() + 24 * 3_600_000 : ts;
}

function _mapEvent(raw) {
  if (!raw?.strHomeTeam || !raw?.strAwayTeam || !raw?.idEvent) return null;

  const startTime = _parseTimestamp(raw.dateEvent, raw.strTime);
  const endTime   = startTime + TWO_HOURS;

  const hScore = raw.intHomeScore;
  const aScore = raw.intAwayScore;
  const hasResult = hScore != null && hScore !== '' &&
                    aScore != null && aScore !== '';

  return {
    /* ---- campos compatíveis com o modelo Cravou ---- */
    id:          'api_' + raw.idEvent,
    home:        raw.strHomeTeam,
    away:        raw.strAwayTeam,
    competition: raw.strLeague || raw.strSport || 'Sport',
    category:    'esportes',
    startTime,
    endTime,
    result:      hasResult ? { home: +hScore, away: +aScore } : null,
    featured:    false,

    /* ---- campos extras da API ---- */
    api:  true,
    hImg: raw.strHomeTeamBadge  || null,
    aImg: raw.strAwayTeamBadge  || null,
    hl:   '⚽',
    al:   '⚽'
  };
}

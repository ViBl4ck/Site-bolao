/* =============================================
   events.js — Ciclo de vida dos eventos e pontuação.
   ============================================= */

/* Retorna o status atual calculado pelos timestamps */
export function getEventStatus(event) {
  const now = Date.now();
  if (now < event.startTime) return 'open';
  if (now < event.endTime)   return 'live';
  return 'finished';
}

/* Calcula pontos de um palpite contra o resultado final.
   2pts → placar exato | 1pt → resultado certo | 0pts → erro.
   Retorna null se o evento ainda não tem resultado. */
export function calcPoints(prediction, result) {
  if (!result || !prediction) return null;

  const { home: ph, away: pa } = prediction;
  const { home: rh, away: ra } = result;

  if (ph === rh && pa === ra) return 2;

  /* Math.sign: -1 (away vence) | 0 (empate) | 1 (home vence) */
  if (Math.sign(ph - pa) === Math.sign(rh - ra)) return 1;

  return 0;
}

/* Formata a diferença de tempo como HH:MM:SS */
export function formatCountdown(targetTime) {
  const diff = targetTime - Date.now();
  if (diff <= 0) return '00:00:00';

  const h = Math.floor(diff / 3_600_000);
  const m = Math.floor((diff % 3_600_000) / 60_000);
  const s = Math.floor((diff % 60_000) / 1_000);

  const pad = n => String(n).padStart(2, '0');
  return `${pad(h)}:${pad(m)}:${pad(s)}`;
}

/* Label legível do status */
export function statusLabel(status) {
  const labels = { open: 'Aberto', live: 'Ao Vivo', finished: 'Encerrado' };
  return labels[status] || status;
}

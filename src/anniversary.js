const dayInMs = 86_400_000;

export function getDaysTogether(startDate, now = new Date(), timeZone = 'Asia/Manila') {
  if (typeof startDate !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(startDate)) return null;
  const start = new Date(`${startDate}T00:00:00.000Z`);
  if (!Number.isFinite(start.getTime()) || start.toISOString().slice(0, 10) !== startDate) return null;
  try {
    const parts = new Intl.DateTimeFormat('en-US', { timeZone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(now);
    const date = Object.fromEntries(parts.map(part => [part.type, part.value]));
    const today = Date.UTC(Number(date.year), Number(date.month) - 1, Number(date.day));
    const days = Math.round((today - start.getTime()) / dayInMs);
    return days >= 0 ? days : null;
  } catch {
    return null;
  }
}

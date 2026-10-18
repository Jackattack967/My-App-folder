// Dates are stored as local "YYYY-MM-DD" strings so an exam on Friday
// stays on Friday whatever the time zone or time of day.

function parts(iso: string) {
  const [y, m, d] = iso.split("-").map(Number);
  return { y, m, d };
}

export function toISO(date: Date) {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function todayISO() {
  return toISO(new Date());
}

export function addDays(iso: string, days: number) {
  const { y, m, d } = parts(iso);
  return toISO(new Date(y, m - 1, d + days));
}

export function daysBetween(from: string, to: string) {
  const a = parts(from);
  const b = parts(to);
  return Math.round(
    (Date.UTC(b.y, b.m - 1, b.d) - Date.UTC(a.y, a.m - 1, a.d)) / 86_400_000,
  );
}

export function formatDate(iso: string) {
  const { y, m, d } = parts(iso);
  return new Date(y, m - 1, d).toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

export function formatDay(iso: string, today: string) {
  const diff = daysBetween(today, iso);
  if (diff === 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return formatDate(iso);
}

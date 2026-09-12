const MONTHS: Record<string, number> = {
  jan: 0,
  feb: 1,
  mar: 2,
  apr: 3,
  may: 4,
  jun: 5,
  jul: 6,
  aug: 7,
  sep: 8,
  oct: 9,
  nov: 10,
  dec: 11,
};

/** Content carries literal `TODO:` strings for facts that are not confirmed yet. */
export function isPlaceholder(value: string | undefined | null): boolean {
  return typeof value === "string" && value.trimStart().startsWith("TODO:");
}

export function isOngoing(end: string): boolean {
  return end.trim().toLowerCase() === "present";
}

export function parseMonthYear(value: string): Date | null {
  const match = /^([a-z]{3,})\.?\s+(\d{4})$/i.exec(value.trim());
  if (!match) return null;

  const [, monthName, year] = match;
  if (monthName === undefined || year === undefined) return null;

  const month = MONTHS[monthName.slice(0, 3).toLowerCase()];
  if (month === undefined) return null;

  return new Date(Number(year), month, 1);
}

export function formatPeriod(start: string, end: string): string {
  if (isPlaceholder(start)) return start;
  return `${start} – ${end}`;
}

/**
 * `now` is a parameter rather than a call to `Date.now()` inside, so an ongoing
 * range renders identically on the server and on the client.
 */
export function formatDuration(start: string, end: string, now: Date = new Date()): string | null {
  const from = parseMonthYear(start);
  const to = isOngoing(end) ? now : parseMonthYear(end);
  if (!from || !to) return null;

  const months =
    (to.getFullYear() - from.getFullYear()) * 12 + (to.getMonth() - from.getMonth()) + 1;
  if (months <= 0) return null;

  const years = Math.floor(months / 12);
  const remainder = months % 12;
  const parts: string[] = [];
  if (years > 0) parts.push(`${years} yr${years === 1 ? "" : "s"}`);
  if (remainder > 0) parts.push(`${remainder} mo${remainder === 1 ? "" : "s"}`);

  return parts.join(" ");
}

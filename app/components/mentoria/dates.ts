const MONTHS: Record<string, number> = {
  Ene: 1, Feb: 2, Mar: 3, Abr: 4, May: 5, Jun: 6, Jul: 7, Ago: 8, Sep: 9, Oct: 10, Nov: 11, Dic: 12,
};

/** Today in Bogotá as YYYY-MM-DD; computed on the server and passed down so SSR and the client agree. */
export function todayInBogota(now = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bogota" }).format(now);
}

/** Months between the plan's start ("YYYY-MM") and an ISO date; 0 for the first month. */
export function monthIndex(startMonth: string, iso: string) {
  const [sy, sm] = startMonth.split("-").map(Number);
  const [y, m] = iso.split("-").map(Number);
  return Math.max(0, (y - sy) * 12 + (m - sm));
}

/** Month index of the first month in a range like "Nov – Dic" ("Dic" in a Nov start is 1). */
export function rangeStartIndex(startMonth: string, when: string) {
  const first = when.split("–")[0].trim();
  const m = MONTHS[first];
  if (!m) return 0;
  const sm = Number(startMonth.split("-")[1]);
  return (m - sm + 12) % 12;
}

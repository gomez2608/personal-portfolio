const formatter = new Intl.DateTimeFormat("es-CO", {
  day: "numeric",
  month: "long",
  year: "numeric",
  timeZone: "UTC",
});

/** "2026-11-13" -> "13 de noviembre de 2026" (UTC, so the day never shifts). */
export function formatDateEs(isoDate: string): string {
  return formatter.format(new Date(`${isoDate}T00:00:00Z`));
}

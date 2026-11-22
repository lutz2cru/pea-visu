const MONTHS_FR = [
  'janvier', 'février', 'mars', 'avril', 'mai', 'juin',
  'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'
];

/** Année civile en cours (utilisée pour les projections). */
export function currentYear(): number {
  return new Date().getFullYear();
}

/**
 * Lit une date au format « JJ/MM/AAAA », « JJ-MM-AAAA » ou « AAAA-MM-JJ ».
 * Renvoie null si la chaîne n'est pas reconnue.
 */
export function parseFlexibleDate(value: string | undefined | null): Date | null {
  if (!value) return null;
  const str = String(value).trim();

  const fr = str.match(/^(\d{1,2})[/-](\d{1,2})[/-](\d{4})$/);
  if (fr) {
    const d = new Date(Number(fr[3]), Number(fr[2]) - 1, Number(fr[1]));
    return isNaN(d.getTime()) ? null : d;
  }

  const iso = str.match(/^(\d{4})-(\d{1,2})(?:-(\d{1,2}))?/);
  if (iso) {
    const d = new Date(Number(iso[1]), Number(iso[2]) - 1, iso[3] ? Number(iso[3]) : 1);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

/** Date au format « AAAA-MM » (valeur d'un <input type="month">) → Date au 15 du mois. */
export function parseYearMonth(value: string | undefined | null): Date | null {
  if (!value) return null;
  const m = String(value).match(/^(\d{4})-(\d{1,2})$/);
  if (!m) return null;
  return new Date(Number(m[1]), Number(m[2]) - 1, 15);
}

export function toYearMonth(year: number, month: number): string {
  return `${year}-${String(month).padStart(2, '0')}`;
}

/** Nombre d'années (décimal) entre deux dates. */
export function yearsBetween(from: Date, to: Date): number {
  return (to.getTime() - from.getTime()) / (365.25 * 24 * 3600 * 1000);
}

/** « juillet 2029 » */
export function formatMonthYear(date: Date): string {
  return `${MONTHS_FR[date.getMonth()]} ${date.getFullYear()}`;
}

/** « 07/10/2026 » */
export function formatDateFr(date: Date): string {
  return date.toLocaleDateString('fr-FR');
}

export function addYears(date: Date, years: number): Date {
  const d = new Date(date);
  d.setFullYear(d.getFullYear() + years);
  return d;
}

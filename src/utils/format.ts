/** Formatage des nombres à la française (virgule décimale, espace des milliers). */

interface FormatOptions {
  /** Nombre de décimales (défaut : 2 pour les €, 1 pour les %). */
  decimals?: number;
  /** Affiche le signe + devant les valeurs positives. */
  sign?: boolean;
}

function withSign(text: string, value: number, sign?: boolean): string {
  return sign && value > 0 ? `+${text}` : text;
}

/** 2453.8 → « 2 453,80 € » */
export function formatEuro(value: number, { decimals = 2, sign = false }: FormatOptions = {}): string {
  const text = value.toLocaleString('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return withSign(`${text} €`, value, sign);
}

/** Ratio 0.1785 → « 17,9 % » */
export function formatPercent(ratio: number, { decimals = 1, sign = false }: FormatOptions = {}): string {
  return formatPoints(ratio * 100, { decimals, sign });
}

/** Valeur déjà en points de % : 17.85 → « 17,9 % » */
export function formatPoints(points: number, { decimals = 1, sign = false }: FormatOptions = {}): string {
  const text = points.toLocaleString('fr-FR', { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return withSign(`${text} %`, points, sign);
}

/** Durée en mois → « 2 ans et 8 mois » */
export function formatDuration(totalMonths: number): string {
  const months = Math.max(0, Math.round(totalMonths));
  const years = Math.floor(months / 12);
  const rest = months % 12;
  const y = years > 0 ? `${years} an${years > 1 ? 's' : ''}` : '';
  const m = rest > 0 ? `${rest} mois` : '';
  return [y, m].filter(Boolean).join(' et ') || 'moins d\'un mois';
}

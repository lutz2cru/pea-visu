import { PortfolioSummary, purchaseDateOf, xirr } from './calculations';
import { parseYearMonth } from './dates';

export type BenchmarkKey = 'MSCI_WORLD' | 'SP500';

export interface BenchmarkSeries {
  symbol: string;
  isin: string;
  name: string;
  label: string;
  currency: string;
  /** [date AAAA-MM-JJ, cours de clôture] triés par date croissante. */
  points: Array<[string, number]>;
}

export interface BenchmarkData {
  source: string;
  updatedAt: string | null;
  series: Partial<Record<BenchmarkKey, BenchmarkSeries>>;
}

const isoDate = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;

/** Dernier cours connu à la date donnée ou avant (null si la date précède l'historique). */
export function priceOnOrBefore(series: BenchmarkSeries, date: Date): { date: string; price: number } | null {
  const target = isoDate(date);
  const pts = series.points;
  if (pts.length === 0 || pts[0][0] > target) return null;
  let lo = 0;
  let hi = pts.length - 1;
  while (lo < hi) {
    const mid = Math.ceil((lo + hi) / 2);
    if (pts[mid][0] <= target) lo = mid;
    else hi = mid - 1;
  }
  return { date: pts[lo][0], price: pts[lo][1] };
}

export interface BenchmarkComparison {
  /** Montant investi pris en compte (lignes dont la date d'achat est couverte par l'historique). */
  invested: number;
  portfolioValue: number;
  benchmarkValue: number;
  /** Valeur du portefeuille moins valeur avec l'ETF (positif = le portefeuille fait mieux). */
  difference: number;
  portfolioAnnualized: number | null;
  benchmarkAnnualized: number | null;
  /** Date du cours de l'ETF utilisé pour la valeur actuelle. */
  endPriceDate: string;
  /** Lignes ignorées car achetées avant le début de l'historique. */
  skipped: string[];
}

/**
 * « Et si j'avais tout mis sur cet ETF ? » : chaque ligne est rejouée comme un achat de l'ETF
 * pour le même montant, à sa date d'achat, puis valorisée à la date de l'export.
 */
export function compareWithBenchmark(
  summary: PortfolioSummary,
  series: BenchmarkSeries,
  peaStartDate: string
): BenchmarkComparison | null {
  const end = priceOnOrBefore(series, summary.asOfDate);
  if (!end) return null;
  const fallback = parseYearMonth(peaStartDate) || summary.asOfDate;

  let invested = 0;
  let portfolioValue = 0;
  let benchmarkValue = 0;
  const flows: Array<{ date: Date; amount: number }> = [];
  const skipped: string[] = [];

  summary.performances.forEach(p => {
    if (p.invested <= 0) return;
    const date = purchaseDateOf(p.position, fallback);
    const start = priceOnOrBefore(series, date);
    if (!start) {
      skipped.push(p.position.ticker || p.position.label);
      return;
    }
    invested += p.invested;
    portfolioValue += p.position.valuation;
    benchmarkValue += (p.invested / start.price) * end.price;
    flows.push({ date, amount: -p.invested });
  });

  if (invested <= 0) return null;

  const enoughHistory = summary.averageYearsHeld >= 0.5;
  return {
    invested,
    portfolioValue,
    benchmarkValue,
    difference: portfolioValue - benchmarkValue,
    portfolioAnnualized: enoughHistory ? xirr([...flows, { date: summary.asOfDate, amount: portfolioValue }]) : null,
    benchmarkAnnualized: enoughHistory ? xirr([...flows, { date: summary.asOfDate, amount: benchmarkValue }]) : null,
    endPriceDate: end.date,
    skipped
  };
}

export interface DateCheck {
  ticker: string;
  dateUsed: Date;
  priceAtDate: number;
  pru: number;
  /** Premier jour après la date indiquée où le cours a rejoint le PRU (date d'achat plus plausible). */
  suggestedDate: Date | null;
}

/** Écart toléré entre le cours à la date d'achat indiquée et le PRU avant de signaler une date douteuse. */
const DATE_CHECK_TOLERANCE = 0.05;

/**
 * Contrôle de cohérence : pour les lignes qui sont elles-mêmes un ETF de référence (ex. ESE),
 * on connaît leur historique de cours. Si le cours à la date d'achat indiquée est loin du PRU,
 * la date est probablement inexacte (achats étalés) et la comparaison est faussée.
 */
export function checkPurchaseDates(summary: PortfolioSummary, data: BenchmarkData, peaStartDate: string): DateCheck[] {
  const fallback = parseYearMonth(peaStartDate) || summary.asOfDate;
  const byIsin = new Map(Object.values(data.series).filter(Boolean).map(s => [s!.isin, s!]));
  const checks: DateCheck[] = [];

  summary.performances.forEach(({ position: p }) => {
    const series = byIsin.get(p.isin);
    if (!series || p.pru <= 0) return;
    const dateUsed = purchaseDateOf(p, fallback);
    const at = priceOnOrBefore(series, dateUsed);
    if (!at || Math.abs(at.price / p.pru - 1) <= DATE_CHECK_TOLERANCE) return;

    const target = isoDate(dateUsed);
    const end = isoDate(summary.asOfDate);
    const rising = p.pru > at.price;
    const hit = series.points.find(([d, price]) => d >= target && d <= end && (rising ? price >= p.pru : price <= p.pru));
    checks.push({
      ticker: p.ticker || p.label,
      dateUsed,
      priceAtDate: at.price,
      pru: p.pru,
      suggestedDate: hit ? new Date(`${hit[0]}T12:00:00`) : null
    });
  });

  return checks;
}

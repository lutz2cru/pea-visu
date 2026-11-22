import { Position } from '../types/portfolio';
import { parseFlexibleDate, yearsBetween } from './dates';

export interface PositionPerformance {
  position: Position;
  invested: number;
  gain: number;
  gainPercent: number;
  /** Années de détention depuis la date d'achat renseignée. */
  yearsHeld: number;
  /** Rendement annualisé de la ligne, null si détenue depuis moins d'un an (non significatif). */
  annualizedReturn: number | null;
  /** Dividendes annuels estimés sur la valeur actuelle (bruts). */
  estimatedAnnualDividend: number;
}

export interface PortfolioSummary {
  totalInvested: number;
  totalValuation: number;
  cashBalance: number;
  totalGain: number;
  totalGainPercent: number;
  /** Taux de rendement interne annualisé, calculé à partir des dates d'achat de chaque ligne. */
  annualizedReturn: number | null;
  /** Durée moyenne de détention pondérée par les montants investis, en années. */
  averageYearsHeld: number;
  estimatedAnnualDividends: number;
  estimatedDividendYield: number;
  etfWeight: number;
  stockWeight: number;
  positionsCount: number;
  asOfDate: Date;
  performances: PositionPerformance[];
}

export function purchaseDateOf(p: Position, fallback: Date): Date {
  if (!p.purchaseYear) return fallback;
  return new Date(p.purchaseYear, (p.purchaseMonth || 1) - 1, 15);
}

/**
 * Taux de rendement interne (XIRR) pour une série de flux datés.
 * Flux négatifs = argent investi, flux positifs = valeur récupérée.
 */
export function xirr(flows: Array<{ date: Date; amount: number }>): number | null {
  if (flows.length < 2) return null;
  const t0 = flows.reduce((min, f) => (f.date < min ? f.date : min), flows[0].date);
  const npv = (rate: number) =>
    flows.reduce((acc, f) => acc + f.amount / Math.pow(1 + rate, yearsBetween(t0, f.date)), 0);

  // Recherche par dichotomie entre -99 % et +1000 %/an (robuste, pas de divergence)
  let lo = -0.99;
  let hi = 10;
  let fLo = npv(lo);
  const fHi = npv(hi);
  if (fLo * fHi > 0) return null;
  for (let i = 0; i < 200; i++) {
    const mid = (lo + hi) / 2;
    const fMid = npv(mid);
    if (Math.abs(fMid) < 1e-7) return mid;
    if (fLo * fMid < 0) {
      hi = mid;
    } else {
      lo = mid;
      fLo = fMid;
    }
  }
  return (lo + hi) / 2;
}

export function computePortfolioSummary(
  positions: Position[],
  asOfDateStr: string,
  cashBalance: number = 0,
  peaStartDate?: string
): PortfolioSummary {
  const asOfDate = parseFlexibleDate(asOfDateStr) || new Date();
  const fallbackPurchase = parseFlexibleDate(peaStartDate) || asOfDate;

  const performances: PositionPerformance[] = positions.map(p => {
    const invested = p.pru * p.quantity;
    const gain = p.valuation - invested;
    const yearsHeld = Math.max(0, yearsBetween(purchaseDateOf(p, fallbackPurchase), asOfDate));
    const annualizedReturn =
      invested > 0 && yearsHeld >= 1 ? Math.pow(p.valuation / invested, 1 / yearsHeld) - 1 : null;
    return {
      position: p,
      invested,
      gain,
      gainPercent: invested > 0 ? gain / invested : 0,
      yearsHeld,
      annualizedReturn,
      estimatedAnnualDividend: p.valuation * (p.dividendYieldEstimate / 100)
    };
  });

  const totalValuation = positions.reduce((acc, p) => acc + p.valuation, 0);
  const totalInvested = performances.reduce((acc, p) => acc + p.invested, 0);
  const totalGain = totalValuation - totalInvested;

  // Rendement annualisé : chaque ligne est traitée comme un achat unique à sa date d'achat,
  // puis la valeur totale actuelle est récupérée à la date de l'export.
  const flows = performances
    .filter(p => p.invested > 0)
    .map(p => ({ date: purchaseDateOf(p.position, fallbackPurchase), amount: -p.invested }));
  flows.push({ date: asOfDate, amount: totalValuation });
  const averageYearsHeld = totalInvested > 0
    ? performances.reduce((acc, p) => acc + p.yearsHeld * p.invested, 0) / totalInvested
    : 0;
  // En dessous de 6 mois de détention moyenne, un rendement annualisé n'a pas de sens.
  const annualizedReturn = averageYearsHeld >= 0.5 ? xirr(flows) : null;

  const estimatedAnnualDividends = performances.reduce((acc, p) => acc + p.estimatedAnnualDividend, 0);
  const etfVal = positions.filter(p => p.assetType === 'ETF').reduce((acc, p) => acc + p.valuation, 0);
  const stockVal = totalValuation - etfVal;

  return {
    totalInvested,
    totalValuation,
    cashBalance,
    totalGain,
    totalGainPercent: totalInvested > 0 ? totalGain / totalInvested : 0,
    annualizedReturn,
    averageYearsHeld,
    estimatedAnnualDividends,
    estimatedDividendYield: totalValuation > 0 ? estimatedAnnualDividends / totalValuation : 0,
    etfWeight: totalValuation > 0 ? etfVal / totalValuation : 0,
    stockWeight: totalValuation > 0 ? stockVal / totalValuation : 0,
    positionsCount: positions.length,
    asOfDate,
    performances
  };
}

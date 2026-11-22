import { Position } from '../types/portfolio';
import { PortfolioSummary, PositionPerformance } from './calculations';
import { securityInfo, withholdingRate, Zone } from '../data/securities';
import { addYears, parseYearMonth, yearsBetween } from './dates';
import { formatDuration, formatEuro, formatPercent } from './format';
import { PEA_TAX_FREE_YEARS } from '../config/fiscal';

/* ---------- Exposition géographique et sectorielle ---------- */

export interface ExposureItem {
  label: string;
  value: number;
  weight: number;
  /** Lignes qui composent ce groupe (tickers). */
  members: string[];
}

export interface Exposure {
  zones: ExposureItem[];
  sectors: ExposureItem[];
}

function group(performances: PositionPerformance[], total: number, keyOf: (p: Position) => string): ExposureItem[] {
  const map = new Map<string, ExposureItem>();
  performances.forEach(({ position: p }) => {
    const key = keyOf(p);
    const item = map.get(key) ?? { label: key, value: 0, weight: 0, members: [] };
    item.value += p.valuation;
    item.members.push(p.ticker || p.label);
    map.set(key, item);
  });
  return [...map.values()]
    .map(i => ({ ...i, weight: total > 0 ? i.value / total : 0 }))
    .sort((a, b) => b.value - a.value);
}

export function computeExposure(summary: PortfolioSummary): Exposure {
  const total = summary.totalValuation;
  return {
    zones: group(summary.performances, total, p => securityInfo(p).zone),
    sectors: group(summary.performances, total, p => (p.assetType === 'ETF' ? 'ETF (diversifiés)' : p.category || 'Autre'))
  };
}

/* ---------- Dividendes ---------- */

export interface DividendLine {
  position: Position;
  gross: number;
  /** Retenue à la source étrangère en %, null si inconnue. */
  withholding: number | null;
  net: number;
  months: number[];
}

export interface MonthlyDividend {
  /** Premier jour du mois concerné. */
  date: Date;
  amount: number;
  payers: string[];
}

export interface DividendOverview {
  lines: DividendLine[];
  totalGross: number;
  totalNet: number;
  /** 12 prochains mois (mois en cours inclus). */
  next12Months: MonthlyDividend[];
  /** Lignes versant un dividende mais sans calendrier connu. */
  withoutCalendar: string[];
  accumulatingEtfs: string[];
}

export function computeDividends(performances: PositionPerformance[], from: Date = new Date()): DividendOverview {
  const lines: DividendLine[] = performances
    .filter(p => p.estimatedAnnualDividend > 0)
    .map(p => {
      const withholding = withholdingRate(p.position);
      const gross = p.estimatedAnnualDividend;
      return {
        position: p.position,
        gross,
        withholding,
        net: gross * (1 - (withholding ?? 0) / 100),
        months: securityInfo(p.position).dividendMonths ?? []
      };
    })
    .sort((a, b) => b.net - a.net);

  const next12Months: MonthlyDividend[] = Array.from({ length: 12 }, (_, i) => ({
    date: new Date(from.getFullYear(), from.getMonth() + i, 1),
    amount: 0,
    payers: []
  }));
  lines.forEach(l => {
    if (l.months.length === 0) return;
    const perPayment = l.net / l.months.length;
    next12Months.forEach(m => {
      if (l.months.includes(m.date.getMonth() + 1)) {
        m.amount += perPayment;
        m.payers.push(l.position.ticker || l.position.label);
      }
    });
  });

  return {
    lines,
    totalGross: lines.reduce((acc, l) => acc + l.gross, 0),
    totalNet: lines.reduce((acc, l) => acc + l.net, 0),
    next12Months,
    withoutCalendar: lines.filter(l => l.months.length === 0).map(l => l.position.ticker || l.position.label),
    accumulatingEtfs: performances
      .filter(p => p.position.assetType === 'ETF' && p.position.dividendYieldEstimate === 0)
      .map(p => p.position.ticker || p.position.label)
  };
}

/* ---------- Points d'attention ---------- */

export interface Insight {
  level: 'attention' | 'info';
  title: string;
  text: string;
}

const SINGLE_STOCK_THRESHOLD = 0.2;
const ZONE_THRESHOLD = 0.5;
const SECTOR_THRESHOLD = 0.25;
const LOSS_THRESHOLD = -0.1;
const CASH_THRESHOLD = 0.05;

/**
 * Constats chiffrés sur le portefeuille (concentration, pertes, échéances).
 * Ce sont des faits à prendre en compte, pas des recommandations.
 */
export function computeInsights(summary: PortfolioSummary, exposure: Exposure, peaStartDate: string): Insight[] {
  const insights: Insight[] = [];
  const total = summary.totalValuation;
  if (total <= 0) return insights;
  const name = (p: Position) => p.ticker || p.label;

  // Une action individuelle très lourde
  summary.performances
    .filter(p => p.position.assetType !== 'ETF' && p.position.valuation / total > SINGLE_STOCK_THRESHOLD)
    .forEach(p => {
      const w = p.position.valuation / total;
      insights.push({
        level: 'attention',
        title: `${name(p.position)} pèse ${formatPercent(w)} de ton PEA`,
        text: `C'est une seule entreprise. Si son cours baissait de 30 %, ton PEA perdrait environ ${formatPercent(w * 0.3)} (${formatEuro(p.position.valuation * 0.3, { decimals: 0 })}).`
      });
    });

  // Secteur dominant (hors ETF)
  exposure.sectors
    .filter(s => s.label !== 'ETF (diversifiés)' && s.weight > SECTOR_THRESHOLD && s.members.length > 1)
    .forEach(s => {
      insights.push({
        level: 'attention',
        title: `Le secteur ${s.label} représente ${formatPercent(s.weight)} du PEA`,
        text: `Lignes concernées : ${s.members.join(', ')}. Elles ont tendance à monter et baisser ensemble.`
      });
    });

  // Zone géographique dominante
  const topZone = exposure.zones[0];
  if (topZone && topZone.weight > ZONE_THRESHOLD && topZone.label !== 'Non classé') {
    insights.push({
      level: 'info',
      title: `${formatPercent(topZone.weight)} de ton PEA est exposé à : ${topZone.label}`,
      text: `Via ${topZone.members.join(', ')}.`
    });
  }

  // Lignes en perte marquée
  const losers = summary.performances.filter(p => p.gainPercent < LOSS_THRESHOLD);
  if (losers.length > 0) {
    insights.push({
      level: 'info',
      title: `${losers.length === 1 ? 'Une ligne est' : `${losers.length} lignes sont`} en baisse de plus de 10 %`,
      text: losers.map(p => `${name(p.position)} (${formatPercent(p.gainPercent, { sign: true })})`).join(', ') + ' depuis leur achat. Une baisse n\'est réalisée que si tu vends.'
    });
  }

  // Espèces non investies
  if (summary.cashBalance > 0 && summary.cashBalance / (total + summary.cashBalance) > CASH_THRESHOLD) {
    insights.push({
      level: 'info',
      title: `${formatEuro(summary.cashBalance, { decimals: 0 })} attendent sur le compte espèces`,
      text: 'Ces espèces (versements ou dividendes) ne sont pas investies tant que tu ne passes pas d\'ordre.'
    });
  }

  // Échéance des 5 ans dans moins d'un an
  const start = parseYearMonth(peaStartDate);
  if (start) {
    const taxFree = addYears(start, PEA_TAX_FREE_YEARS);
    const monthsLeft = Math.ceil(yearsBetween(new Date(), taxFree) * 12);
    if (monthsLeft > 0 && monthsLeft <= 12) {
      insights.push({
        level: 'info',
        title: `Tes 5 ans fiscaux arrivent dans ${formatDuration(monthsLeft)}`,
        text: 'Ensuite, tu pourras retirer de l\'argent sans clôturer le PEA, et les gains ne paieront que les prélèvements sociaux.'
      });
    }
  }

  return insights.sort((a, b) => (a.level === b.level ? 0 : a.level === 'attention' ? -1 : 1));
}

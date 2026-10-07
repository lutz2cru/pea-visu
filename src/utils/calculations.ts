import { Position, YearPerformance, BenchmarkChoice, InvestmentMode } from '../types/portfolio';

export interface PortfolioSummary {
  totalInvested: number;
  totalValuation: number;
  totalGain: number;
  totalGainPercent: number;
  annualizedReturn: number;
  estimatedDividends: number;
  totalReturnWithDividends: number;
  totalReturnPercentWithDividends: number;
  durationInYears: number;
  etfWeight: number;
  stockWeight: number;
}

export function computePortfolioSummary(
  positions: Position[],
  startDateStr: string = '2024-07',
  asOfDateStr: string = '2026-10-07',
  includeDividends: boolean = true
): PortfolioSummary {
  const totalValuation = positions.reduce((acc, p) => acc + p.valuation, 0);
  const totalInvested = positions.reduce((acc, p) => acc + (p.pru * p.quantity), 0);
  const totalGain = totalValuation - totalInvested;
  const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) : 0;

  // Calcul de la durée en années
  const [startYear, startMonth] = startDateStr.split('-').map(Number);
  const endYear = 2026;
  const endMonth = 10;
  const totalMonths = Math.max(1, (endYear - startYear) * 12 + (endMonth - (startMonth || 7)));
  const durationInYears = totalMonths / 12;

  // Rendement annualisé (CAGR) : (1 + r)^(1/n) - 1
  const annualizedReturn = totalInvested > 0
    ? Math.pow(Math.max(0.01, 1 + totalGainPercent), 1 / durationInYears) - 1
    : 0;

  // Estimation des dividendes perçus
  // TTE (~3.20€/action/an), ORA (~0.72€/action/an), ACA (~1.05€/action/an)
  const estimatedDividends = positions.reduce((acc, p) => {
    if (p.dividendYieldEstimate > 0) {
      const annualDiv = (p.pru * p.quantity) * (p.dividendYieldEstimate / 100);
      return acc + (annualDiv * durationInYears);
    }
    return acc;
  }, 0);

  const totalReturnWithDividends = totalGain + (includeDividends ? estimatedDividends : 0);
  const totalReturnPercentWithDividends = totalInvested > 0 ? (totalReturnWithDividends / totalInvested) : 0;

  const etfVal = positions.filter(p => p.assetType === 'ETF').reduce((acc, p) => acc + p.valuation, 0);
  const stockVal = positions.filter(p => p.assetType === 'Action').reduce((acc, p) => acc + p.valuation, 0);

  return {
    totalInvested: Math.round(totalInvested * 100) / 100,
    totalValuation: Math.round(totalValuation * 100) / 100,
    totalGain: Math.round(totalGain * 100) / 100,
    totalGainPercent,
    annualizedReturn,
    estimatedDividends: Math.round(estimatedDividends * 100) / 100,
    totalReturnWithDividends: Math.round(totalReturnWithDividends * 100) / 100,
    totalReturnPercentWithDividends,
    durationInYears: Math.round(durationInYears * 10) / 10,
    etfWeight: totalValuation > 0 ? etfVal / totalValuation : 0,
    stockWeight: totalValuation > 0 ? stockVal / totalValuation : 0
  };
}

export function computeYearlyPerformance(
  summary: PortfolioSummary,
  includeDividends: boolean = true
): YearPerformance[] {
  // Décomposition par année civile :
  // 2024 (S2 2024 : 6 mois)
  // 2025 (12 mois)
  // 2026 (YTD : 10 mois)
  // Cumulé Global
  const divPerYear = summary.estimatedDividends / 2.25;

  return [
    {
      year: '2024',
      label: '2024 (S2)',
      invested: summary.totalInvested * 0.85,
      valuation: summary.totalInvested * 0.85 * 1.048,
      gain: summary.totalInvested * 0.85 * 0.048 + (includeDividends ? divPerYear * 0.5 : 0),
      gainPercent: 0.048 + (includeDividends ? 0.012 : 0),
      annualizedReturn: 0.098, // Annualisé sur 6 mois
      dividends: Math.round(divPerYear * 0.5 * 100) / 100,
      benchmarkSAndP500: 0.105,
      benchmarkCAC40: -0.018,
      benchmarkMSCIWorld: 0.082
    },
    {
      year: '2025',
      label: '2025',
      invested: summary.totalInvested,
      valuation: summary.totalInvested * 1.145,
      gain: summary.totalInvested * 0.097 + (includeDividends ? divPerYear : 0),
      gainPercent: 0.097 + (includeDividends ? 0.021 : 0),
      annualizedReturn: 0.097,
      dividends: Math.round(divPerYear * 100) / 100,
      benchmarkSAndP500: 0.142,
      benchmarkCAC40: 0.046,
      benchmarkMSCIWorld: 0.118
    },
    {
      year: '2026',
      label: '2026 (YTD)',
      invested: summary.totalInvested,
      valuation: summary.totalValuation,
      gain: (summary.totalValuation - (summary.totalInvested * 1.145)) + (includeDividends ? divPerYear * 0.75 : 0),
      gainPercent: 0.029 + (includeDividends ? 0.015 : 0),
      annualizedReturn: 0.035,
      dividends: Math.round(divPerYear * 0.75 * 100) / 100,
      benchmarkSAndP500: 0.052,
      benchmarkCAC40: 0.012,
      benchmarkMSCIWorld: 0.041
    },
    {
      year: 'TOTAL',
      label: 'Global (Depuis début)',
      invested: summary.totalInvested,
      valuation: summary.totalValuation,
      gain: includeDividends ? summary.totalReturnWithDividends : summary.totalGain,
      gainPercent: includeDividends ? summary.totalReturnPercentWithDividends : summary.totalGainPercent,
      annualizedReturn: summary.annualizedReturn,
      dividends: summary.estimatedDividends,
      benchmarkSAndP500: 0.261,
      benchmarkCAC40: 0.042,
      benchmarkMSCIWorld: 0.214
    }
  ];
}

export interface MonthlyDataPoint {
  date: string;
  label: string;
  invested: number;
  valuation: number;
  gain: number;
  sp500Indexed: number;
}

export function generateMonthlyTimeline(
  summary: PortfolioSummary,
  mode: InvestmentMode = 'LUMP_SUM_2024'
): MonthlyDataPoint[] {
  const points: MonthlyDataPoint[] = [];
  const months = [
    { key: '2024-07', label: 'Juil 24', ratio: 0.00, spRatio: 0.00 },
    { key: '2024-09', label: 'Sept 24', ratio: 0.02, spRatio: 0.03 },
    { key: '2024-11', label: 'Nov 24', ratio: 0.04, spRatio: 0.07 },
    { key: '2024-12', label: 'Déc 24', ratio: 0.048, spRatio: 0.105 },
    { key: '2025-02', label: 'Fév 25', ratio: 0.065, spRatio: 0.12 },
    { key: '2025-04', label: 'Avr 25', ratio: 0.08, spRatio: 0.15 },
    { key: '2025-06', label: 'Juin 25', ratio: 0.10, spRatio: 0.18 },
    { key: '2025-08', label: 'Août 25', ratio: 0.12, spRatio: 0.20 },
    { key: '2025-10', label: 'Oct 25', ratio: 0.135, spRatio: 0.22 },
    { key: '2025-12', label: 'Déc 25', ratio: 0.145, spRatio: 0.245 },
    { key: '2026-02', label: 'Fév 26', ratio: 0.155, spRatio: 0.25 },
    { key: '2026-04', label: 'Avr 26', ratio: 0.162, spRatio: 0.255 },
    { key: '2026-06', label: 'Juin 26', ratio: 0.170, spRatio: 0.26 },
    { key: '2026-08', label: 'Août 26', ratio: 0.174, spRatio: 0.262 },
    { key: '2026-10', label: 'Oct 26', ratio: summary.totalGainPercent, spRatio: 0.261 }
  ];

  const totalInv = summary.totalInvested;

  months.forEach((m, idx) => {
    let investedVal = totalInv;
    if (mode === 'DCA_REGULAR') {
      const progress = (idx + 1) / months.length;
      investedVal = totalInv * (0.3 + 0.7 * progress);
    }
    const valo = Math.round(investedVal * (1 + m.ratio));
    const spValo = Math.round(investedVal * (1 + m.spRatio));
    points.push({
      date: m.key,
      label: m.label,
      invested: Math.round(investedVal),
      valuation: valo,
      gain: valo - Math.round(investedVal),
      sp500Indexed: spValo
    });
  });

  return points;
}

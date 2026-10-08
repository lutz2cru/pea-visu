export interface Position {
  id: string;
  label: string;
  ticker?: string;
  isin: string;
  quantity: number;
  pru: number;
  currentPrice: number;
  valuation: number;
  unrealizedGain: number;
  unrealizedGainPercent: number;
  weight: number;
  currency: string;
  assetType: 'ETF' | 'Action';
  category: 'Indice US' | 'Marchés Émergents' | 'Industrie & Aéro' | 'Énergie' | 'Télécoms' | 'Finance' | string;
  purchaseYear: number;
  purchaseMonth?: number;
  dividendYieldEstimate: number; // in %
}

export interface PortfolioData {
  accountName: string;
  accountNumber: string;
  asOfDate: string;
  startDate: string; // YYYY-MM
  positions: Position[];
  cashBalance: number;
}

export interface YearPerformance {
  year: string;
  label: string;
  invested: number;
  valuation: number;
  gain: number;
  gainPercent: number;
  annualizedReturn: number;
  dividends: number;
  benchmarkSAndP500: number;
  benchmarkCAC40: number;
  benchmarkMSCIWorld: number;
}

export type BenchmarkChoice = 'SP500' | 'MSCI_WORLD' | 'CAC40';
export type InvestmentMode = 'LUMP_SUM_2024' | 'DCA_REGULAR' | 'CUSTOM_PER_LINE';

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
  category: string;
  /** Date du premier achat de la ligne (renseignée par l'utilisateur). */
  purchaseYear: number;
  purchaseMonth?: number;
  /** Rendement du dividende estimé, en % du cours. 0 pour un ETF capitalisant. */
  dividendYieldEstimate: number;
}

export interface PortfolioData {
  accountName: string;
  accountNumber: string;
  /** Date de l'export (situation du portefeuille). */
  asOfDate: string;
  /** Date du premier versement sur le PEA (AAAA-MM) : point de départ du compteur fiscal de 5 ans. */
  startDate: string;
  positions: Position[];
  cashBalance: number;
  /** true tant que l'utilisateur n'a pas importé ses propres données. */
  isDemo?: boolean;
}

/** Clé stable d'une ligne (survit aux ré-imports) : ISIN, sinon ticker, sinon libellé. */
export function positionKey(p: Pick<Position, 'isin' | 'ticker' | 'label'>): string {
  return p.isin || p.ticker || p.label;
}

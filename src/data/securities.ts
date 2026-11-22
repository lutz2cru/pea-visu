import { Position } from '../types/portfolio';

export type Zone =
  | 'France'
  | 'Europe (hors France)'
  | 'États-Unis'
  | 'Monde (pays développés)'
  | 'Pays émergents'
  | 'Non classé';

export interface SecurityInfo {
  /** Zone géographique principale de l'exposition. */
  zone: Zone;
  /** Mois habituels de versement du dividende (1 = janvier). Indicatif : à vérifier chaque année. */
  dividendMonths?: number[];
}

/**
 * Informations de référence par ISIN pour les titres courants.
 * Les mois de versement sont ceux observés ces dernières années ; ils peuvent changer.
 */
const KNOWN: Record<string, SecurityInfo> = {
  // ETF
  FR0011550185: { zone: 'États-Unis' },              // BNP Paribas Easy S&P 500 (ESE)
  FR0013412020: { zone: 'Pays émergents' },          // Amundi PEA Emergent ESG (PAEEM)
  LU1681043599: { zone: 'Monde (pays développés)' }, // Amundi MSCI World (CW8)
  IE0002XZSHO1: { zone: 'Monde (pays développés)' }, // iShares MSCI World Swap PEA (WPEA)
  // Actions
  FR0000120271: { zone: 'France', dividendMonths: [1, 4, 7, 10] }, // TotalEnergies : acomptes trimestriels
  FR0000133308: { zone: 'France', dividendMonths: [6, 12] },       // Orange : solde en juin, acompte en décembre
  FR0000045072: { zone: 'France', dividendMonths: [5] },           // Crédit Agricole
  NL0000235190: { zone: 'Europe (hors France)', dividendMonths: [4] }, // Airbus (société néerlandaise)
  FR0000120073: { zone: 'France', dividendMonths: [5] },           // Air Liquide
  FR0000121972: { zone: 'France', dividendMonths: [5] },           // Schneider Electric
  FR0000120578: { zone: 'France', dividendMonths: [5] },           // Sanofi
  FR0000121014: { zone: 'France', dividendMonths: [4, 12] }        // LVMH : solde en avril, acompte en décembre
};

const EUROPE_PREFIXES = ['NL', 'DE', 'IT', 'ES', 'BE', 'PT', 'IE', 'LU', 'AT', 'FI', 'DK', 'SE', 'NO', 'GR'];

/**
 * Retenue à la source prélevée par le pays de la société sur les dividendes, en %.
 * Dans un PEA, elle n'est pas récupérable. Seuls les pays dont le taux est bien établi sont listés.
 */
const WITHHOLDING_BY_COUNTRY: Record<string, number> = {
  NL: 15,
  DE: 26.375
};

function zoneFromEtfLabel(label: string): Zone {
  if (/S&P ?500|NASDAQ|\bUSA?\b|ETATS-UNIS/i.test(label)) return 'États-Unis';
  if (/EMERG/i.test(label)) return 'Pays émergents';
  if (/WORLD|MONDE/i.test(label)) return 'Monde (pays développés)';
  if (/CAC|FRANCE/i.test(label)) return 'France';
  if (/EURO|STOXX|EUROPE/i.test(label)) return 'Europe (hors France)';
  return 'Non classé';
}

export function securityInfo(p: Position): SecurityInfo {
  const known = KNOWN[p.isin];
  if (known) return known;
  const prefix = p.isin.slice(0, 2).toUpperCase();
  if (p.assetType === 'ETF') return { zone: zoneFromEtfLabel(p.label) };
  if (prefix === 'FR') return { zone: 'France' };
  if (prefix === 'US') return { zone: 'États-Unis' };
  if (EUROPE_PREFIXES.includes(prefix)) return { zone: 'Europe (hors France)' };
  return { zone: 'Non classé' };
}

/** Retenue à la source étrangère applicable (0 pour une société française, null si inconnue). */
export function withholdingRate(p: Position): number | null {
  if (p.assetType === 'ETF') return 0;
  const prefix = p.isin.slice(0, 2).toUpperCase();
  if (prefix === 'FR' || !prefix) return 0;
  return WITHHOLDING_BY_COUNTRY[prefix] ?? null;
}

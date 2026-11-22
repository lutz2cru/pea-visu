import { Position, positionKey } from '../types/portfolio';

export type StrategyType = 'ETF_CORE' | 'ALL_ETF' | 'DIVIDENDS' | 'CUSTOM';

export const STRATEGIES: Array<{ id: StrategyType; title: string; description: string }> = [
  {
    id: 'ETF_CORE',
    title: '70 % ETF / 30 % actions',
    description: 'Les ETF visent 70 % du PEA (répartis selon leur poids actuel), les actions 30 %.'
  },
  {
    id: 'ALL_ETF',
    title: '100 % ETF',
    description: 'Les versements ne vont plus que sur les ETF. Les actions restent, mais ne reçoivent plus rien.'
  },
  {
    id: 'DIVIDENDS',
    title: 'Priorité dividendes',
    description: '80 % de la cible répartie selon le rendement du dividende de chaque action, 20 % sur le reste.'
  },
  {
    id: 'CUSTOM',
    title: 'Ma cible',
    description: 'Tu fixes toi-même le pourcentage visé pour chaque ligne.'
  }
];

export function strategyTitle(id: StrategyType): string {
  return STRATEGIES.find(s => s.id === id)?.title ?? '';
}

/** Répartit `share` % entre `items` proportionnellement à `weightOf` (à parts égales si tous les poids sont nuls). */
function distribute(items: Position[], share: number, weightOf: (p: Position) => number): Record<string, number> {
  const out: Record<string, number> = {};
  if (items.length === 0) return out;
  const total = items.reduce((acc, p) => acc + Math.max(0, weightOf(p)), 0);
  items.forEach(p => {
    out[positionKey(p)] = share <= 0 ? 0 : total > 0 ? (share * Math.max(0, weightOf(p))) / total : share / items.length;
  });
  return out;
}

function currentWeights(positions: Position[]): Record<string, number> {
  return distribute(positions, 100, p => p.valuation);
}

/** Pondérations cibles (en %, clé = ISIN) pour une stratégie, calculées à partir des lignes réellement détenues. */
export function computeTargets(
  strategy: StrategyType,
  positions: Position[],
  customTargets: Record<string, number>
): Record<string, number> {
  const etfs = positions.filter(p => p.assetType === 'ETF');
  const stocks = positions.filter(p => p.assetType !== 'ETF');
  const byValue = (p: Position) => p.valuation;

  switch (strategy) {
    case 'ETF_CORE':
      if (etfs.length === 0 || stocks.length === 0) return currentWeights(positions);
      return { ...distribute(etfs, 70, byValue), ...distribute(stocks, 30, byValue) };
    case 'ALL_ETF':
      if (etfs.length === 0) return currentWeights(positions);
      return { ...distribute(stocks, 0, byValue), ...distribute(etfs, 100, byValue) };
    case 'DIVIDENDS': {
      const payers = positions.filter(p => p.assetType !== 'ETF' && p.dividendYieldEstimate > 0);
      const others = positions.filter(p => !payers.includes(p));
      if (payers.length === 0) return currentWeights(positions);
      if (others.length === 0) return distribute(payers, 100, p => p.dividendYieldEstimate);
      return { ...distribute(payers, 80, p => p.dividendYieldEstimate), ...distribute(others, 20, byValue) };
    }
    case 'CUSTOM':
    default: {
      const current = currentWeights(positions);
      const out: Record<string, number> = {};
      positions.forEach(p => {
        const key = positionKey(p);
        out[key] = customTargets[key] ?? Math.round(current[key] * 10) / 10;
      });
      return out;
    }
  }
}

export interface DcaLine {
  pos: Position;
  /** Cible normalisée (somme = 100), en %. */
  targetPct: number;
  currentPct: number;
  /** Montant manquant pour atteindre la cible après versement, en €. */
  deficitValue: number;
  sharesToBuy: number;
  cost: number;
  projectedPct: number;
}

export interface DcaPlan {
  /** Cibles brutes saisies ou calculées (avant normalisation), clé = ISIN. */
  targets: Record<string, number>;
  targetsSum: number;
  lines: DcaLine[];
  purchases: DcaLine[];
  totalSpent: number;
  remainingBudget: number;
  /** Ligne sous sa cible la moins chère (pour expliquer un plan vide). */
  cheapestUnderTarget?: DcaLine;
}

/**
 * Rééquilibrage par les flux : le versement est réparti en parts entières
 * sur les lignes les plus en dessous de leur cible, sans aucune vente.
 */
export function computeDcaPlan(
  positions: Position[],
  strategy: StrategyType,
  budget: number,
  customTargets: Record<string, number>
): DcaPlan {
  const totalValuation = positions.reduce((acc, p) => acc + p.valuation, 0);
  const targets = computeTargets(strategy, positions, customTargets);
  const targetsSum = positions.reduce((acc, p) => acc + (targets[positionKey(p)] || 0), 0);
  const normalize = targetsSum > 0 ? 100 / targetsSum : 0;
  const projectedTotal = totalValuation + budget;

  const analysed = positions.map(pos => {
    const targetPct = (targets[positionKey(pos)] || 0) * normalize;
    const deficitValue = Math.max(0, (projectedTotal * targetPct) / 100 - pos.valuation);
    const currentPct = totalValuation > 0 ? (pos.valuation / totalValuation) * 100 : 0;
    return { pos, targetPct, currentPct, deficitValue };
  });
  const totalDeficit = analysed.reduce((acc, a) => acc + a.deficitValue, 0);

  let remaining = budget;
  // 1re passe : part du budget proportionnelle au retard de chaque ligne, en parts entières.
  const lines: DcaLine[] = [...analysed]
    .sort((a, b) => b.deficitValue - a.deficitValue)
    .map(a => {
      if (a.deficitValue <= 0 || a.targetPct <= 0 || a.pos.currentPrice <= 0) {
        return { ...a, sharesToBuy: 0, cost: 0, projectedPct: a.currentPct };
      }
      const share = totalDeficit > 0 ? (a.deficitValue / totalDeficit) * budget : 0;
      const sharesToBuy = Math.max(0, Math.floor(Math.min(remaining, share) / a.pos.currentPrice));
      const cost = Math.round(sharesToBuy * a.pos.currentPrice * 100) / 100;
      remaining -= cost;
      return { ...a, sharesToBuy, cost, projectedPct: 0 };
    });

  // 2e passe : le reliquat va à la ligne la plus en retard dont une part reste abordable.
  for (const line of lines) {
    if (line.deficitValue > 0 && line.targetPct > 0 && line.pos.currentPrice > 0 && remaining >= line.pos.currentPrice) {
      const extra = Math.floor(remaining / line.pos.currentPrice);
      const extraCost = Math.round(extra * line.pos.currentPrice * 100) / 100;
      line.sharesToBuy += extra;
      line.cost += extraCost;
      remaining -= extraCost;
    }
  }

  lines.forEach(line => {
    line.projectedPct = projectedTotal > 0 ? ((line.pos.valuation + line.cost) / projectedTotal) * 100 : 0;
  });

  const cheapestUnderTarget = lines
    .filter(l => l.deficitValue > 0 && l.targetPct > 0)
    .sort((a, b) => a.pos.currentPrice - b.pos.currentPrice)[0];

  return {
    targets,
    targetsSum,
    lines,
    purchases: lines.filter(l => l.sharesToBuy > 0),
    totalSpent: Math.round((budget - remaining) * 100) / 100,
    remainingBudget: Math.max(0, Math.round(remaining * 100) / 100),
    cheapestUnderTarget
  };
}

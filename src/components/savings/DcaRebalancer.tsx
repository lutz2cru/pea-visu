import React, { useEffect, useState } from 'react';
import { Position, positionKey } from '../../types/portfolio';
import { ShoppingCart, Sparkles, Scale, Calendar, AlertTriangle } from 'lucide-react';
import { downloadDcaCalendarReminder } from '../../utils/calendar';

interface DcaRebalancerProps {
  positions: Position[];
}

type StrategyType = 'ETF_CORE' | 'ALL_ETF' | 'DIVIDENDS' | 'CUSTOM';

const STRATEGY_KEY = 'pea_dca_strategy';
const CUSTOM_TARGETS_KEY = 'pea_dca_custom_targets';

const STRATEGIES: Array<{ id: StrategyType; title: string; description: string }> = [
  {
    id: 'ETF_CORE',
    title: '70 % ETF / 30 % actions',
    description: 'Les ETF visent 70 % du PEA (répartis selon leur poids actuel), les actions 30 %.'
  },
  {
    id: 'ALL_ETF',
    title: '100 % ETF',
    description: 'Les versements ne vont plus que sur les ETF. Les actions restent mais ne reçoivent plus rien.'
  },
  {
    id: 'DIVIDENDS',
    title: 'Priorité dividendes',
    description: '80 % de la cible répartie selon le rendement du dividende de chaque action, 20 % sur le reste.'
  },
  {
    id: 'CUSTOM',
    title: 'Ma cible',
    description: 'Tu fixes toi-même le pourcentage visé pour chaque ligne (enregistré dans ce navigateur).'
  }
];

function readStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeStorage(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // stockage indisponible : la préférence ne sera simplement pas mémorisée
  }
}

/** Répartit `share` % entre `items` proportionnellement à `weightOf` (à parts égales si tous les poids sont nuls). */
function distribute(items: Position[], share: number, weightOf: (p: Position) => number): Record<string, number> {
  const out: Record<string, number> = {};
  if (items.length === 0 || share <= 0) return out;
  const total = items.reduce((acc, p) => acc + Math.max(0, weightOf(p)), 0);
  items.forEach(p => {
    out[positionKey(p)] = total > 0 ? (share * Math.max(0, weightOf(p))) / total : share / items.length;
  });
  return out;
}

function currentWeights(positions: Position[]): Record<string, number> {
  return distribute(positions, 100, p => p.valuation);
}

/** Pondérations cibles (en %, clé = ISIN) pour une stratégie donnée, calculées à partir des lignes réellement détenues. */
function computeTargets(
  strategy: StrategyType,
  positions: Position[],
  customTargets: Record<string, number>
): Record<string, number> {
  const etfs = positions.filter(p => p.assetType === 'ETF');
  const stocks = positions.filter(p => p.assetType !== 'ETF');
  const byValue = (p: Position) => p.valuation;

  switch (strategy) {
    case 'ETF_CORE': {
      if (etfs.length === 0 || stocks.length === 0) return currentWeights(positions);
      return { ...distribute(etfs, 70, byValue), ...distribute(stocks, 30, byValue) };
    }
    case 'ALL_ETF': {
      if (etfs.length === 0) return currentWeights(positions);
      return { ...distribute(stocks, 0, byValue), ...distribute(etfs, 100, byValue) };
    }
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

export const DcaRebalancer: React.FC<DcaRebalancerProps> = ({ positions }) => {
  const [budget, setBudget] = useState<number>(100);
  const [strategy, setStrategy] = useState<StrategyType>(() => readStorage<StrategyType>(STRATEGY_KEY, 'ETF_CORE'));
  const [customTargets, setCustomTargets] = useState<Record<string, number>>(() =>
    readStorage<Record<string, number>>(CUSTOM_TARGETS_KEY, {})
  );

  useEffect(() => writeStorage(STRATEGY_KEY, strategy), [strategy]);
  useEffect(() => writeStorage(CUSTOM_TARGETS_KEY, customTargets), [customTargets]);

  const totalValuation = positions.reduce((acc, p) => acc + p.valuation, 0);
  const targets = computeTargets(strategy, positions, customTargets);
  const targetsSum = positions.reduce((acc, p) => acc + (targets[positionKey(p)] || 0), 0);
  // Les cibles saisies à la main sont ramenées à 100 % pour le calcul.
  const normalize = targetsSum > 0 ? 100 / targetsSum : 0;

  const handleCustomTargetChange = (p: Position, value: number) => {
    const next: Record<string, number> = {};
    positions.forEach(pos => {
      next[positionKey(pos)] = targets[positionKey(pos)] ?? 0;
    });
    next[positionKey(p)] = Math.max(0, Math.min(100, value));
    setCustomTargets(next);
  };

  // Rééquilibrage par les flux : le versement va aux lignes les plus en dessous de leur cible.
  const projectedTotalValuation = totalValuation + budget;

  const positionAnalysis = positions.map(pos => {
    const targetPct = (targets[positionKey(pos)] || 0) * normalize;
    const idealValue = (projectedTotalValuation * targetPct) / 100;
    const deficitValue = Math.max(0, idealValue - pos.valuation);
    const currentPct = totalValuation > 0 ? (pos.valuation / totalValuation) * 100 : 0;
    return { pos, targetPct, currentPct, deficitValue };
  });

  const totalDeficit = positionAnalysis.reduce((acc, item) => acc + item.deficitValue, 0);

  let remainingBudget = budget;
  const sortedByDeficit = [...positionAnalysis].sort((a, b) => b.deficitValue - a.deficitValue);

  // 1re passe : part du budget proportionnelle au retard de chaque ligne, en parts entières.
  const buyRecommendations = sortedByDeficit.map(({ pos, targetPct, currentPct, deficitValue }) => {
    if (deficitValue <= 0 || targetPct <= 0 || pos.currentPrice <= 0) {
      return { pos, sharesToBuy: 0, cost: 0, targetPct, currentPct, deficitValue, projectedPct: currentPct };
    }
    const theoreticalAllocation = totalDeficit > 0 ? (deficitValue / totalDeficit) * budget : 0;
    const sharesToBuy = Math.max(0, Math.floor(Math.min(remainingBudget, theoreticalAllocation) / pos.currentPrice));
    const cost = Math.round(sharesToBuy * pos.currentPrice * 100) / 100;
    remainingBudget -= cost;
    return { pos, sharesToBuy, cost, targetPct, currentPct, deficitValue, projectedPct: 0 };
  });

  // 2e passe : le reliquat va à la ligne la plus en retard dont une part est encore abordable.
  for (const item of buyRecommendations) {
    if (item.deficitValue > 0 && item.targetPct > 0 && item.pos.currentPrice > 0 && remainingBudget >= item.pos.currentPrice) {
      const extraShares = Math.floor(remainingBudget / item.pos.currentPrice);
      const extraCost = Math.round(extraShares * item.pos.currentPrice * 100) / 100;
      item.sharesToBuy += extraShares;
      item.cost += extraCost;
      remainingBudget -= extraCost;
    }
  }

  buyRecommendations.forEach(item => {
    item.projectedPct = projectedTotalValuation > 0 ? ((item.pos.valuation + item.cost) / projectedTotalValuation) * 100 : 0;
  });

  const totalSpent = budget - remainingBudget;
  const positionsToBuy = buyRecommendations.filter(b => b.sharesToBuy > 0);
  const cheapestUnderTarget = buyRecommendations
    .filter(b => b.deficitValue > 0 && b.targetPct > 0)
    .sort((a, b) => a.pos.currentPrice - b.pos.currentPrice)[0];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">

      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight">Où placer mon prochain versement ?</h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Choisis une répartition cible : l'outil calcule quelles parts acheter pour t'en rapprocher, sans rien vendre.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
            <label htmlFor="dca-budget" className="text-xs text-slate-400">Montant :</label>
            <div className="flex items-center gap-1">
              {[50, 100, 200, 300].map(amt => (
                <button
                  key={amt}
                  type="button"
                  onClick={() => setBudget(amt)}
                  className={`text-xs px-2 py-0.5 rounded-md font-mono transition ${
                    budget === amt ? 'bg-indigo-500 text-white font-bold' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {amt}€
                </button>
              ))}
              <input
                id="dca-budget"
                type="number"
                min={0}
                step={10}
                value={budget}
                onChange={(e) => setBudget(Math.max(0, parseFloat(e.target.value) || 0))}
                className="w-20 ml-1 bg-slate-900 border border-slate-700 rounded-md px-2 py-0.5 text-xs font-mono text-white focus:outline-none focus:border-indigo-500"
              />
              <span className="text-xs text-slate-400">€</span>
            </div>
          </div>

          <button
            type="button"
            onClick={() => downloadDcaCalendarReminder(budget)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl border border-slate-700 transition"
            title="Télécharger un rappel mensuel pour ton agenda (.ics)"
          >
            <Calendar className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">Rappel mensuel (.ics)</span>
          </button>
        </div>
      </div>

      {/* Choix de la répartition cible */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-300">Répartition visée :</span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
          {STRATEGIES.map(s => (
            <button
              key={s.id}
              type="button"
              onClick={() => setStrategy(s.id)}
              aria-pressed={strategy === s.id}
              className={`p-3 rounded-xl border text-left transition ${
                strategy === s.id
                  ? 'bg-indigo-950/30 border-indigo-500/50 text-white shadow-sm ring-1 ring-indigo-500/20'
                  : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <span className="text-xs font-bold text-white block">{s.title}</span>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">{s.description}</p>
            </button>
          ))}
        </div>
        <p className="text-[11px] text-slate-500">
          Ces modèles sont des règles de calcul pour t'aider à visualiser, pas des recommandations d'investissement.
        </p>
      </div>

      {/* Plan d'achat */}
      <div className="bg-gradient-to-br from-indigo-950/40 via-slate-950 to-slate-950 border border-indigo-500/30 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white">Achats suggérés pour {budget.toLocaleString('fr-FR')} € :</span>
          </div>
          <span className="text-xs font-mono text-emerald-300 font-bold">
            Total : {totalSpent.toFixed(2)} €
            {remainingBudget > 0.005 && <span className="text-slate-400 font-normal ml-1">({remainingBudget.toFixed(2)} € restent en espèces)</span>}
          </span>
        </div>

        {positionsToBuy.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {positionsToBuy.map(item => (
              <div key={item.pos.id} className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center justify-between">
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-white">{item.pos.ticker || item.pos.label}</span>
                    <span className="text-[10px] px-1.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                      {item.pos.assetType}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5 truncate max-w-[160px]">{item.pos.label}</span>
                  <span className="text-[10px] text-slate-500 font-mono">Cours : {item.pos.currentPrice.toFixed(2)} €</span>
                </div>
                <div className="text-right shrink-0">
                  <span className="text-base font-extrabold font-mono text-emerald-400 block">
                    +{item.sharesToBuy} {item.sharesToBuy > 1 ? 'parts' : 'part'}
                  </span>
                  <span className="text-xs font-mono text-slate-300 font-bold block">{item.cost.toFixed(2)} €</span>
                  <span className="text-[10px] text-sky-400 font-mono">
                    {item.currentPct.toFixed(1)} % → {item.projectedPct.toFixed(1)} %
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 text-center text-xs text-slate-400">
            {cheapestUnderTarget
              ? <>Avec {budget.toLocaleString('fr-FR')} €, aucune part entière d'une ligne sous sa cible n'est abordable. La moins chère est {cheapestUnderTarget.pos.ticker || cheapestUnderTarget.pos.label} à {cheapestUnderTarget.pos.currentPrice.toFixed(2)} €.</>
              : <>Toutes les lignes sont déjà à leur cible ou au-dessus.</>}
          </div>
        )}
      </div>

      {strategy === 'CUSTOM' && Math.abs(targetsSum - 100) > 0.5 && (
        <div className="flex items-center gap-2 text-xs text-amber-200 bg-amber-500/10 border border-amber-500/30 rounded-lg px-3 py-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Tes cibles totalisent {targetsSum.toFixed(1)} % : elles sont ramenées à 100 % pour le calcul.</span>
        </div>
      )}

      {/* Tableau : actuel vs cible vs après achat */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800">
              <th className="py-2 font-medium">Ligne</th>
              <th className="py-2 font-medium">Type</th>
              <th className="py-2 font-medium text-right">Cours</th>
              <th className="py-2 font-medium text-right">Poids actuel</th>
              <th className="py-2 font-medium text-right text-indigo-300">Cible</th>
              <th className="py-2 font-medium text-right text-emerald-400">Achat</th>
              <th className="py-2 font-medium text-right text-sky-300">Poids après</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {buyRecommendations.map(item => (
              <tr key={item.pos.id} className="hover:bg-slate-800/30 transition">
                <td className="py-2.5 font-sans font-bold text-white">{item.pos.ticker || item.pos.label}</td>
                <td className="py-2.5 font-sans">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${item.pos.assetType === 'ETF' ? 'bg-indigo-500/10 text-indigo-300' : 'bg-emerald-500/10 text-emerald-300'}`}>
                    {item.pos.assetType}
                  </span>
                </td>
                <td className="py-2.5 text-right text-slate-400">{item.pos.currentPrice.toFixed(2)} €</td>
                <td className="py-2.5 text-right text-slate-300">{item.currentPct.toFixed(1)} %</td>
                <td className="py-2.5 text-right text-indigo-300 font-bold">
                  {strategy === 'CUSTOM' ? (
                    <span className="inline-flex items-center gap-1">
                      <input
                        type="number"
                        min={0}
                        max={100}
                        step={1}
                        value={targets[positionKey(item.pos)] ?? 0}
                        onChange={(e) => handleCustomTargetChange(item.pos, parseFloat(e.target.value) || 0)}
                        className="w-16 bg-slate-800 border border-slate-700 rounded-md px-1.5 py-0.5 text-right text-indigo-200 focus:outline-none focus:border-indigo-400"
                        aria-label={`Cible pour ${item.pos.label}, en %`}
                      />
                      %
                    </span>
                  ) : (
                    <>{item.targetPct.toFixed(1)} %</>
                  )}
                </td>
                <td className="py-2.5 text-right">
                  {item.sharesToBuy > 0 ? (
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      +{item.sharesToBuy} ({item.cost.toFixed(0)} €)
                    </span>
                  ) : (
                    <span className="text-slate-500">-</span>
                  )}
                </td>
                <td className="py-2.5 text-right text-sky-300 font-bold">{item.projectedPct.toFixed(1)} %</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
        <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
        <span>
          <strong>Rééquilibrer sans vendre :</strong> plutôt que de vendre les lignes qui ont trop monté, on oriente les nouveaux versements vers celles qui sont en dessous de leur cible.
          Les frais de courtage ne sont pas encore pris en compte : sur de petits ordres, ils peuvent peser.
        </span>
      </div>

    </div>
  );
};

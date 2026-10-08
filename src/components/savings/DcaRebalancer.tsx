import React, { useState } from 'react';
import { Position } from '../../types/portfolio';
import { SlidersHorizontal, ShoppingCart, ArrowRight, CheckCircle2, Sparkles, Scale, RefreshCw } from 'lucide-react';

interface DcaRebalancerProps {
  positions: Position[];
}

type StrategyType = 'BALANCED_ETF_STOCK' | 'ALL_ETF' | 'DIVIDENDS' | 'CUSTOM';

export const DcaRebalancer: React.FC<DcaRebalancerProps> = ({ positions }) => {
  const [budget, setBudget] = useState<number>(100);
  const [strategy, setStrategy] = useState<StrategyType>('BALANCED_ETF_STOCK');

  const totalValuation = positions.reduce((acc, p) => acc + p.valuation, 0);

  // Définir les pondérations cibles par défaut selon la stratégie
  const getDefaultTargetWeights = (strat: StrategyType): Record<string, number> => {
    switch (strat) {
      case 'BALANCED_ETF_STOCK':
        // 70% ETF (55% ESE S&P500 + 15% PAEEM Emergents) / 30% Actions (10% TTE, 10% AIR, 5% ORA, 5% CRDU)
        return {
          ese: 55,
          paeem: 15,
          tte: 10,
          air: 10,
          ora: 5,
          crdu: 5
        };
      case 'ALL_ETF':
        // 85% S&P 500 / 15% Émergents (100% ETF, pas d'achat d'actions)
        return {
          ese: 85,
          paeem: 15,
          tte: 0,
          air: 0,
          ora: 0,
          crdu: 0
        };
      case 'DIVIDENDS':
        // Priorité aux actions de rendement (TTE, ORA, CRDU)
        return {
          tte: 35,
          ora: 25,
          crdu: 20,
          ese: 10,
          air: 5,
          paeem: 5
        };
      case 'CUSTOM':
      default:
        // Pondérations réelles actuelles arrondies
        const cur: Record<string, number> = {};
        positions.forEach(p => {
          cur[p.id] = Math.round((p.valuation / totalValuation) * 100);
        });
        return cur;
    }
  };

  const [customWeights, setCustomWeights] = useState<Record<string, number>>(() =>
    getDefaultTargetWeights('BALANCED_ETF_STOCK')
  );

  const activeWeights = strategy === 'CUSTOM' ? customWeights : getDefaultTargetWeights(strategy);

  const handleStrategyChange = (newStrat: StrategyType) => {
    setStrategy(newStrat);
    setCustomWeights(getDefaultTargetWeights(newStrat));
  };

  // Calcul du Smart Inflow Rebalancing (Rééquilibrage par les flux)
  // Valeur totale après injection du budget
  const projectedTotalValuation = totalValuation + budget;

  // Calcul des déficits pour chaque position
  const positionAnalysis = positions.map(pos => {
    const targetPct = activeWeights[pos.id] || 0;
    const idealValue = (projectedTotalValuation * targetPct) / 100;
    const deficitValue = Math.max(0, idealValue - pos.valuation);
    const currentPct = totalValuation > 0 ? (pos.valuation / totalValuation) * 100 : 0;

    return {
      pos,
      targetPct,
      currentPct,
      idealValue,
      deficitValue
    };
  });

  const totalDeficit = positionAnalysis.reduce((acc, item) => acc + item.deficitValue, 0);

  // Attribution du budget disponible proportionnellement aux déficits
  // Puis conversion en parts entières selon le cours de l'action/ETF
  let remainingBudget = budget;
  const buyRecommendations: Array<{
    pos: Position;
    sharesToBuy: number;
    cost: number;
    targetPct: number;
    currentPct: number;
    projectedPct: number;
  }> = [];

  // Trier par sous-pondération décroissante (plus grand besoin d'abord)
  const sortedByDeficit = [...positionAnalysis].sort((a, b) => b.deficitValue - a.deficitValue);

  // Première passe : calcul des allocations idéales
  sortedByDeficit.forEach(({ pos, targetPct, currentPct, deficitValue }) => {
    if (deficitValue <= 0 || targetPct <= 0 || pos.currentPrice <= 0) {
      buyRecommendations.push({
        pos,
        sharesToBuy: 0,
        cost: 0,
        targetPct,
        currentPct,
        projectedPct: currentPct
      });
      return;
    }

    const theoreticalAllocation = totalDeficit > 0 ? (deficitValue / totalDeficit) * budget : 0;
    const maxShares = Math.floor(Math.min(remainingBudget, theoreticalAllocation) / pos.currentPrice);
    const sharesToBuy = Math.max(0, maxShares);
    const cost = Math.round(sharesToBuy * pos.currentPrice * 100) / 100;

    remainingBudget -= cost;

    buyRecommendations.push({
      pos,
      sharesToBuy,
      cost,
      targetPct,
      currentPct,
      projectedPct: 0 // recalculé après
    });
  });

  // Deuxième passe : si du budget résiduel peut acheter des parts supplémentaires du titre le plus sous-pondéré accessible
  if (remainingBudget > 0) {
    for (const item of buyRecommendations) {
      if (item.targetPct > 0 && item.pos.currentPrice > 0 && remainingBudget >= item.pos.currentPrice) {
        const extraShares = Math.floor(remainingBudget / item.pos.currentPrice);
        item.sharesToBuy += extraShares;
        const extraCost = Math.round(extraShares * item.pos.currentPrice * 100) / 100;
        item.cost += extraCost;
        remainingBudget -= extraCost;
      }
    }
  }

  // Recalcul des parts en % projetées après achat
  buyRecommendations.forEach(item => {
    const newVal = item.pos.valuation + item.cost;
    item.projectedPct = projectedTotalValuation > 0 ? (newVal / projectedTotalValuation) * 100 : 0;
  });

  const totalSpent = budget - remainingBudget;
  const positionsToBuy = buyRecommendations.filter(b => b.sharesToBuy > 0);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
      
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Scale className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Assistant DCA Malin & Rééquilibrage</span>
              <span className="text-[11px] font-normal text-indigo-300 bg-indigo-500/15 border border-indigo-500/30 px-2 py-0.5 rounded-full">
                Smart Inflow
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Déterminez sur quelles lignes investir vos prochains euros pour rééquilibrer votre PEA sans jamais vendre
            </p>
          </div>
        </div>

        {/* Sélection du budget à verser */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
          <span className="text-xs text-slate-400">À investir ce mois :</span>
          <div className="flex items-center gap-1">
            {[50, 100, 150, 200, 300].map(amt => (
              <button
                key={amt}
                type="button"
                onClick={() => setBudget(amt)}
                className={`text-xs px-2 py-0.5 rounded-md font-mono transition ${
                  budget === amt
                    ? 'bg-indigo-500 text-white font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {amt}€
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Choix de la stratégie d'allocation cible */}
      <div className="space-y-2">
        <span className="text-xs font-semibold text-slate-300">
          Choisissez votre modèle d'allocation cible :
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
          
          <button
            type="button"
            onClick={() => handleStrategyChange('BALANCED_ETF_STOCK')}
            className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
              strategy === 'BALANCED_ETF_STOCK'
                ? 'bg-indigo-950/30 border-indigo-500/50 text-white shadow-sm ring-1 ring-indigo-500/20'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <div>
              <span className="text-xs font-bold text-white block">
                70% ETF / 30% Actions (Recommandé)
              </span>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Piliers S&P 500 (55%) & Émergents (15%) + titres de conviction (TotalEnergies, Airbus...).
              </p>
            </div>
            <span className="text-[10px] text-indigo-400 font-medium mt-2 flex items-center gap-1">
              <span>Équilibre idéal croissance / dividende</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleStrategyChange('ALL_ETF')}
            className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
              strategy === 'ALL_ETF'
                ? 'bg-indigo-950/30 border-indigo-500/50 text-white shadow-sm ring-1 ring-indigo-500/20'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <div>
              <span className="text-xs font-bold text-white block">
                100% ETF Passif
              </span>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                85% S&P 500 (ESE) & 15% Émergents (PAEEM). Vos actions existantes restent mais ne reçoivent aucun flux.
              </p>
            </div>
            <span className="text-[10px] text-indigo-400 font-medium mt-2 flex items-center gap-1">
              <span>Risque spécifique minimal</span>
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleStrategyChange('DIVIDENDS')}
            className={`p-3 rounded-xl border text-left transition flex flex-col justify-between ${
              strategy === 'DIVIDENDS'
                ? 'bg-indigo-950/30 border-indigo-500/50 text-white shadow-sm ring-1 ring-indigo-500/20'
                : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            <div>
              <span className="text-xs font-bold text-white block">
                Dividendes & Cash-Flow
              </span>
              <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                Priorité à TotalEnergies (35%), Orange (25%) et Crédit Agricole (20%) pour maximiser les revenus passifs.
              </p>
            </div>
            <span className="text-[10px] text-indigo-400 font-medium mt-2 flex items-center gap-1">
              <span>Rendement en dividendes élevé</span>
            </span>
          </button>

        </div>
      </div>

      {/* Plan d'achat recommandé ce mois-ci */}
      <div className="bg-gradient-to-br from-indigo-950/40 via-slate-950 to-slate-950 border border-indigo-500/30 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShoppingCart className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-bold text-white">
              Plan d'Achat Optimisé pour votre versement de {budget} € :
            </span>
          </div>
          <span className="text-xs font-mono text-emerald-300 font-bold">
            Total alloué : {totalSpent.toFixed(2)} €
            {remainingBudget > 0 && <span className="text-slate-400 font-normal ml-1">({remainingBudget.toFixed(2)} € en liquidités)</span>}
          </span>
        </div>

        {positionsToBuy.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2.5">
            {positionsToBuy.map(item => (
              <div
                key={item.pos.id}
                className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 flex items-center justify-between"
              >
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="font-extrabold text-sm text-white">{item.pos.ticker || item.pos.label}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-semibold">
                      {item.pos.assetType}
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5 truncate max-w-[160px]">
                    {item.pos.label}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    Cours : {item.pos.currentPrice.toFixed(2)} €
                  </span>
                </div>

                <div className="text-right">
                  <span className="text-base font-extrabold font-mono text-emerald-400 block">
                    +{item.sharesToBuy} {item.sharesToBuy > 1 ? 'parts' : 'part'}
                  </span>
                  <span className="text-xs font-mono text-slate-300 font-bold block">
                    {item.cost.toFixed(2)} €
                  </span>
                  <span className="text-[10px] text-sky-400 font-mono">
                    {item.currentPct.toFixed(1)}% → {item.projectedPct.toFixed(1)}%
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-3 text-center text-xs text-slate-400">
            Le budget de {budget} € est insuffisant pour acheter une part entière des lignes sous-pondérées. Augmentez le budget ou orientez-vous vers ESE / PAEEM (prix de part ~25-35 €).
          </div>
        )}
      </div>

      {/* Tableau détaillé : Répartition Actuelle vs Cible vs Projetée */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800 pb-2">
              <th className="py-2 font-medium">Ligne</th>
              <th className="py-2 font-medium">Type</th>
              <th className="py-2 font-medium text-right">Cours actuel</th>
              <th className="py-2 font-medium text-right">Poids actuel</th>
              <th className="py-2 font-medium text-right text-indigo-300">Poids Cible</th>
              <th className="py-2 font-medium text-right text-emerald-400">Ordre d'achat</th>
              <th className="py-2 font-medium text-right text-sky-300">Poids après achat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {buyRecommendations.map(item => (
              <tr key={item.pos.id} className="hover:bg-slate-800/30 transition">
                <td className="py-2.5 font-sans font-medium text-white flex items-center gap-1.5">
                  <span className="font-bold">{item.pos.ticker || item.pos.label}</span>
                </td>
                <td className="py-2.5 font-sans">
                  <span className={`text-[10px] px-1.5 py-0.5 rounded font-semibold ${item.pos.assetType === 'ETF' ? 'bg-indigo-500/10 text-indigo-300' : 'bg-emerald-500/10 text-emerald-300'}`}>
                    {item.pos.assetType}
                  </span>
                </td>
                <td className="py-2.5 text-right text-slate-400">
                  {item.pos.currentPrice.toFixed(2)} €
                </td>
                <td className="py-2.5 text-right text-slate-300">
                  {item.currentPct.toFixed(1)} %
                </td>
                <td className="py-2.5 text-right text-indigo-300 font-bold">
                  {item.targetPct.toFixed(0)} %
                </td>
                <td className="py-2.5 text-right">
                  {item.sharesToBuy > 0 ? (
                    <span className="text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                      +{item.sharesToBuy} part ({item.cost.toFixed(0)} €)
                    </span>
                  ) : (
                    <span className="text-slate-500">-</span>
                  )}
                </td>
                <td className="py-2.5 text-right text-sky-300 font-bold">
                  {item.projectedPct.toFixed(1)} %
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Note méthodologique */}
      <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
        <Sparkles className="w-4 h-4 text-indigo-400 shrink-0" />
        <span>
          <strong>Principe du Rééquilibrage Passif (Inflow Rebalancing) :</strong> Au lieu de payer des frais de courtage en vendant vos lignes gagnantes, vous rééquilibrez votre portefeuille en allouant vos nouveaux versements mensuels uniquement sur les lignes sous-pondérées.
        </span>
      </div>

    </div>
  );
};

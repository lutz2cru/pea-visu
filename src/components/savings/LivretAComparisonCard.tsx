import React, { useState } from 'react';
import { calculateFutureValue } from '../../utils/simulation';
import { Landmark, TrendingUp, AlertCircle, ArrowUpRight, CheckCircle2, ShieldAlert } from 'lucide-react';

interface LivretAComparisonCardProps {
  currentPortfolioValuation?: number;
  defaultMonthlyDca?: number;
  expectedPeaRate?: number;
}

export const LivretAComparisonCard: React.FC<LivretAComparisonCardProps> = ({
  currentPortfolioValuation = 2453.80,
  defaultMonthlyDca = 100,
  expectedPeaRate = 7.55
}) => {
  const [monthlyDca, setMonthlyDca] = useState<number>(defaultMonthlyDca);
  const [livretARate, setLivretARate] = useState<number>(2.5); // Taux Livret A (2.5% ou 3.0%)
  const [peaRate, setPeaRate] = useState<number>(expectedPeaRate);

  const initialCapital = currentPortfolioValuation;

  const horizons = [10, 20, 30];

  const comparisons = horizons.map(years => {
    const livretCalc = calculateFutureValue(initialCapital, monthlyDca, livretARate, years);
    const peaCalc = calculateFutureValue(initialCapital, monthlyDca, peaRate, years);

    const extraWealth = Math.max(0, peaCalc.total - livretCalc.total);
    const extraGains = Math.max(0, peaCalc.gains - livretCalc.gains);

    return {
      years,
      calendarYear: 2026 + years,
      invested: livretCalc.invested,
      livretTotal: livretCalc.total,
      livretGains: livretCalc.gains,
      peaTotal: peaCalc.total,
      peaGains: peaCalc.gains,
      extraWealth,
      extraGains
    };
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
      
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Landmark className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Comparateur : PEA vs Livret A (Le Coût de l'Inaction)</span>
              <span className="text-[11px] font-normal text-amber-300 bg-amber-500/15 border border-amber-500/30 px-2 py-0.5 rounded-full">
                Benchmark Épargne
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Mesurez l'enrichissement manqué si votre argent dort sur un livret plutôt que sur votre PEA
            </p>
          </div>
        </div>

        {/* Sélecteur de versement */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400">Épargne mensuelle :</span>
          <div className="flex items-center gap-1 font-mono">
            {[50, 100, 200, 300].map(amt => (
              <button
                key={amt}
                type="button"
                onClick={() => setMonthlyDca(amt)}
                className={`px-2 py-0.5 rounded-md transition ${
                  monthlyDca === amt
                    ? 'bg-amber-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {amt}€
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Cartes comparatives 10, 20 et 30 ans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {comparisons.map((c) => (
          <div
            key={c.years}
            className="bg-slate-950/70 border border-slate-800 rounded-xl p-4 flex flex-col justify-between space-y-4 relative overflow-hidden"
          >
            <div>
              <div className="flex items-center justify-between pb-2 border-b border-slate-800/80">
                <span className="text-xs font-bold text-white">
                  Horizon {c.years} ans ({c.calendarYear})
                </span>
                <span className="text-[11px] text-slate-400 font-mono">
                  Versé : {c.invested.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                </span>
              </div>

              {/* Comparaison Livret A vs PEA */}
              <div className="space-y-3 pt-3">
                
                {/* Livret A */}
                <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Sur Livret A ({livretARate}%)</span>
                    <span className="font-mono text-slate-300 font-semibold">
                      +{c.livretGains.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} € d'intérêts
                    </span>
                  </div>
                  <span className="font-mono font-bold text-slate-300 text-sm">
                    {c.livretTotal.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                  </span>
                </div>

                {/* PEA */}
                <div className="bg-emerald-950/20 p-2.5 rounded-lg border border-emerald-500/30 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-emerald-400 block text-[11px] font-semibold">Sur votre PEA ({peaRate}%)</span>
                    <span className="font-mono text-emerald-400 font-bold">
                      +{c.peaGains.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} € d'intérêts
                    </span>
                  </div>
                  <span className="font-mono font-extrabold text-white text-base">
                    {c.peaTotal.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                  </span>
                </div>

              </div>
            </div>

            {/* Badge Bonus PEA */}
            <div className="pt-2 border-t border-slate-800/80 bg-slate-900/60 -mx-4 -mb-4 p-3 text-center">
              <span className="text-[10px] text-slate-400 block font-medium">Gain supplémentaire sur PEA :</span>
              <span className="font-mono font-extrabold text-emerald-400 text-sm block mt-0.5">
                +{c.extraWealth.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} € nets
              </span>
              <span className="text-[10px] text-slate-500 block">
                {(c.peaTotal / (c.livretTotal || 1)).toFixed(1)}x plus de capital accumulé
              </span>
            </div>

          </div>
        ))}
      </div>

      {/* Règle d'or de l'épargne patrimoniale */}
      <div className="bg-gradient-to-r from-slate-950 via-amber-950/20 to-slate-950 border border-amber-500/20 rounded-xl p-4 text-xs text-slate-300 space-y-2">
        <div className="flex items-center gap-2 text-amber-300 font-bold">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
          <span>La Règle d'Or de l'Épargnant : Ne confondez pas Sécurité et Croissance</span>
        </div>
        <p className="text-slate-400 text-[11px] leading-relaxed">
          Le Livret A est parfait pour votre <strong>épargne de précaution</strong> (gardez entre 3 et 6 mois de dépenses pour les imprévus). Mais au-delà de ce matelas de sécurité, l'inflation grignote votre pouvoir d'achat. Le <strong>PEA est le véhicule n°1</strong> pour faire fructifier votre épargne excédentaire sur le long terme sans impôt sur le revenu.
        </p>
      </div>

    </div>
  );
};

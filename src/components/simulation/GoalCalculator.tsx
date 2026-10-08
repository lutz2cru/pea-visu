import React, { useState } from 'react';
import { calculateRequiredSavings } from '../../utils/simulation';
import { Target, Sparkles, ArrowRight, PiggyBank, TrendingUp } from 'lucide-react';

interface GoalCalculatorProps {
  initialCapital: number;
  expectedRate: number;
  adjustForInflation?: boolean;
  inflationRate?: number;
}

export const GoalCalculator: React.FC<GoalCalculatorProps> = ({
  initialCapital,
  expectedRate,
  adjustForInflation = false,
  inflationRate = 2.0
}) => {
  const [targetAmount, setTargetAmount] = useState<number>(100000);
  const [targetYears, setTargetYears] = useState<number>(20); // 2046

  const result = calculateRequiredSavings(
    targetAmount,
    targetYears,
    initialCapital,
    expectedRate,
    adjustForInflation,
    inflationRate
  );

  const presetGoals = [50000, 100000, 200000, 500000, 1000000];
  const presetYears = [10, 15, 20, 25, 30];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
      
      {/* En-tête */}
      <div className="flex items-center space-x-2 mb-4">
        <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
          <Target className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Calculateur Inversé : « Combien dois-je épargner par mois ? »
          </h3>
          <p className="text-xs text-slate-400">
            Fixez votre objectif financier pour connaître l'effort d'épargne mensuel nécessaire
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        
        {/* Colonne 1 : Objectif & Horizon */}
        <div className="space-y-4 md:col-span-2">
          
          {/* Montant Cible */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Capital Cible souhaité :</span>
              <span className="font-mono font-bold text-amber-300 text-sm">
                {targetAmount.toLocaleString('fr-FR')} €
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {presetGoals.map((amt) => (
                <button
                  key={amt}
                  onClick={() => setTargetAmount(amt)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-mono transition ${targetAmount === amt ? 'bg-amber-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                  {amt >= 1000000 ? `${amt / 1000000} M€` : `${amt / 1000} k€`}
                </button>
              ))}
            </div>
          </div>

          {/* Horizon */}
          <div>
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-slate-300 font-medium">Pour quelle année cible ?</span>
              <span className="font-mono font-bold text-white text-sm">
                {2026 + targetYears} (dans {targetYears} ans)
              </span>
            </div>
            <div className="flex items-center gap-1.5 flex-wrap">
              {presetYears.map((y) => (
                <button
                  key={y}
                  onClick={() => setTargetYears(y)}
                  className={`text-xs px-2.5 py-1 rounded-lg font-mono transition ${targetYears === y ? 'bg-indigo-500 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
                >
                  {2026 + y} ({y} ans)
                </button>
              ))}
            </div>
          </div>

        </div>

        {/* Colonne 2 : Résultat Mis en avant */}
        <div className="bg-gradient-to-br from-amber-950/30 to-slate-950 border border-amber-500/30 rounded-xl p-4 text-center space-y-2">
          <span className="text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
            Effort d'épargne mensuel
          </span>
          <div className="text-3xl font-extrabold text-white font-mono">
            {result.requiredMonthly.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €
            <span className="text-sm text-slate-400 font-sans font-normal"> / mois</span>
          </div>
          <div className="pt-2 border-t border-slate-800/80 text-[11px] text-slate-400 space-y-1 text-left">
            <div className="flex justify-between">
              <span>Capital versé de votre poche :</span>
              <span className="text-slate-200 font-mono font-medium">{result.totalInvested.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</span>
            </div>
            <div className="flex justify-between text-emerald-400 font-medium">
              <span>Gains générés par le marché :</span>
              <span className="font-mono">+{result.totalGains.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</span>
            </div>
            {adjustForInflation && result.nominalTargetAmount && (
              <div className="pt-1 border-t border-slate-800/60 text-[10px] text-amber-300/90">
                <span>Cible future brute avec {inflationRate}% d'inflation : <strong>{result.nominalTargetAmount.toLocaleString('fr-FR')} €</strong></span>
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { ShieldCheck, Target, TrendingUp, Calendar, Coins, ArrowRight, Sparkles, CheckCircle2 } from 'lucide-react';
import { calculateFutureValue } from '../../utils/simulation';

interface PeaLimitCardProps {
  investedAmount: number; // Montant réel déposé (somme des PRU)
  currentValuation: number;
  defaultMonthlyContribution?: number;
  expectedReturnRate?: number;
}

const PEA_LEGAL_LIMIT = 150000; // Plafond officiel de versements sur PEA bancaire

export const PeaLimitCard: React.FC<PeaLimitCardProps> = ({
  investedAmount,
  currentValuation,
  defaultMonthlyContribution = 100,
  expectedReturnRate = 7.55
}) => {
  const [monthlyDca, setMonthlyDca] = useState<number>(defaultMonthlyContribution);

  const remainingToDeposit = Math.max(0, PEA_LEGAL_LIMIT - investedAmount);
  const progressPercent = Math.min(100, (investedAmount / PEA_LEGAL_LIMIT) * 100);

  // Temps nécessaire pour atteindre le plafond au rythme du DCA
  const monthsToMax = monthlyDca > 0 ? Math.ceil(remainingToDeposit / monthlyDca) : 0;
  const yearsToMax = Math.round((monthsToMax / 12) * 10) / 10;
  const targetYear = 2026 + Math.ceil(yearsToMax);

  // Estimation de la valeur du portefeuille quand le plafond de 150 000 € sera atteint
  const futureProjectedValue = calculateFutureValue(
    currentValuation,
    monthlyDca,
    expectedReturnRate,
    yearsToMax
  );

  const presetDcas = [100, 200, 300, 500, 800];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
      
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Target className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Objectif Plafond des 150 000 € de Versements</span>
              <span className="text-[11px] font-normal text-emerald-300 bg-emerald-500/15 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                Plafond légal PEA
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Suivez votre progression vers le montant maximal que vous pouvez déposer sur votre PEA
            </p>
          </div>
        </div>

        <div className="text-right">
          <span className="text-[11px] text-slate-400 block font-medium">Progression globale</span>
          <span className="text-sm font-extrabold font-mono text-emerald-400">
            {progressPercent.toFixed(2)} % atteint
          </span>
        </div>
      </div>

      {/* Barre de progression visuelle */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-slate-300">
            Déposé : <strong className="text-white">{investedAmount.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</strong>
          </span>
          <span className="text-slate-400">
            Reste à verser : <strong className="text-slate-200">{remainingToDeposit.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</strong>
          </span>
          <span className="text-emerald-400 font-bold">
            Plafond : 150 000 €
          </span>
        </div>

        <div className="w-full h-3.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800 shadow-inner relative">
          <div
            style={{ width: `${Math.max(1.5, progressPercent)}%` }}
            className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-indigo-500 rounded-full transition-all duration-500 shadow-sm"
          />
        </div>
      </div>

      {/* Simulateur de rythme de versement */}
      <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div>
            <span className="text-xs font-bold text-white block">
              À quelle vitesse souhaitez-vous remplir votre PEA ?
            </span>
            <span className="text-[11px] text-slate-400">
              Choisissez ou ajustez votre effort d'épargne mensuel :
            </span>
          </div>

          {/* Boutons d'accès rapide */}
          <div className="flex items-center gap-1.5 flex-wrap">
            {presetDcas.map((amt) => (
              <button
                key={amt}
                type="button"
                onClick={() => setMonthlyDca(amt)}
                className={`text-xs px-2.5 py-1 rounded-lg font-mono transition ${
                  monthlyDca === amt
                    ? 'bg-emerald-500 text-slate-950 font-bold shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
                {amt} €/m
              </button>
            ))}
          </div>
        </div>

        {/* Curseur DCA */}
        <div className="space-y-1">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-400">Versement mensuel choisi :</span>
            <span className="font-mono font-bold text-emerald-400 text-sm">{monthlyDca.toLocaleString('fr-FR')} € / mois</span>
          </div>
          <input
            type="range"
            min={50}
            max={1500}
            step={25}
            value={monthlyDca}
            onChange={(e) => setMonthlyDca(parseInt(e.target.value, 10))}
            className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
        </div>

        {/* 3 Cartes de Résultats du rythme */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block flex items-center justify-center gap-1">
              <Calendar className="w-3 h-3 text-slate-400" />
              <span>Année du plein PEA</span>
            </span>
            <div className="text-xl font-extrabold text-white font-mono mt-1">
              {targetYear}
            </div>
            <span className="text-[10px] text-slate-400 font-mono block mt-0.5">
              dans {yearsToMax} ans ({monthsToMax} mois)
            </span>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block flex items-center justify-center gap-1">
              <Coins className="w-3 h-3 text-amber-400" />
              <span>Total déposé de votre poche</span>
            </span>
            <div className="text-xl font-extrabold text-amber-300 font-mono mt-1">
              150 000 €
            </div>
            <span className="text-[10px] text-slate-400 block mt-0.5">
              Plafond légal strict atteint
            </span>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-xl border border-emerald-500/30 text-center bg-gradient-to-br from-emerald-950/20 to-slate-900">
            <span className="text-[11px] text-emerald-400 font-semibold block flex items-center justify-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              <span>Valeur projetée du PEA</span>
            </span>
            <div className="text-xl font-extrabold text-white font-mono mt-1">
              {futureProjectedValue.total.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
            </div>
            <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">
              dont +{(futureProjectedValue.gains).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} € de gains !
            </span>
          </div>

        </div>
      </div>

      {/* Rappel des 2 super-pouvoirs du plafond PEA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
        <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 flex items-start gap-2.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          <div className="text-slate-300 text-[11px] leading-relaxed">
            <strong className="text-white block mb-0.5">Aucun plafond sur la valorisation</strong>
            Seuls les dépôts sont plafonnés à 150 000 €. Grâce aux intérêts composés et dividendes, votre compte peut sans problème dépasser 300 000 €, 500 000 € ou 1 000 000 €.
          </div>
        </div>

        <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 flex items-start gap-2.5">
          <ShieldCheck className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
          <div className="text-slate-300 text-[11px] leading-relaxed">
            <strong className="text-white block mb-0.5">Pas d'impôt sur le revenu après 5 ans</strong>
            Même une fois le plafond atteint, vos titres continuent de croître à l'abri de l'impôt sur le revenu. Tout retrait partiel reste possible sans clôturer le plan.
          </div>
        </div>
      </div>

    </div>
  );
};

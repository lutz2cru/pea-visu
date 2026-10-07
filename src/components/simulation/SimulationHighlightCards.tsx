import React from 'react';
import { SimulationMilestone } from '../../types/simulation';
import { Sparkles, Calendar, TrendingUp, Coins, ShieldCheck, ArrowUpRight } from 'lucide-react';

interface SimulationHighlightCardsProps {
  milestones: SimulationMilestone[];
  monthlyContribution: number;
}

export const SimulationHighlightCards: React.FC<SimulationHighlightCardsProps> = ({
  milestones,
  monthlyContribution
}) => {
  const m10 = milestones.find(m => m.years === 10);
  const m20 = milestones.find(m => m.years === 20);
  const m30 = milestones.find(m => m.years === 30);

  const targets = [
    {
      m: m10,
      label: 'Dans 10 ans',
      badge: 'Horizon Moyen Terme',
      badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      gradient: 'from-blue-950/30 to-slate-900/90',
      borderColor: 'border-blue-500/30'
    },
    {
      m: m20,
      label: 'Dans 20 ans',
      badge: 'Effet Boule de Neige',
      badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      gradient: 'from-emerald-950/30 to-slate-900/90',
      borderColor: 'border-emerald-500/30'
    },
    {
      m: m30,
      label: 'Dans 30 ans',
      badge: 'Liberté Financière / Retraite',
      badgeColor: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      gradient: 'from-purple-950/30 to-slate-900/90',
      borderColor: 'border-purple-500/30'
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {targets.map(({ m, label, badge, badgeColor, gradient, borderColor }) => {
        if (!m) return null;
        return (
          <div
            key={label}
            className={`bg-gradient-to-b ${gradient} border ${borderColor} rounded-2xl p-5 shadow-sm relative overflow-hidden flex flex-col justify-between`}
          >
            {/* Haut de la carte */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>{label}</span>
                  <span className="text-white font-extrabold bg-slate-800/80 px-2 py-0.5 rounded-full text-[11px] border border-slate-700/60">
                    Année {m.targetYear}
                  </span>
                </span>
                <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${badgeColor}`}>
                  {badge}
                </span>
              </div>

              {/* Valeur Totale */}
              <div className="mt-3">
                <span className="text-[11px] text-slate-400 font-medium">Valeur estimée du PEA</span>
                <div className="text-3xl font-extrabold tracking-tight text-white mt-0.5">
                  {m.portfolioValue.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                </div>
              </div>

              {/* Décomposition Versé vs Gains */}
              <div className="mt-4 pt-3 border-t border-slate-800/80 space-y-1.5 text-xs">
                <div className="flex justify-between items-center text-slate-400">
                  <span>Votre capital versé :</span>
                  <span className="font-mono text-slate-200">{m.totalInvested.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</span>
                </div>
                <div className="flex justify-between items-center text-emerald-400 font-semibold">
                  <span>Gains d'intérêts composés :</span>
                  <span className="font-mono">+{m.totalGains.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span>Part des gains dans le total :</span>
                  <span className="font-mono font-bold text-emerald-300">{m.gainsSharePercent} %</span>
                </div>
              </div>
            </div>

            {/* Bas de la carte : Rente ou Net fiscal */}
            <div className="mt-4 pt-3 border-t border-slate-800/80 bg-slate-950/40 -mx-5 -mb-5 p-4 rounded-b-2xl">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 flex items-center gap-1">
                  <Coins className="w-3.5 h-3.5 text-amber-400" />
                  <span>Rente mensuelle estimée :</span>
                </span>
                <span className="font-mono font-bold text-amber-300">
                  {m.monthlyPassiveIncome.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} € / mois
                </span>
              </div>
              <div className="flex items-center justify-between text-[11px] text-slate-400 mt-1">
                <span className="flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-emerald-400" />
                  <span>Net après PS (17,2%) :</span>
                </span>
                <span className="font-mono text-slate-300 font-medium">
                  {m.netValueAfterTax.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                </span>
              </div>
            </div>

          </div>
        );
      })}
    </div>
  );
};

import React from 'react';
import { SimulationMilestone } from '../../types/simulation';
import { Table, Calendar, ShieldCheck, Coins, Award } from 'lucide-react';

interface SimulationMilestonesTableProps {
  milestones: SimulationMilestone[];
}

export const SimulationMilestonesTable: React.FC<SimulationMilestonesTableProps> = ({
  milestones
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
      
      {/* En-tête */}
      <div className="flex items-center space-x-2 mb-4">
        <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
          <Table className="w-4 h-4" />
        </div>
        <div>
          <h3 className="text-base font-bold text-white tracking-tight">
            Tableau des Jalons Clés (5, 10, 15, 20, 25, 30 ans)
          </h3>
          <p className="text-xs text-slate-400">
            Détail chiffré année par année avec calcul de la fiscalité PEA et de la rente passive
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800 pb-2">
              <th className="py-2.5 font-medium">Horizon</th>
              <th className="py-2.5 font-medium">Année Cible</th>
              <th className="py-2.5 font-medium text-right">Capital Versé</th>
              <th className="py-2.5 font-medium text-right text-emerald-400">Gains Générés</th>
              <th className="py-2.5 font-medium text-right">Valeur Totale</th>
              <th className="py-2.5 font-medium text-right text-indigo-300">Part Intérêts</th>
              <th className="py-2.5 font-medium text-right text-slate-300">Net après PS (17,2%)</th>
              <th className="py-2.5 font-medium text-right text-amber-300">Rente Mensuelle (4%)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {milestones.map((m) => {
              const isKeyMilestone = m.years === 10 || m.years === 20 || m.years === 30;
              return (
                <tr
                  key={m.years}
                  className={`hover:bg-slate-800/40 transition ${isKeyMilestone ? 'bg-slate-800/20 font-semibold' : ''}`}
                >
                  <td className="py-3 font-sans font-medium text-slate-200 flex items-center gap-1.5">
                    {isKeyMilestone && <Award className="w-3.5 h-3.5 text-amber-400 shrink-0" />}
                    <span>Dans {m.years} ans</span>
                  </td>
                  <td className="py-3 font-sans text-white font-bold">
                    <span className="px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700/60 text-[11px]">
                      {m.targetYear}
                    </span>
                  </td>
                  <td className="py-3 text-right text-slate-300">
                    {m.totalInvested.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                  </td>
                  <td className="py-3 text-right text-emerald-400 font-bold">
                    +{m.totalGains.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                  </td>
                  <td className="py-3 text-right text-white font-extrabold text-sm">
                    {m.portfolioValue.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                  </td>
                  <td className="py-3 text-right text-indigo-300">
                    <span className="px-1.5 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20 text-[11px]">
                      {m.gainsSharePercent} %
                    </span>
                  </td>
                  <td className="py-3 text-right text-slate-300">
                    {m.netValueAfterTax.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
                  </td>
                  <td className="py-3 text-right text-amber-300 font-bold">
                    {m.monthlyPassiveIncome.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} € / m
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="mt-4 pt-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between gap-3 text-[11px] text-slate-400 font-sans">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>Sur PEA : 0 % d'impôt sur le revenu après 5 ans (seuls 17,2 % de prélèvements sociaux sont dus sur les gains nets).</span>
        </div>
        <div className="flex items-center gap-2">
          <Coins className="w-4 h-4 text-amber-400" />
          <span>Rente estimée calculée sur la règle des 4% annuels de retrait durable (Trinité / FIRE).</span>
        </div>
      </div>

    </div>
  );
};

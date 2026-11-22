import React from 'react';
import { currentYear } from '../../utils/dates';
import { formatEuro, formatPoints } from '../../utils/format';
import { SimulationMilestone } from '../../types/simulation';
import { InfoTip } from '../ui/InfoTip';

interface SimulationHighlightCardsProps {
  milestones: SimulationMilestone[];
  monthlyContribution: number;
  adjustForInflation?: boolean;
  inflationRate?: number;
}

const HORIZONS = [10, 20, 30];

export const SimulationHighlightCards: React.FC<SimulationHighlightCardsProps> = ({
  milestones,
  adjustForInflation = false
}) => (
  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
    {HORIZONS.map(years => {
      const m = milestones.find(x => x.years === years);
      if (!m) return null;
      return (
        <section key={years} className="bg-slate-900 border border-slate-800 rounded-2xl p-5">
          <h3 className="text-base font-bold text-white">
            Dans {years} ans <span className="text-slate-400 font-medium">({m.targetYear})</span>
          </h3>

          <div className="mt-3 text-sm text-slate-400">
            {adjustForInflation ? `Valeur estimée, en euros de ${currentYear()}` : 'Valeur estimée du PEA'}
          </div>
          <div className="text-3xl font-bold tracking-tight text-white tabular-nums">
            {formatEuro(m.portfolioValue, { decimals: 0 })}
          </div>

          <dl className="mt-4 pt-3 border-t border-slate-800 space-y-2 text-sm">
            <div className="flex justify-between gap-3">
              <dt className="text-slate-400">Tu auras versé</dt>
              <dd className="text-slate-100 tabular-nums">{formatEuro(m.totalInvested, { decimals: 0 })}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-400 flex items-center gap-1">Gains <InfoTip term="interetsComposes" /></dt>
              <dd className="text-emerald-400 font-semibold tabular-nums text-right">
                {formatEuro(m.totalGains, { decimals: 0, sign: true })}
                <span className="text-slate-400 font-normal"> ({formatPoints(m.gainsSharePercent, { decimals: 0 })} du total)</span>
              </dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-400 flex items-center gap-1">Après impôts <InfoTip term="prelevementsSociaux" /></dt>
              <dd className="text-slate-100 tabular-nums">{formatEuro(m.netValueAfterTax, { decimals: 0 })}</dd>
            </div>
            <div className="flex justify-between gap-3">
              <dt className="text-slate-400 flex items-center gap-1">Revenu possible <InfoTip term="regle4" /></dt>
              <dd className="text-amber-300 font-semibold tabular-nums">{formatEuro(m.monthlyPassiveIncome, { decimals: 0 })} / mois</dd>
            </div>
          </dl>
        </section>
      );
    })}
  </div>
);

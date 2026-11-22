import React from 'react';
import { SlidersHorizontal } from 'lucide-react';
import { currentYear } from '../../utils/dates';
import { formatEuro, formatPoints } from '../../utils/format';
import { SimulationParameters } from '../../types/simulation';
import { Card } from '../ui/Card';
import { InfoTip } from '../ui/InfoTip';

interface SimulationControlsProps {
  params: SimulationParameters;
  onChange: (newParams: SimulationParameters) => void;
  currentPortfolioValuation: number;
  /** Rendement annualisé constaté du PEA (null si historique trop court). */
  currentAnnualizedReturn: number | null;
}

const chip = (selected: boolean, color: 'emerald' | 'indigo' | 'amber') => {
  const on = {
    emerald: 'bg-emerald-500 text-slate-950',
    indigo: 'bg-indigo-500 text-white',
    amber: 'bg-amber-400 text-slate-950'
  }[color];
  return `text-sm px-2.5 py-1 rounded-lg font-medium transition ${selected ? on : 'bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'}`;
};

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  params,
  onChange,
  currentPortfolioValuation,
  currentAnnualizedReturn
}) => {
  const update = <K extends keyof SimulationParameters>(field: K, value: SimulationParameters[K]) =>
    onChange({ ...params, [field]: value });

  const quickMonthlyAmounts = [50, 100, 200, 300, 500];
  const presetRates = [
    { label: '4 % (prudent)', value: 4.0 },
    { label: '8,5 % (MSCI World, historique)', value: 8.5 },
    { label: '10 % (S&P 500, historique)', value: 10.0 }
  ];
  // Le rendement constaté n'est proposé que s'il est calculable et dans la plage du curseur.
  if (currentAnnualizedReturn !== null) {
    const observed = Math.round(currentAnnualizedReturn * 1000) / 10;
    if (observed >= 3 && observed <= 12) {
      presetRates.splice(1, 0, { label: `${formatPoints(observed)} (ton PEA jusqu'ici)`, value: observed });
    }
  }

  return (
    <Card
      title="Et si je continue à investir ?"
      subtitle="Règle tes hypothèses : tous les montants se mettent à jour en direct."
      icon={SlidersHorizontal}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">

        {/* 1. Point de départ */}
        <div className="space-y-2">
          <label htmlFor="sim-capital" className="text-sm text-slate-200 font-medium block">Je pars de</label>
          <div className="flex items-center gap-2">
            <input
              id="sim-capital"
              type="number"
              min={0}
              step={100}
              inputMode="decimal"
              value={params.initialCapital}
              onChange={(e) => update('initialCapital', parseFloat(e.target.value) || 0)}
              className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-400 rounded-xl px-3 py-2 text-base text-white focus:outline-none tabular-nums"
            />
            <span className="text-slate-300">€</span>
          </div>
          <button
            type="button"
            onClick={() => update('initialCapital', Math.round(currentPortfolioValuation * 100) / 100)}
            className="text-sm text-emerald-300 hover:text-emerald-200"
          >
            Reprendre la valeur actuelle ({formatEuro(currentPortfolioValuation, { decimals: 0 })})
          </button>
        </div>

        {/* 2. Versement mensuel */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 text-sm">
            <label htmlFor="sim-monthly" className="text-slate-200 font-medium flex items-center gap-1.5">
              Je verse chaque mois <InfoTip term="versementMensuel" />
            </label>
            <span className="font-bold text-emerald-300 tabular-nums">{formatEuro(params.monthlyContribution, { decimals: 0 })}</span>
          </div>
          <input
            id="sim-monthly"
            type="range"
            min={0}
            max={1500}
            step={25}
            value={params.monthlyContribution}
            onChange={(e) => update('monthlyContribution', parseInt(e.target.value, 10))}
            className="w-full accent-emerald-400 cursor-pointer"
          />
          <div className="flex items-center gap-1.5 flex-wrap">
            {quickMonthlyAmounts.map(amt => (
              <button key={amt} type="button" onClick={() => update('monthlyContribution', amt)} aria-pressed={params.monthlyContribution === amt} className={chip(params.monthlyContribution === amt, 'emerald')}>
                {amt} €
              </button>
            ))}
          </div>
        </div>

        {/* 3. Rendement espéré */}
        <div className="space-y-2">
          <div className="flex items-center justify-between gap-2 text-sm">
            <label htmlFor="sim-rate" className="text-slate-200 font-medium flex items-center gap-1.5">
              Rendement par an <InfoTip term="rendementHypothese" />
            </label>
            <span className="font-bold text-indigo-300 tabular-nums">{formatPoints(params.expectedReturnRate)}</span>
          </div>
          <input
            id="sim-rate"
            type="range"
            min={3}
            max={12}
            step={0.1}
            value={params.expectedReturnRate}
            onChange={(e) => update('expectedReturnRate', parseFloat(e.target.value))}
            className="w-full accent-indigo-400 cursor-pointer"
          />
          <div className="flex items-center gap-1.5 flex-wrap">
            {presetRates.map(p => (
              <button key={p.label} type="button" onClick={() => update('expectedReturnRate', p.value)} aria-pressed={Math.abs(params.expectedReturnRate - p.value) < 0.05} className={chip(Math.abs(params.expectedReturnRate - p.value) < 0.05, 'indigo')}>
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Durée et inflation */}
        <div className="space-y-2">
          <div className="text-sm text-slate-200 font-medium">Sur combien de temps ?</div>
          <div className="grid grid-cols-3 gap-1.5">
            {[10, 20, 30].map(y => (
              <button key={y} type="button" onClick={() => update('durationYears', y)} aria-pressed={params.durationYears === y} className={chip(params.durationYears === y, 'amber')}>
                {y} ans
              </button>
            ))}
          </div>
          <p className="text-sm text-slate-400">Jusqu'en {currentYear() + params.durationYears}</p>

          <div className="pt-3 mt-1 border-t border-slate-800 flex items-center justify-between gap-2">
            <span id="sim-inflation-label" className="text-sm text-slate-200 flex items-center gap-1.5">
              En euros d'aujourd'hui <InfoTip term="inflation" />
            </span>
            <button
              type="button"
              role="switch"
              aria-checked={params.adjustForInflation}
              aria-labelledby="sim-inflation-label"
              onClick={() => update('adjustForInflation', !params.adjustForInflation)}
              className={`w-11 h-6 rounded-full relative transition-colors shrink-0 ${params.adjustForInflation ? 'bg-emerald-500' : 'bg-slate-700'}`}
            >
              <span className={`absolute top-1 w-4 h-4 bg-white rounded-full transition-all ${params.adjustForInflation ? 'left-6' : 'left-1'}`} />
            </button>
          </div>

          {params.adjustForInflation && (
            <div className="space-y-1.5">
              <div className="text-sm text-slate-400">Inflation supposée :</div>
              <div className="grid grid-cols-4 gap-1">
                {[1.5, 2.0, 2.5, 3.0].map(rate => (
                  <button key={rate} type="button" onClick={() => update('inflationRate', rate)} aria-pressed={params.inflationRate === rate} className={chip(params.inflationRate === rate, 'emerald')}>
                    {formatPoints(rate)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {params.adjustForInflation && (
        <p className="mt-5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl px-3.5 py-2.5 text-sm text-emerald-100">
          Tous les montants des projections sont convertis en euros de {currentYear()} (inflation de {formatPoints(params.inflationRate)} par an) : ils montrent ce que tu pourras réellement acheter.
        </p>
      )}
    </Card>
  );
};

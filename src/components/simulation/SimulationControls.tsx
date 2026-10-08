import React from 'react';
import { SimulationParameters } from '../../types/simulation';
import { Sliders, Sparkles, TrendingUp, Calendar, Coins, Percent, ShieldCheck } from 'lucide-react';

interface SimulationControlsProps {
  params: SimulationParameters;
  onChange: (newParams: SimulationParameters) => void;
  currentPortfolioValuation: number;
}

export const SimulationControls: React.FC<SimulationControlsProps> = ({
  params,
  onChange,
  currentPortfolioValuation
}) => {
  const handleUpdate = (field: keyof SimulationParameters, value: any) => {
    onChange({
      ...params,
      [field]: value
    });
  };

  const quickMonthlyAmounts = [50, 100, 200, 300, 500, 1000];
  const presetRates = [
    { label: '4% (Prudent)', value: 4.0 },
    { label: '7.55% (Votre PEA actuel)', value: 7.55 },
    { label: '8.5% (MSCI World hist.)', value: 8.5 },
    { label: '10% (S&P 500 hist.)', value: 10.0 }
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
      
      {/* En-tête */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Sliders className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white tracking-tight">Paramètres de la Projection</h3>
            <p className="text-[11px] text-slate-400">Personnalisez votre épargne et le rendement espéré</p>
          </div>
        </div>

        <button
          onClick={() => handleUpdate('initialCapital', currentPortfolioValuation)}
          className="text-[11px] text-emerald-400 hover:text-emerald-300 font-medium bg-emerald-500/10 px-2 py-1 rounded-md border border-emerald-500/20 transition"
          title="Réinitialiser le capital de départ à la valorisation actuelle"
        >
          Valo PEA actuelle ({currentPortfolioValuation.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €)
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* 1. Capital initial */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Capital de départ</span>
            <span className="font-mono font-bold text-white">{params.initialCapital.toLocaleString('fr-FR')} €</span>
          </div>
          <input
            type="number"
            min={0}
            step={100}
            value={params.initialCapital}
            onChange={(e) => handleUpdate('initialCapital', parseFloat(e.target.value) || 0)}
            className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500 rounded-xl px-3 py-2 text-xs font-mono text-white focus:outline-none"
          />
          <p className="text-[10px] text-slate-400">Valeur actuelle de votre PEA Fortuneo</p>
        </div>

        {/* 2. Versement mensuel */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Versement mensuel (DCA)</span>
            <span className="font-mono font-bold text-emerald-400">{params.monthlyContribution.toLocaleString('fr-FR')} € / mois</span>
          </div>
          <input
            type="range"
            min={0}
            max={1500}
            step={25}
            value={params.monthlyContribution}
            onChange={(e) => handleUpdate('monthlyContribution', parseInt(e.target.value, 10))}
            className="w-full accent-emerald-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          {/* Boutons d'accès rapide */}
          <div className="flex items-center gap-1 flex-wrap">
            {quickMonthlyAmounts.map(amt => (
              <button
                key={amt}
                onClick={() => handleUpdate('monthlyContribution', amt)}
                className={`text-[10px] px-1.5 py-0.5 rounded font-mono transition ${params.monthlyContribution === amt ? 'bg-emerald-500 text-slate-950 font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                {amt}€
              </button>
            ))}
          </div>
        </div>

        {/* 3. Rendement annuel espéré */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Rendement annuel espéré</span>
            <span className="font-mono font-bold text-indigo-400">{params.expectedReturnRate.toFixed(2)} % / an</span>
          </div>
          <input
            type="range"
            min={3}
            max={12}
            step={0.1}
            value={params.expectedReturnRate}
            onChange={(e) => handleUpdate('expectedReturnRate', parseFloat(e.target.value))}
            className="w-full accent-indigo-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
          />
          {/* Préréglages */}
          <div className="flex items-center gap-1 flex-wrap">
            {presetRates.map(p => (
              <button
                key={p.label}
                onClick={() => handleUpdate('expectedReturnRate', p.value)}
                className={`text-[10px] px-1.5 py-0.5 rounded transition ${Math.abs(params.expectedReturnRate - p.value) < 0.05 ? 'bg-indigo-500 text-white font-bold' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                {p.label}
              </button>
            ))}
          </div>
        </div>

        {/* 4. Horizon & Options */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs">
            <span className="text-slate-300 font-medium">Horizon max</span>
            <span className="font-mono font-bold text-amber-300">{params.durationYears} ans ({2026 + params.durationYears})</span>
          </div>
          <div className="grid grid-cols-3 gap-1">
            {[10, 20, 30].map(y => (
              <button
                key={y}
                onClick={() => handleUpdate('durationYears', y)}
                className={`py-1.5 rounded-lg text-xs font-semibold transition ${params.durationYears === y ? 'bg-amber-500 text-slate-950 shadow-sm' : 'bg-slate-800 text-slate-400 hover:text-white'}`}
              >
                {y} ans ({2026 + y})
              </button>
            ))}
          </div>
          
          {/* Toggle Inflation & Taux */}
          <div className="pt-2 border-t border-slate-800/80 space-y-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${params.adjustForInflation ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'}`} />
                <span className={params.adjustForInflation ? 'text-emerald-300 font-semibold' : 'text-slate-400'}>
                  Pouvoir d'achat réel (Inflation)
                </span>
              </div>
              <button
                type="button"
                onClick={() => handleUpdate('adjustForInflation', !params.adjustForInflation)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                  params.adjustForInflation
                    ? 'bg-emerald-500 text-slate-950 shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
                <span>{params.adjustForInflation ? 'ACTIVÉ' : 'DÉSACTIVÉ'}</span>
              </button>
            </div>

            {/* Sélecteur de taux d'inflation lorsque activé */}
            {params.adjustForInflation && (
              <div className="bg-slate-950/80 p-2 rounded-xl border border-emerald-500/30 space-y-1.5 animate-fadeIn">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <span>Taux annuel déflaté :</span>
                  <span className="font-mono font-bold text-emerald-400">{params.inflationRate.toFixed(1)} % / an</span>
                </div>
                <div className="grid grid-cols-4 gap-1">
                  {[1.5, 2.0, 2.5, 3.0].map((rate) => (
                    <button
                      key={rate}
                      type="button"
                      onClick={() => handleUpdate('inflationRate', rate)}
                      className={`text-[10px] py-1 rounded-md font-mono transition ${
                        params.inflationRate === rate
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50 font-bold'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {rate.toFixed(1)}%
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-400 leading-tight pt-0.5">
                  Convertit tous les montants futurs en euros constants d'aujourd'hui.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>

      {/* Bandeau d'information si l'inflation est active */}
      {params.adjustForInflation && (
        <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl px-3.5 py-2 text-xs flex items-center justify-between text-emerald-300">
          <div className="flex items-center gap-2">
            <span className="text-base">💡</span>
            <span>
              <strong>Mode Pouvoir d'Achat Réel actif :</strong> Tous les montants du simulateur (cartes, courbes, jalons et rentes) sont déflatés à <strong>{params.inflationRate}%/an</strong> pour refléter leur valeur en euros d'aujourd'hui (2026).
            </span>
          </div>
          <button
            type="button"
            onClick={() => handleUpdate('adjustForInflation', false)}
            className="text-[11px] underline hover:text-white ml-2 shrink-0"
          >
            Revenir aux euros bruts (nominaux)
          </button>
        </div>
      )}

    </div>
  );
};

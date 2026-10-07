import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell
} from 'recharts';
import { YearPerformance, BenchmarkChoice } from '../types/portfolio';
import { BarChart3, Percent, DollarSign, Award, Layers } from 'lucide-react';

interface YearlyPerformanceChartProps {
  yearlyData: YearPerformance[];
  benchmark: BenchmarkChoice;
  onBenchmarkChange: (bench: BenchmarkChoice) => void;
  includeDividends: boolean;
  onToggleDividends: () => void;
}

export const YearlyPerformanceChart: React.FC<YearlyPerformanceChartProps> = ({
  yearlyData,
  benchmark,
  onBenchmarkChange,
  includeDividends,
  onToggleDividends
}) => {
  const [viewMode, setViewMode] = useState<'PERCENT' | 'EURO'>('PERCENT');

  const benchmarkLabel = {
    SP500: 'S&P 500 (US)',
    MSCI_WORLD: 'MSCI World',
    CAC40: 'CAC 40 (France)'
  }[benchmark];

  const getBenchmarkVal = (item: YearPerformance) => {
    switch (benchmark) {
      case 'SP500': return item.benchmarkSAndP500;
      case 'MSCI_WORLD': return item.benchmarkMSCIWorld;
      case 'CAC40': return item.benchmarkCAC40;
    }
  };

  const chartData = yearlyData.map(item => {
    const benchVal = getBenchmarkVal(item);
    return {
      name: item.label,
      portfolioReturn: viewMode === 'PERCENT' ? +(item.gainPercent * 100).toFixed(2) : +item.gain.toFixed(2),
      benchmarkReturn: viewMode === 'PERCENT' ? +(benchVal * 100).toFixed(2) : +(item.invested * benchVal).toFixed(2),
      dividends: +item.dividends.toFixed(2),
      rawItem: item
    };
  });

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
      
      {/* En-tête avec contrôles */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Rendement par Année (2024, 2025, 2026)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Découpage annuel de la performance de votre PEA comparé au marché
          </p>
        </div>

        {/* Boutons d'options */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Toggle % vs € */}
          <div className="bg-slate-800/90 p-0.5 rounded-lg border border-slate-700/60 flex items-center text-xs">
            <button
              onClick={() => setViewMode('PERCENT')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${viewMode === 'PERCENT' ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              % Rendement
            </button>
            <button
              onClick={() => setViewMode('EURO')}
              className={`px-2.5 py-1 rounded-md font-medium transition ${viewMode === 'EURO' ? 'bg-emerald-500 text-slate-950 font-semibold shadow-sm' : 'text-slate-400 hover:text-white'}`}
            >
              Gains nets (€)
            </button>
          </div>

          {/* Sélecteur de Benchmark */}
          <div className="flex items-center space-x-1 bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-700/60 text-xs">
            <span className="text-slate-400 mr-1">Benchmark :</span>
            <select
              value={benchmark}
              onChange={(e) => onBenchmarkChange(e.target.value as BenchmarkChoice)}
              className="bg-transparent text-emerald-300 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="SP500" className="bg-slate-900 text-white">S&P 500</option>
              <option value="MSCI_WORLD" className="bg-slate-900 text-white">MSCI World</option>
              <option value="CAC40" className="bg-slate-900 text-white">CAC 40</option>
            </select>
          </div>

          {/* Toggle Dividendes */}
          <button
            onClick={onToggleDividends}
            className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition flex items-center gap-1.5 ${includeDividends ? 'bg-amber-500/10 text-amber-300 border-amber-500/30' : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-white'}`}
          >
            <span>Dividendes perçus</span>
            <span className={`w-2 h-2 rounded-full ${includeDividends ? 'bg-amber-400' : 'bg-slate-600'}`}></span>
          </button>

        </div>
      </div>

      {/* Graphique Recharts */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="name"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={(val) => `${val}${viewMode === 'PERCENT' ? '%' : '€'}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                color: '#f8fafc',
                fontSize: '12px',
                boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)'
              }}
              formatter={(value: any, name: any) => {
                const formatted = Number(value).toFixed(2);
                const unit = viewMode === 'PERCENT' ? '%' : ' €';
                const labelName = name === 'portfolioReturn' ? 'Mon PEA' : benchmarkLabel;
                return [`${formatted}${unit}`, labelName];
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
              formatter={(val) => (val === 'portfolioReturn' ? 'Mon PEA Fortuneo' : `Indice : ${benchmarkLabel}`)}
            />
            <Bar
              dataKey="portfolioReturn"
              name="portfolioReturn"
              radius={[6, 6, 0, 0]}
              fill="#10b981"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={entry.name.includes('Global') ? '#059669' : '#10b981'}
                />
              ))}
            </Bar>
            <Bar
              dataKey="benchmarkReturn"
              name="benchmarkReturn"
              radius={[6, 6, 0, 0]}
              fill="#6366f1"
              opacity={0.65}
            />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Tableau récapitulatif annuel */}
      <div className="mt-6 border-t border-slate-800/80 pt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800 pb-2">
              <th className="py-2 font-medium">Période</th>
              <th className="py-2 font-medium">Investi</th>
              <th className="py-2 font-medium">Valeur période</th>
              <th className="py-2 font-medium">Gain (€)</th>
              <th className="py-2 font-medium">Rendement (%)</th>
              <th className="py-2 font-medium text-amber-300">Dividendes</th>
              <th className="py-2 font-medium text-indigo-300">{benchmarkLabel}</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/50">
            {yearlyData.map((item) => {
              const benchVal = getBenchmarkVal(item);
              const isGlobal = item.year === 'TOTAL';
              return (
                <tr
                  key={item.year}
                  className={`hover:bg-slate-800/40 transition ${isGlobal ? 'bg-emerald-950/20 font-semibold text-emerald-300' : 'text-slate-200'}`}
                >
                  <td className="py-2.5 font-medium flex items-center gap-1.5">
                    {isGlobal && <Award className="w-3.5 h-3.5 text-emerald-400" />}
                    <span>{item.label}</span>
                  </td>
                  <td className="py-2.5 font-mono">{item.invested.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</td>
                  <td className="py-2.5 font-mono">{item.valuation.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</td>
                  <td className="py-2.5 font-mono text-emerald-400">
                    +{item.gain.toFixed(2)} €
                  </td>
                  <td className="py-2.5 font-mono">
                    <span className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold">
                      +{(item.gainPercent * 100).toFixed(2)} %
                    </span>
                  </td>
                  <td className="py-2.5 font-mono text-amber-300/90">+{item.dividends.toFixed(2)} €</td>
                  <td className="py-2.5 font-mono text-indigo-300/90">+{(benchVal * 100).toFixed(2)} %</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};

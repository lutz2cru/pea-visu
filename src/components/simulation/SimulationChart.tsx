import React, { useState } from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend
} from 'recharts';
import { SimulationYearData } from '../../types/simulation';
import { TrendingUp, Layers, GitCompare } from 'lucide-react';

interface SimulationChartProps {
  timeline: SimulationYearData[];
  expectedRate: number;
  adjustForInflation?: boolean;
  inflationRate?: number;
}

export const SimulationChart: React.FC<SimulationChartProps> = ({
  timeline,
  expectedRate,
  adjustForInflation = false,
  inflationRate = 2.0
}) => {
  const [chartMode, setChartMode] = useState<'BREAKDOWN' | 'SCENARIOS'>('BREAKDOWN');

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
      
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h3 className="text-base font-bold text-white tracking-tight">
              Courbe des Intérêts Composés dans le Temps
            </h3>
            {adjustForInflation && (
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 font-mono px-2 py-0.5 rounded-full border border-emerald-500/30">
                Déflaté à {inflationRate}% / an
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 mt-1">
            {adjustForInflation
              ? `Projection exprimée en pouvoir d'achat réel (euros constants) jusqu'en ${timeline[timeline.length - 1]?.calendarYear}`
              : `Visualisez l'effet boule de neige année par année jusqu'en ${timeline[timeline.length - 1]?.calendarYear}`}
          </p>
        </div>

        {/* Boutons de bascule */}
        <div className="flex items-center bg-slate-800/90 p-0.5 rounded-lg border border-slate-700/60 text-xs">
          <button
            onClick={() => setChartMode('BREAKDOWN')}
            className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1.5 ${chartMode === 'BREAKDOWN' ? 'bg-indigo-500 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Versé vs Gains</span>
          </button>
          <button
            onClick={() => setChartMode('SCENARIOS')}
            className={`px-2.5 py-1 rounded-md font-medium transition flex items-center gap-1.5 ${chartMode === 'SCENARIOS' ? 'bg-indigo-500 text-white font-semibold shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>3 Scénarios (+/- 2%)</span>
          </button>
        </div>
      </div>

      {/* Graphique */}
      <div className="h-80 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timeline} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorGains" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorInvestedSim" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorOpt" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="calendarYear"
              stroke="#64748b"
              fontSize={12}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={(year) => `${year}`}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={(val) => {
                if (val >= 1000000) return `${(val / 1000000).toFixed(1)} M€`;
                if (val >= 1000) return `${(val / 1000).toFixed(0)} k€`;
                return `${val} €`;
              }}
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
                const labels: Record<string, string> = {
                  invested: adjustForInflation ? 'Capital versé (pouvoir d\'achat)' : 'Capital versé de votre poche',
                  gains: adjustForInflation ? 'Gains réels déflatés' : 'Gains d\'intérêts composés',
                  total: adjustForInflation ? `Scénario Réaliste (${expectedRate}% - ${inflationRate}% infl.)` : `Scénario Réaliste (${expectedRate}%)`,
                  optimistic: adjustForInflation ? `Optimiste (${(expectedRate + 2).toFixed(1)}% réel)` : `Scénario Optimiste (${(expectedRate + 2).toFixed(1)}%)`,
                  pessimistic: adjustForInflation ? `Prudent (${Math.max(1, expectedRate - 2).toFixed(1)}% réel)` : `Scénario Prudent (${Math.max(1, expectedRate - 2).toFixed(1)}%)`
                };
                return [`${Number(value).toLocaleString('fr-FR')} €`, labels[name] || name];
              }}
              labelFormatter={(label) => `Année ${label}`}
            />
            <Legend wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }} />

            {chartMode === 'BREAKDOWN' ? (
              <>
                <Area
                  type="monotone"
                  dataKey="invested"
                  name="invested"
                  stackId="1"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorInvestedSim)"
                />
                <Area
                  type="monotone"
                  dataKey="gains"
                  name="gains"
                  stackId="1"
                  stroke="#10b981"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorGains)"
                />
              </>
            ) : (
              <>
                <Area
                  type="monotone"
                  dataKey="optimistic"
                  name="optimistic"
                  stroke="#8b5cf6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorOpt)"
                />
                <Area
                  type="monotone"
                  dataKey="total"
                  name="total"
                  stroke="#10b981"
                  strokeWidth={2.5}
                  fill="none"
                />
                <Area
                  type="monotone"
                  dataKey="pessimistic"
                  name="pessimistic"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  strokeDasharray="4 4"
                  fill="none"
                />
              </>
            )}
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

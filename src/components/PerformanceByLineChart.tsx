import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, CartesianGrid } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { PositionPerformance } from '../utils/calculations';

interface PerformanceByLineChartProps {
  performances: PositionPerformance[];
}

type Metric = 'PERCENT' | 'EUROS';

const eur = (v: number) => v.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const LineTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as {
    name: string; fullName: string; gain: number; gainPercent: number;
    invested: number; valuation: number; annualized: number | null; yearsHeld: number;
  };
  const positive = d.gain >= 0;
  return (
    <div className="bg-slate-900/95 border border-slate-700 rounded-xl p-3 shadow-2xl text-xs max-w-xs">
      <div className="font-bold text-white text-sm">{d.name}</div>
      <div className="text-slate-400 text-[11px] mb-2 line-clamp-2">{d.fullName}</div>
      <div className="space-y-1 font-mono">
        <div className="flex justify-between gap-4"><span className="text-slate-400 font-sans">Investi</span><span className="text-slate-200">{eur(d.invested)} €</span></div>
        <div className="flex justify-between gap-4"><span className="text-slate-400 font-sans">Valeur</span><span className="text-white font-semibold">{eur(d.valuation)} €</span></div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400 font-sans">+/- value</span>
          <span className={positive ? 'text-emerald-400' : 'text-rose-400'}>
            {positive ? '+' : ''}{eur(d.gain)} € ({positive ? '+' : ''}{(d.gainPercent * 100).toFixed(1)} %)
          </span>
        </div>
        <div className="flex justify-between gap-4">
          <span className="text-slate-400 font-sans">Par an</span>
          <span className="text-indigo-300">
            {d.annualized !== null ? `${d.annualized >= 0 ? '+' : ''}${(d.annualized * 100).toFixed(1)} %` : '— (< 1 an)'}
          </span>
        </div>
      </div>
    </div>
  );
};

export const PerformanceByLineChart: React.FC<PerformanceByLineChartProps> = ({ performances }) => {
  const [metric, setMetric] = useState<Metric>('PERCENT');

  const data = [...performances]
    .map(p => ({
      name: p.position.ticker || p.position.label,
      fullName: p.position.label,
      gain: p.gain,
      gainPercent: p.gainPercent,
      invested: p.invested,
      valuation: p.position.valuation,
      annualized: p.annualizedReturn,
      yearsHeld: p.yearsHeld,
      value: metric === 'PERCENT' ? Math.round(p.gainPercent * 1000) / 10 : Math.round(p.gain * 100) / 100
    }))
    .sort((a, b) => b.value - a.value);

  const byPercent = [...data].sort((a, b) => b.gainPercent - a.gainPercent);
  const best = byPercent[0];
  const worst = byPercent[byPercent.length - 1];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm h-full flex flex-col">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
              <BarChart3 className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">Performance de chaque ligne</h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Plus ou moins-value depuis l'achat, d'après ton export (survole une barre pour le détail)
          </p>
        </div>

        <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800">
          {(['PERCENT', 'EUROS'] as Metric[]).map(m => (
            <button
              key={m}
              type="button"
              onClick={() => setMetric(m)}
              className={`px-2.5 py-1 rounded-md text-xs font-semibold transition ${
                metric === m ? 'bg-emerald-500 text-slate-950' : 'text-slate-400 hover:text-white'
              }`}
            >
              {m === 'PERCENT' ? 'en %' : 'en €'}
            </button>
          ))}
        </div>
      </div>

      <div className="flex-1" style={{ minHeight: Math.max(240, data.length * 40) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 24, bottom: 4, left: 8 }}>
            <CartesianGrid horizontal={false} stroke="#1e293b" />
            <XAxis
              type="number"
              tick={{ fill: '#94a3b8', fontSize: 11 }}
              tickFormatter={(v: number) => (metric === 'PERCENT' ? `${v} %` : `${v} €`)}
              axisLine={{ stroke: '#334155' }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={70}
              tick={{ fill: '#e2e8f0', fontSize: 12, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <ReferenceLine x={0} stroke="#475569" />
            <Tooltip content={<LineTooltip />} cursor={{ fill: 'rgba(148,163,184,0.08)' }} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={26}>
              {data.map(d => (
                <Cell key={d.name} fill={d.value >= 0 ? '#10b981' : '#f43f5e'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {data.length > 1 && (
        <div className="grid grid-cols-2 gap-2 mt-3 text-xs">
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-3 py-2">
            <span className="text-slate-400">Meilleure ligne : </span>
            <span className="font-semibold text-emerald-300">{best.name}</span>
            <span className="text-slate-400"> ({best.gainPercent >= 0 ? '+' : ''}{(best.gainPercent * 100).toFixed(1)} %)</span>
          </div>
          <div className={`${worst.gain >= 0 ? 'bg-slate-800/40 border-slate-700' : 'bg-rose-500/5 border-rose-500/20'} border rounded-lg px-3 py-2`}>
            <span className="text-slate-400">Moins bonne : </span>
            <span className={`font-semibold ${worst.gain >= 0 ? 'text-slate-200' : 'text-rose-300'}`}>{worst.name}</span>
            <span className="text-slate-400"> ({worst.gainPercent >= 0 ? '+' : ''}{(worst.gainPercent * 100).toFixed(1)} %)</span>
          </div>
        </div>
      )}
    </div>
  );
};

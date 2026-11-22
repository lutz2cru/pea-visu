import React, { useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, ReferenceLine, CartesianGrid } from 'recharts';
import { BarChart3 } from 'lucide-react';
import { PositionPerformance } from '../utils/calculations';
import { formatEuro, formatPercent, formatPoints } from '../utils/format';
import { Card } from './ui/Card';

interface PerformanceByLineChartProps {
  performances: PositionPerformance[];
}

type Metric = 'PERCENT' | 'EUROS';

interface Row {
  name: string;
  fullName: string;
  gain: number;
  gainPercent: number;
  invested: number;
  valuation: number;
  annualized: number | null;
  value: number;
}

const LineTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  const d = payload[0].payload as Row;
  const positive = d.gain >= 0;
  return (
    <div className="bg-slate-800 border border-slate-600 rounded-xl p-3 shadow-2xl text-sm max-w-xs">
      <div className="font-bold text-white">{d.name}</div>
      <div className="text-slate-300 text-xs mb-2 line-clamp-2">{d.fullName}</div>
      <dl className="space-y-1 tabular-nums">
        <div className="flex justify-between gap-4"><dt className="text-slate-300">Payé</dt><dd className="text-white">{formatEuro(d.invested)}</dd></div>
        <div className="flex justify-between gap-4"><dt className="text-slate-300">Vaut</dt><dd className="text-white font-semibold">{formatEuro(d.valuation)}</dd></div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-300">Gain</dt>
          <dd className={positive ? 'text-emerald-400' : 'text-rose-400'}>
            {formatEuro(d.gain, { sign: true })} ({formatPercent(d.gainPercent, { sign: true })})
          </dd>
        </div>
        <div className="flex justify-between gap-4">
          <dt className="text-slate-300">Par an</dt>
          <dd className="text-indigo-300">{d.annualized !== null ? formatPercent(d.annualized, { sign: true }) : 'moins d\'1 an'}</dd>
        </div>
      </dl>
    </div>
  );
};

export const PerformanceByLineChart: React.FC<PerformanceByLineChartProps> = ({ performances }) => {
  const [metric, setMetric] = useState<Metric>('PERCENT');

  const data: Row[] = performances
    .map(p => ({
      name: p.position.ticker || p.position.label,
      fullName: p.position.label,
      gain: p.gain,
      gainPercent: p.gainPercent,
      invested: p.invested,
      valuation: p.position.valuation,
      annualized: p.annualizedReturn,
      value: metric === 'PERCENT' ? Math.round(p.gainPercent * 1000) / 10 : Math.round(p.gain * 100) / 100
    }))
    .sort((a, b) => b.value - a.value);

  const byPercent = [...data].sort((a, b) => b.gainPercent - a.gainPercent);
  const best = byPercent[0];
  const worst = byPercent[byPercent.length - 1];

  const toggle = (
    <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800" role="group" aria-label="Unité">
      {(['PERCENT', 'EUROS'] as Metric[]).map(m => (
        <button
          key={m}
          type="button"
          onClick={() => setMetric(m)}
          aria-pressed={metric === m}
          className={`px-3 py-1 rounded-md text-sm font-semibold transition ${
            metric === m ? 'bg-emerald-500 text-slate-950' : 'text-slate-300 hover:text-white'
          }`}
        >
          {m === 'PERCENT' ? 'en %' : 'en €'}
        </button>
      ))}
    </div>
  );

  return (
    <Card
      title="Comment vont mes lignes ?"
      subtitle="Gain ou perte de chaque ligne depuis son achat (touche ou survole une barre pour le détail)"
      icon={BarChart3}
      action={toggle}
      className="h-full flex flex-col"
    >
      <div className="flex-1" style={{ minHeight: Math.max(220, data.length * 40) }}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, bottom: 4, left: 0 }}>
            <CartesianGrid horizontal={false} stroke="#1e293b" />
            <XAxis
              type="number"
              tick={{ fill: '#cbd5e1', fontSize: 12 }}
              tickFormatter={(v: number) => (metric === 'PERCENT' ? formatPoints(v, { decimals: 0 }) : formatEuro(v, { decimals: 0 }))}
              axisLine={{ stroke: '#334155' }}
              tickLine={false}
            />
            <YAxis
              type="category"
              dataKey="name"
              width={64}
              tick={{ fill: '#f1f5f9', fontSize: 13, fontWeight: 600 }}
              axisLine={false}
              tickLine={false}
            />
            <ReferenceLine x={0} stroke="#64748b" />
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-3 text-sm">
          <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg px-3 py-2">
            <span className="text-slate-400">Meilleure : </span>
            <span className="font-semibold text-emerald-300">{best.name}</span>
            <span className="text-slate-300"> ({formatPercent(best.gainPercent, { sign: true })})</span>
          </div>
          <div className={`${worst.gain >= 0 ? 'bg-slate-800/40 border-slate-700' : 'bg-rose-500/5 border-rose-500/20'} border rounded-lg px-3 py-2`}>
            <span className="text-slate-400">Moins bonne : </span>
            <span className={`font-semibold ${worst.gain >= 0 ? 'text-slate-200' : 'text-rose-300'}`}>{worst.name}</span>
            <span className="text-slate-300"> ({formatPercent(worst.gainPercent, { sign: true })})</span>
          </div>
        </div>
      )}
    </Card>
  );
};

import React from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { Position } from '../types/portfolio';
import { PieChart as PieIcon, ShieldAlert, Award } from 'lucide-react';

interface AllocationChartProps {
  positions: Position[];
}

const COLORS = [
  '#3b82f6', // Bleu S&P 500
  '#10b981', // Vert TotalEnergies
  '#06b6d4', // Cyan Airbus
  '#f59e0b', // Ambre Orange
  '#8b5cf6', // Violet Émergents
  '#ec4899'  // Rose Crédit Agricole
];

export const AllocationChart: React.FC<AllocationChartProps> = ({ positions }) => {
  const totalValuation = positions.reduce((acc, p) => acc + p.valuation, 0);

  const data = positions.map(p => ({
    name: p.ticker || p.label,
    fullName: p.label,
    value: p.valuation,
    percent: totalValuation > 0 ? (p.valuation / totalValuation) * 100 : 0,
    gain: p.unrealizedGain,
    gainPercent: p.unrealizedGainPercent * 100,
    assetType: p.assetType
  }));

  const etfValue = positions.filter(p => p.assetType === 'ETF').reduce((acc, p) => acc + p.valuation, 0);
  const stockValue = positions.filter(p => p.assetType === 'Action').reduce((acc, p) => acc + p.valuation, 0);

  const etfPct = totalValuation > 0 ? (etfValue / totalValuation) * 100 : 0;
  const stockPct = totalValuation > 0 ? (stockValue / totalValuation) * 100 : 0;

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
      
      {/* En-tête */}
      <div>
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <PieIcon className="w-4 h-4" />
          </div>
          <h2 className="text-base font-bold text-white tracking-tight">
            Répartition & Diversification
          </h2>
        </div>
        <p className="text-xs text-slate-400 mt-1">
          Pondération des 6 lignes de votre PEA
        </p>
      </div>

      {/* Donut Chart */}
      <div className="h-56 w-full relative my-2">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip
              contentStyle={{
                backgroundColor: '#0f172a',
                borderColor: '#334155',
                borderRadius: '0.75rem',
                color: '#f8fafc',
                fontSize: '12px'
              }}
              formatter={(val: any, name: any, item: any) => [
                `${Number(val).toLocaleString('fr-FR')} € (${item.payload.percent.toFixed(1)}%)`,
                item.payload.fullName
              ]}
            />
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={55}
              outerRadius={80}
              paddingAngle={3}
              dataKey="value"
            >
              {data.map((_, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>

        {/* Centre du Donut */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-xs text-slate-400 font-medium">Total PEA</span>
          <span className="text-sm font-bold text-white">
            {totalValuation.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
          </span>
        </div>
      </div>

      {/* Synthèse ETF vs Actions */}
      <div className="space-y-3 pt-2 border-t border-slate-800/80">
        
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-400">Répartition par type d'actif :</span>
          <span className="font-semibold text-slate-200">
            {etfPct.toFixed(1)}% ETF / {stockPct.toFixed(1)}% Actions
          </span>
        </div>

        {/* Barre de répartition visuelle */}
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden flex">
          <div style={{ width: `${etfPct}%` }} className="bg-indigo-500 h-full" title={`ETF: ${etfPct.toFixed(1)}%`} />
          <div style={{ width: `${stockPct}%` }} className="bg-emerald-500 h-full" title={`Actions: ${stockPct.toFixed(1)}%`} />
        </div>

        {/* Légende miniature des 6 positions */}
        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-1 text-xs">
          {data.map((item, idx) => (
            <div key={item.name} className="flex items-center justify-between text-slate-300">
              <div className="flex items-center gap-1.5 truncate">
                <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                <span className="truncate font-medium">{item.name}</span>
              </div>
              <span className="font-mono text-slate-400 ml-1 shrink-0">{item.percent.toFixed(1)}%</span>
            </div>
          ))}
        </div>

      </div>

    </div>
  );
};

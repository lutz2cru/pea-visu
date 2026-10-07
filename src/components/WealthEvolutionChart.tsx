import React from 'react';
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
import { MonthlyDataPoint } from '../utils/calculations';
import { InvestmentMode } from '../types/portfolio';
import { TrendingUp, Layers } from 'lucide-react';

interface WealthEvolutionChartProps {
  timelineData: MonthlyDataPoint[];
  investmentMode: InvestmentMode;
  onModeChange: (mode: InvestmentMode) => void;
}

export const WealthEvolutionChart: React.FC<WealthEvolutionChartProps> = ({
  timelineData,
  investmentMode,
  onModeChange
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
      
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Courbe d'Évolution du Capital (Juil 2024 - Oct 2026)
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Trajectoire du capital investi comparé à la valorisation réelle de votre PEA
          </p>
        </div>

        {/* Sélecteur de mode d'apport */}
        <div className="flex items-center bg-slate-800/90 p-0.5 rounded-lg border border-slate-700/60 text-xs">
          <button
            onClick={() => onModeChange('LUMP_SUM_2024')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${investmentMode === 'LUMP_SUM_2024' ? 'bg-teal-500 text-slate-950 font-semibold shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            Apport initial (2024)
          </button>
          <button
            onClick={() => onModeChange('DCA_REGULAR')}
            className={`px-2.5 py-1 rounded-md font-medium transition ${investmentMode === 'DCA_REGULAR' ? 'bg-teal-500 text-slate-950 font-semibold shadow-sm' : 'text-slate-400 hover:text-white'}`}
          >
            Versements DCA lissés
          </button>
        </div>
      </div>

      {/* Graphique AreaChart */}
      <div className="h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="colorValuation" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
              </linearGradient>
              <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis
              dataKey="label"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={{ stroke: '#334155' }}
              tickFormatter={(val) => `${val} €`}
              domain={['dataMin - 100', 'dataMax + 100']}
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
                const names: Record<string, string> = {
                  valuation: 'Valeur du PEA',
                  invested: 'Capital Investi',
                  sp500Indexed: 'Réf. S&P 500'
                };
                return [`${Number(value).toLocaleString('fr-FR')} €`, names[name] || name];
              }}
            />
            <Legend
              wrapperStyle={{ paddingTop: '10px', fontSize: '12px' }}
              formatter={(val) => {
                if (val === 'valuation') return 'Valeur Totale du PEA';
                if (val === 'invested') return 'Capital investi (PRU)';
                if (val === 'sp500Indexed') return 'Trajectoire Réf. S&P 500';
                return val;
              }}
            />
            <Area
              type="monotone"
              dataKey="valuation"
              stroke="#10b981"
              strokeWidth={2.5}
              fillOpacity={1}
              fill="url(#colorValuation)"
            />
            <Area
              type="monotone"
              dataKey="invested"
              stroke="#3b82f6"
              strokeWidth={2}
              strokeDasharray="4 4"
              fillOpacity={1}
              fill="url(#colorInvested)"
            />
            <Area
              type="monotone"
              dataKey="sp500Indexed"
              stroke="#a855f7"
              strokeWidth={1.5}
              strokeDasharray="2 2"
              fill="none"
              opacity={0.6}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      <div className="mt-4 flex items-center justify-between text-xs text-slate-400 bg-slate-950/40 p-2.5 rounded-xl border border-slate-800">
        <span>Capital initial : <strong className="text-slate-200">2 082,15 €</strong></span>
        <span>Plus-value nette : <strong className="text-emerald-400">+371,65 € (+17,85 %)</strong></span>
        <span>Valeur finale : <strong className="text-white font-bold">2 453,80 €</strong></span>
      </div>

    </div>
  );
};

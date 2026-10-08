import React, { useState } from 'react';
import { YearPerformance, BenchmarkChoice, InvestmentMode } from '../types/portfolio';
import { MonthlyDataPoint } from '../utils/calculations';
import { YearlyPerformanceChart } from './YearlyPerformanceChart';
import { WealthEvolutionChart } from './WealthEvolutionChart';
import { BarChart3, TrendingUp } from 'lucide-react';

interface PerformanceOverviewChartProps {
  yearlyData: YearPerformance[];
  benchmark: BenchmarkChoice;
  onBenchmarkChange: (bench: BenchmarkChoice) => void;
  includeDividends: boolean;
  onToggleDividends: () => void;
  timelineData: MonthlyDataPoint[];
  investmentMode: InvestmentMode;
  onModeChange: (mode: InvestmentMode) => void;
}

export const PerformanceOverviewChart: React.FC<PerformanceOverviewChartProps> = ({
  yearlyData,
  benchmark,
  onBenchmarkChange,
  includeDividends,
  onToggleDividends,
  timelineData,
  investmentMode,
  onModeChange
}) => {
  const [activeView, setActiveView] = useState<'YEARLY' | 'TIMELINE'>('YEARLY');

  return (
    <div className="space-y-3">
      {/* Barre de sélection de la vue graphique */}
      <div className="flex items-center justify-between bg-slate-900/60 p-1.5 rounded-xl border border-slate-800">
        <div className="flex items-center space-x-1">
          <button
            type="button"
            onClick={() => setActiveView('YEARLY')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
              activeView === 'YEARLY'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Rendements Annuels vs Indices</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveView('TIMELINE')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center space-x-1.5 transition ${
              activeView === 'TIMELINE'
                ? 'bg-emerald-500 text-slate-950 shadow-sm'
                : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Courbe d'Évolution du Capital</span>
          </button>
        </div>

        <span className="text-[11px] text-slate-500 hidden sm:inline font-mono mr-2">
          {activeView === 'YEARLY' ? 'Historique 2024-2026' : 'Progression mensuelle'}
        </span>
      </div>

      {/* Affichage du graphique sélectionné */}
      {activeView === 'YEARLY' ? (
        <YearlyPerformanceChart
          yearlyData={yearlyData}
          benchmark={benchmark}
          onBenchmarkChange={onBenchmarkChange}
          includeDividends={includeDividends}
          onToggleDividends={onToggleDividends}
        />
      ) : (
        <WealthEvolutionChart
          timelineData={timelineData}
          investmentMode={investmentMode}
          onModeChange={onModeChange}
        />
      )}
    </div>
  );
};

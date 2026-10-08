import React from 'react';
import { Position } from '../../types/portfolio';
import { DcaRebalancer } from './DcaRebalancer';
import { PeaLimitCard } from './PeaLimitCard';
import { LivretAComparisonCard } from './LivretAComparisonCard';
import { BudgetRuleCard } from './BudgetRuleCard';
import { FinancialIndependenceCard } from './FinancialIndependenceCard';
import { Lightbulb, Compass, Award, ShieldCheck } from 'lucide-react';

interface SavingsStrategyViewProps {
  positions: Position[];
  currentValuation: number;
  investedAmount: number;
  expectedReturnRate: number;
  defaultMonthlyDca?: number;
}

export const SavingsStrategyView: React.FC<SavingsStrategyViewProps> = ({
  positions,
  currentValuation,
  investedAmount,
  expectedReturnRate,
  defaultMonthlyDca = 100
}) => {
  return (
    <div className="space-y-6">
      
      {/* Bandeau d'introduction */}
      <div className="bg-gradient-to-r from-indigo-950/40 via-slate-900/80 to-emerald-950/40 border border-indigo-500/20 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center shrink-0 border border-indigo-500/20">
            <Compass className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
              <span>Guide & Outils d'Épargne Stratégique</span>
              <span className="text-[11px] font-normal text-indigo-300 bg-indigo-500/15 px-2 py-0.5 rounded-full border border-indigo-500/30">
                Optimisation PEA
              </span>
            </h2>
            <p className="text-xs text-slate-300 mt-0.5">
              Des fonctionnalités concrètes pour maximiser chaque euro investi, équilibrer votre portefeuille et accélérer votre liberté financière.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 text-xs text-slate-400 font-mono">
          <span>Capital actuel : <strong className="text-white">{currentValuation.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</strong></span>
          <span>•</span>
          <span>Rendement annuel : <strong className="text-emerald-400">{expectedReturnRate.toFixed(2)} %</strong></span>
        </div>
      </div>

      {/* 1. Assistant DCA Malin & Rééquilibrage */}
      <DcaRebalancer positions={positions} />

      {/* 2. Plafond légal des 150 000 € */}
      <PeaLimitCard
        investedAmount={investedAmount}
        currentValuation={currentValuation}
        defaultMonthlyContribution={defaultMonthlyDca}
        expectedReturnRate={expectedReturnRate}
      />

      {/* 3. Comparateur PEA vs Livret A (Le coût de l'inaction) */}
      <LivretAComparisonCard
        currentPortfolioValuation={currentValuation}
        defaultMonthlyDca={defaultMonthlyDca}
        expectedPeaRate={expectedReturnRate}
      />

      {/* 4. Règle budgétaire 50/30/20 & Booster d'épargne */}
      <BudgetRuleCard expectedReturnRate={expectedReturnRate} />

      {/* 5. Règle des 72 & Paliers de rentes FIRE */}
      <FinancialIndependenceCard
        currentValuation={currentValuation}
        expectedReturnRate={expectedReturnRate}
        monthlyDca={defaultMonthlyDca}
      />

    </div>
  );
};

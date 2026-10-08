import React, { useState } from 'react';
import { SimulationParameters } from '../../types/simulation';
import {
  generateSimulationTimeline,
  generateMilestones
} from '../../utils/simulation';
import { SimulationControls } from './SimulationControls';
import { SimulationHighlightCards } from './SimulationHighlightCards';
import { SimulationChart } from './SimulationChart';
import { SimulationMilestonesTable } from './SimulationMilestonesTable';
import { GoalCalculator } from './GoalCalculator';
import { LivretAComparisonCard } from '../savings/LivretAComparisonCard';
import { Info, Sparkles, BookOpen, ShieldCheck, ArrowRight } from 'lucide-react';


interface SimulatorViewProps {
  currentValuation: number;
  currentAnnualizedReturn: number;
  initialMonthlyContribution?: number;
}

export const SimulatorView: React.FC<SimulatorViewProps> = ({
  currentValuation,
  currentAnnualizedReturn,
  initialMonthlyContribution = 100
}) => {
  // Paramètres initiaux basés sur les données réelles de Matthias
  const [params, setParams] = useState<SimulationParameters>({
    initialCapital: currentValuation || 2453.80,
    monthlyContribution: initialMonthlyContribution, // 100 € / mois par défaut
    expectedReturnRate: Math.round((currentAnnualizedReturn * 100) * 100) / 100 || 7.55,
    durationYears: 30, // Jusqu'en 2056
    inflationRate: 2.0,
    adjustForInflation: false,
    socialSecurityTaxRate: 17.2,
    safeWithdrawalRate: 4.0
  });

  const timeline = generateSimulationTimeline(params);
  const milestones = generateMilestones(params);

  return (
    <div className="space-y-6">
      
      {/* 1. Contrôles Interactifs */}
      <SimulationControls
        params={params}
        onChange={setParams}
        currentPortfolioValuation={currentValuation}
      />

      {/* 2. Cartes Jalons 10 ans (2036), 20 ans (2046), 30 ans (2056) */}
      <SimulationHighlightCards
        milestones={milestones}
        monthlyContribution={params.monthlyContribution}
        adjustForInflation={params.adjustForInflation}
        inflationRate={params.inflationRate}
      />

      {/* 3. Graphique d'évolution des intérêts composés */}
      <SimulationChart
        timeline={timeline}
        expectedRate={params.expectedReturnRate}
        adjustForInflation={params.adjustForInflation}
        inflationRate={params.inflationRate}
      />

      {/* 4. Comparateur PEA vs Livret A (Le coût de l'inaction) */}
      <LivretAComparisonCard
        currentPortfolioValuation={params.initialCapital}
        defaultMonthlyDca={params.monthlyContribution}
        expectedPeaRate={params.expectedReturnRate}
      />

      {/* 5. Tableau complet chiffré des jalons (5, 10, 15, 20, 25, 30 ans) */}
      <SimulationMilestonesTable
        milestones={milestones}
        adjustForInflation={params.adjustForInflation}
        inflationRate={params.inflationRate}
      />

      {/* 6. Calculateur d'objectif inverse */}
      <GoalCalculator
        initialCapital={params.initialCapital}
        expectedRate={params.expectedReturnRate}
        adjustForInflation={params.adjustForInflation}
        inflationRate={params.inflationRate}
      />

      {/* 6. Guide & Rappel des règles fiscales du PEA */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950/20 to-slate-900 border border-slate-800 rounded-2xl p-5 text-xs text-slate-300">
        <div className="flex items-center space-x-2 mb-3 text-white font-bold text-sm">
          <BookOpen className="w-4 h-4 text-indigo-400" />
          <span>Guide : La mécanique des intérêts composés & les règles du PEA</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <h4 className="font-semibold text-white mb-1">1. Plafond de versement de 150 000 €</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Le PEA est limité à 150 000 € de dépôts cumulés, mais <strong>la valorisation n'a aucun plafond</strong> ! Grâce aux intérêts composés, votre compte peut atteindre 300 000 €, 500 000 € ou plus.
            </p>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <h4 className="font-semibold text-white mb-1">2. Exonération d'impôt après 5 ans</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Puisque votre PEA est ouvert depuis <strong>Juillet 2024</strong>, il franchira ses 5 ans fiscaux en <strong>Juillet 2029</strong>. Dès lors, tout retrait est 100 % exonéré d'impôt sur le revenu (seuls 17,2 % de prélèvements sociaux sont dus sur les gains).
            </p>
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
            <h4 className="font-semibold text-white mb-1">3. L'effet boule de neige exponentiel</h4>
            <p className="text-slate-400 text-[11px] leading-relaxed">
              Au début, votre effort d'épargne représente la quasi-totalité de votre capital. Mais après 15 à 20 ans, les <strong>gains générés chaque année dépassent largement le montant que vous versez</strong> de votre poche.
            </p>
          </div>
        </div>
      </div>

    </div>
  );
};

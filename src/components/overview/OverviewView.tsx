import React from 'react';
import { PortfolioSummary } from '../../utils/calculations';
import { DcaPlan, StrategyType } from '../../utils/dca';
import { PerformanceByLineChart } from '../PerformanceByLineChart';
import { SummaryHero } from './SummaryHero';
import { AllocationSummary } from './AllocationSummary';
import { MonthlyPlanCard } from './MonthlyPlanCard';

interface OverviewViewProps {
  summary: PortfolioSummary;
  peaStartDate: string;
  plan: DcaPlan;
  budget: number;
  strategy: StrategyType;
  onGoToLines: () => void;
  onGoToInvest: () => void;
}

/** Page d'accueil : répond à « Combien j'ai ? », « Comment ça va ? » et « Que faire ce mois-ci ? ». */
export const OverviewView: React.FC<OverviewViewProps> = ({
  summary,
  peaStartDate,
  plan,
  budget,
  strategy,
  onGoToLines,
  onGoToInvest
}) => (
  <div className="space-y-5">
    <SummaryHero summary={summary} peaStartDate={peaStartDate} />

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2">
        <PerformanceByLineChart performances={summary.performances} />
      </div>
      <AllocationSummary summary={summary} onShowDetails={onGoToLines} />
    </div>

    <MonthlyPlanCard plan={plan} budget={budget} strategy={strategy} onAdjust={onGoToInvest} />
  </div>
);

import React from 'react';
import { PortfolioSummary } from '../../utils/calculations';
import { DcaPlan, StrategyType } from '../../utils/dca';
import { Insight } from '../../utils/analysis';
import { BenchmarkData } from '../../utils/benchmark';
import { BenchmarkStatus } from '../../hooks/useBenchmarks';
import { PerformanceByLineChart } from '../PerformanceByLineChart';
import { BenchmarkCard } from '../analysis/BenchmarkCard';
import { InsightsCard } from '../analysis/InsightsCard';
import { SummaryHero } from './SummaryHero';
import { AllocationSummary } from './AllocationSummary';
import { MonthlyPlanCard } from './MonthlyPlanCard';

interface OverviewViewProps {
  summary: PortfolioSummary;
  peaStartDate: string;
  netAnnualDividends: number;
  plan: DcaPlan;
  budget: number;
  strategy: StrategyType;
  insights: Insight[];
  benchmarks: BenchmarkData | null;
  benchmarkStatus: BenchmarkStatus;
  onGoToLines: () => void;
  onGoToInvest: () => void;
}

/** Page d'accueil : combien j'ai, est-ce que ça marche, à quoi faire attention, que faire ce mois-ci. */
export const OverviewView: React.FC<OverviewViewProps> = ({
  summary,
  peaStartDate,
  netAnnualDividends,
  plan,
  budget,
  strategy,
  insights,
  benchmarks,
  benchmarkStatus,
  onGoToLines,
  onGoToInvest
}) => (
  <div className="space-y-5">
    <SummaryHero summary={summary} peaStartDate={peaStartDate} netAnnualDividends={netAnnualDividends} />

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2">
        <BenchmarkCard summary={summary} peaStartDate={peaStartDate} data={benchmarks} status={benchmarkStatus} />
      </div>
      <InsightsCard insights={insights} />
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
      <div className="lg:col-span-2">
        <PerformanceByLineChart performances={summary.performances} />
      </div>
      <AllocationSummary summary={summary} onShowDetails={onGoToLines} />
    </div>

    <MonthlyPlanCard plan={plan} budget={budget} strategy={strategy} onAdjust={onGoToInvest} />
  </div>
);

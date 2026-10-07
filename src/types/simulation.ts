export interface SimulationParameters {
  initialCapital: number;
  monthlyContribution: number;
  expectedReturnRate: number; // in %
  durationYears: number;
  inflationRate: number; // in %
  adjustForInflation: boolean;
  socialSecurityTaxRate: number; // in %, 17.2% for PEA
  safeWithdrawalRate: number; // in %, 4% rule
}

export interface SimulationMilestone {
  years: number;
  targetYear: number;
  totalInvested: number;
  totalGains: number;
  portfolioValue: number;
  netValueAfterTax: number;
  monthlyPassiveIncome: number;
  gainsSharePercent: number;
}

export interface SimulationYearData {
  years: number;
  calendarYear: number;
  invested: number;
  gains: number;
  total: number;
  optimistic: number; // ex: return + 2%
  pessimistic: number; // ex: return - 2%
  purchasingPower: number; // adjusted for inflation
}

export interface GoalCalculationResult {
  targetAmount: number;
  targetYear: number;
  years: number;
  requiredMonthly: number;
  totalInvested: number;
  totalGains: number;
}

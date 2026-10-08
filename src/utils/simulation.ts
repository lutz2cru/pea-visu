import { SimulationParameters, SimulationMilestone, SimulationYearData, GoalCalculationResult } from '../types/simulation';

const CURRENT_YEAR = 2026;

/**
 * Calcule la valeur future d'un capital avec versements mensuels
 */
export function calculateFutureValue(
  initialCapital: number,
  monthlyContribution: number,
  annualRatePct: number,
  years: number
): { total: number; invested: number; gains: number } {
  const r = annualRatePct / 100;
  const monthlyRate = r / 12;
  const totalMonths = years * 12;

  let total = initialCapital;
  let invested = initialCapital;

  if (monthlyRate === 0) {
    total = initialCapital + monthlyContribution * totalMonths;
    invested = total;
    return { total, invested, gains: 0 };
  }

  // FV = P * (1 + r/12)^n + PMT * [ ((1 + r/12)^n - 1) / (r/12) ]
  const compoundInitial = initialCapital * Math.pow(1 + monthlyRate, totalMonths);
  const compoundMonthly = monthlyContribution * ((Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate);
  
  total = compoundInitial + compoundMonthly;
  invested = initialCapital + (monthlyContribution * totalMonths);
  const gains = Math.max(0, total - invested);

  return {
    total: Math.round(total * 100) / 100,
    invested: Math.round(invested * 100) / 100,
    gains: Math.round(gains * 100) / 100
  };
}

/**
 * Génère la série temporelle année par année de 0 à maxYears
 */
export function generateSimulationTimeline(params: SimulationParameters): SimulationYearData[] {
  const timeline: SimulationYearData[] = [];
  const maxYears = params.durationYears;
  const baseRate = params.expectedReturnRate;
  const optimisticRate = baseRate + 2; // Scénario haussier (+2%)
  const pessimisticRate = Math.max(1, baseRate - 2); // Scénario prudent (-2%)
  const inflationRate = params.inflationRate / 100;

  for (let y = 0; y <= maxYears; y++) {
    const calendarYear = CURRENT_YEAR + y;
    const baseCalc = calculateFutureValue(params.initialCapital, params.monthlyContribution, baseRate, y);
    const optCalc = calculateFutureValue(params.initialCapital, params.monthlyContribution, optimisticRate, y);
    const pessCalc = calculateFutureValue(params.initialCapital, params.monthlyContribution, pessimisticRate, y);

    // Facteur d'inflation au fil des années (pouvoir d'achat de 1 € d'aujourd'hui dans y ans)
    const inflationFactor = Math.pow(1 + inflationRate, y);
    const purchasingPower = Math.round((baseCalc.total / inflationFactor) * 100) / 100;

    // Déflation en euros constants (pouvoir d'achat d'aujourd'hui) si option cochée
    const adjustedInvested = params.adjustForInflation
      ? Math.round((baseCalc.invested / inflationFactor) * 100) / 100
      : baseCalc.invested;

    const adjustedTotal = params.adjustForInflation
      ? purchasingPower
      : baseCalc.total;

    const adjustedGains = params.adjustForInflation
      ? Math.max(0, Math.round((adjustedTotal - adjustedInvested) * 100) / 100)
      : baseCalc.gains;

    timeline.push({
      years: y,
      calendarYear,
      invested: adjustedInvested,
      gains: adjustedGains,
      total: adjustedTotal,
      optimistic: params.adjustForInflation ? Math.round(optCalc.total / inflationFactor) : optCalc.total,
      pessimistic: params.adjustForInflation ? Math.round(pessCalc.total / inflationFactor) : pessCalc.total,
      purchasingPower
    });
  }

  return timeline;
}

/**
 * Génère les jalons clés (+5 ans, +10 ans, +15 ans, +20 ans, +25 ans, +30 ans)
 * En prenant en compte l'ajustement à l'inflation si activé.
 */
export function generateMilestones(params: SimulationParameters): SimulationMilestone[] {
  const milestoneYears = [5, 10, 15, 20, 25, 30, 35, 40].filter(y => y <= Math.max(30, params.durationYears));
  const rate = params.expectedReturnRate;
  const taxRate = params.socialSecurityTaxRate / 100; // 17.2% sur les gains du PEA
  const swr = params.safeWithdrawalRate / 100; // Règle des 4%
  const inflationRate = params.inflationRate / 100;

  return milestoneYears.map(y => {
    const { total, invested, gains } = calculateFutureValue(params.initialCapital, params.monthlyContribution, rate, y);
    
    // Facteur d'inflation pour l'année y
    const inflationFactor = params.adjustForInflation ? Math.pow(1 + inflationRate, y) : 1;

    // Valeur brute et déflatée
    const finalTotal = Math.round((total / inflationFactor) * 100) / 100;
    const finalInvested = Math.round((invested / inflationFactor) * 100) / 100;
    const finalGains = Math.max(0, Math.round((finalTotal - finalInvested) * 100) / 100);

    // Sur PEA après 5 ans : exonération totale d'impôt sur le revenu !
    // Seuls les prélèvements sociaux de 17.2% s'appliquent sur les GAINS.
    const taxOnGains = gains * taxRate;
    const netValueAfterTaxNominal = total - taxOnGains;
    const finalNetValueAfterTax = Math.round((netValueAfterTaxNominal / inflationFactor) * 100) / 100;

    // Rente mensuelle brute à 4% annuel
    const annualPassiveIncome = finalTotal * swr;
    const monthlyPassiveIncome = annualPassiveIncome / 12;

    const gainsShare = finalTotal > 0 ? (finalGains / finalTotal) * 100 : 0;

    return {
      years: y,
      targetYear: CURRENT_YEAR + y,
      totalInvested: finalInvested,
      totalGains: finalGains,
      portfolioValue: finalTotal,
      netValueAfterTax: finalNetValueAfterTax,
      monthlyPassiveIncome: Math.round(monthlyPassiveIncome * 100) / 100,
      gainsSharePercent: Math.round(gainsShare * 10) / 10
    };
  });
}

/**
 * Calcule l'épargne mensuelle nécessaire pour atteindre un objectif de capital
 * Peut ajuster pour l'inflation afin d'atteindre le capital en pouvoir d'achat futur.
 */
export function calculateRequiredSavings(
  targetAmount: number,
  years: number,
  initialCapital: number,
  annualRatePct: number,
  adjustForInflation: boolean = false,
  inflationRatePct: number = 2.0
): GoalCalculationResult {
  const r = annualRatePct / 100;
  const monthlyRate = r / 12;
  const totalMonths = years * 12;

  // Si on ajuste à l'inflation, la somme nominale requise dans "years" années est majorée de l'inflation
  const effectiveTarget = adjustForInflation
    ? Math.round(targetAmount * Math.pow(1 + inflationRatePct / 100, years))
    : targetAmount;

  let requiredMonthly = 0;

  if (monthlyRate === 0) {
    requiredMonthly = Math.max(0, (effectiveTarget - initialCapital) / totalMonths);
  } else {
    const futureInitial = initialCapital * Math.pow(1 + monthlyRate, totalMonths);
    const remainingToFund = Math.max(0, effectiveTarget - futureInitial);
    const annuityFactor = (Math.pow(1 + monthlyRate, totalMonths) - 1) / monthlyRate;
    requiredMonthly = remainingToFund / annuityFactor;
  }

  const roundedMonthly = Math.round(requiredMonthly * 100) / 100;
  const totalInvested = Math.round((initialCapital + roundedMonthly * totalMonths) * 100) / 100;
  const totalGains = Math.max(0, Math.round((effectiveTarget - totalInvested) * 100) / 100);

  return {
    targetAmount,
    nominalTargetAmount: adjustForInflation ? effectiveTarget : undefined,
    targetYear: CURRENT_YEAR + years,
    years,
    requiredMonthly: roundedMonthly,
    totalInvested,
    totalGains
  };
}

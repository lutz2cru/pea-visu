import React from 'react';
import { Wallet } from 'lucide-react';
import { PortfolioSummary } from '../../utils/calculations';
import { addYears, formatDateFr, formatMonthYear, parseYearMonth, yearsBetween } from '../../utils/dates';
import { formatDuration, formatEuro, formatPercent } from '../../utils/format';
import { PEA_DEPOSIT_CEILING, PEA_TAX_FREE_YEARS } from '../../config/fiscal';
import { GlossaryKey } from '../../data/glossary';
import { Card } from '../ui/Card';
import { InfoTip } from '../ui/InfoTip';

interface SummaryHeroProps {
  summary: PortfolioSummary;
  /** Date du premier versement (AAAA-MM). */
  peaStartDate: string;
  /** Dividendes annuels estimés, nets des retenues étrangères. */
  netAnnualDividends: number;
}

const Stat: React.FC<{ label: string; term: GlossaryKey; value: React.ReactNode; hint?: React.ReactNode; valueClassName?: string }> = ({
  label,
  term,
  value,
  hint,
  valueClassName = 'text-white'
}) => (
  <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
    <div className="text-sm text-slate-400 flex items-center gap-1.5">
      {label} <InfoTip term={term} />
    </div>
    <div className={`text-xl font-bold mt-1 tabular-nums ${valueClassName}`}>{value}</div>
    {hint && <div className="text-xs text-slate-400 mt-0.5">{hint}</div>}
  </div>
);

export const SummaryHero: React.FC<SummaryHeroProps> = ({ summary, peaStartDate, netAnnualDividends }) => {
  const total = summary.totalValuation + summary.cashBalance;
  const gain = summary.totalGain;
  const isGain = gain >= 0;
  const annualized = summary.annualizedReturn;

  const start = parseYearMonth(peaStartDate);
  const taxFree = start ? addYears(start, PEA_TAX_FREE_YEARS) : null;
  const monthsLeft = taxFree ? Math.ceil(yearsBetween(new Date(), taxFree) * 12) : null;

  return (
    <Card title="Combien j'ai ?" icon={Wallet}>
      <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-4">
        <div>
          <div className="text-sm text-slate-400 flex items-center gap-1.5">
            Valeur de ton PEA <InfoTip term="valeur" />
          </div>
          <div className="text-4xl sm:text-5xl font-bold tracking-tight text-white tabular-nums mt-1">
            {formatEuro(total)}
          </div>
          <div className="text-xs text-slate-400 mt-1">
            Situation au {formatDateFr(summary.asOfDate)} · {summary.positionsCount} ligne{summary.positionsCount > 1 ? 's' : ''}
            {summary.cashBalance > 0 && <> · dont {formatEuro(summary.cashBalance)} d'espèces</>}
          </div>
        </div>

        <p className="text-base text-slate-200 lg:max-w-md lg:text-right leading-relaxed">
          Tu as investi <strong className="text-white">{formatEuro(summary.totalInvested, { decimals: 0 })}</strong>.
          Ils valent aujourd'hui <strong className="text-white">{formatEuro(summary.totalValuation, { decimals: 0 })}</strong>, soit{' '}
          {isGain ? 'un gain' : 'une perte'} de{' '}
          <strong className={isGain ? 'text-emerald-400' : 'text-rose-400'}>
            {formatEuro(gain, { decimals: 0, sign: true })} ({formatPercent(summary.totalGainPercent, { sign: true })})
          </strong>
          <InfoTip term="plusValue" className="ml-1" />
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mt-5">
        <Stat
          label="Rendement / an"
          term="rendementAnnuel"
          value={annualized !== null ? formatPercent(annualized, { sign: true }) : '—'}
          valueClassName={annualized === null ? 'text-slate-500' : annualized >= 0 ? 'text-indigo-300' : 'text-rose-400'}
          hint={annualized !== null ? `estimation, sur ${summary.averageYearsHeld.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} ans en moyenne` : 'moins de 6 mois de recul'}
        />
        <Stat
          label="Dividendes / an"
          term="dividende"
          value={`≈ ${formatEuro(netAnnualDividends, { decimals: 0 })}`}
          valueClassName="text-amber-300"
          hint={`estimation nette, soit ${formatPercent(summary.totalValuation > 0 ? netAnnualDividends / summary.totalValuation : 0)} de la valeur`}
        />
        <Stat
          label={`${PEA_TAX_FREE_YEARS} ans fiscaux`}
          term="cinqAns"
          value={taxFree ? formatMonthYear(taxFree) : '—'}
          hint={
            monthsLeft === null
              ? 'renseigne le 1er versement dans Paramètres'
              : monthsLeft > 0
                ? `dans ${formatDuration(monthsLeft)}`
                : 'atteints'
          }
        />
        <Stat
          label="Plafond utilisé"
          term="plafond"
          value={formatPercent(summary.totalInvested / PEA_DEPOSIT_CEILING)}
          hint={`reste ${formatEuro(Math.max(0, PEA_DEPOSIT_CEILING - summary.totalInvested), { decimals: 0 })}`}
        />
      </div>
    </Card>
  );
};

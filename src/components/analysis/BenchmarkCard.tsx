import React, { useState } from 'react';
import { Scale, AlertTriangle } from 'lucide-react';
import { PortfolioSummary } from '../../utils/calculations';
import { BenchmarkData, BenchmarkKey, checkPurchaseDates, compareWithBenchmark } from '../../utils/benchmark';
import { BenchmarkStatus } from '../../hooks/useBenchmarks';
import { parseFlexibleDate, formatDateFr, formatMonthYear } from '../../utils/dates';
import { formatEuro, formatPercent } from '../../utils/format';
import { Card } from '../ui/Card';

interface BenchmarkCardProps {
  summary: PortfolioSummary;
  peaStartDate: string;
  data: BenchmarkData | null;
  status: BenchmarkStatus;
}

const OPTIONS: Array<{ key: BenchmarkKey; label: string }> = [
  { key: 'MSCI_WORLD', label: 'ETF Monde' },
  { key: 'SP500', label: 'ETF S&P 500' }
];

export const BenchmarkCard: React.FC<BenchmarkCardProps> = ({ summary, peaStartDate, data, status }) => {
  const [choice, setChoice] = useState<BenchmarkKey>('MSCI_WORLD');
  const series = data?.series[choice];
  const comparison = series ? compareWithBenchmark(summary, series, peaStartDate) : null;
  const label = OPTIONS.find(o => o.key === choice)?.label ?? '';

  const toggle = (
    <div className="flex items-center bg-slate-950 p-1 rounded-lg border border-slate-800" role="group" aria-label="ETF de comparaison">
      {OPTIONS.map(o => (
        <button
          key={o.key}
          type="button"
          onClick={() => setChoice(o.key)}
          aria-pressed={choice === o.key}
          className={`px-3 py-1 rounded-md text-sm font-semibold transition ${choice === o.key ? 'bg-sky-500 text-slate-950' : 'text-slate-300 hover:text-white'}`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );

  let body: React.ReactNode;
  if (status === 'loading') {
    body = <p className="text-sm text-slate-400">Chargement des cours de référence…</p>;
  } else if (!series || !comparison) {
    body = (
      <p className="text-sm text-slate-300">
        Comparaison indisponible : {status === 'unavailable' ? 'les cours de référence n\'ont pas pu être chargés' : 'la date de l\'export dépasse l\'historique disponible'}.
      </p>
    );
  } else {
    const ahead = comparison.difference >= 0;
    const updated = parseFlexibleDate(data?.updatedAt);
    const dateChecks = data ? checkPurchaseDates(summary, data, peaStartDate) : [];
    body = (
      <>
        <p className="text-base text-slate-200 leading-relaxed">
          Si tu avais placé les mêmes montants, aux mêmes dates, sur un <strong className="text-white">{label}</strong> ({series.name}),
          tu aurais environ <strong className="text-white">{formatEuro(comparison.benchmarkValue, { decimals: 0 })}</strong> au lieu de{' '}
          <strong className="text-white">{formatEuro(comparison.portfolioValue, { decimals: 0 })}</strong>.
        </p>

        {dateChecks.length > 0 && (
          <div className="mt-3 flex items-start gap-2 text-sm text-amber-100 bg-amber-500/10 border border-amber-500/30 rounded-xl px-3.5 py-3">
            <AlertTriangle className="w-4 h-4 mt-0.5 shrink-0 text-amber-300" aria-hidden="true" />
            <div>
              <strong>Résultat peu fiable : tes dates d'achat semblent imprécises.</strong>{' '}
              {dateChecks.map(c => (
                <span key={c.ticker}>
                  Pour {c.ticker}, le cours en {formatMonthYear(c.dateUsed)} ({formatEuro(c.priceAtDate)}) est loin de ton prix moyen ({formatEuro(c.pru)})
                  {c.suggestedDate && <> : ce prix correspond plutôt à {formatMonthYear(c.suggestedDate)}</>}.{' '}
                </span>
              ))}
              Si tu as acheté en plusieurs fois, indique une date moyenne pour chaque ligne dans « Mes lignes ».
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
            <div className="text-sm text-slate-400">Ton PEA</div>
            <div className="text-xl font-bold text-white tabular-nums">{formatEuro(comparison.portfolioValue, { decimals: 0 })}</div>
            {comparison.portfolioAnnualized !== null && (
              <div className="text-sm text-slate-300">{formatPercent(comparison.portfolioAnnualized, { sign: true })} par an</div>
            )}
          </div>
          <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
            <div className="text-sm text-slate-400">Avec l'{label}</div>
            <div className="text-xl font-bold text-white tabular-nums">{formatEuro(comparison.benchmarkValue, { decimals: 0 })}</div>
            {comparison.benchmarkAnnualized !== null && (
              <div className="text-sm text-slate-300">{formatPercent(comparison.benchmarkAnnualized, { sign: true })} par an</div>
            )}
          </div>
          <div className={`rounded-xl p-3.5 border ${ahead ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'}`}>
            <div className="text-sm text-slate-300">Écart</div>
            <div className={`text-xl font-bold tabular-nums ${ahead ? 'text-emerald-300' : 'text-rose-300'}`}>
              {formatEuro(comparison.difference, { decimals: 0, sign: true })}
            </div>
            <div className="text-sm text-slate-300">{ahead ? 'en faveur de ton PEA' : `en faveur de l'${label}`}</div>
          </div>
        </div>

        <p className="text-xs text-slate-400 mt-4 leading-relaxed">
          Calcul fait comme si chaque ligne avait été achetée en une fois à sa date d'achat (modifiable dans « Mes lignes »).
          Les dividendes déjà versés par tes actions ne sont pas comptés dans ton PEA alors que l'ETF réinvestit les siens : l'écart est donc un peu défavorable à ton portefeuille.
          {comparison.skipped.length > 0 && <> Lignes non comparées (achat antérieur à l'historique) : {comparison.skipped.join(', ')}.</>}
          {' '}Cours de l'ETF au {formatDateFr(parseFlexibleDate(comparison.endPriceDate) ?? summary.asOfDate)}, source {data?.source}
          {updated && <>, mis à jour le {formatDateFr(updated)}</>}. Les performances passées ne préjugent pas des performances futures.
        </p>
      </>
    );
  }

  return (
    <Card
      title="Est-ce que je fais mieux qu'un simple ETF ?"
      icon={Scale}
      iconClassName="bg-sky-500/10 text-sky-300"
      action={toggle}
      className="h-full"
    >
      {body}
    </Card>
  );
};

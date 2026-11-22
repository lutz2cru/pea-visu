import React from 'react';
import { PieChart } from 'lucide-react';
import { PortfolioSummary } from '../../utils/calculations';
import { formatEuro, formatPercent } from '../../utils/format';
import { Card } from '../ui/Card';
import { InfoTip } from '../ui/InfoTip';

interface AllocationSummaryProps {
  summary: PortfolioSummary;
  onShowDetails: () => void;
}

/** Répartition du PEA sous forme de barres simples, triées de la plus grosse à la plus petite ligne. */
export const AllocationSummary: React.FC<AllocationSummaryProps> = ({ summary, onShowDetails }) => {
  const total = summary.totalValuation;
  const lines = [...summary.performances]
    .map(p => ({ p, weight: total > 0 ? p.position.valuation / total : 0 }))
    .sort((a, b) => b.weight - a.weight);
  const biggest = lines[0];

  return (
    <Card
      title="Comment c'est réparti ?"
      icon={PieChart}
      iconClassName="bg-sky-500/10 text-sky-300"
      className="h-full flex flex-col"
    >
      {/* ETF vs actions */}
      <div className="mb-4">
        <div className="flex items-center justify-between text-sm mb-1.5">
          <span className="text-indigo-300 font-semibold flex items-center gap-1.5">
            ETF {formatPercent(summary.etfWeight)} <InfoTip term="etf" />
          </span>
          <span className="text-emerald-300 font-semibold">Actions {formatPercent(summary.stockWeight)}</span>
        </div>
        <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden flex" aria-hidden="true">
          <div style={{ width: `${summary.etfWeight * 100}%` }} className="bg-indigo-500 h-full" />
          <div style={{ width: `${summary.stockWeight * 100}%` }} className="bg-emerald-500 h-full" />
        </div>
      </div>

      {/* Poids de chaque ligne */}
      <ul className="space-y-2.5 flex-1">
        {lines.map(({ p, weight }) => (
          <li key={p.position.id}>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-200 font-medium truncate" title={p.position.label}>
                {p.position.ticker || p.position.label}
              </span>
              <span className="text-slate-300 tabular-nums shrink-0 ml-2">
                {formatPercent(weight)} <span className="text-slate-500">· {formatEuro(p.position.valuation, { decimals: 0 })}</span>
              </span>
            </div>
            <div className="w-full h-1.5 bg-slate-800 rounded-full mt-1 overflow-hidden" aria-hidden="true">
              <div
                style={{ width: `${weight * 100}%` }}
                className={`h-full rounded-full ${p.position.assetType === 'ETF' ? 'bg-indigo-500' : 'bg-emerald-500'}`}
              />
            </div>
          </li>
        ))}
      </ul>

      {biggest && (
        <p className="text-sm text-slate-400 mt-4">
          Ta plus grosse ligne, <strong className="text-slate-200">{biggest.p.position.ticker || biggest.p.position.label}</strong>, pèse {formatPercent(biggest.weight)} du PEA.
        </p>
      )}

      <button
        type="button"
        onClick={onShowDetails}
        className="mt-3 text-sm font-medium text-sky-300 hover:text-sky-200 text-left"
      >
        Voir le détail de mes lignes →
      </button>
    </Card>
  );
};

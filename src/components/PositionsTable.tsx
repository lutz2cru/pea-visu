import React from 'react';
import { List, Pencil } from 'lucide-react';
import { Position } from '../types/portfolio';
import { PositionPerformance } from '../utils/calculations';
import { toYearMonth } from '../utils/dates';
import { formatEuro, formatPercent } from '../utils/format';
import { Card } from './ui/Card';
import { InfoTip } from './ui/InfoTip';

interface PositionsTableProps {
  performances: PositionPerformance[];
  totalValuation: number;
  onUpdatePosition: (id: string, patch: Partial<Position>) => void;
}

interface EditorProps {
  pos: Position;
  onUpdatePosition: (id: string, patch: Partial<Position>) => void;
}

const maxMonth = () => {
  const now = new Date();
  return toYearMonth(now.getFullYear(), now.getMonth() + 1);
};

const DividendEditor: React.FC<EditorProps & { estimatedAnnualDividend: number }> = ({ pos, onUpdatePosition, estimatedAnnualDividend }) => {
  const isAccumulatingEtf = pos.assetType === 'ETF' && pos.dividendYieldEstimate === 0;
  return (
    <div>
      <span className="inline-flex items-center gap-1">
        <input
          type="number"
          min={0}
          max={20}
          step={0.1}
          inputMode="decimal"
          value={pos.dividendYieldEstimate}
          onChange={(e) => onUpdatePosition(pos.id, { dividendYieldEstimate: Math.max(0, parseFloat(e.target.value) || 0) })}
          className="w-16 bg-slate-800 text-amber-200 text-sm px-2 py-1 rounded-md border border-slate-600 focus:outline-none focus:border-amber-400 text-right"
          aria-label={`Rendement du dividende de ${pos.label}, en % par an`}
        />
        <span className="text-sm text-slate-300">% / an</span>
      </span>
      <div className="text-xs mt-1 text-amber-300/90">
        {isAccumulatingEtf ? (
          <span className="text-slate-400 inline-flex items-center gap-1">capitalisant <InfoTip term="etfCapitalisant" /></span>
        ) : (
          <>≈ {formatEuro(estimatedAnnualDividend)} par an</>
        )}
      </div>
    </div>
  );
};

const PurchaseDateEditor: React.FC<EditorProps> = ({ pos, onUpdatePosition }) => (
  <input
    type="month"
    min="2000-01"
    max={maxMonth()}
    value={toYearMonth(pos.purchaseYear, pos.purchaseMonth || 1)}
    onChange={(e) => {
      const [y, m] = e.target.value.split('-').map(Number);
      if (y && m) onUpdatePosition(pos.id, { purchaseYear: y, purchaseMonth: m });
    }}
    className="bg-slate-800 text-slate-100 text-sm px-2 py-1 rounded-md border border-slate-600 focus:outline-none focus:border-emerald-400 [color-scheme:dark]"
    aria-label={`Date d'achat (moyenne si plusieurs achats) de ${pos.label}`}
  />
);

const TypeBadge: React.FC<{ type: Position['assetType'] }> = ({ type }) => (
  <span className={`px-1.5 py-0.5 rounded text-xs font-semibold ${type === 'ETF' ? 'bg-indigo-500/15 text-indigo-300' : 'bg-emerald-500/15 text-emerald-300'}`}>
    {type}
  </span>
);

const Gain: React.FC<{ gain: number; gainPercent: number }> = ({ gain, gainPercent }) => {
  const positive = gain >= 0;
  return (
    <div className={`tabular-nums ${positive ? 'text-emerald-400' : 'text-rose-400'}`}>
      <div className="font-semibold">{formatEuro(gain, { sign: true })}</div>
      <div className="text-xs">{formatPercent(gainPercent, { sign: true })}</div>
    </div>
  );
};

const Annualized: React.FC<{ value: number | null }> = ({ value }) =>
  value !== null ? (
    <span className={`tabular-nums ${value >= 0 ? 'text-indigo-300' : 'text-rose-400'}`}>{formatPercent(value, { sign: true })}</span>
  ) : (
    <span className="text-slate-500" title="Moins d'un an de détention : un rendement annualisé ne serait pas significatif">—</span>
  );

export const PositionsTable: React.FC<PositionsTableProps> = ({ performances, totalValuation, onUpdatePosition }) => {
  const rows = [...performances].sort((a, b) => b.position.valuation - a.position.valuation);
  const weightOf = (p: Position) => (totalValuation > 0 ? p.valuation / totalValuation : 0);

  return (
    <Card
      title={`Mes ${performances.length} lignes`}
      icon={List}
      iconClassName="bg-indigo-500/10 text-indigo-300"
      subtitle={
        <span className="inline-flex items-start gap-1.5">
          <Pencil className="w-3.5 h-3.5 mt-0.5 shrink-0 text-indigo-300" aria-hidden="true" />
          <span>Tu peux modifier le <strong className="text-slate-200">rendement du dividende</strong> et la <strong className="text-slate-200">date d'achat</strong> (date moyenne si tu as acheté en plusieurs fois) : ils servent aux estimations de dividendes, de rendement par an et à la comparaison avec un ETF.</span>
        </span>
      }
    >
      {/* Téléphone : une carte par ligne */}
      <ul className="md:hidden space-y-3">
        {rows.map(({ position: pos, invested, gain, gainPercent, annualizedReturn, estimatedAnnualDividend }) => (
          <li key={pos.id} className="bg-slate-950/60 border border-slate-800 rounded-xl p-3.5">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-white">{pos.ticker || pos.label}</span>
                  <TypeBadge type={pos.assetType} />
                </div>
                <div className="text-xs text-slate-400 truncate">{pos.label}</div>
              </div>
              <div className="text-right shrink-0">
                <div className="font-bold text-white tabular-nums">{formatEuro(pos.valuation)}</div>
                <Gain gain={gain} gainPercent={gainPercent} />
              </div>
            </div>

            <dl className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm mt-3 pt-3 border-t border-slate-800">
              <dt className="text-slate-400">Poids</dt><dd className="text-right text-slate-200 tabular-nums">{formatPercent(weightOf(pos))}</dd>
              <dt className="text-slate-400">Quantité</dt><dd className="text-right text-slate-200 tabular-nums">{pos.quantity}</dd>
              <dt className="text-slate-400">Prix moyen payé (PRU)</dt><dd className="text-right text-slate-200 tabular-nums">{formatEuro(pos.pru)}</dd>
              <dt className="text-slate-400">Cours</dt><dd className="text-right text-slate-200 tabular-nums">{formatEuro(pos.currentPrice)}</dd>
              <dt className="text-slate-400">Payé au total</dt><dd className="text-right text-slate-200 tabular-nums">{formatEuro(invested)}</dd>
              <dt className="text-slate-400">Rendement / an</dt><dd className="text-right"><Annualized value={annualizedReturn} /></dd>
            </dl>

            <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-800">
              <div>
                <div className="text-xs text-slate-400 mb-1">Dividende</div>
                <DividendEditor pos={pos} onUpdatePosition={onUpdatePosition} estimatedAnnualDividend={estimatedAnnualDividend} />
              </div>
              <div>
                <div className="text-xs text-slate-400 mb-1 flex items-center gap-1">Date d'achat <InfoTip term="dateAchat" /></div>
                <PurchaseDateEditor pos={pos} onUpdatePosition={onUpdatePosition} />
              </div>
            </div>
          </li>
        ))}
      </ul>

      {/* Écran large : tableau */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800 align-bottom">
              <th className="py-2.5 pr-3 font-medium">Ligne</th>
              <th className="py-2.5 px-2 font-medium text-right"><span className="inline-flex items-center gap-1">Poids <InfoTip term="poids" /></span></th>
              <th className="py-2.5 px-2 font-medium text-right">Qté</th>
              <th className="py-2.5 px-2 font-medium text-right"><span className="inline-flex items-center gap-1">PRU <InfoTip term="pru" /></span></th>
              <th className="py-2.5 px-2 font-medium text-right">Cours</th>
              <th className="py-2.5 px-2 font-medium text-right">Valeur</th>
              <th className="py-2.5 px-2 font-medium text-right"><span className="inline-flex items-center gap-1">Gain <InfoTip term="plusValue" /></span></th>
              <th className="py-2.5 px-2 font-medium text-right"><span className="inline-flex items-center gap-1">Par an <InfoTip term="rendementAnnuel" /></span></th>
              <th className="py-2.5 px-2 font-medium"><span className="inline-flex items-center gap-1">Dividende <InfoTip term="dividende" /></span></th>
              <th className="py-2.5 pl-2 font-medium"><span className="inline-flex items-center gap-1">Date d'achat <InfoTip term="dateAchat" /></span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/70">
            {rows.map(({ position: pos, invested, gain, gainPercent, annualizedReturn, estimatedAnnualDividend }) => (
              <tr key={pos.id} className="hover:bg-slate-800/30 align-top">
                <td className="py-3 pr-3">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-white">{pos.ticker || pos.label}</span>
                    <TypeBadge type={pos.assetType} />
                  </div>
                  <div className="text-xs text-slate-400 mt-0.5 max-w-[240px] truncate" title={pos.label}>{pos.label}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{pos.isin} · {pos.category}</div>
                </td>
                <td className="py-3 px-2 text-right text-slate-200 tabular-nums">{formatPercent(weightOf(pos))}</td>
                <td className="py-3 px-2 text-right text-slate-200 tabular-nums">{pos.quantity}</td>
                <td className="py-3 px-2 text-right text-slate-300 tabular-nums">{formatEuro(pos.pru)}</td>
                <td className="py-3 px-2 text-right text-white tabular-nums">{formatEuro(pos.currentPrice)}</td>
                <td className="py-3 px-2 text-right tabular-nums">
                  <div className="font-semibold text-white">{formatEuro(pos.valuation)}</div>
                  <div className="text-xs text-slate-400">payé {formatEuro(invested)}</div>
                </td>
                <td className="py-3 px-2 text-right"><Gain gain={gain} gainPercent={gainPercent} /></td>
                <td className="py-3 px-2 text-right"><Annualized value={annualizedReturn} /></td>
                <td className="py-3 px-2">
                  <DividendEditor pos={pos} onUpdatePosition={onUpdatePosition} estimatedAnnualDividend={estimatedAnnualDividend} />
                </td>
                <td className="py-3 pl-2">
                  <PurchaseDateEditor pos={pos} onUpdatePosition={onUpdatePosition} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
};

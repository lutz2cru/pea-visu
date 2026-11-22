import React from 'react';
import { Position } from '../types/portfolio';
import { PositionPerformance } from '../utils/calculations';
import { toYearMonth } from '../utils/dates';
import { Table, ArrowUpRight, ArrowDownRight, Pencil } from 'lucide-react';

interface PositionsTableProps {
  performances: PositionPerformance[];
  onUpdatePosition: (id: string, patch: Partial<Position>) => void;
}

const eur = (v: number, max = 2) =>
  v.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: max });

export const PositionsTable: React.FC<PositionsTableProps> = ({ performances, onUpdatePosition }) => {
  const now = new Date();
  const maxMonth = toYearMonth(now.getFullYear(), now.getMonth() + 1);

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">

      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Table className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Détail des {performances.length} lignes du PEA
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1 flex items-center gap-1">
            <Pencil className="w-3 h-3 text-indigo-400" />
            Les colonnes <strong className="text-slate-300">Date du 1er achat</strong> et <strong className="text-slate-300">Dividende</strong> sont modifiables : elles servent au calcul du rendement annuel et des dividendes estimés.
          </p>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800">
              <th className="py-2.5 font-medium">Actif / ISIN</th>
              <th className="py-2.5 px-2 font-medium">Type</th>
              <th className="py-2.5 px-2 font-medium text-right">Qté</th>
              <th className="py-2.5 px-2 font-medium text-right">PRU</th>
              <th className="py-2.5 px-2 font-medium text-right">Cours</th>
              <th className="py-2.5 px-2 font-medium text-right">Investi</th>
              <th className="py-2.5 px-2 font-medium text-right">Valeur</th>
              <th className="py-2.5 px-2 font-medium text-right">+/- value</th>
              <th className="py-2.5 px-2 font-medium text-right" title="Rendement annualisé depuis la date du 1er achat (affiché après 1 an de détention)">Par an</th>
              <th className="py-2.5 px-2 font-medium text-right text-amber-300" title="Rendement du dividende estimé (% du cours) et montant annuel correspondant">Dividende</th>
              <th className="py-2.5 pl-2 font-medium text-center">Date du 1er achat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {performances.map(({ position: pos, invested, gain, gainPercent, annualizedReturn, estimatedAnnualDividend }) => {
              const isPositive = gain >= 0;
              const isAccumulatingEtf = pos.assetType === 'ETF' && pos.dividendYieldEstimate === 0;

              return (
                <tr key={pos.id} className="hover:bg-slate-800/40 transition">

                  <td className="py-3 pr-2">
                    <div className="font-semibold text-slate-100">{pos.label}</div>
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400 mt-0.5">
                      <span>{pos.isin}</span>
                      <span className="text-slate-600">•</span>
                      <span>{pos.category}</span>
                    </div>
                  </td>

                  <td className="py-3 px-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${pos.assetType === 'ETF' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                      {pos.assetType}
                    </span>
                  </td>

                  <td className="py-3 px-2 text-right font-mono text-slate-200">{pos.quantity}</td>
                  <td className="py-3 px-2 text-right font-mono text-slate-300">{eur(pos.pru, 4)} €</td>
                  <td className="py-3 px-2 text-right font-mono text-white font-medium">{eur(pos.currentPrice, 4)} €</td>
                  <td className="py-3 px-2 text-right font-mono text-slate-300">{eur(invested)} €</td>
                  <td className="py-3 px-2 text-right font-mono font-semibold text-white">{eur(pos.valuation)} €</td>

                  <td className="py-3 px-2 text-right font-mono">
                    <div className={`font-semibold ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPositive ? '+' : ''}{eur(gain)} €
                    </div>
                    <div className={`text-[11px] flex items-center justify-end ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                      {(gainPercent * 100).toFixed(2)} %
                    </div>
                  </td>

                  <td className="py-3 px-2 text-right font-mono">
                    {annualizedReturn !== null ? (
                      <span className={annualizedReturn >= 0 ? 'text-indigo-300' : 'text-rose-400'}>
                        {annualizedReturn >= 0 ? '+' : ''}{(annualizedReturn * 100).toFixed(1)} %
                      </span>
                    ) : (
                      <span className="text-slate-600" title="Moins d'un an de détention : un rendement annualisé ne serait pas significatif">—</span>
                    )}
                  </td>

                  <td className="py-3 px-2 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <input
                        type="number"
                        min={0}
                        max={20}
                        step={0.1}
                        value={pos.dividendYieldEstimate}
                        onChange={(e) => onUpdatePosition(pos.id, { dividendYieldEstimate: Math.max(0, parseFloat(e.target.value) || 0) })}
                        className="w-14 bg-slate-800 text-amber-200 text-xs px-1.5 py-1 rounded-md border border-slate-700 focus:outline-none focus:border-amber-400 font-mono text-right"
                        aria-label={`Rendement du dividende de ${pos.label}, en %`}
                      />
                      <span className="text-slate-400">%</span>
                    </div>
                    <div className="text-[11px] mt-0.5 font-mono text-amber-300/80">
                      {isAccumulatingEtf ? (
                        <span className="font-sans text-slate-500" title="Un ETF capitalisant ne verse pas de dividende : il le réinvestit automatiquement dans son cours.">capitalisant</span>
                      ) : (
                        <>≈ {eur(estimatedAnnualDividend)} € / an</>
                      )}
                    </div>
                  </td>

                  <td className="py-3 pl-2 text-center">
                    <input
                      type="month"
                      min="2000-01"
                      max={maxMonth}
                      value={toYearMonth(pos.purchaseYear, pos.purchaseMonth || 1)}
                      onChange={(e) => {
                        const [y, m] = e.target.value.split('-').map(Number);
                        if (y && m) onUpdatePosition(pos.id, { purchaseYear: y, purchaseMonth: m });
                      }}
                      className="bg-slate-800 text-slate-200 text-xs px-2 py-1 rounded-md border border-slate-700 focus:outline-none focus:border-emerald-500 font-mono [color-scheme:dark]"
                      aria-label={`Date du premier achat de ${pos.label}`}
                    />
                  </td>

                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

    </div>
  );
};

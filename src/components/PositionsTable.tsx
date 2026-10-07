import React from 'react';
import { Position } from '../types/portfolio';
import { Table, ArrowUpRight, ArrowDownRight, Edit2, Coins, ExternalLink } from 'lucide-react';

interface PositionsTableProps {
  positions: Position[];
  onUpdatePurchaseYear: (id: string, year: number) => void;
}

export const PositionsTable: React.FC<PositionsTableProps> = ({
  positions,
  onUpdatePurchaseYear
}) => {
  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm">
      
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
        <div>
          <div className="flex items-center space-x-2">
            <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
              <Table className="w-4 h-4" />
            </div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Détail des 6 Lignes du PEA
            </h2>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Performance individuelle, PRU, dividendes estimés et année d'acquisition
          </p>
        </div>
      </div>

      {/* Tableau */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-slate-400 border-b border-slate-800 pb-2">
              <th className="py-2.5 font-medium">Actif / ISIN</th>
              <th className="py-2.5 font-medium">Type</th>
              <th className="py-2.5 font-medium text-right">Qté</th>
              <th className="py-2.5 font-medium text-right">PRU</th>
              <th className="py-2.5 font-medium text-right">Cours</th>
              <th className="py-2.5 font-medium text-right">Investi</th>
              <th className="py-2.5 font-medium text-right">Valorisation</th>
              <th className="py-2.5 font-medium text-right">+/- Value</th>
              <th className="py-2.5 font-medium text-right text-amber-300">Dividendes</th>
              <th className="py-2.5 font-medium text-center">Année d'achat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {positions.map((pos) => {
              const isPositive = pos.unrealizedGain >= 0;
              const invested = pos.pru * pos.quantity;
              const estimatedDiv = (invested * (pos.dividendYieldEstimate / 100) * 2.25);

              return (
                <tr key={pos.id} className="hover:bg-slate-800/40 transition">
                  
                  {/* Libellé & ISIN */}
                  <td className="py-3 pr-2">
                    <div className="font-semibold text-slate-100">{pos.label}</div>
                    <div className="flex items-center gap-1.5 font-mono text-[11px] text-slate-400 mt-0.5">
                      <span>{pos.isin}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-slate-400">{pos.category}</span>
                    </div>
                  </td>

                  {/* Type */}
                  <td className="py-3 px-2">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${pos.assetType === 'ETF' ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                      {pos.assetType}
                    </span>
                  </td>

                  {/* Quantité */}
                  <td className="py-3 px-2 text-right font-mono text-slate-200">
                    {pos.quantity}
                  </td>

                  {/* PRU */}
                  <td className="py-3 px-2 text-right font-mono text-slate-300">
                    {pos.pru.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} €
                  </td>

                  {/* Cours */}
                  <td className="py-3 px-2 text-right font-mono text-white font-medium">
                    {pos.currentPrice.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 4 })} €
                  </td>

                  {/* Total Investi */}
                  <td className="py-3 px-2 text-right font-mono text-slate-300">
                    {invested.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </td>

                  {/* Valorisation */}
                  <td className="py-3 px-2 text-right font-mono font-semibold text-white">
                    {pos.valuation.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                  </td>

                  {/* Plus-Value */}
                  <td className="py-3 px-2 text-right font-mono">
                    <div className={`font-semibold flex items-center justify-end ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {isPositive ? '+' : ''}{pos.unrealizedGain.toFixed(2)} €
                    </div>
                    <div className={`text-[11px] flex items-center justify-end font-medium ${isPositive ? 'text-emerald-500' : 'text-rose-500'}`}>
                      {isPositive ? <ArrowUpRight className="w-3 h-3 mr-0.5" /> : <ArrowDownRight className="w-3 h-3 mr-0.5" />}
                      {(pos.unrealizedGainPercent * 100).toFixed(2)} %
                    </div>
                  </td>

                  {/* Dividendes estimés */}
                  <td className="py-3 px-2 text-right font-mono text-amber-300/90">
                    {pos.dividendYieldEstimate > 0 ? (
                      <div>
                        <div>+{estimatedDiv.toFixed(2)} €</div>
                        <div className="text-[10px] text-amber-400/60 font-sans">({pos.dividendYieldEstimate}%/an)</div>
                      </div>
                    ) : (
                      <span className="text-slate-600">—</span>
                    )}
                  </td>

                  {/* Sélecteur Année d'achat */}
                  <td className="py-3 pl-2 text-center">
                    <select
                      value={pos.purchaseYear}
                      onChange={(e) => onUpdatePurchaseYear(pos.id, parseInt(e.target.value, 10))}
                      className="bg-slate-800 text-slate-200 text-xs px-2 py-1 rounded-md border border-slate-700 focus:outline-none focus:border-emerald-500 font-mono cursor-pointer"
                    >
                      <option value={2024}>2024</option>
                      <option value={2025}>2025</option>
                      <option value={2026}>2026</option>
                    </select>
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

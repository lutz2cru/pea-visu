import React from 'react';
import { Wallet, PiggyBank, TrendingUp, Calendar, Coins, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { PortfolioSummary } from '../utils/calculations';
import { PEA_DEPOSIT_CEILING } from '../config/fiscal';
import { formatDateFr } from '../utils/dates';

interface MetricCardsProps {
  summary: PortfolioSummary;
}

const eur = (v: number, digits = 2) =>
  v.toLocaleString('fr-FR', { minimumFractionDigits: digits, maximumFractionDigits: digits });

const EstimateBadge: React.FC<{ title: string }> = ({ title }) => (
  <span
    title={title}
    className="ml-1.5 px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/25 cursor-help"
  >
    estimation
  </span>
);

export const MetricCards: React.FC<MetricCardsProps> = ({ summary }) => {
  const isPositive = summary.totalGain >= 0;
  const totalWithCash = summary.totalValuation + summary.cashBalance;
  const ceilingPct = (summary.totalInvested / PEA_DEPOSIT_CEILING) * 100;
  const annualized = summary.annualizedReturn;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">

      {/* 1. Valeur totale */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-2 font-medium">
          <span>Valeur totale</span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-white">{eur(totalWithCash)} €</div>
        <div className="mt-2 text-xs text-slate-400">
          Au {formatDateFr(summary.asOfDate)} · {summary.positionsCount} {summary.positionsCount > 1 ? 'lignes' : 'ligne'}
          {summary.cashBalance > 0 && <> · dont {eur(summary.cashBalance)} € d'espèces</>}
        </div>
      </div>

      {/* 2. Plus-value latente */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-2 font-medium">
          <span>Plus-value latente</span>
          <div className={`p-1.5 rounded-lg ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className={`text-2xl font-bold tracking-tight ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
          {isPositive ? '+' : ''}{eur(summary.totalGain)} €
        </div>
        <div className="mt-2 flex items-center text-xs font-semibold">
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md ${isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
            {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
            {(summary.totalGainPercent * 100).toFixed(2)} %
          </span>
          <span className="text-slate-500 ml-1.5 font-normal">sur {eur(summary.totalInvested, 0)} € investis</span>
        </div>
      </div>

      {/* 3. Rendement annualisé */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-2 font-medium">
          <span className="flex items-center">
            Rendement / an
            <EstimateBadge title="Taux de rendement interne calculé en considérant chaque ligne achetée en une fois à la date indiquée dans le tableau. Pour un calcul exact il faudra l'historique de toutes les opérations." />
          </span>
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        {annualized !== null ? (
          <div className={`text-2xl font-bold tracking-tight ${annualized >= 0 ? 'text-indigo-300' : 'text-rose-400'}`}>
            {annualized >= 0 ? '+' : ''}{(annualized * 100).toFixed(2)} % <span className="text-sm font-normal text-slate-400">/ an</span>
          </div>
        ) : (
          <div className="text-2xl font-bold tracking-tight text-slate-500">—</div>
        )}
        <div className="mt-2 text-xs text-slate-400">
          {annualized !== null
            ? `Détention moyenne : ${summary.averageYearsHeld.toFixed(1).replace('.', ',')} ans`
            : 'Historique trop court (moins de 6 mois)'}
        </div>
      </div>

      {/* 4. Dividendes estimés */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-2 font-medium">
          <span className="flex items-center">
            Dividendes / an
            <EstimateBadge title="Somme, pour chaque action, de sa valeur actuelle multipliée par le rendement du dividende indiqué dans le tableau (modifiable). Les ETF capitalisants ne versent pas de dividende : ils les réinvestissent dans leur cours." />
          </span>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Coins className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-amber-300">≈ {eur(summary.estimatedAnnualDividends, 0)} €</div>
        <div className="mt-2 text-xs text-slate-400">
          Soit {(summary.estimatedDividendYield * 100).toFixed(1).replace('.', ',')} % de la valeur, versés sur le compte espèces du PEA
        </div>
      </div>

      {/* 5. Montant investi vs plafond */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-2 font-medium">
          <span title="Le plafond de 150 000 € porte sur les versements. Le montant investi (PRU × quantité) en est une bonne approximation tant que tu n'as rien vendu.">
            Investi / plafond
          </span>
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-white">
          {eur(summary.totalInvested, 0)} €
          <span className="text-xs font-normal text-slate-500 ml-1">/ {eur(PEA_DEPOSIT_CEILING, 0)} €</span>
        </div>
        <div className="mt-2 space-y-1">
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.min(100, Math.max(2, ceilingPct))}%` }}
              className="h-full bg-blue-500 rounded-full"
            />
          </div>
          <div className="flex justify-between text-[11px] text-slate-400">
            <span>{ceilingPct.toFixed(1).replace('.', ',')} % utilisé</span>
            <span>Reste {eur(Math.max(0, PEA_DEPOSIT_CEILING - summary.totalInvested), 0)} €</span>
          </div>
        </div>
      </div>

    </div>
  );
};

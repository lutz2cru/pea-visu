import React from 'react';
import { Wallet, PiggyBank, TrendingUp, Calendar, Coins, ArrowUpRight, ArrowDownRight, Info } from 'lucide-react';
import { PortfolioSummary } from '../utils/calculations';

interface MetricCardsProps {
  summary: PortfolioSummary;
  startDate: string;
  includeDividends: boolean;
}

export const MetricCards: React.FC<MetricCardsProps> = ({
  summary,
  startDate,
  includeDividends
}) => {
  const isPositive = summary.totalGain >= 0;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
      
      {/* 1. Valeur Totale */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-2 font-medium">
          <span>Valeur Totale</span>
          <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-400">
            <Wallet className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-white">
          {summary.totalValuation.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center gap-1.5">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          <span>Valorisation Fortuneo ({summary.positionsCount} {summary.positionsCount > 1 ? 'lignes' : 'ligne'})</span>
        </div>
      </div>

      {/* 2. Capital Investi & Plafond 150 000 € */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-2 font-medium">
          <span>Capital Investi / Plafond</span>
          <div className="p-1.5 rounded-lg bg-blue-500/10 text-blue-400">
            <PiggyBank className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-white">
          {summary.totalInvested.toLocaleString('fr-FR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} €
          <span className="text-xs font-normal text-slate-500 ml-1">/ 150 000 €</span>
        </div>
        
        {/* Mini jauge de progression vers les 150 000 € */}
        <div className="mt-2 space-y-1">
          <div className="w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              style={{ width: `${Math.min(100, Math.max(2, (summary.totalInvested / 150000) * 100))}%` }}
              className="h-full bg-blue-500 rounded-full"
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-400 font-mono">
            <span>{((summary.totalInvested / 150000) * 100).toFixed(1)}% atteint</span>
            <span>Reste {(150000 - summary.totalInvested).toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</span>
          </div>
        </div>
      </div>

      {/* 3. Plus-Value Brute */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-2 font-medium">
          <span>Plus-Value Globale</span>
          <div className={`p-1.5 rounded-lg ${isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
            <TrendingUp className="w-4 h-4" />
          </div>
        </div>
        <div className="flex items-baseline gap-2">
          <span className={`text-2xl font-bold tracking-tight ${isPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isPositive ? '+' : ''}{summary.totalGain.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €
          </span>
        </div>
        <div className="mt-2 flex items-center text-xs font-semibold">
          <span className={`inline-flex items-center px-1.5 py-0.5 rounded-md ${isPositive ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
            {isPositive ? <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> : <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />}
            {(summary.totalGainPercent * 100).toFixed(2)} %
          </span>
          <span className="text-slate-500 ml-1.5 font-normal">sur le capital</span>
        </div>
      </div>

      {/* 4. Rendement Annualisé (CAGR) */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-2 font-medium">
          <span>Rendement / An (CAGR)</span>
          <div className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
            <Calendar className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-indigo-300">
          +{(summary.annualizedReturn * 100).toFixed(2)} % <span className="text-sm font-normal text-slate-400">/ an</span>
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center gap-1">
          <span>Sur {summary.durationInYears} ans (depuis {startDate})</span>
        </div>
      </div>

      {/* 5. Rendement avec Dividendes */}
      <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 shadow-sm hover:border-slate-700 transition">
        <div className="flex items-center justify-between text-slate-400 text-xs mb-2 font-medium">
          <span>Total avec Dividendes</span>
          <div className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400">
            <Coins className="w-4 h-4" />
          </div>
        </div>
        <div className="text-2xl font-bold tracking-tight text-amber-300">
          +{(summary.totalReturnPercentWithDividends * 100).toFixed(2)} %
        </div>
        <div className="mt-2 text-xs text-slate-400 flex items-center justify-between">
          <span>+{(summary.totalReturnWithDividends).toFixed(2)} €</span>
          <span className="text-amber-400/90 font-medium">(~{summary.estimatedDividends.toFixed(0)} € div.)</span>
        </div>
      </div>

    </div>
  );
};

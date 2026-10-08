import React, { useState } from 'react';
import { PieChart as PieIcon, Sparkles, TrendingUp, DollarSign, Wallet, ArrowRight, Coffee } from 'lucide-react';
import { calculateFutureValue } from '../../utils/simulation';

interface BudgetRuleCardProps {
  expectedReturnRate?: number;
}

export const BudgetRuleCard: React.FC<BudgetRuleCardProps> = ({
  expectedReturnRate = 7.55
}) => {
  const [monthlyIncome, setMonthlyIncome] = useState<number>(2200);
  const [extraSavings, setExtraSavings] = useState<number>(50);

  // Décomposition 50 / 30 / 20
  const needs = Math.round(monthlyIncome * 0.50);
  const wants = Math.round(monthlyIncome * 0.30);
  const savings = Math.round(monthlyIncome * 0.20);

  // Impact du surplus d'épargne sur 10, 20 et 30 ans (uniquement les gains générés par cet effort supplémentaire)
  const impact10 = calculateFutureValue(0, extraSavings, expectedReturnRate, 10);
  const impact20 = calculateFutureValue(0, extraSavings, expectedReturnRate, 20);
  const impact30 = calculateFutureValue(0, extraSavings, expectedReturnRate, 30);

  const presetIncomes = [1800, 2200, 2500, 3000, 4000];
  const presetExtras = [25, 50, 100, 150];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
      
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-teal-500/10 text-teal-400">
            <Wallet className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Règle Budgétaire 50/30/20 & Booster d'Épargne</span>
              <span className="text-[11px] font-normal text-teal-300 bg-teal-500/15 border border-teal-500/30 px-2 py-0.5 rounded-full">
                Méthode Elizabeth Warren
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              La règle d'or pour structurer vos finances personnelles sans vous priver
            </p>
          </div>
        </div>

        {/* Sélection des revenus nets */}
        <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs">
          <span className="text-slate-400">Revenus nets :</span>
          <div className="flex items-center gap-1 font-mono">
            {presetIncomes.map(inc => (
              <button
                key={inc}
                type="button"
                onClick={() => setMonthlyIncome(inc)}
                className={`px-2 py-0.5 rounded-md transition ${
                  monthlyIncome === inc
                    ? 'bg-teal-500 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {inc}€
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Les 3 piliers 50 / 30 / 20 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        
        {/* 50% Besoins */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">50 % Besoins Essentiels</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-500/20 text-blue-300 font-mono">
                Fixes
              </span>
            </div>
            <div className="text-2xl font-extrabold text-white font-mono mt-2">
              {needs.toLocaleString('fr-FR')} € <span className="text-xs font-normal text-slate-400">/ mois</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Loyer / crédit immo, charges, alimentation, assurances, transports, santé.
            </p>
          </div>
        </div>

        {/* 30% Plaisirs */}
        <div className="bg-slate-950/60 p-4 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-200">30 % Plaisirs & Loisirs</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-300 font-mono">
                Envies
              </span>
            </div>
            <div className="text-2xl font-extrabold text-white font-mono mt-2">
              {wants.toLocaleString('fr-FR')} € <span className="text-xs font-normal text-slate-400">/ mois</span>
            </div>
            <p className="text-[11px] text-slate-400 mt-1 leading-snug">
              Sorties, restaurants, vacances, shopping, abonnements, divertissements.
            </p>
          </div>
        </div>

        {/* 20% Épargne & PEA */}
        <div className="bg-emerald-950/20 p-4 rounded-xl border border-emerald-500/30 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300">20 % Épargne & PEA</span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono font-bold">
                Objectif
              </span>
            </div>
            <div className="text-2xl font-extrabold text-emerald-400 font-mono mt-2">
              {savings.toLocaleString('fr-FR')} € <span className="text-xs font-normal text-slate-300">/ mois</span>
            </div>
            <p className="text-[11px] text-emerald-300/80 mt-1 leading-snug">
              Versements réguliers sur votre PEA et constitution de votre liberté financière.
            </p>
          </div>
        </div>

      </div>

      {/* Le Booster de Micro-Épargne */}
      <div className="bg-gradient-to-br from-indigo-950/30 via-slate-950 to-slate-950 border border-indigo-500/30 rounded-xl p-4 space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Coffee className="w-4 h-4 text-amber-400" />
            <div>
              <span className="text-xs font-bold text-white block">
                Le Booster de Micro-Épargne : « L'effet d'un petit effort »
              </span>
              <span className="text-[11px] text-slate-400">
                Que rapporte une petite économie supplémentaire investie sur votre PEA ?
              </span>
            </div>
          </div>

          <div className="flex items-center gap-1.5 font-mono text-xs">
            {presetExtras.map(ext => (
              <button
                key={ext}
                type="button"
                onClick={() => setExtraSavings(ext)}
                className={`px-2.5 py-1 rounded-lg transition ${
                  extraSavings === ext
                    ? 'bg-indigo-500 text-white font-bold shadow-sm'
                    : 'bg-slate-800 text-slate-400 hover:text-white border border-slate-700'
                }`}
              >
                +{ext} €/m
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 pt-1">
          
          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block font-medium">Sur 10 ans avec +{extraSavings}€/m</span>
            <div className="text-xl font-extrabold text-white font-mono mt-1">
              +{impact10.total.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
            </div>
            <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">
              dont +{impact10.gains.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} € d'intérêts purs
            </span>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 block font-medium">Sur 20 ans avec +{extraSavings}€/m</span>
            <div className="text-xl font-extrabold text-white font-mono mt-1">
              +{impact20.total.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
            </div>
            <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">
              dont +{impact20.gains.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} € d'intérêts purs
            </span>
          </div>

          <div className="bg-slate-900/90 p-3 rounded-xl border border-indigo-500/30 text-center bg-indigo-950/20">
            <span className="text-[11px] text-indigo-300 block font-semibold">Sur 30 ans avec +{extraSavings}€/m</span>
            <div className="text-xl font-extrabold text-white font-mono mt-1">
              +{impact30.total.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €
            </div>
            <span className="text-[10px] text-emerald-400 font-mono block mt-0.5">
              dont +{impact30.gains.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} € d'intérêts purs !
            </span>
          </div>

        </div>

        <p className="text-[11px] text-slate-400 text-center pt-1">
          💡 Une économie de seulement <strong>{(extraSavings / 30).toFixed(2)} € par jour</strong> (le prix d'un café ou d'un snack) génère plus de <strong>{impact20.total.toLocaleString('fr-FR', { maximumFractionDigits: 0 })} €</strong> de patrimoine grâce à la capitalisation sur PEA.
        </p>
      </div>

    </div>
  );
};

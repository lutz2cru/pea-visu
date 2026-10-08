import React, { useState } from 'react';
import { Award, Zap, Flame, Calendar, CheckCircle2, ArrowRight } from 'lucide-react';
import { calculateRequiredSavings } from '../../utils/simulation';

interface FinancialIndependenceCardProps {
  currentValuation: number;
  expectedReturnRate?: number;
  monthlyDca?: number;
}

export const FinancialIndependenceCard: React.FC<FinancialIndependenceCardProps> = ({
  currentValuation,
  expectedReturnRate = 7.55,
  monthlyDca = 100
}) => {
  // Règle des 72
  const yearsToDouble = Math.round((72 / expectedReturnRate) * 10) / 10;

  // Paliers de rente passive (règle des 4% nette annuelle : Capital = Rente Annuelle / 0.04)
  const milestones = [
    {
      level: 1,
      title: 'Palier 1 : Dépenses de loisirs',
      monthlyIncome: 200,
      annualIncome: 2400,
      requiredCapital: 60000,
      icon: '☕',
      desc: 'Couvre vos sorties, abonnements et petits plaisirs du quotidien.'
    },
    {
      level: 2,
      title: 'Palier 2 : Charges & Alimentation',
      monthlyIncome: 500,
      annualIncome: 6000,
      requiredCapital: 150000,
      icon: '🛒',
      desc: 'Couvre l\'ensemble des courses et factures énergétiques du foyer (pile le plafond PEA !).'
    },
    {
      level: 3,
      title: 'Palier 3 : Loyer / Logement',
      monthlyIncome: 1000,
      annualIncome: 12000,
      requiredCapital: 300000,
      icon: '🏠',
      desc: 'Couvre le coût d\'un loyer ou d\'une mensualité de crédit immobilier.'
    },
    {
      level: 4,
      title: 'Palier 4 : Liberté Financière Complète',
      monthlyIncome: 2000,
      annualIncome: 24000,
      requiredCapital: 600000,
      icon: '🏝️',
      desc: 'L\'indépendance financière (FIRE) : le travail devient une option et non une obligation.'
    }
  ];

  return (
    <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-5">
      
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-2">
          <div className="p-1.5 rounded-lg bg-orange-500/10 text-orange-400">
            <Flame className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-tight flex items-center gap-2">
              <span>Règle des 72 & Paliers d'Indépendance Financière (FIRE)</span>
              <span className="text-[11px] font-normal text-orange-300 bg-orange-500/15 border border-orange-500/30 px-2 py-0.5 rounded-full">
                Mouvement FIRE
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              Transformez progressivement votre PEA en machine à générer des revenus passifs
            </p>
          </div>
        </div>

        {/* Badge Règle des 72 */}
        <div className="bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 text-xs flex items-center gap-2">
          <Zap className="w-3.5 h-3.5 text-amber-400" />
          <span className="text-slate-300">
            Votre capital double tous les <strong className="text-amber-300 font-mono">{yearsToDouble} ans</strong> (à {expectedReturnRate}%)
          </span>
        </div>
      </div>

      {/* Grille des 4 Paliers de rente passive */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {milestones.map((m) => {
          const progress = Math.min(100, (currentValuation / m.requiredCapital) * 100);
          const isReached = progress >= 100;

          return (
            <div
              key={m.level}
              className={`p-4 rounded-xl border transition flex flex-col justify-between space-y-3 ${
                isReached
                  ? 'bg-emerald-950/20 border-emerald-500/40 text-white'
                  : 'bg-slate-950/60 border-slate-800 text-slate-300'
              }`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{m.icon}</span>
                    <span className="text-xs font-bold text-white">{m.title}</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-orange-400">
                    +{m.monthlyIncome} € / mois
                  </span>
                </div>

                <p className="text-[11px] text-slate-400 mt-1 leading-snug">
                  {m.desc}
                </p>

                {/* Capital requis */}
                <div className="flex items-center justify-between mt-3 text-xs font-mono">
                  <span className="text-slate-400">Capital requis (règle des 4%) :</span>
                  <span className="font-bold text-white">{m.requiredCapital.toLocaleString('fr-FR')} €</span>
                </div>
              </div>

              {/* Barre de progression vers ce palier */}
              <div className="space-y-1">
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>Progression actuelle</span>
                  <span className="text-orange-400 font-bold">{progress.toFixed(1)} %</span>
                </div>
                <div className="w-full h-2 bg-slate-900 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    style={{ width: `${Math.max(2, progress)}%` }}
                    className="h-full bg-gradient-to-r from-orange-500 to-amber-400 rounded-full"
                  />
                </div>
              </div>

            </div>
          );
        })}
      </div>

      {/* Rappel règle des 4% */}
      <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/80 flex items-center gap-2 text-xs text-slate-400">
        <Award className="w-4 h-4 text-orange-400 shrink-0" />
        <span>
          <strong>La Règle des 4 % (Étude Trinity) :</strong> Retirer 4 % de votre capital chaque année vous permet de vivre de vos rentes sans jamais entamer votre capital sur un horizon de 30 ans et plus.
        </span>
      </div>

    </div>
  );
};

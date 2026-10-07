import React, { useState } from 'react';
import { Calendar, BellRing, Copy, Check, ExternalLink, Sparkles, TrendingUp, ShieldCheck, ArrowRight } from 'lucide-react';
import { downloadDcaCalendarReminder } from '../../utils/calendar';

interface DcaPlanCardProps {
  onGoToSimulator: (monthlyAmount: number) => void;
}

export const DcaPlanCard: React.FC<DcaPlanCardProps> = ({ onGoToSimulator }) => {
  const [copied, setCopied] = useState(false);

  const isin = 'IE0002XZSHO1';

  const handleCopyISIN = () => {
    navigator.clipboard.writeText(isin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-950/40 via-slate-900/90 to-emerald-950/30 border border-indigo-500/30 rounded-2xl p-5 shadow-sm space-y-4">
      
      {/* En-tête */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 flex items-center justify-center shrink-0">
            <BellRing className="w-5 h-5 text-indigo-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">
                Stratégie DCA Recommandée : 100 € / mois sur le MSCI World
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                0 € de frais Fortuneo
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              La méthode la plus efficiente : automatisation bancaire + rappel natif sur smartphone
            </p>
          </div>
        </div>

        {/* Bouton Rappel Téléphone */}
        <button
          onClick={downloadDcaCalendarReminder}
          className="flex items-center space-x-2 px-3.5 py-2 text-xs font-bold text-slate-950 bg-indigo-400 hover:bg-indigo-300 rounded-xl shadow-md transition shrink-0"
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>Ajouter le rappel à mon téléphone (.ics)</span>
        </button>
      </div>

      {/* Les 3 piliers d'efficience */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
        
        {/* Pilier 1 : Le bon ETF */}
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
          <div className="text-slate-400 font-medium mb-1">L'actif parfait pour 100 €</div>
          <div className="font-bold text-white text-sm">iShares MSCI World PEA (WPEA)</div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px]">
            <span className="text-slate-400">Code ISIN :</span>
            <button
              onClick={handleCopyISIN}
              className="font-mono text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-semibold bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20"
              title="Copier le code ISIN"
            >
              <span>{isin}</span>
              {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
            </button>
          </div>
          <div className="text-[11px] text-slate-400 mt-1">
            Part à ~5,80 € ➔ environ <strong className="text-slate-200">17 parts / mois</strong>.
          </div>
        </div>

        {/* Pilier 2 : Zéro frais */}
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
          <div className="text-slate-400 font-medium mb-1">Frais de courtage Fortuneo</div>
          <div className="font-bold text-emerald-400 text-sm">0 € (100 % Gratuit)</div>
          <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80 leading-relaxed">
            Grâce à l'offre <em>Starter</em> de Fortuneo, votre <strong>1er ordre du mois inférieur à 500 €</strong> est sans aucun frais de courtage.
          </div>
        </div>

        {/* Pilier 3 : La routine 45 secondes */}
        <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
          <div className="text-slate-400 font-medium mb-1">Routine mensuelle (45s chrono)</div>
          <div className="font-bold text-amber-300 text-sm">1er du mois ➔ 2 du mois</div>
          <div className="text-[11px] text-slate-400 mt-2 pt-2 border-t border-slate-800/80 space-y-1">
            <div>• <strong>1er du mois :</strong> Virement permanent auto vers le PEA.</div>
            <div>• <strong>2 du mois :</strong> Notification réveil ➔ Ordre de 100 €.</div>
          </div>
        </div>

      </div>

      {/* Résumé de projection & Bouton vers le simulateur */}
      <div className="bg-slate-950/40 p-3.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
        <div className="flex items-center gap-3 text-slate-300">
          <TrendingUp className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            Avec 100 € / mois + votre capital actuel : <strong className="text-white">~21 500 €</strong> dans 10 ans (2036) • <strong className="text-white">~62 000 €</strong> dans 20 ans (2046) • <strong className="text-emerald-400 font-bold">~150 000 €</strong> dans 30 ans (2056).
          </span>
        </div>

        <button
          onClick={() => onGoToSimulator(100)}
          className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 transition text-xs shrink-0"
        >
          <span>Ouvrir la simulation avec 100 € / mois</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>

    </div>
  );
};

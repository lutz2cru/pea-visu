import React from 'react';
import { TrendingUp, UploadCloud, RefreshCw, SlidersHorizontal, ShieldCheck, Sparkles } from 'lucide-react';
import { PortfolioData } from '../types/portfolio';

interface HeaderProps {
  portfolio: PortfolioData;
  onOpenImport: () => void;
  onOpenSettings: () => void;
  onReset: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  portfolio,
  onOpenImport,
  onOpenSettings,
  onReset
}) => {
  return (
    <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-wrap items-center justify-between gap-4">
        
        {/* Logo & Titre */}
        <div className="flex items-center space-x-3.5">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <TrendingUp className="w-5 h-5 text-slate-950 font-bold" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-lg font-bold text-white tracking-tight">PEA Rendement</h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full flex items-center gap-1">
                <Sparkles className="w-3 h-3" /> Fortuneo Connect
              </span>
            </div>
            <div className="flex items-center space-x-2 text-xs text-slate-400">
              <span className="font-medium text-slate-300">{portfolio.accountName}</span>
              <span>•</span>
              <span className="font-mono text-slate-400">N° {portfolio.accountNumber}</span>
              <span>•</span>
              <span className="text-slate-400">Export : {portfolio.asOfDate}</span>
            </div>
          </div>
        </div>

        {/* Actions & Paramètres */}
        <div className="flex items-center space-x-2.5">
          <button
            onClick={onOpenSettings}
            className="flex items-center space-x-1.5 px-3 py-1.5 text-xs font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 hover:text-white rounded-lg border border-slate-700/60 transition shadow-sm"
            title="Paramètres de calcul et benchmark"
          >
            <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-400" />
            <span>Paramètres</span>
          </button>

          <button
            onClick={onOpenImport}
            className="flex items-center space-x-1.5 px-3.5 py-1.5 text-xs font-medium text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-md shadow-emerald-500/20 font-semibold transition"
            title="Importer un fichier Fortuneo"
          >
            <UploadCloud className="w-3.5 h-3.5" />
            <span>Importer export</span>
          </button>

          <button
            onClick={onReset}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded-lg transition"
            title="Réinitialiser avec les données d'origine"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>
    </header>
  );
};

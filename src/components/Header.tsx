import React from 'react';
import { TrendingUp, UploadCloud, Settings } from 'lucide-react';
import { PortfolioData } from '../types/portfolio';
import { TopTabs, TabId } from './Navigation';

interface HeaderProps {
  portfolio: PortfolioData;
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
  onOpenImport: () => void;
  onOpenSettings: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  portfolio,
  activeTab,
  onTabChange,
  onOpenImport,
  onOpenSettings,
}) => (
  <header className="sticky top-0 z-40 bg-slate-950/90 backdrop-blur-md border-b border-slate-800">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3 flex items-center justify-between gap-3">

      <div className="flex items-center gap-3 min-w-0">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shrink-0" aria-hidden="true">
          <TrendingUp className="w-5 h-5 text-slate-950" />
        </div>
        <div className="min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-bold text-white tracking-tight whitespace-nowrap">PEA Visualiseur</h1>
            {portfolio.isDemo && (
              <span className="hidden sm:inline px-2 py-0.5 text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/25 rounded-full">
                Exemple
              </span>
            )}
          </div>
          <p className="text-xs text-slate-400 truncate">
            <span className="hidden sm:inline">{portfolio.accountName}</span>
            {portfolio.accountNumber && (
              <span className="hidden md:inline"> · N° •••• {portfolio.accountNumber.slice(-4)}</span>
            )}
            <span className="hidden sm:inline"> · Situation au </span>
            <span className="sm:hidden">Au </span>
            {portfolio.asOfDate}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-1.5 shrink-0">
        <button
          type="button"
          onClick={onOpenSettings}
          className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-2 text-sm font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition"
          aria-label="Paramètres du PEA"
          title="Paramètres du PEA"
        >
          <Settings className="w-4 h-4" aria-hidden="true" />
          <span className="hidden md:inline">Paramètres</span>
        </button>

        <button
          type="button"
          onClick={onOpenImport}
          className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-emerald-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg transition"
          title="Importer l'export de ton portefeuille Fortuneo"
        >
          <UploadCloud className="w-4 h-4" aria-hidden="true" />
          <span>Importer</span>
        </button>
      </div>
    </div>

    <TopTabs active={activeTab} onChange={onTabChange} />
  </header>
);

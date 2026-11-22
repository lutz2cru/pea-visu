import React from 'react';
import { Home, List, PiggyBank, TrendingUp } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export type TabId = 'OVERVIEW' | 'LINES' | 'INVEST' | 'PROJECTIONS';

export const TABS: Array<{ id: TabId; label: string; shortLabel: string; icon: LucideIcon }> = [
  { id: 'OVERVIEW', label: "Vue d'ensemble", shortLabel: 'Accueil', icon: Home },
  { id: 'LINES', label: 'Mes lignes', shortLabel: 'Lignes', icon: List },
  { id: 'INVEST', label: 'Prochain versement', shortLabel: 'Investir', icon: PiggyBank },
  { id: 'PROJECTIONS', label: 'Projections', shortLabel: 'Projections', icon: TrendingUp }
];

interface NavigationProps {
  active: TabId;
  onChange: (tab: TabId) => void;
}

/** Onglets horizontaux, affichés sous l'en-tête à partir des écrans moyens. */
export const TopTabs: React.FC<NavigationProps> = ({ active, onChange }) => (
  <nav aria-label="Sections" className="hidden sm:block border-t border-slate-800/70">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex gap-1 py-2">
      {TABS.map(({ id, label, icon: Icon }) => {
        const selected = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-current={selected ? 'page' : undefined}
            className={`px-3.5 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition ${
              selected ? 'bg-emerald-500/15 text-emerald-300 ring-1 ring-emerald-500/30' : 'text-slate-300 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Icon className="w-4 h-4" aria-hidden="true" />
            {label}
          </button>
        );
      })}
    </div>
  </nav>
);

/** Barre d'onglets fixée en bas de l'écran sur téléphone. */
export const BottomNav: React.FC<NavigationProps> = ({ active, onChange }) => (
  <nav
    aria-label="Sections"
    className="sm:hidden fixed bottom-0 inset-x-0 z-40 bg-slate-950/95 backdrop-blur border-t border-slate-800 pb-[env(safe-area-inset-bottom)]"
  >
    <div className="grid grid-cols-4">
      {TABS.map(({ id, shortLabel, icon: Icon }) => {
        const selected = active === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            aria-current={selected ? 'page' : undefined}
            className={`flex flex-col items-center gap-0.5 py-2.5 text-xs font-medium transition ${
              selected ? 'text-emerald-300' : 'text-slate-400'
            }`}
          >
            <Icon className="w-5 h-5" aria-hidden="true" />
            {shortLabel}
          </button>
        );
      })}
    </div>
  </nav>
);

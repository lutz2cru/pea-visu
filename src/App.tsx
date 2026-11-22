import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { BottomNav, TabId, TABS } from './components/Navigation';
import { OverviewView } from './components/overview/OverviewView';
import { PositionsTable } from './components/PositionsTable';
import { DcaRebalancer } from './components/savings/DcaRebalancer';
import { SimulatorView } from './components/simulation/SimulatorView';
import { FileImportModal } from './components/FileImportModal';
import { SettingsModal } from './components/SettingsModal';
import { DEMO_PORTFOLIO_DATA } from './data/defaultData';
import { PortfolioData, Position } from './types/portfolio';
import { computePortfolioSummary } from './utils/calculations';
import { computeDcaPlan, StrategyType } from './utils/dca';
import { computeDividends, computeExposure, computeInsights } from './utils/analysis';
import { usePersistentState } from './hooks/usePersistentState';
import { useBenchmarks } from './hooks/useBenchmarks';
import { DividendsView } from './components/dividends/DividendsView';
import { ExposureCard } from './components/analysis/ExposureCard';
import { Info, UploadCloud } from 'lucide-react';

const STORAGE_KEY = 'pea_portfolio_data';

function loadPortfolio(): PortfolioData {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved) as PortfolioData;
      if (parsed && Array.isArray(parsed.positions)) {
        return { ...parsed, startDate: parsed.startDate || DEMO_PORTFOLIO_DATA.startDate };
      }
    }
  } catch {
    // stockage indisponible ou corrompu : on repart des données d'exemple
  }
  return DEMO_PORTFOLIO_DATA;
}

export const App: React.FC = () => {
  const [activeTab, setActiveTab] = usePersistentState<TabId>('pea_active_tab', 'OVERVIEW');
  const [portfolio, setPortfolio] = useState<PortfolioData>(loadPortfolio);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Réglages du prochain versement, partagés entre l'accueil et l'onglet dédié
  const [dcaBudget, setDcaBudget] = usePersistentState<number>('pea_dca_budget', 100);
  const [dcaStrategy, setDcaStrategy] = usePersistentState<StrategyType>('pea_dca_strategy', 'ETF_CORE');
  const [customTargets, setCustomTargets] = usePersistentState<Record<string, number>>('pea_dca_custom_targets', {});

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(portfolio));
    } catch {
      // stockage indisponible (navigation privée…) : l'app fonctionne sans persistance
    }
  }, [portfolio]);

  const summary = useMemo(
    () => computePortfolioSummary(portfolio.positions, portfolio.asOfDate, portfolio.cashBalance, portfolio.startDate),
    [portfolio]
  );

  const plan = useMemo(
    () => computeDcaPlan(portfolio.positions, dcaStrategy, dcaBudget, customTargets),
    [portfolio.positions, dcaStrategy, dcaBudget, customTargets]
  );

  const exposure = useMemo(() => computeExposure(summary), [summary]);
  const insights = useMemo(() => computeInsights(summary, exposure, portfolio.startDate), [summary, exposure, portfolio.startDate]);
  const dividends = useMemo(() => computeDividends(summary.performances), [summary]);
  const { data: benchmarks, status: benchmarkStatus } = useBenchmarks();

  // Onglet inconnu (ancienne version mémorisée) : retour à l'accueil
  const tab: TabId = TABS.some(t => t.id === activeTab) ? activeTab : 'OVERVIEW';

  const goTo = (next: TabId) => {
    setActiveTab(next);
    window.scrollTo({ top: 0 });
  };

  const handleUpdatePosition = (id: string, patch: Partial<Position>) => {
    setPortfolio(prev => ({
      ...prev,
      positions: prev.positions.map(p => (p.id === id ? { ...p, ...patch } : p))
    }));
  };

  const handleImport = (imported: PortfolioData) => {
    setPortfolio(prev => ({ ...imported, startDate: prev.startDate, isDemo: false }));
  };

  const handleReset = () => {
    if (window.confirm('Effacer les données enregistrées dans ce navigateur et revenir au portefeuille d\'exemple ?')) {
      setPortfolio(DEMO_PORTFOLIO_DATA);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">

      <Header
        portfolio={portfolio}
        activeTab={tab}
        onTabChange={goTo}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
      />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-5 pb-8 space-y-5">

        {portfolio.isDemo && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl px-4 py-3 text-sm">
            <div className="flex items-center gap-2 text-amber-100">
              <Info className="w-4 h-4 shrink-0" aria-hidden="true" />
              <span>Ce sont des <strong>données d'exemple</strong>. Importe l'export de ton portefeuille Fortuneo pour voir tes propres chiffres.</span>
            </div>
            <button
              type="button"
              onClick={() => setIsImportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-semibold text-amber-950 bg-amber-300 hover:bg-amber-200 rounded-lg transition"
            >
              <UploadCloud className="w-4 h-4" aria-hidden="true" />
              Importer mon export
            </button>
          </div>
        )}

        {tab === 'OVERVIEW' && (
          <OverviewView
            summary={summary}
            peaStartDate={portfolio.startDate}
            plan={plan}
            budget={dcaBudget}
            strategy={dcaStrategy}
            insights={insights}
            netAnnualDividends={dividends.totalNet}
            benchmarks={benchmarks}
            benchmarkStatus={benchmarkStatus}
            onGoToLines={() => goTo('LINES')}
            onGoToInvest={() => goTo('INVEST')}
          />
        )}

        {tab === 'LINES' && (
          <>
            <PositionsTable
              performances={summary.performances}
              totalValuation={summary.totalValuation}
              onUpdatePosition={handleUpdatePosition}
            />
            <ExposureCard exposure={exposure} />
          </>
        )}

        {tab === 'DIVIDENDS' && (
          <DividendsView dividends={dividends} onGoToInvest={() => goTo('INVEST')} />
        )}

        {tab === 'INVEST' && (
          <DcaRebalancer
            positions={portfolio.positions}
            plan={plan}
            budget={dcaBudget}
            onBudgetChange={setDcaBudget}
            strategy={dcaStrategy}
            onStrategyChange={setDcaStrategy}
            onCustomTargetsChange={setCustomTargets}
          />
        )}

        {tab === 'PROJECTIONS' && (
          <SimulatorView
            key={`${summary.totalValuation}-${portfolio.startDate}`}
            currentValuation={summary.totalValuation + summary.cashBalance}
            currentAnnualizedReturn={summary.annualizedReturn}
            peaStartDate={portfolio.startDate}
            initialMonthlyContribution={dcaBudget || 100}
          />
        )}

      </main>

      <footer className="border-t border-slate-900 pt-4 pb-24 sm:pb-4 text-center text-xs text-slate-400 px-4">
        PEA Visualiseur · Données traitées uniquement dans ton navigateur · Outil d'information, pas un conseil en investissement
      </footer>

      <BottomNav active={tab} onChange={goTo} />

      <FileImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={handleImport}
        currentPositions={portfolio.positions}
        defaultPurchaseDate={portfolio.startDate}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        startDate={portfolio.startDate}
        onStartDateChange={(date) => setPortfolio(prev => ({ ...prev, startDate: date }))}
        onReset={() => { setIsSettingsOpen(false); handleReset(); }}
      />

    </div>
  );
};

export default App;

import React, { useState, useEffect, useMemo } from 'react';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { PerformanceByLineChart } from './components/PerformanceByLineChart';
import { AllocationChart } from './components/AllocationChart';
import { PositionsTable } from './components/PositionsTable';
import { DcaRebalancer } from './components/savings/DcaRebalancer';
import { SimulatorView } from './components/simulation/SimulatorView';
import { FileImportModal } from './components/FileImportModal';
import { SettingsModal } from './components/SettingsModal';
import { DEMO_PORTFOLIO_DATA } from './data/defaultData';
import { PortfolioData, Position } from './types/portfolio';
import { computePortfolioSummary } from './utils/calculations';
import { BarChart3, Rocket, Info, UploadCloud } from 'lucide-react';

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
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'SIMULATOR'>('DASHBOARD');
  const [portfolio, setPortfolio] = useState<PortfolioData>(loadPortfolio);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

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

  const gainPositive = summary.totalGainPercent >= 0;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">

      <Header
        portfolio={portfolio}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onReset={handleReset}
      />

      <div className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-[61px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <nav className="flex space-x-2 py-2.5">
            <button
              type="button"
              onClick={() => setActiveTab('DASHBOARD')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition ${
                activeTab === 'DASHBOARD'
                  ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Mon portefeuille</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('SIMULATOR')}
              className={`px-4 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition ${
                activeTab === 'SIMULATOR'
                  ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
              }`}
            >
              <Rocket className="w-4 h-4 text-indigo-400" />
              <span>Projections</span>
            </button>
          </nav>

          <div className="hidden sm:flex items-center text-xs text-slate-400 font-mono">
            <span>Valeur : <strong className="text-white">{(summary.totalValuation + summary.cashBalance).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €</strong></span>
            <span className="mx-2">•</span>
            <span className={`font-bold ${gainPositive ? 'text-emerald-400' : 'text-rose-400'}`}>
              {gainPositive ? '+' : ''}{(summary.totalGainPercent * 100).toFixed(2)} %
            </span>
          </div>
        </div>
      </div>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">

        {portfolio.isDemo && (
          <div className="flex flex-wrap items-center justify-between gap-3 bg-amber-500/10 border border-amber-500/30 rounded-2xl px-4 py-3 text-sm">
            <div className="flex items-center gap-2 text-amber-200">
              <Info className="w-4 h-4 shrink-0" />
              <span>Ce sont des <strong>données d'exemple</strong>. Importe l'export de ton portefeuille Fortuneo pour voir tes propres chiffres.</span>
            </div>
            <button
              type="button"
              onClick={() => setIsImportOpen(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-amber-950 bg-amber-300 hover:bg-amber-200 rounded-lg transition"
            >
              <UploadCloud className="w-3.5 h-3.5" />
              Importer mon export
            </button>
          </div>
        )}

        {activeTab === 'DASHBOARD' ? (
          <>
            <MetricCards summary={summary} />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PerformanceByLineChart performances={summary.performances} />
              </div>
              <div>
                <AllocationChart positions={portfolio.positions} />
              </div>
            </div>

            <DcaRebalancer positions={portfolio.positions} />

            <PositionsTable
              performances={summary.performances}
              onUpdatePosition={handleUpdatePosition}
            />
          </>
        ) : (
          <SimulatorView
            key={`${summary.totalValuation}-${portfolio.startDate}`}
            currentValuation={summary.totalValuation + summary.cashBalance}
            currentAnnualizedReturn={summary.annualizedReturn}
            peaStartDate={portfolio.startDate}
            initialMonthlyContribution={100}
          />
        )}

      </main>

      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500 px-4">
        <p>PEA Visualiseur • Données traitées uniquement dans ton navigateur • Outil d'information, pas un conseil en investissement</p>
      </footer>

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
      />

    </div>
  );
};

export default App;

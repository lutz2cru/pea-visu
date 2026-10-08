import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { YearlyPerformanceChart } from './components/YearlyPerformanceChart';
import { WealthEvolutionChart } from './components/WealthEvolutionChart';
import { AllocationChart } from './components/AllocationChart';
import { PositionsTable } from './components/PositionsTable';
import { FileImportModal } from './components/FileImportModal';
import { SettingsModal } from './components/SettingsModal';
import { SimulatorView } from './components/simulation/SimulatorView';
import { DcaPlanCard } from './components/dca/DcaPlanCard';
import { INITIAL_PORTFOLIO_DATA } from './data/defaultData';
import { PortfolioData, BenchmarkChoice, InvestmentMode } from './types/portfolio';
import {
  computePortfolioSummary,
  computeYearlyPerformance,
  generateMonthlyTimeline
} from './utils/calculations';
import { ShieldCheck, BarChart3, Rocket, Sparkles } from 'lucide-react';

export const App: React.FC = () => {
  // Navigation par onglets
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'SIMULATOR'>('DASHBOARD');

  // Paramètres simulateur
  const [simulatorMonthlyAmount, setSimulatorMonthlyAmount] = useState<number>(100);

  // État du portefeuille avec persistance LocalStorage
  const [portfolio, setPortfolio] = useState<PortfolioData>(() => {
    const saved = localStorage.getItem('pea_portfolio_data');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        return INITIAL_PORTFOLIO_DATA;
      }
    }
    return INITIAL_PORTFOLIO_DATA;
  });

  // Paramètres financiers
  const [startDate, setStartDate] = useState<string>('2024-07');
  const [benchmark, setBenchmark] = useState<BenchmarkChoice>('SP500');
  const [investmentMode, setInvestmentMode] = useState<InvestmentMode>('LUMP_SUM_2024');
  const [includeDividends, setIncludeDividends] = useState<boolean>(true);

  // Modales
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Sauvegarde LocalStorage
  useEffect(() => {
    localStorage.setItem('pea_portfolio_data', JSON.stringify(portfolio));
  }, [portfolio]);

  // Calculs dérivés
  const summary = computePortfolioSummary(portfolio.positions, startDate, portfolio.asOfDate, includeDividends);
  const yearlyData = computeYearlyPerformance(summary, includeDividends);
  const timelineData = generateMonthlyTimeline(summary, investmentMode);

  // Mise à jour de l'année d'achat d'une ligne
  const handleUpdatePurchaseYear = (id: string, year: number) => {
    setPortfolio(prev => ({
      ...prev,
      positions: prev.positions.map(p => p.id === id ? { ...p, purchaseYear: year } : p)
    }));
  };

  // Basculer vers le simulateur avec un montant spécifique
  const handleGoToSimulatorWithAmount = (amount: number) => {
    setSimulatorMonthlyAmount(amount);
    setActiveTab('SIMULATOR');
  };

  // Réinitialiser les données
  const handleReset = () => {
    if (window.confirm('Voulez-vous réinitialiser le portefeuille avec vos données Fortuneo d\'origine ?')) {
      setPortfolio(INITIAL_PORTFOLIO_DATA);
      setStartDate('2024-07');
      setInvestmentMode('LUMP_SUM_2024');
      setIncludeDividends(true);
      localStorage.removeItem('pea_portfolio_data');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Barre de navigation / En-tête */}
      <Header
        portfolio={portfolio}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onReset={handleReset}
      />

      {/* Barre d'onglets de navigation */}
      <div className="border-b border-slate-800 bg-slate-900/40 backdrop-blur-sm sticky top-[61px] z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <nav className="flex space-x-2 py-2.5">
            <button
              onClick={() => setActiveTab('DASHBOARD')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition ${activeTab === 'DASHBOARD' ? 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Tableau de Bord & Historique (2024-2026)</span>
            </button>

            <button
              onClick={() => setActiveTab('SIMULATOR')}
              className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center space-x-2 transition ${activeTab === 'SIMULATOR' ? 'bg-indigo-500/15 text-indigo-400 border border-indigo-500/30 shadow-sm' : 'text-slate-400 hover:text-white hover:bg-slate-800/60'}`}
            >
              <Rocket className="w-4 h-4 text-indigo-400" />
              <span>Projections & Simulations (10, 20, 30 ans)</span>
              <span className="ml-1 text-[10px] px-1.5 py-0.2 rounded-full bg-indigo-500 text-white font-bold">
                Nouveau
              </span>
            </button>
          </nav>

          <div className="hidden sm:flex items-center text-xs text-slate-400 font-mono">
            <span>Valo : <strong className="text-white">{summary.totalValuation.toLocaleString('fr-FR', { minimumFractionDigits: 2 })} €</strong></span>
            <span className="mx-2">•</span>
            <span className="text-emerald-400 font-bold">+{(summary.totalGainPercent * 100).toFixed(2)} %</span>
          </div>
        </div>
      </div>

      {/* Contenu principal */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        
        {activeTab === 'DASHBOARD' ? (
          <>
            {/* Bandeau de contexte et synthèse */}
            <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900/80 to-indigo-950/40 border border-emerald-500/20 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center space-x-3">
                <div className="w-9 h-9 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center shrink-0 border border-emerald-500/20">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                    <span>PEA Fortuneo transféré depuis Boursorama</span>
                    <span className="text-[11px] font-normal text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700/60">
                      Ouvert en Juillet 2024
                    </span>
                  </h2>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Vos Prix de Revient Unitaires (PRU) fiscaux sont intégrés. Vous visualisez ci-dessous votre performance calendaire pour <strong className="text-white">2024 (S2)</strong>, <strong className="text-white">2025</strong> et <strong className="text-white">2026 (YTD)</strong>.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 text-xs">
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-200 border border-slate-700 transition"
                >
                  Ajuster les paramètres
                </button>
              </div>
            </div>

            {/* 1. Carte Plan DCA 100€/mois WPEA & Rappel Téléphone */}
            <DcaPlanCard onGoToSimulator={handleGoToSimulatorWithAmount} />

            {/* 2. Cartes de métriques clés */}
            <MetricCards
              summary={summary}
              startDate={startDate}
              includeDividends={includeDividends}
            />

            {/* 3. Graphiques Rendement Annuel + Allocation */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <YearlyPerformanceChart
                  yearlyData={yearlyData}
                  benchmark={benchmark}
                  onBenchmarkChange={setBenchmark}
                  includeDividends={includeDividends}
                  onToggleDividends={() => setIncludeDividends(!includeDividends)}
                />
              </div>
              <div>
                <AllocationChart positions={portfolio.positions} />
              </div>
            </div>

            {/* 4. Courbe d'enrichissement et d'évolution dans le temps */}
            <WealthEvolutionChart
              timelineData={timelineData}
              investmentMode={investmentMode}
              onModeChange={setInvestmentMode}
            />

            {/* 5. Tableau complet des 6 lignes */}
            <PositionsTable
              positions={portfolio.positions}
              onUpdatePurchaseYear={handleUpdatePurchaseYear}
            />
          </>
        ) : (
          /* Onglet 2 : Simulateur de projection à long terme */
          <SimulatorView
            currentValuation={summary.totalValuation}
            currentAnnualizedReturn={summary.annualizedReturn}
            initialMonthlyContribution={simulatorMonthlyAmount}
          />
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <p>PEA Visualiseur • Données 100% traitées en local sur votre machine • Export Fortuneo</p>
      </footer>

      {/* Modales */}
      <FileImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onImportSuccess={(newPort) => setPortfolio(newPort)}
        currentPositions={portfolio.positions}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        startDate={startDate}
        onStartDateChange={setStartDate}
        investmentMode={investmentMode}
        onInvestmentModeChange={setInvestmentMode}
        benchmark={benchmark}
        onBenchmarkChange={setBenchmark}
        includeDividends={includeDividends}
        onToggleDividends={() => setIncludeDividends(!includeDividends)}
      />

    </div>
  );
};

export default App;

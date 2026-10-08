import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { MetricCards } from './components/MetricCards';
import { PerformanceOverviewChart } from './components/PerformanceOverviewChart';
import { AllocationChart } from './components/AllocationChart';
import { PositionsTable } from './components/PositionsTable';
import { DcaRebalancer } from './components/savings/DcaRebalancer';
import { SimulatorView } from './components/simulation/SimulatorView';
import { FileImportModal } from './components/FileImportModal';
import { SettingsModal } from './components/SettingsModal';
import { INITIAL_PORTFOLIO_DATA } from './data/defaultData';
import { PortfolioData, BenchmarkChoice, InvestmentMode } from './types/portfolio';
import {
  computePortfolioSummary,
  computeYearlyPerformance,
  generateMonthlyTimeline
} from './utils/calculations';
import { BarChart3, Rocket, ShieldCheck } from 'lucide-react';

export const App: React.FC = () => {
  // Navigation simplifiée en 2 onglets essentiels : Portefeuille actuel & Projections futures
  const [activeTab, setActiveTab] = useState<'DASHBOARD' | 'SIMULATOR'>('DASHBOARD');

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

  // Calculs financiers dérivés
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

  // Réinitialiser les données d'origine
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

      {/* Barre d'onglets épurée : Présent (Portefeuille) vs Futur (Simulateur) */}
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
              <span>Mon Portefeuille & DCA</span>
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
              <span>Simulateur & Projections</span>
            </button>
          </nav>

          {/* Synthèse rapide dans la barre */}
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
            {/* 1. Métriques clés (Valo, Plus-values, Rendement annuel, Plafond 150k€) */}
            <MetricCards
              summary={summary}
              startDate={startDate}
              includeDividends={includeDividends}
            />

            {/* 2. Graphiques : Performance & Évolution (2/3) + Camembert Répartition (1/3) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <PerformanceOverviewChart
                  yearlyData={yearlyData}
                  benchmark={benchmark}
                  onBenchmarkChange={setBenchmark}
                  includeDividends={includeDividends}
                  onToggleDividends={() => setIncludeDividends(!includeDividends)}
                  timelineData={timelineData}
                  investmentMode={investmentMode}
                  onModeChange={setInvestmentMode}
                />
              </div>

              <div>
                <AllocationChart positions={portfolio.positions} />
              </div>
            </div>

            {/* 3. Assistant DCA Malin : Où investir ce mois-ci ? */}
            <DcaRebalancer positions={portfolio.positions} />

            {/* 4. Tableau complet et détaillé des positions */}
            <PositionsTable
              positions={portfolio.positions}
              onUpdatePurchaseYear={handleUpdatePurchaseYear}
            />
          </>
        ) : (
          /* Onglet 2 : Simulateur complet avec inflation corrigée & outils en sous-onglets */
          <SimulatorView
            currentValuation={summary.totalValuation}
            currentAnnualizedReturn={summary.annualizedReturn}
            initialMonthlyContribution={100}
          />
        )}

      </main>

      {/* Footer épuré */}
      <footer className="border-t border-slate-900 bg-slate-950 py-4 text-center text-xs text-slate-500">
        <p>PEA Visualiseur • Données 100% traitées en local sur votre machine • Fichier export Fortuneo</p>
      </footer>

      {/* Modales Import & Paramètres */}
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

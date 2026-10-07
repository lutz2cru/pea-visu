import React from 'react';
import { X, SlidersHorizontal, Calendar, Coins, TrendingUp, Info } from 'lucide-react';
import { BenchmarkChoice, InvestmentMode } from '../types/portfolio';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  startDate: string;
  onStartDateChange: (date: string) => void;
  investmentMode: InvestmentMode;
  onInvestmentModeChange: (mode: InvestmentMode) => void;
  benchmark: BenchmarkChoice;
  onBenchmarkChange: (bench: BenchmarkChoice) => void;
  includeDividends: boolean;
  onToggleDividends: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  startDate,
  onStartDateChange,
  investmentMode,
  onInvestmentModeChange,
  benchmark,
  onBenchmarkChange,
  includeDividends,
  onToggleDividends
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
        
        {/* Bouton Fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Paramètres de Calcul du PEA</h3>
            <p className="text-xs text-slate-400">Ajustez la temporalité et les hypothèses financières</p>
          </div>
        </div>

        <div className="space-y-4 text-xs">
          
          {/* 1. Date d'ouverture */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <label className="block font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Date d'ouverture du PEA :</span>
            </label>
            <p className="text-slate-400 mb-2">
              Définit la base de calcul de la durée et du rendement annualisé (CAGR).
            </p>
            <select
              value={startDate}
              onChange={(e) => onStartDateChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-medium"
            >
              <option value="2024-07">Juillet 2024 (Votre date)</option>
              <option value="2024-01">Janvier 2024</option>
              <option value="2023-07">Juillet 2023</option>
              <option value="2023-01">Janvier 2023</option>
              <option value="2022-01">Janvier 2022</option>
            </select>
          </div>

          {/* 2. Mode d'investissement */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <label className="block font-semibold text-slate-200 mb-1">
              Rythme d'apport des capitaux :
            </label>
            <p className="text-slate-400 mb-2">
              Comment le capital de 2 082 € a été injecté dans le PEA.
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => onInvestmentModeChange('LUMP_SUM_2024')}
                className={`p-2.5 rounded-lg border text-left transition ${investmentMode === 'LUMP_SUM_2024' ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
              >
                <div className="font-medium text-slate-200">Apport initial 2024</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Tout le capital investi dès 2024</div>
              </button>
              <button
                type="button"
                onClick={() => onInvestmentModeChange('DCA_REGULAR')}
                className={`p-2.5 rounded-lg border text-left transition ${investmentMode === 'DCA_REGULAR' ? 'bg-indigo-600/20 border-indigo-500 text-white font-semibold' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
              >
                <div className="font-medium text-slate-200">DCA progressif</div>
                <div className="text-[10px] text-slate-400 mt-0.5">Versements réguliers lissés</div>
              </button>
            </div>
          </div>

          {/* 3. Dividendes */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex items-center justify-between">
            <div className="pr-4">
              <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Coins className="w-3.5 h-3.5 text-amber-400" />
                <span>Inclure les dividendes estimés</span>
              </div>
              <p className="text-slate-400 mt-0.5">
                TotalEnergies (~5.8%), Orange (~5.2%) et Crédit Agricole (~6.5%) distribuent de forts dividendes réinvestis ou crédités sur le PEA.
              </p>
            </div>
            <button
              type="button"
              onClick={onToggleDividends}
              className={`w-11 h-6 rounded-full transition-colors relative shrink-0 ${includeDividends ? 'bg-emerald-500' : 'bg-slate-700'}`}
            >
              <div
                className={`w-4 h-4 bg-white rounded-full transition-transform absolute top-1 ${includeDividends ? 'right-1' : 'left-1'}`}
              />
            </button>
          </div>

          {/* 4. Benchmark */}
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <label className="block font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
              <TrendingUp className="w-3.5 h-3.5 text-blue-400" />
              <span>Indice de référence (Benchmark) :</span>
            </label>
            <div className="grid grid-cols-3 gap-2 mt-2">
              {(['SP500', 'MSCI_WORLD', 'CAC40'] as BenchmarkChoice[]).map((b) => (
                <button
                  key={b}
                  type="button"
                  onClick={() => onBenchmarkChange(b)}
                  className={`py-2 px-2 rounded-lg border text-center transition ${benchmark === b ? 'bg-blue-600/20 border-blue-500 text-blue-300 font-bold' : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'}`}
                >
                  {b === 'SP500' ? 'S&P 500' : b === 'MSCI_WORLD' ? 'MSCI World' : 'CAC 40'}
                </button>
              ))}
            </div>
          </div>

        </div>

        <div className="flex justify-end mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow transition"
          >
            Appliquer les réglages
          </button>
        </div>

      </div>
    </div>
  );
};

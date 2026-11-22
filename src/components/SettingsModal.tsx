import React from 'react';
import { X, SlidersHorizontal, Calendar, Trash2 } from 'lucide-react';
import { PEA_TAX_FREE_YEARS } from '../config/fiscal';
import { addYears, formatMonthYear, parseYearMonth, toYearMonth } from '../utils/dates';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  /** Date du premier versement sur le PEA (AAAA-MM). */
  startDate: string;
  onStartDateChange: (date: string) => void;
  /** Efface les données enregistrées et revient au portefeuille d'exemple. */
  onReset: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  startDate,
  onStartDateChange,
  onReset
}) => {
  if (!isOpen) return null;

  const now = new Date();
  const start = parseYearMonth(startDate);
  const taxFree = start ? addYears(start, PEA_TAX_FREE_YEARS) : null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          aria-label="Fermer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-5">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Paramètres du PEA</h3>
            <p className="text-xs text-slate-400">Informations utilisées pour les calculs fiscaux</p>
          </div>
        </div>

        <div className="space-y-4 text-sm">
          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800">
            <label htmlFor="pea-start" className="font-semibold text-slate-200 mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Date du premier versement sur le PEA</span>
            </label>
            <p className="text-slate-400 mb-2">
              C'est elle qui fait courir le délai fiscal de {PEA_TAX_FREE_YEARS} ans (pas la date d'ouverture administrative ni celle des achats).
              Elle sert aussi de date d'achat par défaut pour les nouvelles lignes importées.
            </p>
            <input
              id="pea-start"
              type="month"
              min="2000-01"
              max={toYearMonth(now.getFullYear(), now.getMonth() + 1)}
              value={startDate}
              onChange={(e) => e.target.value && onStartDateChange(e.target.value)}
              className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500 font-medium [color-scheme:dark]"
            />
            {taxFree && (
              <p className="mt-2 text-emerald-300">
                {taxFree <= now ? 'Délai de 5 ans atteint depuis ' : '5 ans fiscaux atteints en '}
                <strong>{formatMonthYear(taxFree)}</strong>.
              </p>
            )}
          </div>

          <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="font-semibold text-slate-200 text-sm">Effacer mes données</div>
              <p className="text-slate-400 mt-0.5">Supprime le portefeuille enregistré dans ce navigateur et revient à l'exemple.</p>
            </div>
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-rose-200 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 rounded-lg transition"
            >
              <Trash2 className="w-4 h-4" aria-hidden="true" />
              Effacer
            </button>
          </div>
        </div>

        <div className="flex justify-end mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow transition"
          >
            Fermer
          </button>
        </div>

      </div>
    </div>
  );
};

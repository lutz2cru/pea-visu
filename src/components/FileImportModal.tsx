import React, { useState } from 'react';
import { X, UploadCloud, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { parseFortuneoCSV } from '../utils/parser';
import { PortfolioData } from '../types/portfolio';

interface FileImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (data: PortfolioData) => void;
}

export const FileImportModal: React.FC<FileImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess
}) => {
  const [pasteContent, setPasteContent] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      processText(text);
    };
    reader.readAsText(file, 'ISO-8859-1'); // Fortuneo exports often use ISO-8859-1 or UTF-8
  };

  const processText = (text: string) => {
    setErrorMsg(null);
    const parsed = parseFortuneoCSV(text);
    if (parsed && parsed.positions.length > 0) {
      onImportSuccess(parsed);
      onClose();
    } else {
      setErrorMsg("Impossible de lire les lignes du portefeuille. Assurez-vous qu'il s'agit bien d'un export Fortuneo contenant les colonnes 'Libellé, Cours, Qté, PRU, Valorisation'.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative">
        
        {/* Bouton Fermer */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center">
            <UploadCloud className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Importer un export Fortuneo</h3>
            <p className="text-xs text-slate-400">Glissez votre fichier .csv ou collez son contenu</p>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Zone de Drag & Drop / Input fichier */}
        <label className="border-2 border-dashed border-slate-700 hover:border-emerald-500 rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer transition bg-slate-950/40 group mb-4">
          <UploadCloud className="w-8 h-8 text-slate-500 group-hover:text-emerald-400 transition mb-2" />
          <span className="text-sm font-semibold text-slate-200 group-hover:text-white">
            Cliquez pour choisir votre fichier CSV Fortuneo
          </span>
          <span className="text-xs text-slate-500 mt-1">Export "Portefeuille" (.csv)</span>
          <input
            type="file"
            accept=".csv,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>

        {/* Ou coller le texte */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Ou collez le texte directement :</span>
          </div>
          <textarea
            value={pasteContent}
            onChange={(e) => setPasteContent(e.target.value)}
            placeholder="Portefeuille 010209283616&#10;Libellé,Cours,,Dev,Var/Veille,Qté,PRU,Valorisation..."
            className="w-full h-28 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500 resize-none"
          />
        </div>

        <div className="flex justify-end gap-2 mt-5">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            Annuler
          </button>
          <button
            onClick={() => processText(pasteContent)}
            disabled={!pasteContent.trim()}
            className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 disabled:pointer-events-none rounded-lg shadow-md transition"
          >
            Valider et Analyser
          </button>
        </div>

      </div>
    </div>
  );
};

import React, { useState } from 'react';
import {
  X,
  UploadCloud,
  FileSpreadsheet,
  FileText,
  CheckCircle2,
  AlertCircle,
  Sparkles,
  ArrowRight,
  TrendingUp,
  Wallet
} from 'lucide-react';
import { parseFortuneoFile, parseFortuneoCSV } from '../utils/parser';
import { PortfolioData, Position } from '../types/portfolio';

interface FileImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onImportSuccess: (data: PortfolioData) => void;
  currentPositions?: Position[];
}

const SAMPLE_CSV = `Portefeuille 010209283616,,,,,,,,,,,
(PEA M LUTZ MATTHIAS),,,,,,,,,,,
08/10/2026,,,,,,,,,,,
,,,,,,,,,,,
Libellé,Cours,,Dev,Var/Veille,Qté,PRU,Valorisation,+/- values,+/- values (%),Poids,ISIN
AIRBUS (AIR),187.44,V,EUR,0.0,3.0,180.33,562.32,21.33,0.0394,0.23037,NL0000235190
Amundi PEA Emergent (MSCI Emerging) ESG Transition UCITS ETF - EUR DIS (PAEEM),37.37,V,EUR,0.0,5.0,25.63,186.85,58.7,0.4581,0.076548,FR0013412020
BNP PARIBAS EASY S&P 500 UCITS ETF - C EUR ACC (ESE),35.2542,V,EUR,0.0,22.0,28.0759,775.5924,157.9226,0.2557,0.317742,FR0011550185
CREDIT AGRICOLE (ACA),16.525,V,EUR,0.0,6.0,18.92,99.15,-14.37,-0.1266,0.040619,FR0000045072
ORANGE (ORA),14.245,V,EUR,0.0,15.0,16.0093,213.675,-26.4645,-0.1102,0.087538,FR0000133308
TOTALENERGIES (TTE),75.42,V,EUR,0.0,8.0,55.21,603.36,161.68,0.3661,0.247183,FR0000120271`;

export const FileImportModal: React.FC<FileImportModalProps> = ({
  isOpen,
  onClose,
  onImportSuccess,
  currentPositions
}) => {
  const [pasteContent, setPasteContent] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [parsedPreview, setParsedPreview] = useState<PortfolioData | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  if (!isOpen) return null;

  const handleProcessFile = async (file: File) => {
    setIsLoading(true);
    setErrorMsg(null);
    setFileName(file.name);

    try {
      const parsed = await parseFortuneoFile(file, currentPositions);
      if (parsed && parsed.positions.length > 0) {
        setParsedPreview(parsed);
      } else {
        setParsedPreview(null);
        setErrorMsg(
          "Impossible de lire le fichier. Assurez-vous qu'il s'agit d'un export Fortuneo (.xlsx, .xls ou .csv) contenant les colonnes 'Libellé, Cours, Qté, PRU, Valorisation'."
        );
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("Une erreur s'est produite lors de la lecture du fichier Excel/CSV.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) {
      handleProcessFile(file);
    }
  };

  const handleProcessText = (text: string) => {
    setErrorMsg(null);
    setFileName('Texte collé');
    const parsed = parseFortuneoCSV(text, currentPositions);
    if (parsed && parsed.positions.length > 0) {
      setParsedPreview(parsed);
    } else {
      setParsedPreview(null);
      setErrorMsg(
        "Impossible de lire les données. Vérifiez que le texte contient la ligne d'en-tête 'Libellé,Cours,...' et les lignes de positions."
      );
    }
  };

  const handleConfirmImport = () => {
    if (parsedPreview) {
      onImportSuccess(parsedPreview);
      handleClose();
    }
  };

  const handleClose = () => {
    setParsedPreview(null);
    setErrorMsg(null);
    setPasteContent('');
    setFileName(null);
    onClose();
  };

  const totalValo = parsedPreview
    ? parsedPreview.positions.reduce((acc, p) => acc + p.valuation, 0)
    : 0;
  const totalInvested = parsedPreview
    ? parsedPreview.positions.reduce((acc, p) => acc + (p.pru * p.quantity), 0)
    : 0;
  const totalGain = totalValo - totalInvested;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        
        {/* Bouton Fermer */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
        >
          <X className="w-5 h-5" />
        </button>

        {/* En-tête */}
        <div className="flex items-center space-x-3 mb-5">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <span>Importer vos données Fortuneo</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                Excel & CSV
              </span>
            </h3>
            <p className="text-xs text-slate-400">
              Compatible avec les fichiers <strong className="text-slate-200">.xlsx</strong>, <strong className="text-slate-200">.xls</strong>, <strong className="text-slate-200">.csv</strong> ou copier-coller
            </p>
          </div>
        </div>

        {/* Message d'erreur */}
        {errorMsg && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMsg}</span>
          </div>
        )}

        {/* Aperçu des données détectées */}
        {parsedPreview ? (
          <div className="mb-5 p-4 rounded-xl bg-emerald-950/30 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                <span className="text-sm font-bold text-white">Export analysé avec succès</span>
              </div>
              <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                {fileName}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Compte</span>
                <span className="font-semibold text-slate-200 truncate block" title={parsedPreview.accountName}>
                  {parsedPreview.accountName}
                </span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Date du relevé</span>
                <span className="font-semibold text-slate-200 block font-mono">
                  {parsedPreview.asOfDate}
                </span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Valorisation totale</span>
                <span className="font-bold text-white block font-mono">
                  {totalValo.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </span>
              </div>
              <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Plus-value</span>
                <span className={`font-bold block font-mono ${totalGain >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  {totalGain >= 0 ? '+' : ''}{totalGain.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €
                </span>
              </div>
            </div>

            {/* Liste des positions trouvées */}
            <div className="pt-1">
              <span className="text-[11px] text-slate-400 block mb-1.5 font-medium">
                {parsedPreview.positions.length} positions détectées :
              </span>
              <div className="flex flex-wrap gap-1.5">
                {parsedPreview.positions.map((p) => (
                  <span
                    key={p.id}
                    className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800/90 text-slate-200 border border-slate-700 font-mono flex items-center gap-1.5"
                  >
                    <strong className="text-white">{p.ticker || p.isin.slice(0, 4)}</strong>
                    <span className="text-slate-400 text-[10px]">({p.quantity} × {p.currentPrice.toFixed(2)}€)</span>
                  </span>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Zone Drag & Drop */}
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center transition bg-slate-950/40 group mb-4 ${
                isDragging
                  ? 'border-emerald-400 bg-emerald-500/10'
                  : 'border-slate-700 hover:border-emerald-500'
              }`}
            >
              <label className="w-full flex flex-col items-center justify-center cursor-pointer">
                <UploadCloud
                  className={`w-9 h-9 transition mb-2 ${
                    isDragging ? 'text-emerald-400 scale-110' : 'text-slate-400 group-hover:text-emerald-400'
                  }`}
                />
                <span className="text-sm font-semibold text-slate-200 group-hover:text-white text-center">
                  {isLoading ? 'Analyse en cours...' : 'Glissez-déposez votre fichier Excel ou CSV'}
                </span>
                <span className="text-xs text-slate-500 mt-1">
                  Cliquez pour parcourir (.xlsx, .xls, .csv, .txt)
                </span>
                <input
                  type="file"
                  accept=".xlsx,.xls,.csv,.txt,.tsv"
                  onChange={handleFileInputChange}
                  className="hidden"
                  disabled={isLoading}
                />
              </label>
            </div>

            {/* Zone de texte copier/coller */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-400">
                <span>Ou collez le contenu textuel / CSV :</span>
                <button
                  type="button"
                  onClick={() => {
                    setPasteContent(SAMPLE_CSV);
                    handleProcessText(SAMPLE_CSV);
                  }}
                  className="text-emerald-400 hover:text-emerald-300 font-medium flex items-center gap-1 transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Charger l'exemple du 08/10/2026</span>
                </button>
              </div>

              <textarea
                value={pasteContent}
                onChange={(e) => setPasteContent(e.target.value)}
                placeholder="Portefeuille 010209283616&#10;(PEA M LUTZ MATTHIAS)&#10;08/10/2026&#10;&#10;Libellé,Cours,,Dev,Var/Veille,Qté,PRU,Valorisation..."
                className="w-full h-24 bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-emerald-500 resize-none"
              />
            </div>
          </>
        )}

        {/* Boutons d'action */}
        <div className="flex justify-between items-center gap-2 mt-5 pt-3 border-t border-slate-800">
          <div>
            {parsedPreview && (
              <button
                type="button"
                onClick={() => setParsedPreview(null)}
                className="text-xs text-slate-400 hover:text-slate-200 transition underline underline-offset-2"
              >
                Choisir un autre fichier
              </button>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleClose}
              className="px-4 py-2 text-xs font-medium text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
            >
              Annuler
            </button>

            {parsedPreview ? (
              <button
                onClick={handleConfirmImport}
                className="px-5 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 rounded-lg shadow-md transition flex items-center gap-1.5"
              >
                <span>Appliquer à mon tableau de bord</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            ) : (
              <button
                onClick={() => handleProcessText(pasteContent)}
                disabled={!pasteContent.trim() || isLoading}
                className="px-4 py-2 text-xs font-bold text-slate-950 bg-emerald-400 hover:bg-emerald-300 disabled:opacity-40 disabled:pointer-events-none rounded-lg shadow-md transition"
              >
                Analyser le texte
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

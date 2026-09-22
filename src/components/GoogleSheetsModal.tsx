import React, { useState } from 'react';
import { X, Copy, Download, RotateCcw, Volume2, CheckCircle2, FileSpreadsheet, AlertTriangle } from 'lucide-react';
import { ExerciseTemplate } from '../types/fitness';
import { exportExercisesToCSV, parseCSVToExercises } from '../data/defaultProgram';
import { soundService } from '../utils/audio';

interface GoogleSheetsModalProps {
  isOpen: boolean;
  exercises: ExerciseTemplate[];
  onClose: () => void;
  onImportExercises: (exercises: ExerciseTemplate[]) => void;
  onResetDefault: () => void;
  onDownloadStandalone: () => void;
}

export const GoogleSheetsModal: React.FC<GoogleSheetsModalProps> = ({
  isOpen,
  exercises,
  onClose,
  onImportExercises,
  onResetDefault,
  onDownloadStandalone,
}) => {
  const currentCSV = exportExercisesToCSV(exercises);
  const [csvText, setCsvText] = useState(currentCSV);
  const [copied, setCopied] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  if (!isOpen) return null;

  const handleCopy = () => {
    navigator.clipboard.writeText(csvText).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const handleImport = () => {
    const parsed = parseCSVToExercises(csvText);
    if (parsed.length === 0) {
      setImportStatus('Erreur : format CSV invalide ou vide.');
      return;
    }
    onImportExercises(parsed);
    setImportStatus(`${parsed.length} exercices importés avec succès !`);
    setTimeout(() => {
      setImportStatus(null);
      onClose();
    }, 1200);
  };

  const handleTestSound = () => {
    soundService.playLoudAlarm();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#151515] border border-zinc-800 rounded-2xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#BCE029]/15 border border-[#BCE029]/30 flex items-center justify-center text-[#BCE029]">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Google Sheets & Données</h3>
              <p className="text-[10px] text-zinc-400">Import / Export des exercices au format standard</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Info label */}
        <div className="bg-black/50 p-3 rounded-xl border border-zinc-800/80 text-xs text-zinc-300 space-y-1">
          <p className="font-semibold text-white">Format standard des colonnes Google Sheets :</p>
          <code className="text-[10px] text-[#BCE029] font-mono block bg-zinc-950 p-2 rounded border border-zinc-800 break-all">
            Jour,Séance,Exercice,Groupe Musculaire,Piste Sollicitée,Séries,Répétitions,Charge / Matériel,RIR,Repos
          </code>
        </div>

        {/* Textarea */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-300 block">
            Données CSV (modifiables ou à copier-coller) :
          </label>
          <textarea
            value={csvText}
            onChange={e => setCsvText(e.target.value)}
            rows={7}
            className="w-full bg-black/80 border border-zinc-800 rounded-xl p-3 text-[11px] font-mono-numbers text-zinc-200 focus:outline-none focus:border-[#BCE029]"
          />
        </div>

        {importStatus && (
          <div
            className={`p-2.5 rounded-xl text-xs font-semibold flex items-center gap-2 ${
              importStatus.startsWith('Erreur')
                ? 'bg-red-950/50 border border-red-900/50 text-red-300'
                : 'bg-[#BCE029]/15 border border-[#BCE029]/40 text-[#BCE029]'
            }`}
          >
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{importStatus}</span>
          </div>
        )}

        {/* Reset Confirmation Prompt */}
        {showResetConfirm ? (
          <div className="bg-red-950/30 border border-red-900/50 p-3 rounded-xl space-y-2 text-xs">
            <div className="flex items-center gap-2 text-red-400 font-bold">
              <AlertTriangle className="w-4 h-4" />
              <span>Rétablir le programme d'origine ?</span>
            </div>
            <p className="text-zinc-400 text-[11px]">
              Toutes vos personnalisations d'exercices seront remplacées par la configuration par défaut.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setShowResetConfirm(false)}
                className="flex-1 py-1.5 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  onResetDefault();
                  setShowResetConfirm(false);
                  onClose();
                }}
                className="flex-1 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-bold"
              >
                Confirmer
              </button>
            </div>
          </div>
        ) : (
          /* Actions buttons */
          <div className="space-y-2 pt-1">
            <button
              onClick={handleImport}
              className="w-full py-2.5 rounded-xl bg-[#BCE029] hover:bg-[#A8CE1E] text-black font-extrabold text-xs shadow-md shadow-[#BCE029]/20 transition active:scale-95"
            >
              Appliquer & Importer les modifications
            </button>

            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleCopy}
                className="py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copié !' : 'Copier le CSV'}</span>
              </button>

              <button
                onClick={() => setShowResetConfirm(true)}
                className="py-2.5 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-red-400 font-medium text-xs flex items-center justify-center gap-1.5 transition active:scale-95"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Réinitialiser</span>
              </button>
            </div>

            {/* Standalone HTML export button */}
            <button
              onClick={onDownloadStandalone}
              className="w-full py-2.5 rounded-xl bg-zinc-900 border border-zinc-700 hover:border-zinc-500 text-white font-bold text-xs flex items-center justify-center gap-2 transition active:scale-95"
            >
              <Download className="w-4 h-4 text-[#FF6D00]" />
              <span>Télécharger en fichier HTML unique autonome</span>
            </button>

            {/* Audio test */}
            <button
              onClick={handleTestSound}
              className="w-full py-2 rounded-xl bg-[#FF6D00]/15 border border-[#FF6D00]/40 text-[#FF6D00] font-bold text-xs flex items-center justify-center gap-1.5 hover:bg-[#FF6D00]/25 transition active:scale-95"
            >
              <Volume2 className="w-3.5 h-3.5" />
              <span>Tester l'Alarme Web Audio API</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

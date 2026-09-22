import React from 'react';
import { Volume2, VolumeX, FileSpreadsheet, Download, Dumbbell, Flame } from 'lucide-react';
import { soundService } from '../utils/audio';

interface HeaderProps {
  weeklyTonnage: number;
  isMuted: boolean;
  onToggleMute: () => void;
  onOpenSheetsModal: () => void;
  onDownloadStandalone: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  weeklyTonnage,
  isMuted,
  onToggleMute,
  onOpenSheetsModal,
  onDownloadStandalone,
}) => {
  return (
    <header className="sticky top-0 z-40 bg-[#0D0D0D]/95 backdrop-blur-md border-b border-zinc-800/80 px-4 py-3 flex items-center justify-between">
      {/* Brand Wordmark with Anis and Orange accents */}
      <div className="flex items-center gap-2.5">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF6D00]/25 to-[#BCE029]/25 border border-[#BCE029]/40 flex items-center justify-center text-[#BCE029]">
          <Dumbbell className="w-4 h-4" />
        </div>
        <div>
          <h1 className="text-base font-black tracking-tight text-white flex items-center gap-1">
            TITAN<span className="text-[#BCE029]">FIT</span>
          </h1>
          <p className="text-[10px] text-zinc-400 font-medium">Musculation & Tonnage</p>
        </div>
      </div>

      {/* Right controls: Weekly Tonnage, Sound, Sheets, Standalone Export */}
      <div className="flex items-center gap-2">
        {/* Weekly Tonnage Widget */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-xl px-2.5 py-1 text-right flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-[#FF6D00] shrink-0" />
          <div>
            <span className="text-[9px] text-zinc-400 block leading-tight font-medium">7 JOURS</span>
            <span className="text-xs font-mono-numbers font-bold text-[#BCE029]">
              {Math.round(weeklyTonnage).toLocaleString('fr-FR')} kg
            </span>
          </div>
        </div>

        {/* Audio Mute / Unmute */}
        <button
          onClick={onToggleMute}
          className={`w-9 h-9 rounded-xl border flex items-center justify-center transition active:scale-95 ${
            isMuted
              ? 'bg-zinc-900 border-zinc-800 text-zinc-500'
              : 'bg-zinc-900 border-zinc-700 text-zinc-200 hover:text-white'
          }`}
          title={isMuted ? 'Activer le son' : 'Couper le son'}
        >
          {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4 text-[#BCE029]" />}
        </button>

        {/* Google Sheets Modal trigger */}
        <button
          onClick={onOpenSheetsModal}
          className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-300 hover:text-[#BCE029] hover:border-[#BCE029]/50 transition active:scale-95"
          title="Google Sheets & Données"
        >
          <FileSpreadsheet className="w-4 h-4" />
        </button>

        {/* Standalone HTML export */}
        <button
          onClick={onDownloadStandalone}
          className="w-9 h-9 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-[#FF6D00] hover:border-[#FF6D00]/50 hover:bg-[#FF6D00]/10 transition active:scale-95"
          title="Télécharger en fichier HTML autonome (Android / Cordova / WebIntoApp)"
        >
          <Download className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
};

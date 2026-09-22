import React, { useState } from 'react';
import { X, Check, Flame, Trophy, Clock, Dumbbell, Award } from 'lucide-react';

interface WorkoutValidationModalProps {
  isOpen: boolean;
  day: string;
  sessionName: string;
  durationSeconds: number;
  totalTonnage: number;
  totalReps: number;
  completedSets: number;
  totalSets: number;
  onConfirm: (notes?: string) => void;
  onCancel: () => void;
}

export const WorkoutValidationModal: React.FC<WorkoutValidationModalProps> = ({
  isOpen,
  day,
  sessionName,
  durationSeconds,
  totalTonnage,
  totalReps,
  completedSets,
  totalSets,
  onConfirm,
  onCancel,
}) => {
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const minutes = Math.floor(durationSeconds / 60);
  const seconds = durationSeconds % 60;

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#151515] border-2 border-[#BCE029]/50 rounded-3xl w-full max-w-md p-5 space-y-4 shadow-2xl shadow-[#BCE029]/10 animate-in fade-in zoom-in-95 duration-200">
        {/* Header with celebration banner */}
        <div className="text-center space-y-1.5 pt-2">
          <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF6D00] to-[#BCE029] p-0.5 mx-auto shadow-lg shadow-[#FF6D00]/25">
            <div className="w-full h-full bg-[#151515] rounded-[14px] flex items-center justify-center text-white">
              <Trophy className="w-7 h-7 text-[#BCE029]" />
            </div>
          </div>
          <h3 className="text-lg font-black text-white tracking-tight">
            Valider la Séance
          </h3>
          <p className="text-xs text-zinc-400">
            {day} · <span className="text-zinc-200 font-bold">{sessionName}</span>
          </p>
        </div>

        {/* Big Tonnage Highlight */}
        <div className="bg-black/60 border border-zinc-800 rounded-2xl p-4 text-center space-y-1">
          <span className="text-[10px] text-zinc-400 uppercase font-bold tracking-wider">
            TONNAGE TOTAL SOULÉVÉ
          </span>
          <div className="text-3xl font-mono-numbers font-black text-[#BCE029]">
            {Math.round(totalTonnage).toLocaleString('fr-FR')}{' '}
            <span className="text-sm font-sans font-normal text-zinc-400">kg</span>
          </div>
        </div>

        {/* 3 Metric Cards */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="bg-black/40 border border-zinc-800/80 rounded-xl p-2.5">
            <span className="text-[9px] text-zinc-400 block font-medium">DURÉE</span>
            <div className="text-sm font-mono-numbers font-bold text-white mt-0.5">
              {minutes}:{String(seconds).padStart(2, '0')}
            </div>
          </div>

          <div className="bg-black/40 border border-zinc-800/80 rounded-xl p-2.5">
            <span className="text-[9px] text-zinc-400 block font-medium">RÉPÉTITIONS</span>
            <div className="text-sm font-mono-numbers font-bold text-[#FF6D00] mt-0.5">
              {totalReps}
            </div>
          </div>

          <div className="bg-black/40 border border-zinc-800/80 rounded-xl p-2.5">
            <span className="text-[9px] text-zinc-400 block font-medium">SÉRIES</span>
            <div className="text-sm font-mono-numbers font-bold text-white mt-0.5">
              {completedSets} / {totalSets}
            </div>
          </div>
        </div>

        {/* Optional session note */}
        <div className="space-y-1">
          <label className="text-[11px] text-zinc-400 block font-medium">
            Note personnelle (optionnel) :
          </label>
          <input
            type="text"
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Ex: Super congestion, charges en hausse sur le premier exo..."
            className="w-full bg-black/60 border border-zinc-800 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#BCE029]"
          />
        </div>

        {/* Warning if 0 sets completed */}
        {completedSets === 0 && (
          <div className="bg-amber-950/40 border border-amber-900/40 p-2.5 rounded-xl text-xs text-amber-300">
            ⚠️ Attention : aucune série n'a été cochée comme complétée. Le tonnage calculé est de 0 kg.
          </div>
        )}

        {/* Actions buttons */}
        <div className="pt-2 space-y-2">
          <button
            onClick={() => onConfirm(notes)}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#BCE029] to-[#9BC416] hover:from-[#CEFA1C] hover:to-[#A8CE1E] text-black font-extrabold text-sm shadow-xl shadow-[#BCE029]/25 flex items-center justify-center gap-2 active:scale-[0.98] transition-all cursor-pointer"
          >
            <Check className="w-4 h-4 stroke-[3]" />
            <span>Confirmer et Enregistrer la séance</span>
          </button>

          <button
            onClick={onCancel}
            className="w-full py-2.5 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white text-xs font-semibold active:scale-95 transition"
          >
            Continuer la séance
          </button>
        </div>
      </div>
    </div>
  );
};

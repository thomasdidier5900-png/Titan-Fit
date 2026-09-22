import React, { useState } from 'react';
import { X, Check, Edit3, Plus, ArrowUp, ArrowDown, Trash2, Dumbbell, Calendar, Sliders } from 'lucide-react';
import { ExerciseTemplate } from '../types/fitness';

interface EditSessionModalProps {
  isOpen: boolean;
  day: string;
  sessionName: string;
  exercises: ExerciseTemplate[];
  onClose: () => void;
  onUpdateSession: (day: string, newSessionName: string, updatedExercises: ExerciseTemplate[]) => void;
  onOpenAddExercise: (day: string, sessionName: string) => void;
  onOpenEditExercise: (exercise: ExerciseTemplate) => void;
}

export const EditSessionModal: React.FC<EditSessionModalProps> = ({
  isOpen,
  day,
  sessionName,
  exercises,
  onClose,
  onUpdateSession,
  onOpenAddExercise,
  onOpenEditExercise,
}) => {
  const [editedName, setEditedName] = useState(sessionName);
  const [localExercises, setLocalExercises] = useState<ExerciseTemplate[]>(exercises);

  React.useEffect(() => {
    setEditedName(sessionName);
    setLocalExercises(exercises);
  }, [sessionName, exercises, isOpen]);

  if (!isOpen) return null;

  const handleMove = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= localExercises.length) return;
    const copy = [...localExercises];
    const temp = copy[index];
    copy[index] = copy[target];
    copy[target] = temp;
    setLocalExercises(copy);
  };

  const handleDelete = (id: string) => {
    setLocalExercises(prev => prev.filter(e => e.id !== id));
  };

  const handleSave = () => {
    const trimmedName = editedName.trim() || sessionName;
    const updatedWithNewName = localExercises.map(e => ({
      ...e,
      session: trimmedName,
    }));
    onUpdateSession(day, trimmedName, updatedWithNewName);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-[#151515] border border-zinc-800 rounded-2xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto space-y-4 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-zinc-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-[#FF6D00]/15 border border-[#FF6D00]/40 flex items-center justify-center text-[#FF6D00]">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-white">Modifier la Séance</h3>
              <p className="text-[10px] text-zinc-400">
                {day} · {localExercises.length} exercices
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Session Name Field */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-zinc-300 block">
            Nom de la séance :
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={editedName}
              onChange={e => setEditedName(e.target.value)}
              placeholder="Ex: PULL 1 - Dos & Biceps"
              className="flex-1 bg-black/70 border border-zinc-800 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-none focus:border-[#BCE029]"
            />
            <button
              type="button"
              onClick={() => setEditedName('REPOS')}
              className={`px-2.5 py-2 rounded-xl text-xs font-bold transition ${
                editedName.toUpperCase().includes('REPOS')
                  ? 'bg-zinc-800 text-[#FF6D00] border border-[#FF6D00]/40'
                  : 'bg-zinc-900 text-zinc-400 border border-zinc-800 hover:text-white'
              }`}
              title="Marquer comme jour de repos"
            >
              Repos
            </button>
          </div>
        </div>

        {/* Exercises Management */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-zinc-300">
              Exercices de la séance ({localExercises.length}) :
            </span>
            <button
              onClick={() => {
                onClose();
                onOpenAddExercise(day, editedName);
              }}
              className="text-xs font-bold text-[#BCE029] hover:text-[#A8CE1E] flex items-center gap-1 active:scale-95 transition"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Ajouter un exercice</span>
            </button>
          </div>

          {localExercises.length === 0 ? (
            <div className="py-6 text-center bg-black/40 rounded-xl border border-dashed border-zinc-800 text-xs text-zinc-500">
              Aucun exercice dans cette séance.
            </div>
          ) : (
            <div className="space-y-2">
              {localExercises.map((ex, idx) => (
                <div
                  key={ex.id}
                  className="bg-black/60 border border-zinc-800 rounded-xl p-3 flex items-center justify-between gap-2"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px] font-mono-numbers font-bold text-zinc-500">
                        #{idx + 1}
                      </span>
                      <h4 className="text-xs font-bold text-white truncate">{ex.name}</h4>
                    </div>
                    <div className="text-[10px] text-zinc-400 flex items-center gap-2 mt-0.5 font-mono-numbers">
                      <span>{ex.sets} séries</span>
                      <span>·</span>
                      <span>{ex.reps} reps</span>
                      <span>·</span>
                      <span className="text-zinc-300 truncate">{ex.load}</span>
                      <span>·</span>
                      <span className="text-[#FF6D00]">{ex.restSeconds}s repos</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleMove(idx, -1)}
                      disabled={idx === 0}
                      className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 disabled:opacity-30 hover:text-white flex items-center justify-center text-xs active:scale-90"
                      title="Monter"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(idx, 1)}
                      disabled={idx === localExercises.length - 1}
                      className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 disabled:opacity-30 hover:text-white flex items-center justify-center text-xs active:scale-90"
                      title="Descendre"
                    >
                      <ArrowDown className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onOpenEditExercise(ex);
                      }}
                      className="w-6 h-6 rounded bg-[#BCE029]/15 border border-[#BCE029]/30 text-[#BCE029] hover:bg-[#BCE029]/25 flex items-center justify-center text-xs active:scale-90"
                      title="Modifier les paramètres"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(ex.id)}
                      className="w-6 h-6 rounded bg-red-950/40 border border-red-900/30 text-red-400 hover:text-red-300 flex items-center justify-center text-xs active:scale-90"
                      title="Supprimer de la séance"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="pt-2 flex items-center gap-2 border-t border-zinc-800">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white font-medium text-xs transition active:scale-95"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-xl bg-[#BCE029] hover:bg-[#A8CE1E] text-black font-extrabold text-xs shadow-md shadow-[#BCE029]/20 transition active:scale-95 flex items-center justify-center gap-1.5"
          >
            <Check className="w-3.5 h-3.5 stroke-[3]" />
            <span>Valider les modifications</span>
          </button>
        </div>
      </div>
    </div>
  );
};

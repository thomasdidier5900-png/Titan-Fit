import React, { useState } from 'react';
import { Play, Plus, ChevronDown, ChevronUp, ArrowUp, ArrowDown, Trash2, Dumbbell, Sparkles, Edit3, Sliders } from 'lucide-react';
import { ExerciseTemplate } from '../types/fitness';
import { EditSessionModal } from './EditSessionModal';
import { EditExerciseModal } from './EditExerciseModal';

interface WorkoutProgramViewProps {
  exercises: ExerciseTemplate[];
  onStartSession: (day: string, sessionName: string) => void;
  onMoveExercise: (id: string, direction: -1 | 1) => void;
  onDeleteExercise: (id: string) => void;
  onUpdateExercise: (exercise: ExerciseTemplate) => void;
  onUpdateSessionGroup: (day: string, newSessionName: string, updatedExercises: ExerciseTemplate[]) => void;
  onOpenAddModal: (defaultDay?: string, defaultSession?: string) => void;
}

export const WorkoutProgramView: React.FC<WorkoutProgramViewProps> = ({
  exercises,
  onStartSession,
  onMoveExercise,
  onDeleteExercise,
  onUpdateExercise,
  onUpdateSessionGroup,
  onOpenAddModal,
}) => {
  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>({
    'Jour 1': true, // Expanded by default
  });

  // Modal States
  const [editingSessionDay, setEditingSessionDay] = useState<string | null>(null);
  const [editingExercise, setEditingExercise] = useState<ExerciseTemplate | null>(null);
  const [pendingDeleteId, setPendingDeleteId] = useState<string | null>(null);

  // Group exercises by day
  const daysGrouped: { [day: string]: { day: string; session: string; exercises: ExerciseTemplate[] } } = {};

  exercises.forEach(ex => {
    if (!daysGrouped[ex.day]) {
      daysGrouped[ex.day] = {
        day: ex.day,
        session: ex.session,
        exercises: [],
      };
    }
    daysGrouped[ex.day].exercises.push(ex);
  });

  const dayKeys = Object.keys(daysGrouped);

  const toggleDay = (day: string) => {
    setExpandedDays(prev => ({
      ...prev,
      [day]: !prev[day],
    }));
  };

  const currentEditingGroup = editingSessionDay ? daysGrouped[editingSessionDay] : null;

  return (
    <div className="space-y-4">
      {/* Title & Add exercise button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-black text-white tracking-tight">Programme Musculation</h2>
          <p className="text-xs text-zinc-400">7 Jours · Personnalisables & Synchronisés</p>
        </div>

        <button
          onClick={() => onOpenAddModal()}
          className="px-3 py-1.5 rounded-xl bg-[#BCE029]/15 border border-[#BCE029]/40 text-[#BCE029] text-xs font-bold hover:bg-[#BCE029]/25 transition active:scale-95 flex items-center gap-1.5"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>+ Exercice</span>
        </button>
      </div>

      {/* Days List */}
      <div className="space-y-3">
        {dayKeys.map(dayKey => {
          const group = daysGrouped[dayKey];
          const isRest = group.session.toUpperCase().includes('REPOS');
          const isExpanded = !!expandedDays[dayKey];
          const totalExercises = group.exercises.length;

          return (
            <div
              key={dayKey}
              className={`bg-[#151515] border rounded-2xl transition-all duration-200 overflow-hidden ${
                isExpanded
                  ? 'border-zinc-700 shadow-xl shadow-black/50'
                  : 'border-zinc-800/80 hover:border-zinc-700'
              }`}
            >
              {/* Card Header */}
              <div className="p-4 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-[#BCE029] uppercase tracking-wider">
                      {group.day}
                    </span>
                    <span className="text-zinc-600">·</span>
                    <h3 className="text-sm font-extrabold text-white">{group.session}</h3>
                  </div>

                  <div className="flex items-center gap-1.5">
                    {/* Modifier la séance trigger */}
                    <button
                      onClick={() => setEditingSessionDay(dayKey)}
                      className="px-2 py-1 rounded-lg bg-[#FF6D00]/15 border border-[#FF6D00]/30 text-[#FF6D00] hover:bg-[#FF6D00]/25 text-[11px] font-bold flex items-center gap-1 transition active:scale-95"
                      title="Modifier les exercices et le nom de la séance"
                    >
                      <Sliders className="w-3 h-3 text-[#FF6D00]" />
                      <span>Modifier</span>
                    </button>

                    {isRest ? (
                      <span className="text-[10px] text-zinc-400 uppercase font-semibold bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
                        Récupération
                      </span>
                    ) : (
                      <span className="text-xs text-zinc-400 font-mono-numbers">
                        {totalExercises} exos
                      </span>
                    )}
                  </div>
                </div>

                {/* Short preview of exercises if not expanded */}
                {!isExpanded && !isRest && (
                  <div className="text-xs text-zinc-400 space-y-1">
                    {group.exercises.slice(0, 3).map(ex => (
                      <div key={ex.id} className="truncate">
                        • {ex.name}
                      </div>
                    ))}
                    {group.exercises.length > 3 && (
                      <div className="text-[11px] text-zinc-500 font-medium">
                        + {group.exercises.length - 3} autres exercices...
                      </div>
                    )}
                  </div>
                )}

                {/* Actions row */}
                <div className="flex items-center justify-between pt-2 border-t border-zinc-800/70">
                  <button
                    onClick={() => toggleDay(dayKey)}
                    className="text-xs text-zinc-400 hover:text-white font-medium flex items-center gap-1 py-1"
                  >
                    <span>{isExpanded ? 'Masquer détails' : 'Voir les exercices'}</span>
                    {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                  </button>

                  {!isRest ? (
                    <button
                      onClick={() => onStartSession(group.day, group.session)}
                      className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#BCE029] to-[#9BC416] hover:from-[#CEFA1C] hover:to-[#A8CE1E] text-black font-extrabold text-xs transition active:scale-95 flex items-center gap-1.5 shadow-md shadow-[#BCE029]/20"
                    >
                      <Play className="w-3.5 h-3.5 fill-black" />
                      <span>Démarrer la séance</span>
                    </button>
                  ) : (
                    <span className="text-xs text-zinc-500 italic">Jour de repos & régénération</span>
                  )}
                </div>
              </div>

              {/* Expanded Exercises List */}
              {isExpanded && (
                <div className="bg-black/40 border-t border-zinc-800/80 p-3 space-y-2.5">
                  {group.exercises.map((ex, index) => (
                    <div
                      key={ex.id}
                      className="bg-[#181818] border border-zinc-800 rounded-xl p-3 space-y-1.5 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <div className="font-bold text-white text-xs leading-snug">{ex.name}</div>
                          <div className="text-[11px] text-zinc-400 mt-0.5">
                            {ex.muscleGroup} · <span className="text-zinc-300">{ex.track}</span>
                          </div>
                        </div>

                        {/* Order, edit & delete controls */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => onMoveExercise(ex.id, -1)}
                            className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center active:scale-90"
                            title="Monter"
                          >
                            <ArrowUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => onMoveExercise(ex.id, 1)}
                            className="w-7 h-7 rounded-lg bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center active:scale-90"
                            title="Descendre"
                          >
                            <ArrowDown className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setEditingExercise(ex)}
                            className="w-7 h-7 rounded-lg bg-[#FF6D00]/15 border border-[#FF6D00]/30 text-[#FF6D00] hover:bg-[#FF6D00]/25 flex items-center justify-center active:scale-90"
                            title="Modifier l'exercice"
                          >
                            <Edit3 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setPendingDeleteId(ex.id)}
                            className="w-7 h-7 rounded-lg bg-red-950/40 border border-red-900/30 text-red-400 hover:text-red-300 flex items-center justify-center active:scale-90"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>

                      {/* Specs */}
                      <div className="flex items-center gap-3 text-[11px] text-zinc-400 pt-1 border-t border-zinc-800/60 font-mono-numbers">
                        <span>{ex.sets} séries</span>
                        <span>·</span>
                        <span>{ex.reps} reps</span>
                        <span>·</span>
                        <span className="text-zinc-200">{ex.load}</span>
                        <span>·</span>
                        <span className="text-[#FF6D00]">Repos: {ex.restSeconds}s</span>
                      </div>
                    </div>
                  ))}

                  {/* Add button inside day */}
                  {!isRest && (
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        onClick={() => onOpenAddModal(group.day, group.session)}
                        className="flex-1 py-2 rounded-xl bg-zinc-900 border border-dashed border-zinc-700 text-xs text-zinc-300 hover:text-white hover:border-zinc-500 flex items-center justify-center gap-1.5 transition active:scale-95"
                      >
                        <Plus className="w-3.5 h-3.5 text-[#BCE029]" />
                        <span>Ajouter un exercice</span>
                      </button>

                      <button
                        onClick={() => setEditingSessionDay(dayKey)}
                        className="py-2 px-3 rounded-xl bg-zinc-900 border border-zinc-800 text-xs text-[#FF6D00] hover:bg-zinc-800 flex items-center justify-center gap-1.5 transition active:scale-95"
                        title="Modifier la séance"
                      >
                        <Sliders className="w-3.5 h-3.5" />
                        <span>Modifier la séance</span>
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Edit Session Modal */}
      {currentEditingGroup && (
        <EditSessionModal
          isOpen={!!editingSessionDay}
          day={currentEditingGroup.day}
          sessionName={currentEditingGroup.session}
          exercises={currentEditingGroup.exercises}
          onClose={() => setEditingSessionDay(null)}
          onUpdateSession={(day, newSessionName, updatedExercises) => {
            onUpdateSessionGroup(day, newSessionName, updatedExercises);
            setEditingSessionDay(null);
          }}
          onOpenAddExercise={(d, s) => {
            setEditingSessionDay(null);
            onOpenAddModal(d, s);
          }}
          onOpenEditExercise={ex => {
            setEditingSessionDay(null);
            setEditingExercise(ex);
          }}
        />
      )}

      {/* Edit Exercise Modal */}
      <EditExerciseModal
        isOpen={!!editingExercise}
        exercise={editingExercise}
        onClose={() => setEditingExercise(null)}
        onSaveExercise={updated => {
          onUpdateExercise(updated);
          setEditingExercise(null);
        }}
      />

      {/* In-app Delete Confirmation Dialog (No window.confirm!) */}
      {pendingDeleteId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151515] border border-zinc-800 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">Supprimer cet exercice ?</h3>
            <p className="text-xs text-zinc-400">
              L'exercice sera retiré de votre programme d'entraînement.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setPendingDeleteId(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white font-medium text-xs active:scale-95 transition"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  onDeleteExercise(pendingDeleteId);
                  setPendingDeleteId(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-950/60 border border-red-900 text-red-400 hover:text-red-300 font-bold text-xs active:scale-95 transition"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

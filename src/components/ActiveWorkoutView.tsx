import React, { useState, useEffect } from 'react';
import { Play, Pause, Check, Plus, Trash2, Dumbbell, Clock, Flame, ChevronDown, Bell, FastForward, RotateCcw } from 'lucide-react';
import { ActiveExerciseItem, SetLog, WorkoutSessionLog } from '../types/fitness';
import { soundService } from '../utils/audio';
import { RestTimerCard } from './RestTimerCard';
import { WorkoutValidationModal } from './WorkoutValidationModal';

interface ActiveWorkoutViewProps {
  day: string;
  sessionName: string;
  exercises: ActiveExerciseItem[];
  startedAt: number;
  initialElapsedSeconds?: number;
  onUpdateExercises: (exercises: ActiveExerciseItem[]) => void;
  onFinishSession: (log: WorkoutSessionLog) => void;
  onCancelSession: () => void;
}

export const ActiveWorkoutView: React.FC<ActiveWorkoutViewProps> = ({
  day,
  sessionName,
  exercises,
  startedAt,
  initialElapsedSeconds = 0,
  onUpdateExercises,
  onFinishSession,
  onCancelSession,
}) => {
  // Global Session Stopwatch
  const [elapsedSeconds, setElapsedSeconds] = useState(initialElapsedSeconds);
  const [isTimerPaused, setIsTimerPaused] = useState(false);

  // Active Rest Timer State
  const [activeRestTimer, setActiveRestTimer] = useState<{
    show: boolean;
    duration: number;
    exerciseName: string;
    remaining: number;
    isRunning: boolean;
  }>({
    show: false,
    duration: 90,
    exerciseName: '',
    remaining: 90,
    isRunning: false,
  });

  // Modal States
  const [isValidationModalOpen, setIsValidationModalOpen] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Elapsed Session Timer Tick
  useEffect(() => {
    if (isTimerPaused) return;
    const interval = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isTimerPaused]);

  // Compute live session tonnage: sum of (reps * weight) for all completed sets
  const liveTonnage = exercises.reduce((accEx, ex) => {
    return (
      accEx +
      ex.sets.reduce((accSet, s) => {
        if (s.completed) {
          return accSet + (s.actualReps || 0) * (s.actualWeight || 0);
        }
        return accSet;
      }, 0)
    );
  }, 0);

  // Compute completed sets and total reps
  const totalSetsCount = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const completedSetsCount = exercises.reduce(
    (acc, ex) => acc + ex.sets.filter(s => s.completed).length,
    0
  );
  const totalRepsCount = exercises.reduce((accEx, ex) => {
    return (
      accEx +
      ex.sets.reduce((accSet, s) => {
        return accSet + (s.completed ? s.actualReps || 0 : 0);
      }, 0)
    );
  }, 0);

  // Toggle set completion
  const handleToggleSet = (exIndex: number, setIndex: number) => {
    const updated = [...exercises];
    const targetSet = updated[exIndex].sets[setIndex];
    const willBeCompleted = !targetSet.completed;

    targetSet.completed = willBeCompleted;
    targetSet.completedAt = willBeCompleted ? Date.now() : undefined;

    if (willBeCompleted) {
      soundService.playSuccessChime();
      // Auto-trigger rest countdown
      const restSec = updated[exIndex].restSeconds || 90;
      setActiveRestTimer({
        show: true,
        duration: restSec,
        exerciseName: updated[exIndex].name,
        remaining: restSec,
        isRunning: true,
      });
    }

    onUpdateExercises(updated);
  };

  // Modify actual reps or weight
  const handleSetChange = (
    exIndex: number,
    setIndex: number,
    field: 'actualReps' | 'actualWeight',
    val: number
  ) => {
    const updated = [...exercises];
    updated[exIndex].sets[setIndex][field] = Math.max(0, val);
    onUpdateExercises(updated);
  };

  // Add set to exercise
  const handleAddSet = (exIndex: number) => {
    const updated = [...exercises];
    const ex = updated[exIndex];
    const lastSet = ex.sets[ex.sets.length - 1];
    const nextNum = ex.sets.length + 1;

    ex.sets.push({
      id: `set_${nextNum}_${Date.now()}`,
      setNumber: nextNum,
      targetReps: lastSet ? lastSet.targetReps : '10 - 12',
      targetWeight: lastSet ? lastSet.targetWeight : 10,
      actualReps: lastSet ? lastSet.actualReps : 10,
      actualWeight: lastSet ? lastSet.actualWeight : 10,
      completed: false,
    });

    onUpdateExercises(updated);
  };

  // Remove set from exercise
  const handleRemoveSet = (exIndex: number, setIndex: number) => {
    const updated = [...exercises];
    if (updated[exIndex].sets.length <= 1) return;
    updated[exIndex].sets.splice(setIndex, 1);
    updated[exIndex].sets.forEach((s, i) => {
      s.setNumber = i + 1;
    });
    onUpdateExercises(updated);
  };

  // Trigger manual rest timer
  const handleLaunchRest = (seconds: number, name = '') => {
    setActiveRestTimer({
      show: true,
      duration: seconds,
      exerciseName: name,
      remaining: seconds,
      isRunning: true,
    });
  };

  // Finish Workout Execution (Called from WorkoutValidationModal)
  const handleConfirmFinishSession = (notes?: string) => {
    let totalReps = 0;
    const exerciseSummaries = exercises.map(ex => {
      const finished = ex.sets.filter(s => s.completed);
      finished.forEach(s => (totalReps += s.actualReps));
      return {
        name: ex.name,
        muscleGroup: ex.muscleGroup,
        completedSets: finished.map(s => ({
          reps: s.actualReps,
          weight: s.actualWeight,
        })),
      };
    });

    const sessionLog: WorkoutSessionLog = {
      id: `log_${Date.now()}`,
      day,
      sessionName,
      startedAt,
      finishedAt: Date.now(),
      durationSeconds: elapsedSeconds,
      totalTonnage: liveTonnage,
      totalSets: completedSetsCount,
      totalReps: totalRepsCount || totalReps,
      exercises: exerciseSummaries,
      notes,
    };

    setIsValidationModalOpen(false);
    onFinishSession(sessionLog);
  };

  const timerMins = Math.floor(elapsedSeconds / 60);
  const timerSecs = elapsedSeconds % 60;
  const progressRatio = totalSetsCount > 0 ? (completedSetsCount / totalSetsCount) * 100 : 0;

  return (
    <div className="space-y-4">
      {/* =========================================================================
          STICKY TOP WORKOUT BAR (CHRONO & REPOS ALWAYS VISIBLE EVEN WHEN SCROLLING)
          ========================================================================= */}
      <div className="sticky top-[57px] z-30 bg-[#0D0D0D]/95 backdrop-blur-md border-b border-zinc-800 pb-2.5 pt-1 -mx-4 px-4 shadow-xl">
        {/* Row 1: Session Tag & Live Tonnage Counter */}
        <div className="flex items-center justify-between gap-2 mb-2">
          <div className="flex items-center gap-1.5 truncate">
            <span className="text-[10px] font-black text-[#BCE029] bg-[#BCE029]/15 border border-[#BCE029]/30 px-1.5 py-0.5 rounded tracking-wider uppercase">
              {day}
            </span>
            <span className="text-xs font-extrabold text-white truncate">{sessionName}</span>
          </div>

          <div className="flex items-center gap-1.5 shrink-0 font-mono-numbers">
            <div className="flex items-center gap-1 bg-black/60 border border-zinc-800 px-2 py-0.5 rounded-lg">
              <Flame className="w-3 h-3 text-[#FF6D00]" />
              <span className="text-xs font-black text-[#BCE029]">
                {Math.round(liveTonnage).toLocaleString('fr-FR')}
              </span>
              <span className="text-[10px] text-zinc-400 font-sans">kg</span>
            </div>

            <button
              onClick={() => setIsValidationModalOpen(true)}
              className="px-2.5 py-1 rounded-lg bg-[#BCE029] hover:bg-[#A8CE1E] text-black font-extrabold text-xs shadow-md shadow-[#BCE029]/20 transition active:scale-95 flex items-center gap-1"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>Valider</span>
            </button>
          </div>
        </div>

        {/* Row 2: Dual Timers (Chrono de Séance & Temps de Repos) */}
        <div className="grid grid-cols-2 gap-2">
          {/* CHRONO SÉANCE */}
          <div className="bg-[#181818] border border-zinc-800 rounded-xl px-2.5 py-1.5 flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#BCE029]" />
              <div>
                <span className="text-[9px] text-zinc-400 block font-semibold uppercase leading-none">
                  Chrono
                </span>
                <span className="text-xs font-mono-numbers font-bold text-white">
                  {String(timerMins).padStart(2, '0')}:{String(timerSecs).padStart(2, '0')}
                </span>
              </div>
            </div>

            <button
              onClick={() => setIsTimerPaused(p => !p)}
              className="px-2 py-0.5 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-[10px] font-bold transition active:scale-95"
            >
              {isTimerPaused ? 'Reprendre' : 'Pause'}
            </button>
          </div>

          {/* TEMPS DE REPOS DOCK */}
          <div
            className={`border rounded-xl px-2.5 py-1.5 flex items-center justify-between transition-colors ${
              activeRestTimer.show
                ? 'bg-[#FF6D00]/15 border-[#FF6D00]/60 text-white'
                : 'bg-[#181818] border-zinc-800 text-zinc-300'
            }`}
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span
                className={`w-2 h-2 rounded-full shrink-0 ${
                  activeRestTimer.show ? 'bg-[#FF6D00] animate-ping' : 'bg-zinc-500'
                }`}
              />
              <div className="min-w-0">
                <span className="text-[9px] text-zinc-400 block font-semibold uppercase leading-none truncate">
                  {activeRestTimer.show ? 'Repos En Cours' : 'Temps Repos'}
                </span>
                <span className="text-xs font-mono-numbers font-bold text-[#FF6D00]">
                  {activeRestTimer.show ? `${activeRestTimer.duration}s` : '90s'}
                </span>
              </div>
            </div>

            {activeRestTimer.show ? (
              <button
                onClick={() =>
                  setActiveRestTimer(prev => ({ ...prev, show: false }))
                }
                className="px-2 py-0.5 rounded bg-[#FF6D00] text-black text-[10px] font-extrabold active:scale-95 transition"
              >
                Fermer
              </button>
            ) : (
              <button
                onClick={() => handleLaunchRest(90, 'Repos standard')}
                className="px-2 py-0.5 rounded bg-[#FF6D00]/20 border border-[#FF6D00]/40 text-[#FF6D00] hover:bg-[#FF6D00]/30 text-[10px] font-bold active:scale-95 transition"
              >
                Lancer
              </button>
            )}
          </div>
        </div>

        {/* Mini progress bar of completed sets */}
        <div className="w-full bg-zinc-800 rounded-full h-1 mt-2 overflow-hidden">
          <div
            className="bg-gradient-to-r from-[#BCE029] to-[#FF6D00] h-full transition-all duration-300"
            style={{ width: `${progressRatio}%` }}
          />
        </div>
      </div>

      {/* Dedicated Rest Timer Card if running */}
      {activeRestTimer.show && (
        <RestTimerCard
          initialSeconds={activeRestTimer.duration}
          exerciseName={activeRestTimer.exerciseName}
          onClose={() => setActiveRestTimer(prev => ({ ...prev, show: false }))}
        />
      )}

      {/* Exercises List */}
      <div className="space-y-4">
        {exercises.map((exercise, exIndex) => {
          const finishedExSets = exercise.sets.filter(s => s.completed).length;
          const isAllDone = finishedExSets === exercise.sets.length && exercise.sets.length > 0;

          return (
            <div
              key={exercise.id}
              className={`bg-[#151515] border rounded-2xl p-4 space-y-3 transition-colors ${
                isAllDone
                  ? 'border-[#BCE029]/50 shadow-sm shadow-[#BCE029]/10'
                  : 'border-zinc-800'
              }`}
            >
              {/* Exercise Header */}
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold text-white leading-snug">
                      {exercise.name}
                    </h3>
                    {isAllDone && (
                      <span className="text-[10px] text-[#BCE029] bg-[#BCE029]/15 border border-[#BCE029]/30 px-1.5 py-0.2 rounded font-bold">
                        Fait
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-zinc-400 mt-0.5">
                    {exercise.muscleGroup} · <span className="text-zinc-300">{exercise.track}</span>
                  </p>
                </div>

                {/* Direct Rest button for this exercise */}
                <button
                  onClick={() =>
                    handleLaunchRest(exercise.restSeconds || 90, exercise.name)
                  }
                  className="px-2.5 py-1 rounded-xl bg-zinc-900 border border-zinc-800 text-[11px] text-[#FF6D00] font-mono-numbers font-bold hover:border-[#FF6D00]/50 hover:bg-[#FF6D00]/10 transition active:scale-95 flex items-center gap-1"
                  title="Démarrer le temps de repos pour cet exercice"
                >
                  <Clock className="w-3 h-3 text-[#FF6D00]" />
                  <span>Repos: {exercise.restSeconds}s</span>
                </button>
              </div>

              {/* Target info reminder */}
              <div className="flex items-center justify-between text-[11px] text-zinc-400 bg-black/40 px-3 py-1.5 rounded-lg border border-zinc-800/60 font-mono-numbers">
                <span>Cible: <strong className="text-zinc-200">{exercise.targetReps} reps</strong></span>
                <span>Charge: <strong className="text-zinc-200">{exercise.targetLoad}</strong></span>
                <span>RIR: <strong className="text-zinc-200">{exercise.targetRir}</strong></span>
              </div>

              {/* Sets Table */}
              <div className="bg-black/50 rounded-xl p-2.5 border border-zinc-800/80">
                <div className="grid grid-cols-12 gap-2 text-[10px] font-bold text-zinc-400 pb-2 px-1 border-b border-zinc-800">
                  <div className="col-span-2">SÉRIE</div>
                  <div className="col-span-4 text-center">RÉPS</div>
                  <div className="col-span-4 text-center">POIDS (KG)</div>
                  <div className="col-span-2 text-right">VAL.</div>
                </div>

                <div className="space-y-2 pt-2">
                  {exercise.sets.map((set, setIndex) => (
                    <div
                      key={set.id}
                      className={`grid grid-cols-12 gap-2 items-center px-1.5 py-1 rounded-lg transition-all ${
                        set.completed
                          ? 'bg-[#BCE029]/15 border border-[#BCE029]/40'
                          : 'bg-zinc-900/50'
                      }`}
                    >
                      {/* Set Number */}
                      <div className="col-span-2 text-xs font-mono-numbers font-bold flex items-center gap-1">
                        <span className={set.completed ? 'text-[#BCE029]' : 'text-zinc-400'}>
                          #{set.setNumber}
                        </span>
                        {exercise.sets.length > 1 && !set.completed && (
                          <button
                            onClick={() => handleRemoveSet(exIndex, setIndex)}
                            className="text-zinc-600 hover:text-red-400 text-[10px]"
                            title="Supprimer la série"
                          >
                            ×
                          </button>
                        )}
                      </div>

                      {/* Reps Input with +/- */}
                      <div className="col-span-4 flex items-center justify-center gap-1">
                        <button
                          onClick={() =>
                            handleSetChange(exIndex, setIndex, 'actualReps', set.actualReps - 1)
                          }
                          className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center font-bold text-xs active:scale-90"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          value={set.actualReps}
                          onChange={e =>
                            handleSetChange(
                              exIndex,
                              setIndex,
                              'actualReps',
                              parseInt(e.target.value, 10) || 0
                            )
                          }
                          className="w-10 bg-black border border-zinc-700 rounded text-center text-xs font-mono-numbers text-white py-1 focus:outline-none focus:border-[#BCE029]"
                        />
                        <button
                          onClick={() =>
                            handleSetChange(exIndex, setIndex, 'actualReps', set.actualReps + 1)
                          }
                          className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center font-bold text-xs active:scale-90"
                        >
                          +
                        </button>
                      </div>

                      {/* Weight Input with +/- */}
                      <div className="col-span-4 flex items-center justify-center gap-1">
                        <button
                          onClick={() =>
                            handleSetChange(
                              exIndex,
                              setIndex,
                              'actualWeight',
                              Math.max(0, set.actualWeight - 1)
                            )
                          }
                          className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center font-bold text-xs active:scale-90"
                        >
                          -
                        </button>
                        <input
                          type="number"
                          step="0.5"
                          value={set.actualWeight}
                          onChange={e =>
                            handleSetChange(
                              exIndex,
                              setIndex,
                              'actualWeight',
                              parseFloat(e.target.value) || 0
                            )
                          }
                          className="w-12 bg-black border border-zinc-700 rounded text-center text-xs font-mono-numbers text-white py-1 focus:outline-none focus:border-[#BCE029]"
                        />
                        <button
                          onClick={() =>
                            handleSetChange(
                              exIndex,
                              setIndex,
                              'actualWeight',
                              set.actualWeight + 1
                            )
                          }
                          className="w-6 h-6 rounded bg-zinc-800 text-zinc-300 hover:text-white flex items-center justify-center font-bold text-xs active:scale-90"
                        >
                          +
                        </button>
                      </div>

                      {/* Checkmark validation */}
                      <div className="col-span-2 text-right">
                        <button
                          onClick={() => handleToggleSet(exIndex, setIndex)}
                          className={`w-8 h-8 rounded-lg flex items-center justify-center transition active:scale-90 ${
                            set.completed
                              ? 'bg-[#BCE029] text-black font-extrabold shadow-sm shadow-[#BCE029]/40'
                              : 'bg-zinc-800 border border-zinc-700 text-zinc-500 hover:text-white'
                          }`}
                          title="Valider la série"
                        >
                          <Check className="w-4 h-4 stroke-[3]" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Add Set Button */}
              <div className="flex items-center justify-between pt-1">
                <button
                  onClick={() => handleAddSet(exIndex)}
                  className="text-xs font-semibold text-[#BCE029] hover:text-[#A8CE1E] flex items-center gap-1 active:scale-95 transition"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter une série</span>
                </button>

                <span className="text-[11px] text-zinc-500 font-mono-numbers">
                  Tonnage : {Math.round(
                    exercise.sets.reduce(
                      (acc, s) => acc + (s.completed ? s.actualReps * s.actualWeight : 0),
                      0
                    )
                  )}{' '}
                  kg
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Bottom Sticky Action Buttons */}
      <div className="pt-2 flex items-center gap-2">
        <button
          onClick={() => setIsValidationModalOpen(true)}
          className="flex-1 h-12 rounded-xl bg-gradient-to-r from-[#BCE029] to-[#9BC416] hover:from-[#CEFA1C] hover:to-[#A8CE1E] text-black font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#BCE029]/25 active:scale-[0.98] transition cursor-pointer"
        >
          <Check className="w-4 h-4 stroke-[3]" />
          <span>Valider la séance ({Math.round(liveTonnage)} kg)</span>
        </button>

        <button
          onClick={() => setIsCancelModalOpen(true)}
          className="h-12 px-4 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-red-400 text-xs font-medium active:scale-95 transition"
        >
          Annuler
        </button>
      </div>

      {/* In-app Validation Modal */}
      <WorkoutValidationModal
        isOpen={isValidationModalOpen}
        day={day}
        sessionName={sessionName}
        durationSeconds={elapsedSeconds}
        totalTonnage={liveTonnage}
        totalReps={totalRepsCount}
        completedSets={completedSetsCount}
        totalSets={totalSetsCount}
        onConfirm={handleConfirmFinishSession}
        onCancel={() => setIsValidationModalOpen(false)}
      />

      {/* In-app Cancel Modal (No window.confirm!) */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151515] border border-zinc-800 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">Abandonner la séance ?</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Les séries effectuées lors de cette séance ne seront pas enregistrées dans votre historique.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white font-medium text-xs active:scale-95 transition"
              >
                Continuer la séance
              </button>
              <button
                onClick={() => {
                  setIsCancelModalOpen(false);
                  onCancelSession();
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-950/60 border border-red-900 text-red-400 hover:text-red-300 font-bold text-xs active:scale-95 transition"
              >
                Abandonner
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

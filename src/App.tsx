import React, { useState, useEffect } from 'react';
import { Dumbbell, Flame, Play, Calendar, FileSpreadsheet, Plus, Download, CheckCircle2 } from 'lucide-react';
import { ExerciseTemplate, ActiveExerciseItem, WorkoutSessionLog } from './types/fitness';
import {
  getStoredExercises,
  saveStoredExercises,
  resetStoredExercises,
  getWorkoutHistory,
  addSessionToHistory,
  deleteSessionFromHistory,
  saveWorkoutHistory,
  calculateWeeklyTonnage,
  getSavedActiveSession,
  saveActiveSession,
  clearActiveSession,
} from './utils/storage';
import { soundService } from './utils/audio';
import { buildStandaloneHtml } from './utils/generateStandaloneHtml';
import { Header } from './components/Header';
import { WorkoutProgramView } from './components/WorkoutProgramView';
import { ActiveWorkoutView } from './components/ActiveWorkoutView';
import { HistoryAndStatsView } from './components/HistoryAndStatsView';
import { GoogleSheetsModal } from './components/GoogleSheetsModal';
import { AddExerciseModal } from './components/AddExerciseModal';

type NavTab = 'program' | 'active' | 'history';

export default function App() {
  const [currentTab, setCurrentTab] = useState<NavTab>('program');
  const [exercises, setExercises] = useState<ExerciseTemplate[]>([]);
  const [history, setHistory] = useState<WorkoutSessionLog[]>([]);
  const [isMuted, setIsMuted] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Active workout state
  const [activeSession, setActiveSession] = useState<{
    day: string;
    sessionName: string;
    startedAt: number;
    elapsedSeconds: number;
    exercises: ActiveExerciseItem[];
  } | null>(null);

  // Modals
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [addModalDefaults, setAddModalDefaults] = useState<{ day?: string; session?: string }>({});

  // Show auto-dismissing toast
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 3800);
  };

  // Initial load
  useEffect(() => {
    const loadedEx = getStoredExercises();
    setExercises(loadedEx);

    const loadedHist = getWorkoutHistory();
    setHistory(loadedHist);

    setIsMuted(soundService.getMuted());

    // Restore any existing in-progress workout
    const savedActive = getSavedActiveSession();
    if (savedActive && savedActive.exercises && savedActive.exercises.length > 0) {
      setActiveSession(savedActive);
    }
  }, []);

  // Sync active session to localStorage
  useEffect(() => {
    if (activeSession) {
      saveActiveSession(activeSession);
    }
  }, [activeSession]);

  const weeklyTonnage = calculateWeeklyTonnage(history);

  // Sound toggle
  const handleToggleMute = () => {
    const next = !isMuted;
    setIsMuted(next);
    soundService.setMuted(next);
  };

  // Start a new workout
  const handleStartSession = (day: string, sessionName: string) => {
    const dayExercises = exercises.filter(e => e.day === day);
    if (dayExercises.length === 0) {
      showToast('Aucun exercice trouvé pour cette séance.');
      return;
    }

    const newActiveExercises: ActiveExerciseItem[] = dayExercises.map(t => {
      const setsCount = t.sets || 4;
      const defaultWeight = t.defaultWeight || 10;
      let targetRepsNum = 10;
      const matchReps = (t.reps || '').match(/\d+/);
      if (matchReps) targetRepsNum = parseInt(matchReps[0], 10);

      return {
        id: `active_ex_${Math.random().toString(36).slice(2, 8)}`,
        templateId: t.id,
        name: t.name,
        muscleGroup: t.muscleGroup,
        track: t.track,
        targetReps: t.reps,
        targetLoad: t.load,
        targetRir: t.rir,
        restSeconds: t.restSeconds || 90,
        sets: Array.from({ length: setsCount }, (_, i) => ({
          id: `set_${i + 1}_${Date.now()}`,
          setNumber: i + 1,
          targetReps: t.reps,
          targetWeight: defaultWeight,
          actualReps: targetRepsNum,
          actualWeight: defaultWeight,
          completed: false,
        })),
      };
    });

    const sessionData = {
      day,
      sessionName,
      startedAt: Date.now(),
      elapsedSeconds: 0,
      exercises: newActiveExercises,
    };

    setActiveSession(sessionData);
    saveActiveSession(sessionData);
    setCurrentTab('active');
    showToast(`Séance ${sessionName} démarrée ! Bon entraînement 💪`);
  };

  // Update active exercises while in workout
  const handleUpdateActiveExercises = (updated: ActiveExerciseItem[]) => {
    if (!activeSession) return;
    setActiveSession(prev => (prev ? { ...prev, exercises: updated } : null));
  };

  // Finish active workout
  const handleFinishSession = (sessionLog: WorkoutSessionLog) => {
    const updatedHistory = addSessionToHistory(sessionLog);
    setHistory(updatedHistory);
    setActiveSession(null);
    clearActiveSession();
    setCurrentTab('history');
    showToast(
      `🎉 Séance validée ! +${Math.round(sessionLog.totalTonnage).toLocaleString(
        'fr-FR'
      )} kg enregistrés`
    );
  };

  // Cancel workout
  const handleCancelSession = () => {
    setActiveSession(null);
    clearActiveSession();
    setCurrentTab('program');
    showToast('Séance annulée.');
  };

  // Exercise management in Program view
  const handleMoveExercise = (id: string, direction: -1 | 1) => {
    const idx = exercises.findIndex(e => e.id === id);
    if (idx < 0) return;
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= exercises.length) return;

    const copy = [...exercises];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;

    setExercises(copy);
    saveStoredExercises(copy);
  };

  const handleDeleteExercise = (id: string) => {
    const updated = exercises.filter(e => e.id !== id);
    setExercises(updated);
    saveStoredExercises(updated);
    showToast('Exercice supprimé.');
  };

  const handleAddExercise = (newEx: ExerciseTemplate) => {
    const updated = [...exercises, newEx];
    setExercises(updated);
    saveStoredExercises(updated);
    showToast(`Exercice "${newEx.name}" ajouté avec succès !`);
  };

  // Update single exercise
  const handleUpdateExercise = (updatedEx: ExerciseTemplate) => {
    const updated = exercises.map(e => (e.id === updatedEx.id ? updatedEx : e));
    setExercises(updated);
    saveStoredExercises(updated);
    showToast(`Exercice "${updatedEx.name}" mis à jour !`);
  };

  // Update full session group (rename session, reorder or delete within day)
  const handleUpdateSessionGroup = (
    day: string,
    newSessionName: string,
    updatedDayExercises: ExerciseTemplate[]
  ) => {
    // Keep exercises for other days, replace exercises for this day
    const otherExercises = exercises.filter(e => e.day !== day);
    const updated = [...otherExercises, ...updatedDayExercises];
    setExercises(updated);
    saveStoredExercises(updated);
    showToast(`Séance "${newSessionName}" mise à jour !`);
  };

  // Standalone HTML Download
  const handleDownloadStandalone = () => {
    const standaloneHtml = buildStandaloneHtml(exercises);
    const blob = new Blob([standaloneHtml], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'TitanFit-Standalone.html';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast('Fichier HTML autonome téléchargé !');
  };

  return (
    <div className="bg-[#0D0D0D] text-zinc-100 min-h-screen flex flex-col justify-between selection:bg-[#BCE029] selection:text-black">
      {/* Top Header */}
      <Header
        weeklyTonnage={weeklyTonnage}
        isMuted={isMuted}
        onToggleMute={handleToggleMute}
        onOpenSheetsModal={() => setIsSheetsModalOpen(true)}
        onDownloadStandalone={handleDownloadStandalone}
      />

      {/* Floating Toast Notification */}
      {toastMessage && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 max-w-sm w-[90%] bg-[#1c1c1c] border-2 border-[#BCE029]/70 text-white px-4 py-2.5 rounded-2xl shadow-2xl shadow-[#BCE029]/20 flex items-center gap-2.5 animate-in fade-in slide-in-from-top-2 duration-200">
          <CheckCircle2 className="w-4 h-4 text-[#BCE029] shrink-0" />
          <span className="text-xs font-bold leading-snug">{toastMessage}</span>
        </div>
      )}

      {/* Main Content Viewport (Mobile-first max-w-md centered) */}
      <main className="flex-1 w-full max-w-md mx-auto px-4 py-4 pb-28">
        {currentTab === 'program' && (
          <WorkoutProgramView
            exercises={exercises}
            onStartSession={handleStartSession}
            onMoveExercise={handleMoveExercise}
            onDeleteExercise={handleDeleteExercise}
            onUpdateExercise={handleUpdateExercise}
            onUpdateSessionGroup={handleUpdateSessionGroup}
            onOpenAddModal={(d, s) => {
              setAddModalDefaults({ day: d, session: s });
              setIsAddModalOpen(true);
            }}
          />
        )}

        {currentTab === 'active' &&
          (activeSession ? (
            <ActiveWorkoutView
              day={activeSession.day}
              sessionName={activeSession.sessionName}
              exercises={activeSession.exercises}
              startedAt={activeSession.startedAt}
              initialElapsedSeconds={activeSession.elapsedSeconds}
              onUpdateExercises={handleUpdateActiveExercises}
              onFinishSession={handleFinishSession}
              onCancelSession={handleCancelSession}
            />
          ) : (
            <div className="text-center py-16 bg-[#151515] border border-zinc-800 rounded-3xl p-6 space-y-3.5 shadow-xl">
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF6D00]/20 to-[#BCE029]/20 border border-[#BCE029]/40 flex items-center justify-center text-[#BCE029] mx-auto">
                <Dumbbell className="w-7 h-7" />
              </div>
              <h3 className="text-base font-extrabold text-white">Aucune séance en cours</h3>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto leading-relaxed">
                Choisissez une séance dans l'onglet Programmes pour lancer le chronomètre, le minuteur de repos et le calcul automatique du tonnage.
              </p>
              <button
                onClick={() => setCurrentTab('program')}
                className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#BCE029] to-[#9BC416] text-black font-extrabold text-xs shadow-lg shadow-[#BCE029]/25 transition active:scale-95"
              >
                Choisir une séance
              </button>
            </div>
          ))}

        {currentTab === 'history' && (
          <HistoryAndStatsView
            history={history}
            onDeleteSession={id => {
              const updated = deleteSessionFromHistory(id);
              setHistory(updated);
              showToast('Séance supprimée de l\'historique.');
            }}
            onClearHistory={() => {
              saveWorkoutHistory([]);
              setHistory([]);
              showToast('Historique effacé.');
            }}
          />
        )}
      </main>

      {/* Fixed Bottom Navigation (Thumb Zone Ergonomics, Hitbox >= 44px) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-[#0D0D0D]/95 backdrop-blur-md border-t border-zinc-800/80 pb-safe">
        <div className="max-w-md mx-auto grid grid-cols-3 h-16 items-center px-4">
          {/* Tab 1: Programmes */}
          <button
            onClick={() => setCurrentTab('program')}
            className={`flex flex-col items-center justify-center min-h-[44px] transition active:scale-95 ${
              currentTab === 'program' ? 'text-[#BCE029] font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Calendar className="w-5 h-5 mb-1" />
            <span className="text-[11px]">Programmes</span>
          </button>

          {/* Tab 2: En Séance */}
          <button
            onClick={() => setCurrentTab('active')}
            className={`relative flex flex-col items-center justify-center min-h-[44px] transition active:scale-95 ${
              currentTab === 'active' ? 'text-[#BCE029] font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            {activeSession && (
              <span className="absolute top-2 right-8 w-2 h-2 rounded-full bg-[#FF6D00] animate-ping" />
            )}
            <Play className="w-5 h-5 mb-1" />
            <span className="text-[11px]">En Séance</span>
          </button>

          {/* Tab 3: Tonnage & Stats */}
          <button
            onClick={() => setCurrentTab('history')}
            className={`flex flex-col items-center justify-center min-h-[44px] transition active:scale-95 ${
              currentTab === 'history' ? 'text-[#BCE029] font-bold' : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            <Flame className="w-5 h-5 mb-1 text-[#FF6D00]" />
            <span className="text-[11px]">Tonnage & Log</span>
          </button>
        </div>
      </nav>

      {/* Google Sheets Modal */}
      <GoogleSheetsModal
        isOpen={isSheetsModalOpen}
        exercises={exercises}
        onClose={() => setIsSheetsModalOpen(false)}
        onImportExercises={imported => {
          setExercises(imported);
          saveStoredExercises(imported);
          showToast(`${imported.length} exercices importés !`);
        }}
        onResetDefault={() => {
          const reset = resetStoredExercises();
          setExercises(reset);
          showToast('Programme réinitialisé par défaut.');
        }}
        onDownloadStandalone={handleDownloadStandalone}
      />

      {/* Add Exercise Modal */}
      <AddExerciseModal
        isOpen={isAddModalOpen}
        defaultDay={addModalDefaults.day}
        defaultSession={addModalDefaults.session}
        onClose={() => setIsAddModalOpen(false)}
        onAddExercise={handleAddExercise}
      />
    </div>
  );
}

import React, { useState } from 'react';
import { Calendar, Clock, Dumbbell, Flame, TrendingUp, Download, Trash2, ChevronDown, ChevronUp, AlertTriangle } from 'lucide-react';
import { WorkoutSessionLog } from '../types/fitness';
import { calculateWeeklyTonnage } from '../utils/storage';
import { ProgressChart } from './ProgressChart';

interface HistoryAndStatsViewProps {
  history: WorkoutSessionLog[];
  onDeleteSession: (id: string) => void;
  onClearHistory: () => void;
}

export const HistoryAndStatsView: React.FC<HistoryAndStatsViewProps> = ({
  history,
  onDeleteSession,
  onClearHistory,
}) => {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [isClearModalOpen, setIsClearModalOpen] = useState(false);
  const [deleteSessionId, setDeleteSessionId] = useState<string | null>(null);

  const weeklyTonnage = calculateWeeklyTonnage(history);
  const totalWorkouts = history.length;
  const allTimeTonnage = history.reduce((acc, log) => acc + (log.totalTonnage || 0), 0);
  const totalSets = history.reduce((acc, log) => acc + (log.totalSets || 0), 0);
  const totalReps = history.reduce((acc, log) => acc + (log.totalReps || 0), 0);

  const toggleExpand = (id: string) => {
    setExpandedLogId(prev => (prev === id ? null : id));
  };

  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(history, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'titanfit_historique.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  return (
    <div className="space-y-4">
      {/* Top Stats Overview Card */}
      <div className="bg-[#151515] border border-zinc-800 rounded-2xl p-4 space-y-3 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold text-white flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-[#BCE029]" />
            <span>Statistiques & Tonnage</span>
          </h2>
          <span className="text-xs text-zinc-400 font-medium">Suivi Musculation</span>
        </div>

        {/* 2x2 Grid of Key Metrics */}
        <div className="grid grid-cols-2 gap-2.5">
          {/* Weekly Tonnage Card */}
          <div className="bg-black/60 border border-zinc-800/80 rounded-xl p-3">
            <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-bold">
              <span>CUMUL SEMAINE</span>
              <Flame className="w-3.5 h-3.5 text-[#BCE029]" />
            </div>
            <div className="text-xl font-mono-numbers font-black text-[#BCE029] mt-0.5">
              {Math.round(weeklyTonnage).toLocaleString('fr-FR')}{' '}
              <span className="text-xs font-sans font-normal text-zinc-400">kg</span>
            </div>
            <p className="text-[10px] text-zinc-500 mt-0.5">Glissant sur 7 jours</p>
          </div>

          {/* Workouts count */}
          <div className="bg-black/60 border border-zinc-800/80 rounded-xl p-3">
            <div className="flex items-center justify-between text-zinc-400 text-[10px] uppercase font-bold">
              <span>SÉANCES FAITES</span>
              <Dumbbell className="w-3.5 h-3.5 text-[#FF6D00]" />
            </div>
            <div className="text-xl font-mono-numbers font-black text-white mt-0.5">
              {totalWorkouts}
            </div>
            <p className="text-[10px] text-zinc-500 mt-0.5">
              {totalSets} séries · {totalReps} reps
            </p>
          </div>

          {/* All-time volume */}
          <div className="col-span-2 bg-black/60 border border-zinc-800/80 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-zinc-400 uppercase font-bold block">
                TONNAGE TOTAL HISTORIQUE
              </span>
              <div className="text-lg font-mono-numbers font-black text-white mt-0.5">
                {Math.round(allTimeTonnage).toLocaleString('fr-FR')}{' '}
                <span className="text-xs font-sans font-normal text-zinc-400">kg soulevés</span>
              </div>
            </div>

            <button
              onClick={handleExportJSON}
              className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-xs text-zinc-300 hover:text-white font-medium flex items-center gap-1.5 transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export JSON</span>
            </button>
          </div>
        </div>
      </div>

      {/* Progress Chart: Tonnage & Repetitions Evolution */}
      <ProgressChart history={history} />

      {/* History Log List */}
      <div className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-zinc-400" />
            <span>Historique des Séances</span>
          </h3>

          {history.length > 0 && (
            <button
              onClick={() => setIsClearModalOpen(true)}
              className="text-xs text-red-400 hover:text-red-300 font-medium transition"
            >
              Tout effacer
            </button>
          )}
        </div>

        {history.length === 0 ? (
          <div className="bg-[#151515] border border-zinc-800 rounded-2xl p-8 text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-500 mx-auto">
              <Dumbbell className="w-6 h-6 text-[#BCE029]" />
            </div>
            <h4 className="text-sm font-bold text-white">Aucune séance enregistrée</h4>
            <p className="text-xs text-zinc-400 max-w-xs mx-auto">
              Terminez votre première séance dans l'onglet "En Séance" pour voir votre évolution de tonnage et de répétitions se construire.
            </p>
          </div>
        ) : (
          history.map(log => {
            const isExpanded = expandedLogId === log.id;
            const formattedDate = new Date(log.finishedAt).toLocaleDateString('fr-FR', {
              weekday: 'short',
              day: 'numeric',
              month: 'short',
              hour: '2-digit',
              minute: '2-digit',
            });
            const minutes = Math.round(log.durationSeconds / 60);

            return (
              <div
                key={log.id}
                className="bg-[#151515] border border-zinc-800 rounded-2xl p-3.5 space-y-2.5 transition-colors hover:border-zinc-700"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-black text-[#BCE029] uppercase">
                        {log.day}
                      </span>
                      <span className="text-zinc-600">·</span>
                      <span className="text-xs font-bold text-white">{log.sessionName}</span>
                    </div>
                    <span className="text-[11px] text-zinc-400 block mt-0.5">
                      {formattedDate}
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => toggleExpand(log.id)}
                      className="text-xs text-zinc-400 hover:text-white p-1 rounded-md"
                    >
                      {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => setDeleteSessionId(log.id)}
                      className="text-zinc-600 hover:text-red-400 p-1 rounded-md"
                      title="Supprimer la séance"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Metrics bar */}
                <div className="grid grid-cols-3 gap-2 bg-black/40 p-2 rounded-xl text-center font-mono-numbers">
                  <div>
                    <span className="text-[9px] text-zinc-400 block font-sans">TONNAGE</span>
                    <span className="text-xs font-bold text-[#BCE029]">
                      {Math.round(log.totalTonnage).toLocaleString('fr-FR')} kg
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-400 block font-sans">RÉPÉTITIONS</span>
                    <span className="text-xs font-bold text-[#FF6D00]">
                      {log.totalReps || 0} réps
                    </span>
                  </div>
                  <div>
                    <span className="text-[9px] text-zinc-400 block font-sans">SÉRIES</span>
                    <span className="text-xs font-medium text-zinc-200">{log.totalSets}</span>
                  </div>
                </div>

                {/* Notes if any */}
                {log.notes && (
                  <div className="text-[11px] text-zinc-400 italic bg-black/20 px-2.5 py-1.5 rounded-lg border border-zinc-800/40">
                    "{log.notes}"
                  </div>
                )}

                {/* Expanded exercise details */}
                {isExpanded && log.exercises && (
                  <div className="pt-2 border-t border-zinc-800 space-y-2 text-xs">
                    {log.exercises.map((ex, i) => (
                      <div key={i} className="bg-black/30 p-2 rounded-lg">
                        <div className="font-semibold text-zinc-200">{ex.name}</div>
                        <div className="text-[11px] text-zinc-400 flex flex-wrap gap-2 mt-1">
                          {ex.completedSets.map((s, si) => (
                            <span
                              key={si}
                              className="bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded font-mono-numbers"
                            >
                              S{si + 1}: {s.reps} × {s.weight}kg
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Delete Single Session Modal */}
      {deleteSessionId && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151515] border border-zinc-800 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <h3 className="text-sm font-bold text-white">Supprimer cette séance ?</h3>
            <p className="text-xs text-zinc-400">
              Cette séance sera retirée définitivement de votre historique et des graphiques.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setDeleteSessionId(null)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white font-medium text-xs active:scale-95 transition"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  onDeleteSession(deleteSessionId);
                  setDeleteSessionId(null);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-950/60 border border-red-900 text-red-400 hover:text-red-300 font-bold text-xs active:scale-95 transition"
              >
                Supprimer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Clear All History Modal */}
      {isClearModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#151515] border border-red-900/40 rounded-2xl w-full max-w-sm p-5 space-y-4 shadow-2xl">
            <div className="flex items-center gap-2 text-red-400 font-bold text-sm">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              <span>Effacer tout l'historique ?</span>
            </div>
            <p className="text-xs text-zinc-400 leading-relaxed">
              Toutes vos séances enregistrées seront définitivement effacées du stockage local. Cette action est irréversible.
            </p>
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => setIsClearModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-zinc-800 text-zinc-300 hover:text-white font-medium text-xs active:scale-95 transition"
              >
                Annuler
              </button>
              <button
                onClick={() => {
                  onClearHistory();
                  setIsClearModalOpen(false);
                }}
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs active:scale-95 transition"
              >
                Confirmer l'effacement
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

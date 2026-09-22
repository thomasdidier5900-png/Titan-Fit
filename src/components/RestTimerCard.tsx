import React, { useEffect, useState, useRef } from 'react';
import { Play, Pause, FastForward, Bell, VolumeX, Plus, Minus, Check } from 'lucide-react';
import { soundService } from '../utils/audio';

interface RestTimerCardProps {
  initialSeconds: number;
  exerciseName?: string;
  onFinish?: () => void;
  onClose: () => void;
  compact?: boolean;
}

export const RestTimerCard: React.FC<RestTimerCardProps> = ({
  initialSeconds,
  exerciseName = '',
  onFinish,
  onClose,
  compact = false,
}) => {
  const [totalSeconds, setTotalSeconds] = useState(initialSeconds || 90);
  const [remainingSeconds, setRemainingSeconds] = useState(initialSeconds || 90);
  const [isPaused, setIsPaused] = useState(false);
  const [isAlarmActive, setIsAlarmActive] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const alarmTimeoutRef = useRef<number | null>(null);

  // Sync if initialSeconds changes
  useEffect(() => {
    setTotalSeconds(initialSeconds);
    setRemainingSeconds(initialSeconds);
    setIsPaused(false);
    setIsCompleted(false);
    stopAlarm();
  }, [initialSeconds]);

  // Main countdown timer interval
  useEffect(() => {
    if (isPaused || remainingSeconds <= 0) return;

    const timer = setInterval(() => {
      setRemainingSeconds(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          triggerAlarm();
          return 0;
        }

        // Countdown warning beeps at 3s, 2s, 1s
        if (prev <= 4 && prev > 1) {
          soundService.playCountdownTick();
        }

        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isPaused, remainingSeconds]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopAlarm();
    };
  }, []);

  // Alarm sound trigger: rings for exactly 2 seconds
  const triggerAlarm = () => {
    setIsAlarmActive(true);
    setIsCompleted(true);
    soundService.playRestAlarm(2.0); // 2-second ringing

    if (alarmTimeoutRef.current) clearTimeout(alarmTimeoutRef.current);
    // After 2 seconds, stop active alarm visual state
    alarmTimeoutRef.current = window.setTimeout(() => {
      setIsAlarmActive(false);
    }, 2000);

    if (onFinish) onFinish();
  };

  const stopAlarm = () => {
    setIsAlarmActive(false);
    soundService.stopAlarmSound();
    if (alarmTimeoutRef.current) {
      clearTimeout(alarmTimeoutRef.current);
      alarmTimeoutRef.current = null;
    }
  };

  const handleAdjust = (delta: number) => {
    stopAlarm();
    setIsCompleted(false);
    setRemainingSeconds(prev => {
      const next = Math.max(0, prev + delta);
      setTotalSeconds(t => Math.max(t, next));
      return next;
    });
  };

  const handleDismissAlarm = () => {
    stopAlarm();
    onClose();
  };

  const minutes = Math.floor(remainingSeconds / 60);
  const seconds = remainingSeconds % 60;
  const progressPercent = Math.max(0, Math.min(100, (remainingSeconds / (totalSeconds || 1)) * 100));

  return (
    <div
      className={`relative bg-[#181818] border-2 rounded-2xl p-3.5 shadow-2xl transition-all duration-300 ${
        isAlarmActive
          ? 'border-[#FF6D00] shadow-[#FF6D00]/50 animate-pulse bg-gradient-to-b from-[#FF6D00]/20 to-[#181818]'
          : isCompleted
          ? 'border-[#BCE029]/60 shadow-black/80'
          : 'border-[#FF6D00]/60 shadow-black/80'
      }`}
    >
      {/* Top status indicator */}
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <span
            className={`w-2.5 h-2.5 rounded-full ${
              isAlarmActive
                ? 'bg-[#FF6D00] animate-ping'
                : isCompleted
                ? 'bg-[#BCE029]'
                : isPaused
                ? 'bg-zinc-500'
                : 'bg-[#FF6D00]'
            }`}
          />
          <span
            className={`text-xs font-black uppercase tracking-wider ${
              isAlarmActive || (!isCompleted && !isPaused) ? 'text-[#FF6D00]' : isCompleted ? 'text-[#BCE029]' : 'text-zinc-400'
            }`}
          >
            {isAlarmActive
              ? 'Repos Terminé ! (Sonnerie 2s)'
              : isCompleted
              ? 'Repos Terminé'
              : isPaused
              ? 'Repos en Pause'
              : 'Temps de Repos'}
          </span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="text-[11px] font-mono-numbers text-zinc-400">
            Cible : {totalSeconds}s
          </span>
          <button
            onClick={() => {
              stopAlarm();
              onClose();
            }}
            className="w-5 h-5 rounded-md bg-zinc-800 text-zinc-400 hover:text-white flex items-center justify-center text-xs ml-1"
            title="Fermer le minuteur"
          >
            ×
          </button>
        </div>
      </div>

      {/* Big Countdown Number */}
      <div className="py-1 text-center">
        <div
          className={`text-4xl font-mono-numbers font-black tracking-wider transition-colors ${
            isAlarmActive
              ? 'text-[#FF6D00] scale-105 transition-transform'
              : isCompleted
              ? 'text-[#BCE029]'
              : remainingSeconds <= 5
              ? 'text-[#FF9100]'
              : 'text-white'
          }`}
        >
          {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}
        </div>
        {exerciseName && (
          <p className="text-[11px] text-zinc-400 mt-0.5 truncate max-w-xs mx-auto">
            Série terminée : <span className="text-zinc-200 font-semibold">{exerciseName}</span>
          </p>
        )}
      </div>

      {/* Progress Bar */}
      <div className="w-full bg-zinc-800 rounded-full h-2 my-2.5 overflow-hidden">
        <div
          className={`h-full transition-all duration-300 ${
            isCompleted
              ? 'bg-[#BCE029]'
              : 'bg-gradient-to-r from-[#FFA000] via-[#FF6D00] to-[#E65100]'
          }`}
          style={{ width: `${progressPercent}%` }}
        />
      </div>

      {/* Controls: -15s, Pause/Play, +15s, Skip */}
      <div className="grid grid-cols-4 gap-2">
        <button
          onClick={() => handleAdjust(-15)}
          className="py-1.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-white font-mono-numbers text-xs font-bold active:scale-95 transition"
        >
          -15s
        </button>

        <button
          onClick={() => setIsPaused(p => !p)}
          disabled={remainingSeconds <= 0}
          className="py-1.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 disabled:opacity-40 text-white text-xs font-semibold flex items-center justify-center gap-1 active:scale-95 transition"
        >
          {isPaused ? <Play className="w-3.5 h-3.5 fill-white" /> : <Pause className="w-3.5 h-3.5 fill-white" />}
          <span>{isPaused ? 'Go' : 'Pause'}</span>
        </button>

        <button
          onClick={() => handleAdjust(15)}
          className="py-1.5 rounded-xl bg-zinc-800/90 hover:bg-zinc-700 text-white font-mono-numbers text-xs font-bold active:scale-95 transition"
        >
          +15s
        </button>

        <button
          onClick={() => {
            stopAlarm();
            onClose();
          }}
          className="py-1.5 rounded-xl bg-[#FF6D00]/20 border border-[#FF6D00]/40 text-[#FF6D00] text-xs font-bold flex items-center justify-center gap-1 hover:bg-[#FF6D00]/30 active:scale-95 transition"
        >
          <FastForward className="w-3.5 h-3.5" />
          <span>Passer</span>
        </button>
      </div>

      {/* 2-Second Active Alarm Notification Banner */}
      {isAlarmActive && (
        <div className="mt-3 pt-2.5 border-t border-zinc-800 flex items-center justify-between animate-in fade-in duration-150">
          <div className="flex items-center gap-1.5 text-xs font-extrabold text-[#FF6D00]">
            <Bell className="w-4 h-4 animate-bounce" />
            <span>À VOUS DE JOUER ! (2s)</span>
          </div>
          <button
            onClick={handleDismissAlarm}
            className="px-3 py-1.5 rounded-lg bg-[#FF6D00] hover:bg-[#E65100] text-black font-extrabold text-xs shadow-lg shadow-[#FF6D00]/50 active:scale-95 transition"
          >
            Fermer
          </button>
        </div>
      )}
    </div>
  );
};

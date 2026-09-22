import { ExerciseTemplate } from '../types/fitness';
import { exportExercisesToCSV } from '../data/defaultProgram';

export function buildStandaloneHtml(currentExercises: ExerciseTemplate[]): string {
  const jsonDatabase = JSON.stringify(currentExercises, null, 2);
  const csvData = exportExercisesToCSV(currentExercises);

  return `<!DOCTYPE html>
<html lang="fr" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover">
  <title>TitanFit - Musculation & Minuteur</title>
  <meta name="theme-color" content="#0D0D0D">
  <meta name="description" content="Application fitness mobile autonome avec minuteur de repos, alarme Web Audio, suivi de tonnage et synchronisation Google Sheets.">
  
  <!-- Tailwind CSS via CDN -->
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            darkBg: '#0D0D0D',
            darkCard: '#151515',
            darkBorder: '#262626',
            neonGreen: '#BCE029',
            neonGreenHover: '#A8CE1E',
            vividOrange: '#FF6D00',
            vividOrangeHover: '#E65100',
            lightGreen: '#CEFA1C'
          }
        }
      }
    }
  </script>

  <style>
    @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;700&display=swap');
    
    body {
      background-color: #0D0D0D;
      color: #F3F4F6;
      font-family: 'Plus Jakarta Sans', system-ui, -apple-system, sans-serif;
      -webkit-font-smoothing: antialiased;
      -webkit-tap-highlight-color: transparent;
      user-select: none;
    }
    
    input, textarea {
      user-select: text;
    }

    .font-mono-num {
      font-family: 'JetBrains Mono', monospace;
      font-variant-numeric: tabular-nums;
    }

    /* Pulse animation for alarm */
    @keyframes alarmPulse {
      0%, 100% { transform: scale(1); box-shadow: 0 0 0 0 rgba(255, 109, 0, 0.7); }
      50% { transform: scale(1.02); box-shadow: 0 0 35px 12px rgba(255, 109, 0, 0.9); }
    }
    .animate-alarm {
      animation: alarmPulse 0.8s infinite;
    }

    /* Safe bottom padding for mobile touch devices */
    .pb-safe {
      padding-bottom: env(safe-area-inset-bottom, 20px);
    }
  </style>
</head>
<body class="bg-darkBg text-gray-100 min-h-screen flex flex-col justify-between selection:bg-neonGreen selection:text-black">

  <!-- TOP HEADER -->
  <header class="sticky top-0 z-40 bg-[#0D0D0D]/95 backdrop-blur-md border-b border-darkBorder px-4 py-3 flex items-center justify-between">
    <div class="flex items-center gap-2.5">
      <div class="w-8 h-8 rounded-lg bg-neonGreen/15 border border-neonGreen/40 flex items-center justify-center text-neonGreen font-extrabold text-base">
        ⚡
      </div>
      <div>
        <h1 class="text-base font-extrabold tracking-tight text-white flex items-center gap-1.5">
          TITAN<span class="text-neonGreen">FIT</span>
        </h1>
        <p class="text-[11px] text-gray-400 font-medium">Musculation & Tonnage</p>
      </div>
    </div>

    <!-- Quick Stats & Sound Action -->
    <div class="flex items-center gap-2">
      <div id="headerWeeklyBadge" class="bg-zinc-900 border border-zinc-800 rounded-lg px-2.5 py-1 text-right">
        <span class="text-[9px] text-gray-400 block leading-tight font-medium">7 JOURS</span>
        <span id="headerWeeklyTonnage" class="text-xs font-mono-num font-bold text-neonGreen">0 kg</span>
      </div>

      <button id="btnSoundToggle" onclick="toggleMute()" class="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-gray-300 hover:text-white transition active:scale-95" title="Activer / Couper le son">
        <span id="soundIcon">🔊</span>
      </button>

      <button onclick="openSheetsModal()" class="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-gray-300 hover:text-neonGreen transition active:scale-95" title="Synchroniser Google Sheets">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 7v10c0 2 1.5 3 3.5 3h9c2 0 3.5-1 3.5-3V7c0-2-1.5-3-3.5-3h-9C5.5 4 4 5 4 7zm0 5h16M9 4v16m6-16v16"/></svg>
      </button>
    </div>
  </header>

  <!-- MAIN VIEWPORT CONTAINER -->
  <main class="flex-1 w-full max-w-md mx-auto px-4 py-4 pb-28">

    <!-- VIEW: WORKOUT SELECTOR (HOME) -->
    <section id="viewSelector" class="space-y-4">
      <div class="flex items-center justify-between">
        <div>
          <h2 class="text-lg font-bold text-white">Programme de la Semaine</h2>
          <p class="text-xs text-gray-400">Issu de votre tableau Google Sheets</p>
        </div>
        <button onclick="openNewExerciseModal()" class="px-2.5 py-1.5 rounded-lg bg-neonGreen/10 border border-neonGreen/30 text-neonGreen text-xs font-semibold hover:bg-neonGreen/20 transition active:scale-95">
          + Ajouter Ex.
        </button>
      </div>

      <!-- Days List Container -->
      <div id="daysListContainer" class="space-y-3">
        <!-- Rendered via JS -->
      </div>
    </section>

    <!-- VIEW: ACTIVE WORKOUT SESSION -->
    <section id="viewActiveSession" class="hidden space-y-4">
      <!-- Session Header Bar -->
      <div class="bg-darkCard border border-darkBorder rounded-2xl p-4 space-y-3">
        <div class="flex items-center justify-between">
          <div>
            <div class="flex items-center gap-2">
              <span id="activeSessionDayBadge" class="text-[11px] font-bold text-neonGreen uppercase tracking-wider">Jour 1</span>
              <span class="text-gray-600">·</span>
              <span id="activeSessionNameBadge" class="text-sm font-extrabold text-white">PULL 1</span>
            </div>
            <p id="activeSessionCount" class="text-xs text-gray-400 mt-0.5">0 / 0 séries complétées</p>
          </div>

          <div class="text-right">
            <span class="text-[10px] text-gray-400 block font-medium">TEMPS ÉCOULÉ</span>
            <div id="sessionElapsedTimer" class="text-base font-mono-num font-bold text-neonGreen">00:00</div>
          </div>
        </div>

        <!-- Live Tonnage Counter Banner -->
        <div class="bg-black/60 rounded-xl p-3 border border-zinc-800 flex items-center justify-between">
          <div class="flex items-center gap-2">
            <div class="w-8 h-8 rounded-lg bg-vividOrange/15 border border-vividOrange/30 flex items-center justify-center text-vividOrange text-sm">
              🏋️
            </div>
            <div>
              <span class="text-[10px] text-gray-400 uppercase font-medium block">Tonnage Séance</span>
              <div id="sessionLiveTonnage" class="text-lg font-mono-num font-extrabold text-white leading-tight">
                0 <span class="text-xs text-gray-400 font-sans font-normal">kg</span>
              </div>
            </div>
          </div>

          <div class="flex items-center gap-1.5">
            <button onclick="pauseResumeSessionTimer()" id="btnSessionPause" class="px-2.5 py-1.5 rounded-lg bg-zinc-800 text-gray-200 text-xs font-medium hover:bg-zinc-700 transition active:scale-95">
              Pause
            </button>
            <button onclick="confirmFinishSession()" class="px-3 py-1.5 rounded-lg bg-neonGreen text-black text-xs font-bold hover:bg-neonGreenHover transition active:scale-95">
              Terminer
            </button>
          </div>
        </div>
      </div>

      <!-- ACTIVE REST TIMER CARD (FLOAT / DOCKED) -->
      <div id="restTimerCard" class="hidden bg-darkCard border-2 border-vividOrange/60 rounded-2xl p-4 shadow-xl shadow-vividOrange/10 transition-all">
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center gap-2">
            <span class="w-2.5 h-2.5 rounded-full bg-vividOrange animate-ping"></span>
            <span class="text-xs font-bold uppercase tracking-wider text-vividOrange">Temps de Repos</span>
          </div>
          <span id="restTargetLabel" class="text-xs text-gray-400 font-medium">Cible: 90s</span>
        </div>

        <!-- Big Countdown Display -->
        <div class="py-2 text-center">
          <div id="restCountdownDisplay" class="text-4xl font-mono-num font-black text-white tracking-wider">
            01:30
          </div>
          <p id="restExerciseContext" class="text-xs text-gray-400 mt-1 truncate">Préparez la série suivante</p>
        </div>

        <!-- Progress bar -->
        <div class="w-full bg-zinc-800 rounded-full h-2 mb-3 overflow-hidden">
          <div id="restProgressBar" class="bg-vividOrange h-full transition-all duration-300" style="width: 100%;"></div>
        </div>

        <!-- Timer Controls -->
        <div class="grid grid-cols-4 gap-2">
          <button onclick="adjustRestTimer(-15)" class="py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-mono-num text-xs font-bold active:scale-95 transition">
            -15s
          </button>
          <button id="btnRestPause" onclick="toggleRestPause()" class="py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white text-xs font-semibold active:scale-95 transition">
            Pause
          </button>
          <button onclick="adjustRestTimer(15)" class="py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-mono-num text-xs font-bold active:scale-95 transition">
            +15s
          </button>
          <button onclick="skipRestTimer()" class="py-2 rounded-xl bg-vividOrange/20 border border-vividOrange/40 text-vividOrange text-xs font-bold active:scale-95 transition">
            Passer
          </button>
        </div>

        <!-- Alarm Dismiss Banner (Visible when 00:00) -->
        <div id="alarmDismissBanner" class="hidden mt-3 pt-3 border-t border-darkBorder flex items-center justify-between">
          <span class="text-xs font-bold text-vividOrange animate-bounce">🔔 C'EST L'HEURE !</span>
          <button onclick="stopAlarmSound()" class="px-4 py-1.5 rounded-lg bg-vividOrange text-white text-xs font-extrabold active:scale-95 shadow-lg shadow-vividOrange/40">
            Couper l'Alarme
          </button>
        </div>
      </div>

      <!-- Active Exercise List Container -->
      <div id="activeExercisesContainer" class="space-y-4">
        <!-- Rendered via JS -->
      </div>
    </section>

    <!-- VIEW: STATS & HISTORIQUE -->
    <section id="viewHistory" class="hidden space-y-4">
      <div class="bg-darkCard border border-darkBorder rounded-2xl p-4">
        <h2 class="text-base font-bold text-white mb-3">Statistiques de Tonnage</h2>
        
        <div class="grid grid-cols-2 gap-3 mb-3">
          <div class="bg-black/50 border border-zinc-800 rounded-xl p-3">
            <span class="text-[10px] text-gray-400 font-medium block">CUMUL 7 JOURS</span>
            <div id="statWeeklyTonnage" class="text-xl font-mono-num font-black text-neonGreen mt-0.5">0 kg</div>
            <span class="text-[10px] text-gray-500 block mt-1">Glissant sur la semaine</span>
          </div>

          <div class="bg-black/50 border border-zinc-800 rounded-xl p-3">
            <span class="text-[10px] text-gray-400 font-medium block">SÉANCES TERMINÉES</span>
            <div id="statTotalWorkouts" class="text-xl font-mono-num font-black text-white mt-0.5">0</div>
            <span class="text-[10px] text-gray-500 block mt-1">Enregistrées en local</span>
          </div>
        </div>

        <div class="bg-black/50 border border-zinc-800 rounded-xl p-3 flex items-center justify-between">
          <div>
            <span class="text-[10px] text-gray-400 font-medium block">TONNAGE GLOBAL HISTORIQUE</span>
            <div id="statAllTimeTonnage" class="text-lg font-mono-num font-black text-white mt-0.5">0 kg</div>
          </div>
          <button onclick="exportHistoryJSON()" class="px-2.5 py-1.5 rounded-lg bg-zinc-800 text-xs text-gray-300 hover:text-white active:scale-95 transition">
            Export JSON
          </button>
        </div>
      </div>

      <div>
        <h3 class="text-sm font-bold text-white mb-2 flex items-center justify-between">
          <span>Historique des Séances</span>
          <button onclick="clearHistoryConfirm()" class="text-xs text-red-400 hover:text-red-300">Effacer</button>
        </h3>
        <div id="historyListContainer" class="space-y-2.5">
          <!-- Rendered via JS -->
        </div>
      </div>
    </section>

  </main>

  <!-- BOTTOM NAVIGATION BAR (FIXED TOUCH DOCKED) -->
  <nav class="fixed bottom-0 left-0 right-0 z-40 bg-[#0D0D0D]/95 backdrop-blur-md border-t border-darkBorder pb-safe">
    <div class="max-w-md mx-auto grid grid-cols-3 h-16 items-center px-4">
      <button id="navBtnSelector" onclick="switchTab('selector')" class="flex flex-col items-center justify-center text-neonGreen font-semibold transition active:scale-95">
        <svg class="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"/></svg>
        <span class="text-[11px]">Programmes</span>
      </button>

      <button id="navBtnActive" onclick="switchTab('active')" class="flex flex-col items-center justify-center text-gray-400 hover:text-gray-200 transition active:scale-95 relative">
        <span id="activeWorkoutDot" class="hidden absolute top-2 right-8 w-2 h-2 rounded-full bg-neonGreen animate-ping"></span>
        <svg class="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 10V3L4 14h7v7l9-11h-7z"/></svg>
        <span class="text-[11px]">En Séance</span>
      </button>

      <button id="navBtnHistory" onclick="switchTab('history')" class="flex flex-col items-center justify-center text-gray-400 hover:text-gray-200 transition active:scale-95">
        <svg class="w-5 h-5 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"/></svg>
        <span class="text-[11px]">Tonnage & Log</span>
      </button>
    </div>
  </nav>

  <!-- MODAL: GOOGLE SHEETS & SYNCHRONISATION -->
  <div id="modalSheets" class="hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-darkCard border border-darkBorder rounded-2xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto space-y-4">
      <div class="flex items-center justify-between pb-2 border-b border-darkBorder">
        <div class="flex items-center gap-2">
          <span class="text-xl">📊</span>
          <h3 class="text-base font-bold text-white">Google Sheets & Données</h3>
        </div>
        <button onclick="closeSheetsModal()" class="w-8 h-8 rounded-lg bg-zinc-800 text-gray-300 flex items-center justify-center hover:text-white">✕</button>
      </div>

      <p class="text-xs text-gray-400 leading-relaxed">
        Copiez-collez vos colonnes Google Sheets au format standard CSV :<br>
        <code class="text-[10px] text-neonGreen font-mono block mt-1 bg-black/50 p-1.5 rounded">Jour,Séance,Exercice,Groupe Musculaire,Piste Sollicitée,Séries,Répétitions,Charge / Matériel,RIR,Repos</code>
      </p>

      <div class="space-y-2">
        <label class="text-xs font-semibold text-gray-300 block">Données CSV Actuelles :</label>
        <textarea id="csvInputArea" rows="8" class="w-full bg-black/70 border border-darkBorder rounded-xl p-3 text-xs font-mono text-gray-200 focus:outline-none focus:border-neonGreen"></textarea>
      </div>

      <div class="flex flex-col gap-2">
        <button onclick="importCSVFromInput()" class="w-full py-2.5 rounded-xl bg-neonGreen text-black font-bold text-xs hover:bg-neonGreenHover active:scale-95 transition">
          📥 Appliquer / Importer le CSV
        </button>
        <div class="grid grid-cols-2 gap-2">
          <button onclick="exportCurrentCSV()" class="py-2 rounded-xl bg-zinc-800 text-white font-medium text-xs hover:bg-zinc-700 active:scale-95 transition">
            📋 Copier le CSV
          </button>
          <button onclick="resetDefaultProgram()" class="py-2 rounded-xl bg-zinc-800 text-red-400 font-medium text-xs hover:bg-zinc-700 active:scale-95 transition">
            ↺ Réinitialiser d'origine
          </button>
        </div>
        <button onclick="testAlarmSound()" class="w-full py-2 rounded-xl bg-vividOrange/20 border border-vividOrange/40 text-vividOrange font-bold text-xs hover:bg-vividOrange/30 active:scale-95 transition">
          🔊 Tester l'Alarme Web Audio API
        </button>
      </div>
    </div>
  </div>

  <!-- MODAL: AJOUTER UN NOUVEL EXERCICE -->
  <div id="modalNewExercise" class="hidden fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
    <div class="bg-darkCard border border-darkBorder rounded-2xl w-full max-w-md p-5 max-h-[90vh] overflow-y-auto space-y-3">
      <div class="flex items-center justify-between pb-2 border-b border-darkBorder">
        <h3 class="text-base font-bold text-white">Ajouter un Exercice</h3>
        <button onclick="closeNewExerciseModal()" class="w-8 h-8 rounded-lg bg-zinc-800 text-gray-300 flex items-center justify-center">✕</button>
      </div>

      <div class="space-y-3 text-xs">
        <div>
          <label class="text-gray-400 block mb-1">Jour & Séance cible</label>
          <select id="newExDaySelect" class="w-full bg-black/60 border border-darkBorder rounded-xl p-2.5 text-white">
            <option value="Jour 1|PULL 1">Jour 1 - PULL 1</option>
            <option value="Jour 2|PUSH 1">Jour 2 - PUSH 1</option>
            <option value="Jour 3|CORE 1">Jour 3 - CORE 1</option>
            <option value="Jour 4|PULL 2">Jour 4 - PULL 2</option>
            <option value="Jour 5|PUSH 2">Jour 5 - PUSH 2</option>
            <option value="Jour 6|CORE 2">Jour 6 - CORE 2</option>
          </select>
        </div>

        <div>
          <label class="text-gray-400 block mb-1">Nom de l'exercice</label>
          <input id="newExName" type="text" placeholder="Ex: Développé couché haltères" class="w-full bg-black/60 border border-darkBorder rounded-xl p-2.5 text-white">
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="text-gray-400 block mb-1">Groupe musculaire</label>
            <input id="newExMuscle" type="text" placeholder="Ex: Pectoraux" class="w-full bg-black/60 border border-darkBorder rounded-xl p-2.5 text-white">
          </div>
          <div>
            <label class="text-gray-400 block mb-1">Piste / Emphase</label>
            <input id="newExTrack" type="text" placeholder="Ex: Piste Externe" class="w-full bg-black/60 border border-darkBorder rounded-xl p-2.5 text-white">
          </div>
        </div>

        <div class="grid grid-cols-3 gap-2">
          <div>
            <label class="text-gray-400 block mb-1">Séries</label>
            <input id="newExSets" type="number" value="4" min="1" max="10" class="w-full bg-black/60 border border-darkBorder rounded-xl p-2.5 text-white text-center font-mono-num">
          </div>
          <div>
            <label class="text-gray-400 block mb-1">Répétitions</label>
            <input id="newExReps" type="text" value="10 - 12" class="w-full bg-black/60 border border-darkBorder rounded-xl p-2.5 text-white text-center">
          </div>
          <div>
            <label class="text-gray-400 block mb-1">Repos (sec)</label>
            <input id="newExRest" type="number" value="90" step="5" class="w-full bg-black/60 border border-darkBorder rounded-xl p-2.5 text-white text-center font-mono-num">
          </div>
        </div>

        <div class="grid grid-cols-2 gap-2">
          <div>
            <label class="text-gray-400 block mb-1">Charge / Matériel</label>
            <input id="newExLoad" type="text" placeholder="Ex: Haltères 12 kg" class="w-full bg-black/60 border border-darkBorder rounded-xl p-2.5 text-white">
          </div>
          <div>
            <label class="text-gray-400 block mb-1">RIR cible</label>
            <input id="newExRir" type="text" value="1 - 2" class="w-full bg-black/60 border border-darkBorder rounded-xl p-2.5 text-white text-center">
          </div>
        </div>

        <button onclick="saveNewExercise()" class="w-full py-2.5 rounded-xl bg-neonGreen text-black font-bold text-xs mt-2 hover:bg-neonGreenHover active:scale-95 transition">
          Enregistrer l'exercice
        </button>
      </div>
    </div>
  </div>

  <!-- JAVASCRIPT LOGIC -->
  <script>
    /* =========================================================================
       1. BASE DE DONNÉES PAR DÉFAUT (STRUCTURE ISSUE DU GOOGLE SHEETS)
       Cette variable JSON est facilement remplaçable ou synchronisable.
       ========================================================================= */
    const DEFAULT_EXERCISES_DATABASE = ${jsonDatabase};

    // Clés LocalStorage
    const STORAGE_KEYS = {
      EXERCISES: 'titanfit_exercises_v1',
      HISTORY: 'titanfit_history_v1',
      ACTIVE: 'titanfit_active_session_v1',
      MUTED: 'titanfit_muted_v1'
    };

    // État global de l'application
    let appState = {
      exercises: [],
      history: [],
      currentTab: 'selector', // 'selector' | 'active' | 'history'
      activeSession: null,
      isMuted: false,
      
      // Minuteur de repos
      restTimer: {
        active: false,
        paused: false,
        totalSeconds: 90,
        remainingSeconds: 90,
        intervalId: null,
        exerciseName: '',
        alarmActive: false
      },

      // Chronomètre global
      sessionTimer: {
        intervalId: null,
        elapsedSeconds: 0,
        paused: false
      }
    };

    /* =========================================================================
       2. MOTEUR AUDIO WEB AUDIO API (ALARME RETENTISSANTE ET BIP DE REPOS)
       ========================================================================= */
    let audioCtx = null;
    let alarmIntervalId = null;

    function getAudioContext() {
      if (!audioCtx) {
        const AudioClass = window.AudioContext || window.webkitAudioContext;
        if (AudioClass) {
          audioCtx = new AudioClass();
        }
      }
      if (audioCtx && audioCtx.state === 'suspended') {
        audioCtx.resume();
      }
      return audioCtx;
    }

    function playTickSound() {
      if (appState.isMuted) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, ctx.currentTime);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.1);
        if ('vibrate' in navigator) navigator.vibrate(50);
      } catch (e) {}
    }

    // ALARME RETENTISSANTE DE REPOS (2 SECONDES)
    function playLoudAlarm() {
      if (appState.isMuted) return;
      try {
        const ctx = getAudioContext();
        if (!ctx) return;
        const now = ctx.currentTime;
        const pulses = [
          { time: now, f1: 1046.50, f2: 783.99, d: 0.42 },
          { time: now + 0.50, f1: 1046.50, f2: 783.99, d: 0.42 },
          { time: now + 1.00, f1: 1174.66, f2: 880.00, d: 0.42 },
          { time: now + 1.50, f1: 1318.51, f2: 1046.50, d: 0.50 }
        ];

        pulses.forEach(p => {
          const osc1 = ctx.createOscillator();
          const osc2 = ctx.createOscillator();
          const gain = ctx.createGain();

          osc1.type = 'triangle';
          osc1.frequency.setValueAtTime(p.f1, p.time);
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(p.f2, p.time);

          gain.gain.setValueAtTime(0.001, p.time);
          gain.gain.linearRampToValueAtTime(0.35, p.time + 0.03);
          gain.gain.exponentialRampToValueAtTime(0.001, p.time + p.d);

          osc1.connect(gain);
          osc2.connect(gain);
          gain.connect(ctx.destination);

          osc1.start(p.time);
          osc2.start(p.time);
          osc1.stop(p.time + p.d);
          osc2.stop(p.time + p.d);
        });

        if ('vibrate' in navigator) navigator.vibrate([350, 150, 350, 150, 350, 150, 350]);
      } catch (e) {}
    }

    function startRepeatingAlarm() {
      appState.restTimer.alarmActive = true;
      playLoudAlarm();
      document.getElementById('restTimerCard').classList.add('animate-alarm');
      document.getElementById('alarmDismissBanner').classList.remove('hidden');
      if (alarmIntervalId) clearTimeout(alarmIntervalId);
      alarmIntervalId = setTimeout(() => {
        stopAlarmSound();
      }, 2000);
    }

    function stopAlarmSound() {
      appState.restTimer.alarmActive = false;
      if (alarmIntervalId) clearTimeout(alarmIntervalId);
      document.getElementById('restTimerCard').classList.remove('animate-alarm');
      document.getElementById('alarmDismissBanner').classList.add('hidden');
    }

    function testAlarmSound() {
      getAudioContext();
      playLoudAlarm();
    }

    function toggleMute() {
      appState.isMuted = !appState.isMuted;
      localStorage.setItem(STORAGE_KEYS.MUTED, appState.isMuted ? 'true' : 'false');
      document.getElementById('soundIcon').textContent = appState.isMuted ? '🔇' : '🔊';
    }

    /* =========================================================================
       3. GESTION DU STOCKAGE LOCAL (LOCALSTORAGE) & TONNAGE HEBDOMADAIRE
       ========================================================================= */
    function loadStorage() {
      try {
        const storedEx = localStorage.getItem(STORAGE_KEYS.EXERCISES);
        appState.exercises = storedEx ? JSON.parse(storedEx) : DEFAULT_EXERCISES_DATABASE;
      } catch {
        appState.exercises = DEFAULT_EXERCISES_DATABASE;
      }

      try {
        const storedHist = localStorage.getItem(STORAGE_KEYS.HISTORY);
        appState.history = storedHist ? JSON.parse(storedHist) : [];
      } catch {
        appState.history = [];
      }

      try {
        appState.isMuted = localStorage.getItem(STORAGE_KEYS.MUTED) === 'true';
        document.getElementById('soundIcon').textContent = appState.isMuted ? '🔇' : '🔊';
      } catch {}

      try {
        const active = localStorage.getItem(STORAGE_KEYS.ACTIVE);
        if (active) {
          appState.activeSession = JSON.parse(active);
        }
      } catch {}
    }

    function saveExercises() {
      localStorage.setItem(STORAGE_KEYS.EXERCISES, JSON.stringify(appState.exercises));
    }

    function saveHistory() {
      localStorage.setItem(STORAGE_KEYS.HISTORY, JSON.stringify(appState.history));
      updateWeeklyStats();
    }

    function saveActiveSessionState() {
      if (appState.activeSession) {
        localStorage.setItem(STORAGE_KEYS.ACTIVE, JSON.stringify(appState.activeSession));
      } else {
        localStorage.removeItem(STORAGE_KEYS.ACTIVE);
      }
    }

    // Calcul du tonnage total cumulé sur 7 jours glissants
    function getWeeklyTonnage() {
      const now = Date.now();
      const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
      return appState.history
        .filter(s => s.finishedAt >= sevenDaysAgo)
        .reduce((sum, s) => sum + (s.totalTonnage || 0), 0);
    }

    function updateWeeklyStats() {
      const weekly = getWeeklyTonnage();
      const formatted = Math.round(weekly).toLocaleString('fr-FR') + ' kg';
      document.getElementById('headerWeeklyTonnage').textContent = formatted;
      document.getElementById('statWeeklyTonnage').textContent = formatted;

      const totalWorkouts = appState.history.length;
      document.getElementById('statTotalWorkouts').textContent = totalWorkouts;

      const allTime = appState.history.reduce((sum, s) => sum + (s.totalTonnage || 0), 0);
      document.getElementById('statAllTimeTonnage').textContent = Math.round(allTime).toLocaleString('fr-FR') + ' kg';
    }

    /* =========================================================================
       4. LOGIQUE DES SÉANCES & ÉDITEUR D'EXERCICES
       ========================================================================= */
    function renderDaysList() {
      const container = document.getElementById('daysListContainer');
      container.innerHTML = '';

      // Regrouper par jour
      const daysMap = {};
      appState.exercises.forEach(ex => {
        if (!daysMap[ex.day]) {
          daysMap[ex.day] = {
            day: ex.day,
            session: ex.session,
            exercises: []
          };
        }
        daysMap[ex.day].exercises.push(ex);
      });

      const dayKeys = Object.keys(daysMap);

      dayKeys.forEach(dayKey => {
        const item = daysMap[dayKey];
        const isRest = item.session.toUpperCase().includes('REPOS');
        const exCount = item.exercises.length;

        const card = document.createElement('div');
        card.className = "bg-darkCard border border-darkBorder rounded-2xl p-4 transition-all hover:border-zinc-700";

        card.innerHTML = \`
          <div class="flex items-center justify-between mb-2">
            <div class="flex items-center gap-2">
              <span class="text-xs font-black text-neonGreen tracking-wider uppercase">\${item.day}</span>
              <span class="text-gray-600">·</span>
              <span class="text-sm font-bold text-white">\${item.session}</span>
            </div>
            \${isRest ? '<span class="text-[10px] text-gray-500 font-semibold uppercase">Récupération</span>' : \`<span class="text-xs text-gray-400 font-mono-num">\${exCount} exercices</span>\`}
          </div>

          <div class="text-xs text-gray-400 space-y-1 mb-3">
            \${item.exercises.slice(0, 3).map(e => \`<div class="truncate">• \${e.name}</div>\`).join('')}
            \${item.exercises.length > 3 ? \`<div class="text-[11px] text-gray-500">+ \${item.exercises.length - 3} autres exercices...</div>\` : ''}
          </div>

          <div class="flex items-center justify-between pt-2 border-t border-darkBorder">
            <button onclick="toggleDayDetails('\${dayKey}')" class="text-xs text-gray-400 hover:text-white font-medium">
              Détails & Modifier
            </button>
            \${!isRest ? \`
              <button onclick="startWorkoutSession('\${dayKey}', '\${item.session}')" class="px-3.5 py-1.5 rounded-xl bg-neonGreen text-black font-bold text-xs hover:bg-neonGreenHover active:scale-95 transition shadow-sm shadow-neonGreen/20">
                Démarrer la séance ▶
              </button>
            \` : \`
              <span class="text-xs text-gray-500 italic">Repos bien mérité</span>
            \`}
          </div>

          <!-- Section détails masquable -->
          <div id="details_\${dayKey.replace(/\\s+/g, '_')}" class="hidden mt-3 pt-3 border-t border-zinc-800 space-y-2">
            \${item.exercises.map((ex, idx) => \`
              <div class="bg-black/40 p-2.5 rounded-xl flex items-center justify-between text-xs">
                <div class="truncate pr-2">
                  <div class="font-semibold text-gray-200">\${ex.name}</div>
                  <div class="text-[11px] text-gray-400">\${ex.sets} séries · \${ex.reps} reps · \${ex.load} · Repos \${ex.restSeconds}s</div>
                </div>
                <div class="flex items-center gap-1">
                  <button onclick="moveExercise('\${ex.id}', -1)" class="w-6 h-6 rounded bg-zinc-800 text-gray-300 hover:text-white flex items-center justify-center">▲</button>
                  <button onclick="moveExercise('\${ex.id}', 1)" class="w-6 h-6 rounded bg-zinc-800 text-gray-300 hover:text-white flex items-center justify-center">▼</button>
                  <button onclick="deleteExercise('\${ex.id}')" class="w-6 h-6 rounded bg-red-900/30 text-red-400 hover:text-red-300 flex items-center justify-center">✕</button>
                </div>
              </div>
            \`).join('')}
          </div>
        \`;

        container.appendChild(card);
      });
    }

    function toggleDayDetails(dayKey) {
      const el = document.getElementById('details_' + dayKey.replace(/\\s+/g, '_'));
      if (el) el.classList.toggle('hidden');
    }

    function moveExercise(id, direction) {
      const idx = appState.exercises.findIndex(e => e.id === id);
      if (idx < 0) return;
      const targetIdx = idx + direction;
      if (targetIdx < 0 || targetIdx >= appState.exercises.length) return;
      
      const temp = appState.exercises[idx];
      appState.exercises[idx] = appState.exercises[targetIdx];
      appState.exercises[targetIdx] = temp;
      
      saveExercises();
      renderDaysList();
    }

    function deleteExercise(id) {
      if (!confirm('Supprimer cet exercice de la séance ?')) return;
      appState.exercises = appState.exercises.filter(e => e.id !== id);
      saveExercises();
      renderDaysList();
    }

    /* =========================================================================
       5. ÉCRAN DE SÉANCE EN DIRECT & SAISIE EN TEMPS RÉEL DU TONNAGE
       ========================================================================= */
    function startWorkoutSession(day, sessionName) {
      getAudioContext(); // débloquer l'audio via interaction utilisateur

      const exercisesForDay = appState.exercises.filter(e => e.day === day);
      if (exercisesForDay.length === 0) {
        alert('Aucun exercice trouvé pour ce jour.');
        return;
      }

      appState.activeSession = {
        id: 'session_' + Date.now(),
        day,
        sessionName,
        startedAt: Date.now(),
        elapsedSeconds: 0,
        exercises: exercisesForDay.map(t => {
          const setsCount = t.sets || 4;
          const defaultW = t.defaultWeight || 10;
          let parsedReps = 10;
          const match = (t.reps || '').match(/\\d+/);
          if (match) parsedReps = parseInt(match[0], 10);

          return {
            id: 'ex_' + Math.random().toString(36).slice(2, 8),
            templateId: t.id,
            name: t.name,
            muscleGroup: t.muscleGroup,
            track: t.track,
            targetReps: t.reps,
            targetLoad: t.load,
            targetRir: t.rir,
            restSeconds: t.restSeconds || 90,
            sets: Array.from({ length: setsCount }, (_, i) => ({
              id: 's_' + (i + 1),
              setNumber: i + 1,
              targetReps: t.reps,
              actualReps: parsedReps,
              actualWeight: defaultW,
              completed: false
            }))
          };
        })
      };

      saveActiveSessionState();
      startSessionTimer();
      renderActiveSession();
      switchTab('active');
    }

    function startSessionTimer() {
      if (appState.sessionTimer.intervalId) clearInterval(appState.sessionTimer.intervalId);
      appState.sessionTimer.intervalId = setInterval(() => {
        if (!appState.sessionTimer.paused && appState.activeSession) {
          appState.activeSession.elapsedSeconds = (appState.activeSession.elapsedSeconds || 0) + 1;
          const mins = Math.floor(appState.activeSession.elapsedSeconds / 60);
          const secs = appState.activeSession.elapsedSeconds % 60;
          document.getElementById('sessionElapsedTimer').textContent = 
            String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');
        }
      }, 1000);
    }

    function pauseResumeSessionTimer() {
      appState.sessionTimer.paused = !appState.sessionTimer.paused;
      document.getElementById('btnSessionPause').textContent = appState.sessionTimer.paused ? 'Reprendre' : 'Pause';
    }

    // Calcul du tonnage en direct : Somme de (Reps x Poids) pour toutes les séries complétées
    function calculateSessionTonnage() {
      if (!appState.activeSession) return 0;
      let total = 0;
      appState.activeSession.exercises.forEach(ex => {
        ex.sets.forEach(s => {
          if (s.completed) {
            total += (s.actualReps || 0) * (s.actualWeight || 0);
          }
        });
      });
      return total;
    }

    function updateLiveTonnageDisplay() {
      const tonnage = calculateSessionTonnage();
      document.getElementById('sessionLiveTonnage').innerHTML = 
        Math.round(tonnage).toLocaleString('fr-FR') + ' <span class="text-xs text-gray-400 font-sans font-normal">kg</span>';

      // Comptage séries complétées
      let totalSets = 0;
      let completedSets = 0;
      if (appState.activeSession) {
        appState.activeSession.exercises.forEach(ex => {
          totalSets += ex.sets.length;
          completedSets += ex.sets.filter(s => s.completed).length;
        });
      }
      document.getElementById('activeSessionCount').textContent = \`\${completedSets} / \${totalSets} séries complétées\`;
    }

    function renderActiveSession() {
      if (!appState.activeSession) {
        document.getElementById('viewActiveSession').innerHTML = \`
          <div class="text-center py-16 bg-darkCard border border-darkBorder rounded-2xl p-6">
            <span class="text-3xl block mb-2">⚡</span>
            <h3 class="text-base font-bold text-white">Aucune séance active</h3>
            <p class="text-xs text-gray-400 mt-1 mb-4">Sélectionnez une séance dans l'onglet Programmes pour commencer.</p>
            <button onclick="switchTab('selector')" class="px-4 py-2 rounded-xl bg-neonGreen text-black font-bold text-xs">
              Choisir une séance
            </button>
          </div>
        \`;
        document.getElementById('activeWorkoutDot').classList.add('hidden');
        return;
      }

      document.getElementById('activeWorkoutDot').classList.remove('hidden');
      document.getElementById('activeSessionDayBadge').textContent = appState.activeSession.day;
      document.getElementById('activeSessionNameBadge').textContent = appState.activeSession.sessionName;

      const container = document.getElementById('activeExercisesContainer');
      container.innerHTML = '';

      appState.activeSession.exercises.forEach((ex, exIndex) => {
        const exCard = document.createElement('div');
        exCard.className = "bg-darkCard border border-darkBorder rounded-2xl p-4 space-y-3";

        exCard.innerHTML = \`
          <div class="flex items-start justify-between">
            <div>
              <h4 class="text-sm font-bold text-white leading-tight">\${ex.name}</h4>
              <p class="text-[11px] text-gray-400 mt-0.5">\${ex.muscleGroup} · \${ex.track}</p>
            </div>
            <div class="text-right">
              <span class="text-[10px] text-gray-400 block font-medium">REPOS PRÉVU</span>
              <span class="text-xs font-mono-num font-bold text-vividOrange">\${ex.restSeconds}s</span>
            </div>
          </div>

          <div class="bg-black/40 rounded-xl p-2 border border-zinc-800/80">
            <div class="grid grid-cols-12 gap-2 text-[10px] font-bold text-gray-400 pb-1.5 px-2 border-b border-zinc-800">
              <div class="col-span-2">SÉRIE</div>
              <div class="col-span-4 text-center">RÉPÉTITIONS</div>
              <div class="col-span-4 text-center">CHARGE (KG)</div>
              <div class="col-span-2 text-right">VAL.</div>
            </div>

            <div class="space-y-1.5 pt-1.5">
              \${ex.sets.map((set, setIndex) => \`
                <div class="grid grid-cols-12 gap-2 items-center px-1 py-1 rounded-lg \${set.completed ? 'bg-neonGreen/10 border border-neonGreen/30' : 'bg-transparent'}">
                  <div class="col-span-2 text-xs font-mono-num font-bold \${set.completed ? 'text-neonGreen' : 'text-gray-400'}">
                    #\${set.setNumber}
                  </div>

                  <div class="col-span-4 flex items-center justify-center gap-1">
                    <button onclick="modifySetVal(\${exIndex}, \${setIndex}, 'actualReps', -1)" class="w-6 h-6 rounded bg-zinc-800 text-gray-300 hover:text-white flex items-center justify-center font-bold active:scale-95">-</button>
                    <input type="number" value="\${set.actualReps}" onchange="updateSetInput(\${exIndex}, \${setIndex}, 'actualReps', this.value)" class="w-10 bg-black border border-zinc-700 rounded text-center text-xs font-mono-num text-white py-1 focus:outline-none focus:border-neonGreen">
                    <button onclick="modifySetVal(\${exIndex}, \${setIndex}, 'actualReps', 1)" class="w-6 h-6 rounded bg-zinc-800 text-gray-300 hover:text-white flex items-center justify-center font-bold active:scale-95">+</button>
                  </div>

                  <div class="col-span-4 flex items-center justify-center gap-1">
                    <button onclick="modifySetVal(\${exIndex}, \${setIndex}, 'actualWeight', -1)" class="w-6 h-6 rounded bg-zinc-800 text-gray-300 hover:text-white flex items-center justify-center font-bold active:scale-95">-</button>
                    <input type="number" step="0.5" value="\${set.actualWeight}" onchange="updateSetInput(\${exIndex}, \${setIndex}, 'actualWeight', this.value)" class="w-12 bg-black border border-zinc-700 rounded text-center text-xs font-mono-num text-white py-1 focus:outline-none focus:border-neonGreen">
                    <button onclick="modifySetVal(\${exIndex}, \${setIndex}, 'actualWeight', 1)" class="w-6 h-6 rounded bg-zinc-800 text-gray-300 hover:text-white flex items-center justify-center font-bold active:scale-95">+</button>
                  </div>

                  <div class="col-span-2 text-right">
                    <button onclick="toggleSetComplete(\${exIndex}, \${setIndex})" class="w-8 h-8 rounded-lg flex items-center justify-center transition active:scale-90 \${set.completed ? 'bg-neonGreen text-black font-extrabold' : 'bg-zinc-800 border border-zinc-700 text-gray-500 hover:text-white'}">
                      \${set.completed ? '✓' : '○'}
                    </button>
                  </div>
                </div>
              \`).join('')}
            </div>
          </div>

          <div class="flex items-center justify-between text-xs pt-1">
            <button onclick="addSetToExercise(\${exIndex})" class="text-neonGreen hover:underline font-semibold text-[11px]">
              + Ajouter une série
            </button>
            <span class="text-[11px] text-gray-500">Cible: \${ex.targetReps} · RIR \${ex.targetRir}</span>
          </div>
        \`;

        container.appendChild(exCard);
      });

      updateLiveTonnageDisplay();
    }

    function modifySetVal(exIndex, setIndex, field, delta) {
      const set = appState.activeSession.exercises[exIndex].sets[setIndex];
      set[field] = Math.max(0, (set[field] || 0) + delta);
      saveActiveSessionState();
      renderActiveSession();
    }

    function updateSetInput(exIndex, setIndex, field, value) {
      const set = appState.activeSession.exercises[exIndex].sets[setIndex];
      set[field] = Math.max(0, parseFloat(value) || 0);
      saveActiveSessionState();
      updateLiveTonnageDisplay();
    }

    function addSetToExercise(exIndex) {
      const ex = appState.activeSession.exercises[exIndex];
      const lastSet = ex.sets[ex.sets.length - 1];
      const newNum = ex.sets.length + 1;
      ex.sets.push({
        id: 's_' + newNum,
        setNumber: newNum,
        targetReps: lastSet ? lastSet.targetReps : '10 - 12',
        actualReps: lastSet ? lastSet.actualReps : 10,
        actualWeight: lastSet ? lastSet.actualWeight : 10,
        completed: false
      });
      saveActiveSessionState();
      renderActiveSession();
    }

    /* =========================================================================
       6. MINUTEUR DE REPOS & DÉCLENCHEMENT DE L'ALARME
       ========================================================================= */
    function toggleSetComplete(exIndex, setIndex) {
      const ex = appState.activeSession.exercises[exIndex];
      const set = ex.sets[setIndex];
      set.completed = !set.completed;

      if (set.completed) {
        set.completedAt = Date.now();
        playTickSound();
        // Lancer automatiquement le minuteur de repos
        startRestTimer(ex.restSeconds || 90, ex.name);
      }

      saveActiveSessionState();
      renderActiveSession();
    }

    function startRestTimer(durationSeconds, exerciseName) {
      stopAlarmSound();
      if (appState.restTimer.intervalId) clearInterval(appState.restTimer.intervalId);

      appState.restTimer.active = true;
      appState.restTimer.paused = false;
      appState.restTimer.totalSeconds = durationSeconds;
      appState.restTimer.remainingSeconds = durationSeconds;
      appState.restTimer.exerciseName = exerciseName || '';

      document.getElementById('restTimerCard').classList.remove('hidden');
      document.getElementById('restTargetLabel').textContent = \`Cible: \${durationSeconds}s\`;
      document.getElementById('restExerciseContext').textContent = exerciseName ? \`Après: \${exerciseName}\` : 'Préparez la suite';
      document.getElementById('btnRestPause').textContent = 'Pause';

      updateRestTimerUI();

      appState.restTimer.intervalId = setInterval(() => {
        if (!appState.restTimer.paused && appState.restTimer.remainingSeconds > 0) {
          appState.restTimer.remainingSeconds--;
          updateRestTimerUI();

          // Bips d'avertissement à 3s, 2s, 1s
          if (appState.restTimer.remainingSeconds <= 3 && appState.restTimer.remainingSeconds > 0) {
            playTickSound();
          }

          // Arrivée à ZÉRO : ALARME RETENTISSANTE !
          if (appState.restTimer.remainingSeconds === 0) {
            clearInterval(appState.restTimer.intervalId);
            startRepeatingAlarm();
          }
        }
      }, 1000);
    }

    function updateRestTimerUI() {
      const rem = appState.restTimer.remainingSeconds;
      const mins = Math.floor(rem / 60);
      const secs = rem % 60;
      document.getElementById('restCountdownDisplay').textContent = 
        String(mins).padStart(2, '0') + ':' + String(secs).padStart(2, '0');

      const total = appState.restTimer.totalSeconds || 1;
      const pct = Math.max(0, Math.min(100, (rem / total) * 100));
      document.getElementById('restProgressBar').style.width = pct + '%';
    }

    function toggleRestPause() {
      appState.restTimer.paused = !appState.restTimer.paused;
      document.getElementById('btnRestPause').textContent = appState.restTimer.paused ? 'Reprendre' : 'Pause';
    }

    function adjustRestTimer(delta) {
      appState.restTimer.remainingSeconds = Math.max(0, appState.restTimer.remainingSeconds + delta);
      appState.restTimer.totalSeconds = Math.max(appState.restTimer.totalSeconds, appState.restTimer.remainingSeconds);
      updateRestTimerUI();
    }

    function skipRestTimer() {
      if (appState.restTimer.intervalId) clearInterval(appState.restTimer.intervalId);
      stopAlarmSound();
      appState.restTimer.active = false;
      document.getElementById('restTimerCard').classList.add('hidden');
    }

    function confirmFinishSession() {
      if (!confirm('Confirmez-vous la fin de cette séance et l\\'enregistrement du tonnage ?')) return;

      if (appState.sessionTimer.intervalId) clearInterval(appState.sessionTimer.intervalId);
      skipRestTimer();

      const tonnage = calculateSessionTonnage();
      let totalSets = 0;
      let totalReps = 0;

      const exerciseSummary = appState.activeSession.exercises.map(ex => {
        const completed = ex.sets.filter(s => s.completed);
        totalSets += completed.length;
        completed.forEach(s => totalReps += s.actualReps);
        return {
          name: ex.name,
          muscleGroup: ex.muscleGroup,
          completedSets: completed.map(s => ({ reps: s.actualReps, weight: s.actualWeight }))
        };
      });

      const logEntry = {
        id: appState.activeSession.id,
        day: appState.activeSession.day,
        sessionName: appState.activeSession.sessionName,
        startedAt: appState.activeSession.startedAt,
        finishedAt: Date.now(),
        durationSeconds: appState.activeSession.elapsedSeconds || 0,
        totalTonnage: tonnage,
        totalSets,
        totalReps,
        exercises: exerciseSummary
      };

      appState.history.unshift(logEntry);
      saveHistory();

      appState.activeSession = null;
      saveActiveSessionState();

      alert(\`Séance terminée avec succès !\\nTonnage validé : \${Math.round(tonnage)} kg\\nSéries : \${totalSets}\`);

      renderActiveSession();
      renderHistory();
      switchTab('history');
    }

    /* =========================================================================
       7. HISTORIQUE & STATISTIQUES
       ========================================================================= */
    function renderHistory() {
      updateWeeklyStats();
      const container = document.getElementById('historyListContainer');
      container.innerHTML = '';

      if (appState.history.length === 0) {
        container.innerHTML = \`
          <div class="text-center py-8 text-xs text-gray-500 italic">
            Aucune séance terminée pour le moment. Vos tonnages s'afficheront ici.
          </div>
        \`;
        return;
      }

      appState.history.forEach(log => {
        const dateStr = new Date(log.finishedAt).toLocaleDateString('fr-FR', {
          weekday: 'short', day: 'numeric', month: 'short'
        });
        const durationMin = Math.round((log.durationSeconds || 0) / 60);

        const card = document.createElement('div');
        card.className = "bg-darkCard border border-darkBorder rounded-xl p-3 space-y-2";
        card.innerHTML = \`
          <div class="flex items-center justify-between">
            <div class="flex items-center gap-2">
              <span class="text-xs font-bold text-neonGreen uppercase">\${log.day}</span>
              <span class="text-gray-600">·</span>
              <span class="text-xs font-bold text-white">\${log.sessionName}</span>
            </div>
            <span class="text-[11px] text-gray-400">\${dateStr}</span>
          </div>

          <div class="flex items-center justify-between text-xs bg-black/40 p-2 rounded-lg font-mono-num">
            <div>
              <span class="text-[9px] text-gray-400 block font-sans">TONNAGE</span>
              <span class="font-bold text-white">\${Math.round(log.totalTonnage).toLocaleString('fr-FR')} kg</span>
            </div>
            <div>
              <span class="text-[9px] text-gray-400 block font-sans">DURÉE</span>
              <span class="text-gray-300">\${durationMin} min</span>
            </div>
            <div>
              <span class="text-[9px] text-gray-400 block font-sans">SÉRIES</span>
              <span class="text-neonGreen font-bold">\${log.totalSets}</span>
            </div>
          </div>
        \`;
        container.appendChild(card);
      });
    }

    function clearHistoryConfirm() {
      if (!confirm('Voulez-vous réinitialiser tout l\\'historique et les statistiques ?')) return;
      appState.history = [];
      saveHistory();
      renderHistory();
    }

    function exportHistoryJSON() {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(appState.history, null, 2));
      const a = document.createElement('a');
      a.setAttribute("href", dataStr);
      a.setAttribute("download", "titanfit_historique.json");
      document.body.appendChild(a);
      a.click();
      a.remove();
    }

    /* =========================================================================
       8. GESTION DES ONGLETS & MODALES
       ========================================================================= */
    function switchTab(tab) {
      appState.currentTab = tab;

      document.getElementById('viewSelector').classList.toggle('hidden', tab !== 'selector');
      document.getElementById('viewActiveSession').classList.toggle('hidden', tab !== 'active');
      document.getElementById('viewHistory').classList.toggle('hidden', tab !== 'history');

      // Style des boutons
      const activeColor = 'text-neonGreen';
      const defaultColor = 'text-gray-400';

      const btnSelector = document.getElementById('navBtnSelector');
      const btnActive = document.getElementById('navBtnActive');
      const btnHistory = document.getElementById('navBtnHistory');

      btnSelector.className = \`flex flex-col items-center justify-center font-semibold transition active:scale-95 \${tab === 'selector' ? activeColor : defaultColor}\`;
      btnActive.className = \`flex flex-col items-center justify-center font-semibold transition active:scale-95 relative \${tab === 'active' ? activeColor : defaultColor}\`;
      btnHistory.className = \`flex flex-col items-center justify-center font-semibold transition active:scale-95 \${tab === 'history' ? activeColor : defaultColor}\`;

      if (tab === 'history') renderHistory();
      if (tab === 'active') renderActiveSession();
    }

    // Google Sheets Modal
    function openSheetsModal() {
      document.getElementById('csvInputArea').value = \`${csvData}\`;
      document.getElementById('modalSheets').classList.remove('hidden');
    }

    function closeSheetsModal() {
      document.getElementById('modalSheets').classList.add('hidden');
    }

    function exportCurrentCSV() {
      const header = 'Jour,Séance,Exercice,Groupe Musculaire,Piste Sollicitée,Séries,Répétitions,Charge / Matériel,RIR,Repos';
      const rows = appState.exercises.map(ex => {
        const esc = s => \`"\${String(s || '').replace(/"/g, '""')}"\`;
        return [
          esc(ex.day), esc(ex.session), esc(ex.name), esc(ex.muscleGroup),
          esc(ex.track), esc(ex.sets), esc(ex.reps), esc(ex.load),
          esc(ex.rir), esc(ex.rawRest || (ex.restSeconds + 's'))
        ].join(',');
      });
      const fullCSV = [header, ...rows].join('\\n');
      navigator.clipboard.writeText(fullCSV).then(() => {
        alert('CSV copié dans le presse-papiers ! Vous pouvez le coller dans Google Sheets.');
      }).catch(() => {
        document.getElementById('csvInputArea').value = fullCSV;
        alert('Sélectionnez et copiez le texte dans la zone ci-dessous.');
      });
    }

    function importCSVFromInput() {
      const text = document.getElementById('csvInputArea').value.trim();
      if (!text) return;
      const lines = text.split(/\\r?\\n/).filter(l => l.trim().length > 0);
      if (lines.length <= 1) {
        alert('Format CSV invalide.');
        return;
      }

      const parsed = [];
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i];
        const row = [];
        let inside = false;
        let entry = '';
        for (let c = 0; c < line.length; c++) {
          const char = line[c];
          if (char === '"') inside = !inside;
          else if (char === ',' && !inside) { row.push(entry.trim()); entry = ''; }
          else entry += char;
        }
        row.push(entry.trim());

        if (row.length >= 3) {
          const rawRest = row[9] || '90s';
          let restSec = 90;
          const matchRest = rawRest.match(/\\d+/);
          if (matchRest) {
            const val = parseInt(matchRest[0], 10);
            restSec = rawRest.includes("'") ? val * 60 : val;
          }

          let defaultWeight = 10;
          const matchW = (row[7] || '').match(/\\d+(?:\\.\\d+)?/g);
          if (matchW) defaultWeight = parseFloat(matchW[matchW.length - 1]);

          parsed.push({
            id: 'ex_' + i + '_' + Date.now(),
            day: row[0] || 'Jour 1',
            session: row[1] || 'SÉANCE',
            name: row[2] || 'Exercice',
            muscleGroup: row[3] || 'Général',
            track: row[4] || '-',
            sets: parseInt(row[5], 10) || 4,
            reps: row[6] || '10 - 12',
            load: row[7] || 'Poids du corps',
            defaultWeight,
            rir: row[8] || '1 - 2',
            restSeconds: restSec,
            rawRest
          });
        }
      }

      if (parsed.length > 0) {
        appState.exercises = parsed;
        saveExercises();
        renderDaysList();
        closeSheetsModal();
        alert(\`\${parsed.length} exercices importés avec succès !\`);
      }
    }

    function resetDefaultProgram() {
      if (!confirm('Rétablir la programmation d\\'origine du tableau Google Sheets ?')) return;
      appState.exercises = DEFAULT_EXERCISES_DATABASE;
      saveExercises();
      renderDaysList();
      closeSheetsModal();
    }

    // Modal Nouveau Exercice
    function openNewExerciseModal() {
      document.getElementById('modalNewExercise').classList.remove('hidden');
    }

    function closeNewExerciseModal() {
      document.getElementById('modalNewExercise').classList.add('hidden');
    }

    function saveNewExercise() {
      const daySession = document.getElementById('newExDaySelect').value.split('|');
      const name = document.getElementById('newExName').value.trim();
      const muscle = document.getElementById('newExMuscle').value.trim() || 'Général';
      const track = document.getElementById('newExTrack').value.trim() || '-';
      const sets = parseInt(document.getElementById('newExSets').value, 10) || 4;
      const reps = document.getElementById('newExReps').value.trim() || '10 - 12';
      const rest = parseInt(document.getElementById('newExRest').value, 10) || 90;
      const load = document.getElementById('newExLoad').value.trim() || 'Haltères 10 kg';
      const rir = document.getElementById('newExRir').value.trim() || '1 - 2';

      if (!name) {
        alert('Veuillez renseigner le nom de l\\'exercice.');
        return;
      }

      let defaultWeight = 10;
      const matchW = load.match(/\\d+(?:\\.\\d+)?/g);
      if (matchW) defaultWeight = parseFloat(matchW[matchW.length - 1]);

      const newEx = {
        id: 'ex_' + Date.now() + '_' + Math.random().toString(36).slice(2, 6),
        day: daySession[0],
        session: daySession[1],
        name,
        muscleGroup: muscle,
        track,
        sets,
        reps,
        load,
        defaultWeight,
        rir,
        restSeconds: rest,
        rawRest: rest + 's'
      };

      appState.exercises.push(newEx);
      saveExercises();
      renderDaysList();
      closeNewExerciseModal();
    }

    /* =========================================================================
       9. INITIALISATION AU CHARGEMENT DE LA PAGE
       ========================================================================= */
    window.addEventListener('DOMContentLoaded', () => {
      loadStorage();
      renderDaysList();
      updateWeeklyStats();

      // Restaurer une séance active si présente
      if (appState.activeSession) {
        startSessionTimer();
        renderActiveSession();
      }
    });
  </script>
</body>
</html>`;
}

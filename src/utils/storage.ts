import { ExerciseTemplate, WorkoutSessionLog } from '../types/fitness';
import { INITIAL_EXERCISES } from '../data/defaultProgram';

const EXERCISES_KEY = 'titanfit_exercises_v1';
const HISTORY_KEY = 'titanfit_history_v1';
const ACTIVE_SESSION_KEY = 'titanfit_active_session_v1';

export function getStoredExercises(): ExerciseTemplate[] {
  try {
    const raw = localStorage.getItem(EXERCISES_KEY);
    if (!raw) return INITIAL_EXERCISES;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) {
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load stored exercises', e);
  }
  return INITIAL_EXERCISES;
}

export function saveStoredExercises(exercises: ExerciseTemplate[]): void {
  try {
    localStorage.setItem(EXERCISES_KEY, JSON.stringify(exercises));
  } catch (e) {
    console.error('Failed to save exercises', e);
  }
}

export function resetStoredExercises(): ExerciseTemplate[] {
  try {
    localStorage.setItem(EXERCISES_KEY, JSON.stringify(INITIAL_EXERCISES));
  } catch (e) {
    console.error('Failed to reset exercises', e);
  }
  return INITIAL_EXERCISES;
}

export function getWorkoutHistory(): WorkoutSessionLog[] {
  try {
    const raw = localStorage.getItem(HISTORY_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) {
      return parsed;
    }
  } catch (e) {
    console.error('Failed to load history', e);
  }
  return [];
}

export function saveWorkoutHistory(history: WorkoutSessionLog[]): void {
  try {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save history', e);
  }
}

export function addSessionToHistory(session: WorkoutSessionLog): WorkoutSessionLog[] {
  const current = getWorkoutHistory();
  const updated = [session, ...current];
  saveWorkoutHistory(updated);
  return updated;
}

export function deleteSessionFromHistory(id: string): WorkoutSessionLog[] {
  const current = getWorkoutHistory();
  const updated = current.filter(s => s.id !== id);
  saveWorkoutHistory(updated);
  return updated;
}

// Computes total tonnage lifted in the last 7 rolling days
export function calculateWeeklyTonnage(history: WorkoutSessionLog[]): number {
  const now = Date.now();
  const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
  
  return history
    .filter(session => session.finishedAt >= sevenDaysAgo)
    .reduce((total, session) => total + (session.totalTonnage || 0), 0);
}

// In-progress session persistence
export function getSavedActiveSession(): any | null {
  try {
    const raw = localStorage.getItem(ACTIVE_SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

export function saveActiveSession(data: any): void {
  try {
    localStorage.setItem(ACTIVE_SESSION_KEY, JSON.stringify(data));
  } catch {}
}

export function clearActiveSession(): void {
  try {
    localStorage.removeItem(ACTIVE_SESSION_KEY);
  } catch {}
}

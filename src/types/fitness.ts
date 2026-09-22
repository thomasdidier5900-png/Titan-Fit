export interface ExerciseTemplate {
  id: string;
  day: string; // e.g. "Jour 1"
  session: string; // e.g. "PULL 1"
  name: string;
  muscleGroup: string;
  track: string;
  sets: number;
  reps: string;
  load: string;
  defaultWeight: number;
  rir: string;
  restSeconds: number;
  rawRest: string;
}

export interface SetLog {
  id: string;
  setNumber: number;
  targetReps: string;
  targetWeight: number;
  actualReps: number;
  actualWeight: number;
  completed: boolean;
  completedAt?: number;
}

export interface ActiveExerciseItem {
  id: string;
  templateId?: string;
  name: string;
  muscleGroup: string;
  track: string;
  targetReps: string;
  targetLoad: string;
  targetRir: string;
  restSeconds: number;
  sets: SetLog[];
}

export interface WorkoutSessionLog {
  id: string;
  day: string;
  sessionName: string;
  startedAt: number;
  finishedAt: number;
  durationSeconds: number;
  totalTonnage: number;
  totalReps: number;
  totalSets: number;
  exercises: {
    name: string;
    muscleGroup: string;
    completedSets: { reps: number; weight: number }[];
  }[];
  notes?: string;
}

export interface ProgramDay {
  day: string;
  sessionName: string;
  description: string;
  exercises: ExerciseTemplate[];
}

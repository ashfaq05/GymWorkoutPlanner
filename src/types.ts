export type MuscleCategory =
  | 'Chest'
  | 'Back'
  | 'Shoulders'
  | 'Biceps'
  | 'Triceps'
  | 'Quads'
  | 'Hamstrings'
  | 'Glutes'
  | 'Calves'
  | 'Core'
  | 'Forearms'
  | 'Traps & Neck'
  | 'Full Body & Conditioning';

export type ExerciseClipartKey =
  | 'bench-press'
  | 'incline-dumbbell-press'
  | 'seated-cable-row'
  | 'lat-pulldown'
  | 'neutral-lat-pulldown'
  | 'lateral-raise'
  | 'triceps-pushdown'
  | 'incline-dumbbell-curl'
  | 'leg-extension'
  | 'seated-leg-curl'
  | 'leg-press'
  | 'seated-calf-raise'
  | 'hanging-knee-raise'
  | 'smith-incline-press'
  | 'machine-chest-press'
  | 'seated-shoulder-press'
  | 'reverse-pec-deck'
  | 'ez-bar-curl'
  | 'hammer-curl'
  | 'overhead-tricep-ext'
  | 'banded-lateral-walk'
  | 'plank-hold'
  | 'squat'
  | 'deadlift'
  | 'pullup'
  | 'dip'
  | 'cable-cross'
  | 'hip-thrust'
  | 'bent-row'
  | 'face-pull'
  | 'standing-calf'
  | 'wrist-curl'
  | 'ab-rollout'
  | 'shrug'
  | 'russian-twist'
  | 'split-squat'
  | 'kettlebell-swing'
  | 'default-exercise';

export interface Exercise {
  id: string;
  name: string;
  target: string;
  defaultSets: number;
  repRange: string;
  restSeconds: number;
  restDisplay: string;
  notes: string;
  clipartType: ExerciseClipartKey;
  category: MuscleCategory;
  customImageUrl?: string; // Uploaded base64 image or web image URL
  youtubeUrl?: string;     // YouTube demo link
}

export type DayKey = string;

export interface DayRoutine {
  id: string;
  dayKey: DayKey;   // e.g. 'day-1', 'day-2', or 'mon', 'wed'
  dayShort: string; // 'Day 1', 'Push', 'MON'
  dayName: string;  // 'Day 1: Push' or 'Monday'
  title: string;    // 'Upper Body A' or 'Push (Chest & Triceps)'
  subtitle: string; // 'Heavy chest, upper back & lateral delts'
  isRestDay: boolean;
  restNotes?: string;
  accent?: 'blue' | 'amber' | 'emerald' | 'purple' | 'slate';
  exercises: Exercise[];
}

export interface WorkoutPlan {
  id: string;
  name: string;
  description: string;
  daysCount?: number; // 3, 4, 5, etc.
  isCustom?: boolean;
  days: DayRoutine[];
}

export interface LoggedSet {
  setNumber: number;
  weight: number;
  reps: number;
  completed: boolean;
  rpe?: number;
}

export interface LoggedExercise {
  exerciseId: string;
  exerciseName: string;
  target: string;
  sets: LoggedSet[];
  notes?: string;
}

export interface WorkoutSessionLog {
  id: string;
  planId: string;
  dayKey: string;
  dayTitle: string;
  date: string; // YYYY-MM-DD
  timestamp: number;
  durationSeconds: number;
  exercises: LoggedExercise[];
  completed: boolean;
}

export interface UserPreferences {
  weightUnit: 'kg' | 'lbs';
  theme: 'light' | 'dark' | 'amoled';
  autoRestTimer: boolean;
  soundEnabled: boolean;
  vibrateEnabled: boolean;
  wakeLockEnabled: boolean;
  defaultRestDuration: number; // e.g. 90
  compactMode: boolean;
}

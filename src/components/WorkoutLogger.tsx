import React, { useState, useEffect } from 'react';
import {
  DayRoutine,
  LoggedExercise,
  LoggedSet,
  WorkoutSessionLog,
  UserPreferences,
  Exercise,
} from '../types';
import { ExerciseImage } from './ExerciseImage';
import { ExerciseVideoPlayer } from './ExerciseVideoPlayer';
import { ExerciseEditModal } from './ExerciseEditModal';
import {
  getPreviousExercisePerformance,
  getTodayDateString,
} from '../utils/storage';
import {
  Check,
  Plus,
  Trash2,
  Timer,
  ChevronDown,
  ChevronUp,
  Sparkles,
  Calendar,
  Edit2,
  Dumbbell,
  Clock,
  Info,
} from 'lucide-react';

interface WorkoutLoggerProps {
  dayRoutine: DayRoutine;
  planId: string;
  preferences: UserPreferences;
  onSaveSession: (log: WorkoutSessionLog) => void;
  onStartRestTimer: (seconds: number) => void;
  onUpdateDayRoutine?: (updatedDay: DayRoutine) => void;
  onOpenLibraryToAdd?: () => void;
  existingSessionLog?: WorkoutSessionLog;
}

export const WorkoutLogger: React.FC<WorkoutLoggerProps> = ({
  dayRoutine,
  planId,
  preferences,
  onSaveSession,
  onStartRestTimer,
  onUpdateDayRoutine,
  onOpenLibraryToAdd,
  existingSessionLog,
}) => {
  const [selectedDate, setSelectedDate] = useState<string>(
    existingSessionLog ? existingSessionLog.date : getTodayDateString()
  );
  const [expandedNotes, setExpandedNotes] = useState<Record<string, boolean>>({});
  const [exerciseLogs, setExerciseLogs] = useState<LoggedExercise[]>([]);
  const [previousPerformances, setPreviousPerformances] = useState<
    Record<string, { weight: number; reps: number; date: string }[] | null>
  >({});
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Exercise being edited in modal
  const [editingExercise, setEditingExercise] = useState<Exercise | null>(null);
  const [confirmDeleteExerciseId, setConfirmDeleteExerciseId] = useState<string | null>(null);

  // Initialize exercise logs
  useEffect(() => {
    if (existingSessionLog && existingSessionLog.exercises.length > 0) {
      setExerciseLogs(existingSessionLog.exercises);
      setSelectedDate(existingSessionLog.date);
    } else {
      const initialLogs: LoggedExercise[] = dayRoutine.exercises.map((ex) => {
        const prev = getPreviousExercisePerformance(ex.id);
        const defaultSetCount = ex.defaultSets || 3;
        const sets: LoggedSet[] = [];

        const repMatch = ex.repRange.match(/\d+/);
        const parsedReps = repMatch ? parseInt(repMatch[0], 10) : 10;

        for (let i = 1; i <= defaultSetCount; i++) {
          const prevSet = prev && prev[i - 1];
          sets.push({
            setNumber: i,
            weight: prevSet ? prevSet.weight : 0,
            reps: prevSet ? prevSet.reps : parsedReps,
            completed: false,
          });
        }

        return {
          exerciseId: ex.id,
          exerciseName: ex.name,
          target: ex.target,
          sets,
          notes: '',
        };
      });

      setExerciseLogs(initialLogs);
    }

    const prevMap: Record<string, { weight: number; reps: number; date: string }[] | null> = {};
    dayRoutine.exercises.forEach((ex) => {
      prevMap[ex.id] = getPreviousExercisePerformance(ex.id);
    });
    setPreviousPerformances(prevMap);
  }, [dayRoutine, existingSessionLog]);

  const toggleNotes = (id: string) => {
    setExpandedNotes((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const handleUpdateSet = (
    exerciseIndex: number,
    setIndex: number,
    field: keyof LoggedSet,
    value: any
  ) => {
    setExerciseLogs((prev) => {
      const updated = [...prev];
      const ex = { ...updated[exerciseIndex] };
      const sets = [...ex.sets];
      sets[setIndex] = { ...sets[setIndex], [field]: value };
      ex.sets = sets;
      updated[exerciseIndex] = ex;
      return updated;
    });
  };

  const handleToggleComplete = (
    exerciseIndex: number,
    setIndex: number,
    exerciseRestSeconds: number
  ) => {
    setExerciseLogs((prev) => {
      const updated = [...prev];
      const ex = { ...updated[exerciseIndex] };
      const sets = [...ex.sets];
      const nextCompleted = !sets[setIndex].completed;
      sets[setIndex] = { ...sets[setIndex], completed: nextCompleted };
      ex.sets = sets;
      updated[exerciseIndex] = ex;

      if (nextCompleted && preferences.autoRestTimer) {
        onStartRestTimer(exerciseRestSeconds);
      }

      return updated;
    });
  };

  const handleAddSet = (exerciseIndex: number) => {
    setExerciseLogs((prev) => {
      const updated = [...prev];
      const ex = { ...updated[exerciseIndex] };
      const lastSet = ex.sets[ex.sets.length - 1];
      const newSet: LoggedSet = {
        setNumber: ex.sets.length + 1,
        weight: lastSet ? lastSet.weight : 0,
        reps: lastSet ? lastSet.reps : 10,
        completed: false,
      };
      ex.sets = [...ex.sets, newSet];
      updated[exerciseIndex] = ex;
      return updated;
    });
  };

  const handleRemoveSet = (exerciseIndex: number, setIndex: number) => {
    setExerciseLogs((prev) => {
      const updated = [...prev];
      const ex = { ...updated[exerciseIndex] };
      if (ex.sets.length <= 1) return prev;
      const sets = ex.sets
        .filter((_, idx) => idx !== setIndex)
        .map((s, idx) => ({ ...s, setNumber: idx + 1 }));
      ex.sets = sets;
      updated[exerciseIndex] = ex;
      return updated;
    });
  };

  const handleAdjustValue = (
    exerciseIndex: number,
    setIndex: number,
    field: 'weight' | 'reps',
    delta: number
  ) => {
    setExerciseLogs((prev) => {
      const updated = [...prev];
      const ex = { ...updated[exerciseIndex] };
      const sets = [...ex.sets];
      const currentVal = Number(sets[setIndex][field]) || 0;
      const nextVal = Math.max(0, currentVal + delta);
      sets[setIndex] = {
        ...sets[setIndex],
        [field]: field === 'weight' ? Math.round(nextVal * 2) / 2 : Math.round(nextVal),
      };
      ex.sets = sets;
      updated[exerciseIndex] = ex;
      return updated;
    });
  };

  const handleSaveExerciseEdit = (updatedExercise: Exercise) => {
    if (!onUpdateDayRoutine) return;
    const updatedExercises = dayRoutine.exercises.map((ex) =>
      ex.id === updatedExercise.id ? updatedExercise : ex
    );
    onUpdateDayRoutine({ ...dayRoutine, exercises: updatedExercises });
  };

  const handleDeleteExercise = (exerciseId: string) => {
    if (!onUpdateDayRoutine) return;
    const updatedExercises = dayRoutine.exercises.filter((ex) => ex.id !== exerciseId);
    onUpdateDayRoutine({ ...dayRoutine, exercises: updatedExercises });
  };

  const handleRemoveExerciseVideo = (exerciseId: string) => {
    if (!onUpdateDayRoutine) return;
    const updatedExercises = dayRoutine.exercises.map((ex) =>
      ex.id === exerciseId ? { ...ex, youtubeUrl: undefined } : ex
    );
    onUpdateDayRoutine({ ...dayRoutine, exercises: updatedExercises });
  };

  const handleFinishWorkout = () => {
    const totalCompletedSets = exerciseLogs.reduce(
      (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
      0
    );

    const log: WorkoutSessionLog = {
      id: existingSessionLog?.id || `session-${Date.now()}`,
      planId,
      dayKey: dayRoutine.id || dayRoutine.dayKey,
      dayTitle: dayRoutine.title,
      date: selectedDate,
      timestamp: existingSessionLog?.timestamp || Date.now(),
      durationSeconds: existingSessionLog?.durationSeconds || 0,
      exercises: exerciseLogs,
      completed: totalCompletedSets > 0,
    };

    onSaveSession(log);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  // Rest Day Screen
  if (dayRoutine.isRestDay) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-12">
        <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-xs">
          <div className="inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-50 text-amber-600 mb-4 border border-amber-200">
            <Sparkles className="h-7 w-7" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">{dayRoutine.title}</h2>
          <p className="mt-2 text-sm text-slate-500 max-w-md mx-auto">
            {dayRoutine.subtitle || 'Active recovery, hydration and muscle rest day.'}
          </p>
          {dayRoutine.restNotes && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4 text-xs text-slate-700 text-left max-w-md mx-auto">
              <span className="font-semibold text-slate-900 uppercase tracking-wide block mb-1">
                Recovery Guidance
              </span>
              {dayRoutine.restNotes}
            </div>
          )}
          <div className="mt-6 text-xs text-slate-400">
            Take today off or select another workout day above to start training.
          </div>
        </div>
      </div>
    );
  }

  const completedSetsCount = exerciseLogs.reduce(
    (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
    0
  );
  const totalSetsCount = exerciseLogs.reduce((sum, ex) => sum + ex.sets.length, 0);

  return (
    <div className="max-w-2xl mx-auto px-3.5 py-4 space-y-4 pb-28">
      {/* Top Session Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h2 className="text-base font-bold text-slate-900">{dayRoutine.title}</h2>
            <span className="text-[11px] font-mono font-bold px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
              {completedSetsCount}/{totalSetsCount} Sets Completed
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">{dayRoutine.subtitle}</p>
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs text-slate-700 hover:border-slate-300 transition-colors cursor-pointer shadow-2xs">
            <Calendar className="h-3.5 w-3.5 text-slate-500" />
            <input
              type="date"
              value={selectedDate}
              onChange={(e) => setSelectedDate(e.target.value)}
              className="bg-transparent text-xs text-slate-800 outline-none cursor-pointer font-medium"
            />
          </label>
        </div>
      </div>

      {/* Exercises List */}
      {dayRoutine.exercises.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-8 text-center text-slate-500 space-y-3">
          <Dumbbell className="h-8 w-8 text-slate-400 mx-auto" />
          <p className="text-xs font-medium">No exercises in this workout day yet.</p>
          {onOpenLibraryToAdd && (
            <button
              onClick={onOpenLibraryToAdd}
              className="inline-flex items-center gap-1.5 rounded-xl bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-500 shadow-xs"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>Add Exercises from Library</span>
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3.5">
          {dayRoutine.exercises.map((exercise, exIndex) => {
            const exLog = exerciseLogs[exIndex];
            if (!exLog) return null;

            const prevPerf = previousPerformances[exercise.id];
            const isNoteOpen = expandedNotes[exercise.id];
            const allSetsCompleted =
              exLog.sets.length > 0 && exLog.sets.every((s) => s.completed);

            return (
              <div
                key={exercise.id}
                className={`rounded-2xl border transition-all ${
                  allSetsCompleted
                    ? 'border-emerald-300 bg-white shadow-xs ring-1 ring-emerald-200'
                    : 'border-slate-200/90 bg-white shadow-2xs hover:shadow-xs'
                } p-4`}
              >
                {/* Exercise Header Card */}
                <div className="flex items-start gap-3.5">
                  {/* Photo or Clipart (clickable to edit) */}
                  <div className="shrink-0">
                    <ExerciseImage
                      customImageUrl={exercise.customImageUrl}
                      clipartType={exercise.clipartType}
                      name={exercise.name}
                      size="md"
                      onClick={() => setEditingExercise(exercise)}
                      showZoomOnHover={true}
                    />
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-[11px] font-mono font-bold text-slate-400">
                            #{exIndex + 1}
                          </span>
                          <h3 className="text-sm font-bold text-slate-900 truncate">
                            {exercise.name}
                          </h3>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-slate-500 flex-wrap">
                          <span className="font-medium text-slate-600">
                            {exercise.target}
                          </span>
                          <span>•</span>
                          <span className="font-mono text-slate-800 font-semibold">
                            {exercise.defaultSets} × {exercise.repRange}
                          </span>
                        </div>
                      </div>

                      {/* Header Actions (Rest button + Edit + Delete) */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => onStartRestTimer(exercise.restSeconds)}
                          className="flex items-center gap-1 rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 hover:border-slate-300 transition-colors"
                          title="Start Prescribed Rest Timer"
                        >
                          <Timer className="h-3 w-3 text-blue-600" />
                          <span>{exercise.restDisplay}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setEditingExercise(exercise)}
                          className="p-1 text-slate-400 hover:text-blue-600 hover:bg-slate-100 rounded-lg transition-colors"
                          title="Edit photo, video or exercise details"
                        >
                          <Edit2 className="h-3.5 w-3.5" />
                        </button>

                        {confirmDeleteExerciseId === exercise.id ? (
                          <div className="flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => {
                                handleDeleteExercise(exercise.id);
                                setConfirmDeleteExerciseId(null);
                              }}
                              className="rounded-md bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-red-700 transition-colors shadow-2xs"
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              onClick={() => setConfirmDeleteExerciseId(null)}
                              className="rounded-md border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteExerciseId(exercise.id)}
                            className="p-1 text-slate-300 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                            title="Remove Exercise"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Coaching Cue toggle */}
                    {exercise.notes && (
                      <button
                        type="button"
                        onClick={() => toggleNotes(exercise.id)}
                        className="mt-1.5 flex items-center gap-1 text-[11px] font-medium text-slate-500 hover:text-slate-800 transition-colors"
                      >
                        <Info className="h-3 w-3 text-slate-400" />
                        <span>Form Instructions</span>
                        {isNoteOpen ? (
                          <ChevronUp className="h-3 w-3" />
                        ) : (
                          <ChevronDown className="h-3 w-3" />
                        )}
                      </button>
                    )}

                    {isNoteOpen && exercise.notes && (
                      <div className="mt-1.5 rounded-xl border border-slate-200 bg-slate-50 p-2.5 text-xs text-slate-700 leading-relaxed">
                        💡 {exercise.notes}
                      </div>
                    )}

                    {/* YouTube Demonstration Video Player */}
                    <ExerciseVideoPlayer
                      youtubeUrl={exercise.youtubeUrl}
                      exerciseName={exercise.name}
                      onEditLink={() => setEditingExercise(exercise)}
                      onRemoveLink={() => handleRemoveExerciseVideo(exercise.id)}
                    />
                  </div>
                </div>

                {/* Sets Logging Table */}
                <div className="mt-3.5 overflow-hidden rounded-xl border border-slate-200 bg-white">
                  {/* Table Header */}
                  <div className="grid grid-cols-12 gap-1 border-b border-slate-200 bg-slate-50/80 px-2 py-1.5 text-[10px] font-mono font-bold uppercase tracking-wider text-slate-500">
                    <div className="col-span-2 text-center">Set</div>
                    <div className="col-span-3 text-center">Previous</div>
                    <div className="col-span-3 text-center">
                      {preferences.weightUnit.toUpperCase()}
                    </div>
                    <div className="col-span-2 text-center">Reps</div>
                    <div className="col-span-2 text-center">Done</div>
                  </div>

                  {/* Table Body */}
                  <div className="divide-y divide-slate-100">
                    {exLog.sets.map((set, setIndex) => {
                      const prevSet = prevPerf && prevPerf[setIndex];

                      return (
                        <div
                          key={set.setNumber}
                          className={`grid grid-cols-12 items-center gap-1 px-2 py-2 transition-colors ${
                            set.completed ? 'bg-emerald-50/50' : 'hover:bg-slate-50/60'
                          }`}
                        >
                          {/* Set # */}
                          <div className="col-span-2 text-center font-mono text-xs font-bold text-slate-500">
                            {set.setNumber}
                          </div>

                          {/* Previous */}
                          <div className="col-span-3 text-center font-mono text-xs text-slate-400 truncate">
                            {prevSet ? `${prevSet.weight} × ${prevSet.reps}` : '—'}
                          </div>

                          {/* Weight input with +/- steppers */}
                          <div className="col-span-3 flex items-center justify-center gap-1">
                            <button
                              type="button"
                              onClick={() =>
                                handleAdjustValue(
                                  exIndex,
                                  setIndex,
                                  'weight',
                                  preferences.weightUnit === 'kg' ? -2.5 : -5
                                )
                              }
                              className="hidden sm:flex h-6 w-5 items-center justify-center rounded text-[11px] font-bold text-slate-400 hover:bg-slate-200 active:scale-95 transition-colors"
                            >
                              -
                            </button>
                            <input
                              type="number"
                              step={preferences.weightUnit === 'kg' ? '0.5' : '1'}
                              value={set.weight === 0 ? '' : set.weight}
                              placeholder={prevSet ? String(prevSet.weight) : '0'}
                              onChange={(e) =>
                                handleUpdateSet(
                                  exIndex,
                                  setIndex,
                                  'weight',
                                  parseFloat(e.target.value) || 0
                                )
                              }
                              className="w-14 rounded-lg border border-slate-300 bg-white px-1 py-1 text-center font-mono text-xs font-bold text-slate-900 outline-none focus:border-blue-500 shadow-2xs"
                            />
                            <button
                              type="button"
                              onClick={() =>
                                handleAdjustValue(
                                  exIndex,
                                  setIndex,
                                  'weight',
                                  preferences.weightUnit === 'kg' ? 2.5 : 5
                                )
                              }
                              className="hidden sm:flex h-6 w-5 items-center justify-center rounded text-[11px] font-bold text-slate-400 hover:bg-slate-200 active:scale-95 transition-colors"
                            >
                              +
                            </button>
                          </div>

                          {/* Reps input */}
                          <div className="col-span-2 flex items-center justify-center">
                            <input
                              type="number"
                              value={set.reps === 0 ? '' : set.reps}
                              placeholder="0"
                              onChange={(e) =>
                                handleUpdateSet(
                                  exIndex,
                                  setIndex,
                                  'reps',
                                  parseInt(e.target.value, 10) || 0
                                )
                              }
                              className="w-11 rounded-lg border border-slate-300 bg-white px-1 py-1 text-center font-mono text-xs font-bold text-slate-900 outline-none focus:border-blue-500 shadow-2xs"
                            />
                          </div>

                          {/* Done Checkmark */}
                          <div className="col-span-2 flex items-center justify-center">
                            <button
                              type="button"
                              onClick={() =>
                                handleToggleComplete(
                                  exIndex,
                                  setIndex,
                                  exercise.restSeconds
                                )
                              }
                              className={`flex h-7 w-7 items-center justify-center rounded-lg border transition-all active:scale-90 ${
                                set.completed
                                  ? 'border-emerald-600 bg-emerald-600 text-white shadow-2xs'
                                  : 'border-slate-300 bg-white text-slate-300 hover:border-slate-400 hover:text-slate-500'
                              }`}
                              title="Mark Set Completed"
                            >
                              <Check className="h-4 w-4 stroke-[2.5]" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions: Add / Remove Set */}
                  <div className="flex items-center justify-between border-t border-slate-200 px-3 py-1.5 bg-slate-50/50">
                    <button
                      type="button"
                      onClick={() => handleAddSet(exIndex)}
                      className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-bold text-slate-700 hover:bg-slate-200 hover:text-slate-900 transition-colors"
                    >
                      <Plus className="h-3 w-3" />
                      <span>Add Set</span>
                    </button>

                    {exLog.sets.length > 1 && (
                      <button
                        type="button"
                        onClick={() =>
                          handleRemoveSet(exIndex, exLog.sets.length - 1)
                        }
                        className="flex items-center gap-1 rounded-md px-2 py-1 text-[11px] font-semibold text-slate-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                      >
                        <Trash2 className="h-3 w-3" />
                        <span>Remove Set</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Add Exercise to day button */}
      {onOpenLibraryToAdd && (
        <button
          type="button"
          onClick={onOpenLibraryToAdd}
          className="w-full flex items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white/70 py-3 font-bold text-xs text-slate-700 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/30 transition-all shadow-2xs"
        >
          <Plus className="h-4 w-4" />
          <span>Add Exercise to {dayRoutine.title}</span>
        </button>
      )}

      {/* Bottom Save Workout Action Bar */}
      <div className="pt-2">
        <button
          onClick={handleFinishWorkout}
          className={`w-full flex items-center justify-center gap-2 rounded-2xl py-3.5 px-4 font-bold text-sm transition-all shadow-sm active:scale-[0.98] ${
            savedSuccess
              ? 'bg-emerald-600 text-white'
              : 'bg-slate-900 text-white hover:bg-slate-800'
          }`}
        >
          {savedSuccess ? (
            <>
              <Check className="h-4 w-4 stroke-[2.5]" />
              <span>Workout Saved to Log History!</span>
            </>
          ) : (
            <>
              <Check className="h-4 w-4 stroke-[2.5]" />
              <span>Finish & Save Workout ({completedSetsCount}/{totalSetsCount} Sets Done)</span>
            </>
          )}
        </button>
      </div>

      {/* Exercise Edit Modal (Photo & Video & Prescriptions) */}
      {editingExercise && (
        <ExerciseEditModal
          exercise={editingExercise}
          onSave={handleSaveExerciseEdit}
          onDelete={() => handleDeleteExercise(editingExercise.id)}
          onClose={() => setEditingExercise(null)}
        />
      )}
    </div>
  );
};

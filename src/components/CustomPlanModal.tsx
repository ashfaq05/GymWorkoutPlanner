import React, { useState } from 'react';
import {
  WorkoutPlan,
  Exercise,
  MuscleCategory,
  DayRoutine,
  ExerciseClipartKey,
} from '../types';
import { EXERCISE_LIBRARY, CATEGORIES, DEFAULT_4DAY_PLAN } from '../data/defaultPlan';
import { ExerciseImage } from './ExerciseImage';
import { ExerciseClipart } from './ExerciseClipart';
import { resizeImageFile, isGifUrl } from '../utils/imageUtils';
import { isValidYouTubeUrl } from '../utils/youtube';
import {
  X,
  Plus,
  Trash2,
  Search,
  ArrowUp,
  ArrowDown,
  Dumbbell,
  Check,
  BookOpen,
  Upload,
  Link,
  Youtube,
  Image as ImageIcon,
} from 'lucide-react';

interface CustomPlanModalProps {
  currentPlan: WorkoutPlan;
  onSavePlan: (updatedPlan: WorkoutPlan) => void;
  onClose: () => void;
  initialTab?: 'edit-plan' | 'browse-library' | 'new-exercise';
  initialDayIndex?: number;
}

export const CustomPlanModal: React.FC<CustomPlanModalProps> = ({
  currentPlan,
  onSavePlan,
  onClose,
  initialTab = 'edit-plan',
  initialDayIndex = 0,
}) => {
  const [tab, setTab] = useState<'edit-plan' | 'browse-library' | 'new-exercise'>(initialTab);
  const [planDraft, setPlanDraft] = useState<WorkoutPlan>(
    JSON.stringify(currentPlan) ? JSON.parse(JSON.stringify(currentPlan)) : currentPlan
  );
  const [selectedDayIndex, setSelectedDayIndex] = useState(
    initialDayIndex >= 0 && initialDayIndex < currentPlan.days.length ? initialDayIndex : 0
  );

  // Exercise Library state
  const [librarySearch, setLibrarySearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [libraryExercises, setLibraryExercises] = useState<Exercise[]>(EXERCISE_LIBRARY);

  // New custom exercise state
  const [customName, setCustomName] = useState('');
  const [customTarget, setCustomTarget] = useState('');
  const [customCategory, setCustomCategory] = useState<MuscleCategory>('Chest');
  const [customSets, setCustomSets] = useState(3);
  const [customReps, setCustomReps] = useState('8–12');
  const [customRest, setCustomRest] = useState(90);
  const [customNotes, setCustomNotes] = useState('');
  const [customClipart, setCustomClipart] = useState<ExerciseClipartKey>('bench-press');
  const [customImageUrl, setCustomImageUrl] = useState('');
  const [customYoutubeUrl, setCustomYoutubeUrl] = useState('');

  const selectedDay = planDraft.days[selectedDayIndex] || planDraft.days[0];

  const handleAddExerciseToDay = (exercise: Exercise) => {
    if (!selectedDay) return;
    const updatedDays = [...planDraft.days];
    const targetDay = { ...updatedDays[selectedDayIndex] };
    const newEx = { ...exercise, id: `${exercise.id}-${Date.now()}` };
    targetDay.exercises = [...targetDay.exercises, newEx];
    if (targetDay.isRestDay) {
      targetDay.isRestDay = false;
    }
    updatedDays[selectedDayIndex] = targetDay;
    const updatedPlan = { ...planDraft, days: updatedDays };
    setPlanDraft(updatedPlan);
    onSavePlan(updatedPlan);
    setTab('edit-plan');
  };

  const handleRemoveExerciseFromDay = (exIndex: number) => {
    const updatedDays = [...planDraft.days];
    const targetDay = { ...updatedDays[selectedDayIndex] };
    targetDay.exercises = targetDay.exercises.filter((_, idx) => idx !== exIndex);
    updatedDays[selectedDayIndex] = targetDay;
    const updatedPlan = { ...planDraft, days: updatedDays };
    setPlanDraft(updatedPlan);
    onSavePlan(updatedPlan);
  };

  const handleMoveExercise = (exIndex: number, direction: 'up' | 'down') => {
    const updatedDays = [...planDraft.days];
    const targetDay = { ...updatedDays[selectedDayIndex] };
    const list = [...targetDay.exercises];
    const targetIdx = direction === 'up' ? exIndex - 1 : exIndex + 1;
    if (targetIdx < 0 || targetIdx >= list.length) return;
    const temp = list[exIndex];
    list[exIndex] = list[targetIdx];
    list[targetIdx] = temp;
    targetDay.exercises = list;
    updatedDays[selectedDayIndex] = targetDay;
    setPlanDraft({ ...planDraft, days: updatedDays });
  };

  const handleToggleRestDay = (dayIndex: number) => {
    const updatedDays = [...planDraft.days];
    const day = { ...updatedDays[dayIndex] };
    day.isRestDay = !day.isRestDay;
    if (day.isRestDay) {
      day.subtitle = 'Rest & Recovery day';
    } else {
      day.subtitle = 'Custom workout session';
    }
    updatedDays[dayIndex] = day;
    setPlanDraft({ ...planDraft, days: updatedDays });
  };

  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    try {
      const dataUrl = await resizeImageFile(file, 800, 0.82);
      setCustomImageUrl(dataUrl);
    } catch (err) {
      console.error('Could not process image file:', err);
    }
  };

  const handleCreateCustomExercise = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customName.trim()) return;

    const restDisplay =
      customRest >= 60
        ? customRest % 60 === 0
          ? `${customRest / 60} min`
          : `${Math.floor(customRest / 60)}m ${customRest % 60}s`
        : `${customRest} sec`;

    const newEx: Exercise = {
      id: `custom-${Date.now()}`,
      name: customName.trim(),
      target: customTarget.trim() || customCategory,
      defaultSets: Number(customSets) || 3,
      repRange: customReps || '8–12',
      restSeconds: Number(customRest) || 90,
      restDisplay,
      notes: customNotes.trim(),
      clipartType: customClipart,
      category: customCategory,
      customImageUrl: customImageUrl.trim() ? customImageUrl.trim() : undefined,
      youtubeUrl: customYoutubeUrl.trim() ? customYoutubeUrl.trim() : undefined,
    };

    setLibraryExercises((prev) => [newEx, ...prev]);
    handleAddExerciseToDay(newEx);

    // Reset
    setCustomName('');
    setCustomTarget('');
    setCustomNotes('');
    setCustomImageUrl('');
    setCustomYoutubeUrl('');
  };

  const handleResetToDefault = () => {
    setPlanDraft(JSON.parse(JSON.stringify(DEFAULT_4DAY_PLAN)));
    setShowResetConfirm(false);
  };

  const handleSaveAll = () => {
    onSavePlan(planDraft);
    onClose();
  };

  const filteredLibrary = libraryExercises.filter((ex) => {
    const matchesCategory =
      selectedCategory === 'All' || ex.category === selectedCategory;
    const matchesSearch =
      ex.name.toLowerCase().includes(librarySearch.toLowerCase()) ||
      ex.target.toLowerCase().includes(librarySearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const availableClipartKeys: { key: ExerciseClipartKey; label: string }[] = [
    { key: 'bench-press', label: 'Bench Press' },
    { key: 'incline-dumbbell-press', label: 'Incline Press' },
    { key: 'seated-cable-row', label: 'Cable Row' },
    { key: 'lat-pulldown', label: 'Lat Pulldown' },
    { key: 'neutral-lat-pulldown', label: 'Neutral Pulldown' },
    { key: 'lateral-raise', label: 'Lateral Raise' },
    { key: 'triceps-pushdown', label: 'Tricep Pushdown' },
    { key: 'incline-dumbbell-curl', label: 'Incline Curl' },
    { key: 'leg-extension', label: 'Leg Extension' },
    { key: 'seated-leg-curl', label: 'Leg Curl' },
    { key: 'leg-press', label: 'Leg Press' },
    { key: 'seated-calf-raise', label: 'Calf Raise' },
    { key: 'hanging-knee-raise', label: 'Hanging Knee Raise' },
    { key: 'smith-incline-press', label: 'Smith Press' },
    { key: 'machine-chest-press', label: 'Chest Press' },
    { key: 'seated-shoulder-press', label: 'Shoulder Press' },
    { key: 'reverse-pec-deck', label: 'Rear Delt Fly' },
    { key: 'ez-bar-curl', label: 'EZ Bar Curl' },
    { key: 'hammer-curl', label: 'Hammer Curl' },
    { key: 'overhead-tricep-ext', label: 'Overhead Tricep' },
    { key: 'banded-lateral-walk', label: 'Banded Walk' },
    { key: 'plank-hold', label: 'Plank Hold' },
    { key: 'squat', label: 'Squat' },
    { key: 'deadlift', label: 'Deadlift' },
    { key: 'pullup', label: 'Pull-up' },
    { key: 'dip', label: 'Dip' },
    { key: 'cable-cross', label: 'Cable Fly' },
    { key: 'hip-thrust', label: 'Hip Thrust' },
    { key: 'bent-row', label: 'Bent Row' },
    { key: 'face-pull', label: 'Face Pull' },
    { key: 'standing-calf', label: 'Standing Calf' },
    { key: 'wrist-curl', label: 'Wrist Curl' },
    { key: 'ab-rollout', label: 'Ab Rollout' },
    { key: 'shrug', label: 'Shrug' },
    { key: 'russian-twist', label: 'Russian Twist' },
    { key: 'split-squat', label: 'Split Squat' },
    { key: 'kettlebell-swing', label: 'KB Swing' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs px-3 sm:px-4 overflow-y-auto modal-safe-overlay">
      <div className="my-auto flex max-h-[92vh] w-full max-w-2xl flex-col rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
        {/* Modal Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-slate-50/80">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Dumbbell className="h-4 w-4 text-blue-600" />
              Workout Exercises & Library
            </h2>
            <p className="text-xs text-slate-500">
              Add exercises to days, browse categories, or create custom workouts
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Segmented Navigation Bar */}
        <div className="grid grid-cols-3 border-b border-slate-200 bg-slate-100/70 p-1.5 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setTab('edit-plan')}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 transition-all ${
              tab === 'edit-plan'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <span>Current Days ({planDraft.days.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('browse-library')}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 transition-all ${
              tab === 'browse-library'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <BookOpen className="h-3.5 w-3.5" />
            <span>Exercise Library</span>
          </button>
          <button
            type="button"
            onClick={() => setTab('new-exercise')}
            className={`flex items-center justify-center gap-1.5 rounded-xl py-2 transition-all ${
              tab === 'new-exercise'
                ? 'bg-white text-slate-900 shadow-2xs font-bold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Create Exercise</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-slate-700">
          {/* TAB 1: Edit Days */}
          {tab === 'edit-plan' && (
            <div className="space-y-4">
              {/* Day Selector Pills */}
              <div>
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide block mb-1.5">
                  Select Workout Day to Inspect
                </label>
                <div className="flex gap-1.5 overflow-x-auto no-scrollbar py-0.5">
                  {planDraft.days.map((d, idx) => {
                    const isSelected = idx === selectedDayIndex;
                    return (
                      <button
                        key={d.id || d.dayKey}
                        type="button"
                        onClick={() => setSelectedDayIndex(idx)}
                        className={`flex flex-col items-center justify-center rounded-xl px-3.5 py-2 text-center transition-all shrink-0 border ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold shadow-2xs'
                            : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                        }`}
                      >
                        <span className="text-xs">{d.dayShort}</span>
                        <span className="text-[10px] text-slate-500">
                          {d.isRestDay ? 'Rest' : `${d.exercises.length} ex`}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Day Detail */}
              {selectedDay && (
                <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
                  <div className="flex items-center justify-between gap-2">
                    <div>
                      <h3 className="font-bold text-sm text-slate-900">{selectedDay.title}</h3>
                      <p className="text-xs text-slate-500">{selectedDay.subtitle}</p>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleToggleRestDay(selectedDayIndex)}
                      className={`text-xs px-3 py-1.5 rounded-xl border font-semibold transition-all ${
                        selectedDay.isRestDay
                          ? 'border-amber-300 bg-amber-50 text-amber-800'
                          : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {selectedDay.isRestDay ? 'Set as Workout Day' : 'Set as Rest Day'}
                    </button>
                  </div>

                  {/* Day Exercises List */}
                  {!selectedDay.isRestDay ? (
                    <div className="space-y-2 pt-2 border-t border-slate-200">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-800">
                          Prescribed Exercises ({selectedDay.exercises.length})
                        </span>
                        <button
                          type="button"
                          onClick={() => setTab('browse-library')}
                          className="flex items-center gap-1 text-xs font-bold text-blue-600 hover:text-blue-700"
                        >
                          <Plus className="h-3 w-3" />
                          <span>Add from Library</span>
                        </button>
                      </div>

                      {selectedDay.exercises.length === 0 ? (
                        <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-center text-xs text-slate-500">
                          No exercises added to this day yet. Click "Add from Library" above!
                        </div>
                      ) : (
                        <div className="space-y-1.5">
                          {selectedDay.exercises.map((ex, exIdx) => (
                            <div
                              key={ex.id}
                              className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-2.5 shadow-2xs"
                            >
                              <div className="flex items-center gap-2.5 min-w-0">
                                <ExerciseImage
                                  customImageUrl={ex.customImageUrl}
                                  clipartType={ex.clipartType}
                                  name={ex.name}
                                  size="sm"
                                  className="shrink-0"
                                />
                                <div className="min-w-0">
                                  <div className="font-bold text-slate-900 truncate">
                                    {exIdx + 1}. {ex.name}
                                  </div>
                                  <div className="text-[11px] text-slate-500">
                                    {ex.target} • {ex.defaultSets} × {ex.repRange}
                                  </div>
                                </div>
                              </div>

                              <div className="flex items-center gap-1 shrink-0">
                                <button
                                  type="button"
                                  disabled={exIdx === 0}
                                  onClick={() => handleMoveExercise(exIdx, 'up')}
                                  className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20"
                                  title="Move Up"
                                >
                                  <ArrowUp className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  disabled={exIdx === selectedDay.exercises.length - 1}
                                  onClick={() => handleMoveExercise(exIdx, 'down')}
                                  className="p-1 text-slate-400 hover:text-slate-800 disabled:opacity-20"
                                  title="Move Down"
                                >
                                  <ArrowDown className="h-3.5 w-3.5" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleRemoveExerciseFromDay(exIdx)}
                                  className="p-1 text-slate-300 hover:text-red-600 transition-colors"
                                  title="Remove"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-slate-200 bg-white p-4 text-center text-xs text-slate-500">
                      This day is currently scheduled as a Rest & Recovery day.
                    </div>
                  )}
                </div>
              )}

              {/* Reset to Default */}
              <div className="pt-2 flex justify-start">
                {showResetConfirm ? (
                  <div className="flex items-center gap-2 p-2 rounded-xl bg-red-50 border border-red-200">
                    <span className="text-xs text-red-900 font-medium">Reset plan to default 4-day?</span>
                    <button
                      type="button"
                      onClick={handleResetToDefault}
                      className="px-2.5 py-1 text-[11px] font-bold rounded-lg bg-red-600 text-white hover:bg-red-700 transition-colors shadow-2xs"
                    >
                      Confirm Reset
                    </button>
                    <button
                      type="button"
                      onClick={() => setShowResetConfirm(false)}
                      className="px-2 py-1 text-[11px] font-medium rounded-lg bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowResetConfirm(true)}
                    className="text-xs text-slate-400 hover:text-slate-700 underline underline-offset-4"
                  >
                    Reset active plan back to original 4-Day Muscle Building Plan
                  </button>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: Workout Library */}
          {tab === 'browse-library' && (
            <div className="space-y-3">
              <div className="text-xs text-slate-600">
                Adding exercises directly to:{' '}
                <strong className="text-slate-900">
                  {selectedDay.title} ({selectedDay.dayShort})
                </strong>
              </div>

              {/* Search & Category Filter */}
              <div className="space-y-2">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                  <input
                    type="text"
                    placeholder="Search exercises by name or muscle (bench, row, squat, curl...)"
                    value={librarySearch}
                    onChange={(e) => setLibrarySearch(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>

                <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-1">
                  <button
                    type="button"
                    onClick={() => setSelectedCategory('All')}
                    className={`rounded-lg px-3 py-1 text-[11px] font-semibold transition-colors shrink-0 ${
                      selectedCategory === 'All'
                        ? 'bg-slate-900 text-white shadow-2xs'
                        : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    All Buckets
                  </button>
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setSelectedCategory(cat)}
                      className={`rounded-lg px-3 py-1 text-[11px] font-semibold transition-colors shrink-0 ${
                        selectedCategory === cat
                          ? 'bg-slate-900 text-white shadow-2xs'
                          : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Exercises List */}
              <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
                {filteredLibrary.map((ex) => (
                  <div
                    key={ex.id}
                    className="flex items-center justify-between gap-3 rounded-xl border border-slate-200 bg-white p-3 text-xs hover:border-slate-300 shadow-2xs transition-colors"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <ExerciseImage
                        customImageUrl={ex.customImageUrl}
                        clipartType={ex.clipartType}
                        name={ex.name}
                        size="md"
                        className="shrink-0"
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-slate-900 truncate">
                          {ex.name}
                        </div>
                        <div className="text-[11px] text-slate-500 truncate mt-0.5">
                          <span className="font-medium text-slate-700">{ex.target}</span> • {ex.defaultSets} × {ex.repRange} • Rest {ex.restDisplay}
                        </div>
                        {ex.notes && (
                          <div className="text-[10px] text-slate-400 line-clamp-1 mt-0.5">
                            {ex.notes}
                          </div>
                        )}
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleAddExerciseToDay(ex)}
                      className="flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 text-xs font-bold text-white hover:bg-blue-500 active:scale-95 transition-all shrink-0 shadow-2xs"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: Create Custom Exercise */}
          {tab === 'new-exercise' && (
            <form onSubmit={handleCreateCustomExercise} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide block mb-1">
                    Exercise Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Incline Cable Flyes"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide block mb-1">
                    Target Muscle *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Upper Chest & Delts"
                    value={customTarget}
                    onChange={(e) => setCustomTarget(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>
              </div>

              {/* Upload image or link */}
              <div className="rounded-xl border border-slate-200 bg-slate-50/70 p-3.5 space-y-2">
                <span className="font-semibold text-slate-900 text-xs block">
                  Demonstration Image (Optional)
                </span>
                <div className="flex items-center gap-3">
                  <div className="relative h-16 w-24 shrink-0 rounded-lg border border-slate-200 bg-white overflow-hidden flex items-center justify-center">
                    {customImageUrl ? (
                      <img
                        src={customImageUrl}
                        alt="Preview"
                        className={`h-full w-full ${isGifUrl(customImageUrl) ? 'object-contain' : 'object-cover'}`}
                      />
                    ) : (
                      <div className="h-full w-full flex items-center justify-center text-slate-400">
                        <ImageIcon className="h-6 w-6" />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 space-y-1.5">
                    <label className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer shadow-2xs">
                      <Upload className="h-3.5 w-3.5 text-blue-600" />
                      <span>Upload from Device</span>
                      <input type="file" accept="image/*,image/gif" onChange={handleImageUpload} className="hidden" />
                    </label>
                    <input
                      type="url"
                      placeholder="Or enter image URL (https://...)"
                      value={customImageUrl.startsWith('data:') ? '' : customImageUrl}
                      onChange={(e) => setCustomImageUrl(e.target.value)}
                      className="w-full rounded-lg border border-slate-300 bg-white px-2.5 py-1 text-xs text-slate-900 outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* YouTube Link */}
              <div>
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide block mb-1">
                  Optional YouTube Demonstration Link
                </label>
                <div className="flex items-center gap-2">
                  <Youtube className="h-4 w-4 text-red-600 shrink-0" />
                  <input
                    type="text"
                    placeholder="https://www.youtube.com/watch?v=..."
                    value={customYoutubeUrl}
                    onChange={(e) => setCustomYoutubeUrl(e.target.value)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 shadow-2xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div>
                  <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide block mb-1">
                    Category Bucket
                  </label>
                  <select
                    value={customCategory}
                    onChange={(e) => setCustomCategory(e.target.value as any)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-2 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide block mb-1">
                    Default Sets
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={customSets}
                    onChange={(e) => setCustomSets(parseInt(e.target.value, 10) || 3)}
                    className="w-full rounded-xl border border-slate-300 bg-white px-2 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide block mb-1">
                    Rep Range
                  </label>
                  <input
                    type="text"
                    value={customReps}
                    onChange={(e) => setCustomReps(e.target.value)}
                    placeholder="8–12"
                    className="w-full rounded-xl border border-slate-300 bg-white px-2 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide block mb-1">
                    Rest Seconds
                  </label>
                  <input
                    type="number"
                    value={customRest}
                    onChange={(e) => setCustomRest(parseInt(e.target.value, 10) || 90)}
                    step="15"
                    className="w-full rounded-xl border border-slate-300 bg-white px-2 py-2 text-xs text-slate-900 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Clipart selector fallback */}
              <div>
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide block mb-1">
                  Default Stick-Figure Illustration (Fallback)
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 max-h-32 overflow-y-auto p-1.5 border border-slate-200 rounded-xl bg-slate-50">
                  {availableClipartKeys.map((c) => {
                    const isSelected = customClipart === c.key;
                    return (
                      <button
                        key={c.key}
                        type="button"
                        onClick={() => setCustomClipart(c.key)}
                        className={`flex flex-col items-center justify-center p-1.5 rounded-lg border transition-all ${
                          isSelected
                            ? 'border-blue-500 bg-blue-50 text-blue-900 shadow-2xs font-bold'
                            : 'border-slate-200 bg-white text-slate-600 hover:border-slate-300'
                        }`}
                      >
                        <ExerciseClipart type={c.key} size="sm" className="border-0 bg-transparent" />
                        <span className="text-[9px] truncate max-w-full mt-1">
                          {c.label}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <button
                type="submit"
                className="w-full rounded-xl bg-blue-600 py-3 font-bold text-xs text-white hover:bg-blue-500 shadow-sm transition-colors"
              >
                Create Exercise & Add to {selectedDay.title}
              </button>
            </form>
          )}
        </div>

        {/* Modal Bottom Save Action */}
        <div className="flex items-center justify-end gap-2 border-t border-slate-200 bg-slate-50/80 px-5 py-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveAll}
            className="flex items-center gap-1.5 rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800 shadow-sm active:scale-95 transition-all"
          >
            <Check className="h-4 w-4" />
            <span>Apply Plan Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
};

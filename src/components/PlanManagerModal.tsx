import React, { useState } from 'react';
import { WorkoutPlan, DayRoutine, Exercise } from '../types';
import { DEFAULT_4DAY_PLAN, EXERCISE_LIBRARY } from '../data/defaultPlan';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Check,
  Dumbbell,
  Calendar,
  Layers,
  Sparkles,
  ArrowRight,
  ChevronRight,
  Copy,
} from 'lucide-react';

interface PlanManagerModalProps {
  plans: WorkoutPlan[];
  activePlanId: string;
  onSelectPlan: (planId: string) => void;
  onCreatePlan: (newPlan: WorkoutPlan) => void;
  onUpdatePlan: (updatedPlan: WorkoutPlan) => void;
  onDeletePlan: (planId: string) => void;
  onClose: () => void;
}

export const PlanManagerModal: React.FC<PlanManagerModalProps> = ({
  plans,
  activePlanId,
  onSelectPlan,
  onCreatePlan,
  onUpdatePlan,
  onDeletePlan,
  onClose,
}) => {
  const [view, setView] = useState<'list' | 'create' | 'edit-days'>('list');
  const [editingPlan, setEditingPlan] = useState<WorkoutPlan | null>(null);
  const [confirmDeletePlanId, setConfirmDeletePlanId] = useState<string | null>(null);
  const [confirmDeleteDayIndex, setConfirmDeleteDayIndex] = useState<number | null>(null);
  const [planMessage, setPlanMessage] = useState<string | null>(null);

  // New plan form state
  const [newPlanName, setNewPlanName] = useState('');
  const [newPlanDaysCount, setNewPlanDaysCount] = useState<number>(3);
  const [starterTemplate, setStarterTemplate] = useState<'template' | 'blank'>('template');

  const startCreate = (defaultDays: number = 3) => {
    setNewPlanName('');
    setNewPlanDaysCount(defaultDays);
    setStarterTemplate('template');
    setView('create');
  };

  const startEditPlanDays = (plan: WorkoutPlan) => {
    setEditingPlan(JSON.parse(JSON.stringify(plan)));
    setView('edit-days');
  };

  const handleCreatePlanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPlanName.trim()) return;

    let days: DayRoutine[] = [];

    if (starterTemplate === 'template') {
      if (newPlanDaysCount === 3) {
        // 3-Day Push / Pull / Legs Template
        days = [
          {
            id: `day-${Date.now()}-1`,
            dayKey: 'day-1',
            dayShort: 'Push',
            dayName: 'Day 1: Push',
            title: 'Push (Chest, Shoulders & Triceps)',
            subtitle: 'Heavy compound pushing movements',
            isRestDay: false,
            accent: 'blue',
            exercises: [
              EXERCISE_LIBRARY.find((e) => e.id === 'bb-bench-press')!,
              EXERCISE_LIBRARY.find((e) => e.id === 'incline-db-press')!,
              EXERCISE_LIBRARY.find((e) => e.id === 'seated-db-shoulder-press')!,
              EXERCISE_LIBRARY.find((e) => e.id === 'db-lateral-raises')!,
              EXERCISE_LIBRARY.find((e) => e.id === 'triceps-pushdown')!,
            ],
          },
          {
            id: `day-${Date.now()}-2`,
            dayKey: 'day-2',
            dayShort: 'Pull',
            dayName: 'Day 2: Pull',
            title: 'Pull (Back, Rear Delts & Biceps)',
            subtitle: 'Vertical and horizontal pulling exercises',
            isRestDay: false,
            accent: 'emerald',
            exercises: [
              EXERCISE_LIBRARY.find((e) => e.id === 'lat-pulldown')!,
              EXERCISE_LIBRARY.find((e) => e.id === 'seated-cable-row')!,
              EXERCISE_LIBRARY.find((e) => e.id === 'reverse-pec-deck')!,
              EXERCISE_LIBRARY.find((e) => e.id === 'ez-bar-biceps-curls')!,
              EXERCISE_LIBRARY.find((e) => e.id === 'db-hammer-curls')!,
            ],
          },
          {
            id: `day-${Date.now()}-3`,
            dayKey: 'day-3',
            dayShort: 'Legs',
            dayName: 'Day 3: Legs & Core',
            title: 'Legs (Quads, Hamstrings & Abs)',
            subtitle: 'Lower body foundation and core stability',
            isRestDay: false,
            accent: 'amber',
            exercises: [
              EXERCISE_LIBRARY.find((e) => e.id === 'barbell-back-squat') || EXERCISE_LIBRARY.find((e) => e.id === 'leg-press')!,
              EXERCISE_LIBRARY.find((e) => e.id === 'romanian-deadlift')!,
              EXERCISE_LIBRARY.find((e) => e.id === 'leg-extension')!,
              EXERCISE_LIBRARY.find((e) => e.id === 'seated-leg-curl')!,
              EXERCISE_LIBRARY.find((e) => e.id === 'hanging-knee-raise')!,
            ],
          },
        ];
      } else if (newPlanDaysCount === 5) {
        // 5-Day Bodypart Split Template
        days = [
          {
            id: `day-${Date.now()}-1`,
            dayKey: 'day-1',
            dayShort: 'Chest',
            dayName: 'Day 1: Chest',
            title: 'Chest & Abs',
            subtitle: 'Flat, incline and isolation chest focus',
            isRestDay: false,
            accent: 'blue',
            exercises: [
              EXERCISE_LIBRARY.find((e) => e.id === 'bb-bench-press')!,
              EXERCISE_LIBRARY.find((e) => e.id === 'incline-db-press')!,
              EXERCISE_LIBRARY.find((e) => e.id === 'cable-crossover')!,
              EXERCISE_LIBRARY.find((e) => e.id === 'hanging-knee-raise')!,
            ],
          },
          {
            id: `day-${Date.now()}-2`,
            dayKey: 'day-2',
            dayShort: 'Back',
            dayName: 'Day 2: Back',
            title: 'Back & Core',
            subtitle: 'Full back width, thickness and stability',
            isRestDay: false,
            accent: 'emerald',
            exercises: [
              EXERCISE_LIBRARY.find((e) => e.id === 'lat-pulldown')!,
              EXERCISE_LIBRARY.find((e) => e.id === 'seated-cable-row')!,
              EXERCISE_LIBRARY.find((e) => e.id === 'barbell-bent-row') || EXERCISE_LIBRARY.find((e) => e.id === 'neutral-grip-lat-pulldown')!,
              EXERCISE_LIBRARY.find((e) => e.id === 'plank-hold')!,
            ],
          },
          {
            id: `day-${Date.now()}-3`,
            dayKey: 'day-3',
            dayShort: 'Shoulders',
            dayName: 'Day 3: Shoulders',
            title: 'Shoulders & Traps',
            subtitle: 'Overhead strength and 3D deltoid volume',
            isRestDay: false,
            accent: 'purple',
            exercises: [
              EXERCISE_LIBRARY.find((e) => e.id === 'seated-db-shoulder-press')!,
              EXERCISE_LIBRARY.find((e) => e.id === 'db-lateral-raises')!,
              EXERCISE_LIBRARY.find((e) => e.id === 'reverse-pec-deck')!,
              EXERCISE_LIBRARY.find((e) => e.id === 'dumbbell-shrugs') || EXERCISE_LIBRARY.find((e) => e.id === 'cable-face-pull')!,
            ],
          },
          {
            id: `day-${Date.now()}-4`,
            dayKey: 'day-4',
            dayShort: 'Legs',
            dayName: 'Day 4: Legs',
            title: 'Legs & Calves',
            subtitle: 'Quads, hamstrings, glutes and calves',
            isRestDay: false,
            accent: 'amber',
            exercises: [
              EXERCISE_LIBRARY.find((e) => e.id === 'leg-press')!,
              EXERCISE_LIBRARY.find((e) => e.id === 'romanian-deadlift')!,
              EXERCISE_LIBRARY.find((e) => e.id === 'leg-extension')!,
              EXERCISE_LIBRARY.find((e) => e.id === 'seated-calf-raises')!,
            ],
          },
          {
            id: `day-${Date.now()}-5`,
            dayKey: 'day-5',
            dayShort: 'Arms',
            dayName: 'Day 5: Arms',
            title: 'Biceps, Triceps & Forearms',
            subtitle: 'Arm hypertrophy volume',
            isRestDay: false,
            accent: 'blue',
            exercises: [
              EXERCISE_LIBRARY.find((e) => e.id === 'ez-bar-biceps-curls')!,
              EXERCISE_LIBRARY.find((e) => e.id === 'triceps-pushdown')!,
              EXERCISE_LIBRARY.find((e) => e.id === 'db-hammer-curls')!,
              EXERCISE_LIBRARY.find((e) => e.id === 'overhead-triceps-ext')!,
            ],
          },
        ];
      } else {
        // Generic 4-Day or custom count
        for (let i = 1; i <= newPlanDaysCount; i++) {
          days.push({
            id: `day-${Date.now()}-${i}`,
            dayKey: `day-${i}`,
            dayShort: `Day ${i}`,
            dayName: `Day ${i}`,
            title: `Workout Day ${i}`,
            subtitle: 'Custom target session',
            isRestDay: false,
            accent: 'blue',
            exercises: [EXERCISE_LIBRARY[0], EXERCISE_LIBRARY[1]],
          });
        }
      }
    } else {
      // Blank Days
      for (let i = 1; i <= newPlanDaysCount; i++) {
        days.push({
          id: `day-${Date.now()}-${i}`,
          dayKey: `day-${i}`,
          dayShort: `Day ${i}`,
          dayName: `Day ${i}`,
          title: `Workout Day ${i}`,
          subtitle: 'Add exercises to this day',
          isRestDay: false,
          accent: 'blue',
          exercises: [],
        });
      }
    }

    const newPlan: WorkoutPlan = {
      id: `plan-${Date.now()}`,
      name: newPlanName.trim(),
      description: `${newPlanDaysCount}-Day workout schedule`,
      daysCount: newPlanDaysCount,
      isCustom: true,
      days,
    };

    onCreatePlan(newPlan);
    setView('list');
  };

  const handleDeletePlanClick = (plan: WorkoutPlan, e: React.MouseEvent) => {
    e.stopPropagation();
    if (plans.length <= 1) {
      setPlanMessage('You cannot delete the only workout plan. Create another plan first.');
      setTimeout(() => setPlanMessage(null), 3000);
      return;
    }
    setConfirmDeletePlanId(plan.id);
  };

  const handleSaveEditedPlan = () => {
    if (editingPlan) {
      onUpdatePlan(editingPlan);
      setView('list');
    }
  };

  const handleAddDayToEditingPlan = () => {
    if (!editingPlan) return;
    const nextIdx = editingPlan.days.length + 1;
    const newDay: DayRoutine = {
      id: `day-${Date.now()}-${nextIdx}`,
      dayKey: `day-${nextIdx}`,
      dayShort: `Day ${nextIdx}`,
      dayName: `Day ${nextIdx}`,
      title: `Workout Day ${nextIdx}`,
      subtitle: 'Custom workout session',
      isRestDay: false,
      accent: 'blue',
      exercises: [],
    };
    setEditingPlan({
      ...editingPlan,
      days: [...editingPlan.days, newDay],
    });
  };

  const handleRemoveDayFromEditingPlan = (dayIndex: number) => {
    if (!editingPlan || editingPlan.days.length <= 1) {
      setPlanMessage('A plan must have at least one day.');
      setTimeout(() => setPlanMessage(null), 3000);
      return;
    }
    setConfirmDeleteDayIndex(dayIndex);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs px-3 sm:px-4 overflow-y-auto modal-safe-overlay">
      <div className="my-auto flex max-h-[92vh] w-full max-w-xl flex-col rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-slate-50/80">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="h-4 w-4 text-blue-600" />
              {view === 'create'
                ? 'Create New Workout Plan'
                : view === 'edit-days'
                ? `Edit ${editingPlan?.name || 'Plan'}`
                : 'Workout Plans'}
            </h2>
            <p className="text-xs text-slate-500">
              {view === 'create'
                ? 'Configure a 3-day, 4-day, 5-day or custom routine'
                : view === 'edit-days'
                ? 'Add, rename, or reorder workout days'
                : 'Select an active workout plan or create additional plans'}
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

        {/* Body Content */}
        <div className="flex-1 overflow-y-auto p-5 text-xs text-slate-700">
          {/* VIEW: Plans List */}
          {view === 'list' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 uppercase tracking-wide text-[11px]">
                  Available Plans ({plans.length})
                </span>
                <button
                  type="button"
                  onClick={() => startCreate(3)}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-3.5 py-1.5 font-bold text-white hover:bg-blue-500 shadow-xs active:scale-95 transition-all text-xs"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Workout Plan</span>
                </button>
              </div>

              {/* Plans Grid */}
              <div className="space-y-2.5">
                {plans.map((p) => {
                  const isActive = p.id === activePlanId;
                  const totalExercises = p.days.reduce(
                    (sum, d) => sum + d.exercises.length,
                    0
                  );
                  const daysCount = p.days.length;

                  return (
                    <div
                      key={p.id}
                      onClick={() => onSelectPlan(p.id)}
                      className={`relative flex items-center justify-between rounded-xl border p-4 transition-all cursor-pointer ${
                        isActive
                          ? 'border-blue-500 bg-blue-50/50 shadow-xs'
                          : 'border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50'
                      }`}
                    >
                      <div className="min-w-0 pr-3">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-bold text-sm text-slate-900">
                            {p.name}
                          </h3>
                          {isActive && (
                            <span className="rounded-full bg-blue-600 px-2 py-0.5 text-[10px] font-bold text-white uppercase tracking-wider">
                              Active
                            </span>
                          )}
                          <span className="rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[10px] font-semibold text-slate-700">
                            {daysCount} Days
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1 line-clamp-1">
                          {p.description || `${daysCount} workout days with ${totalExercises} exercises`}
                        </p>
                        <div className="flex items-center gap-1.5 mt-2 flex-wrap text-[11px] text-slate-600">
                          {p.days.slice(0, 5).map((d) => (
                            <span
                              key={d.id}
                              className="rounded bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-700"
                            >
                              {d.dayShort}
                            </span>
                          ))}
                          {p.days.length > 5 && (
                            <span className="text-[10px] text-slate-400">
                              +{p.days.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditPlanDays(p);
                          }}
                          className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
                          title="Edit days and routine structure"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>

                        {confirmDeletePlanId === p.id ? (
                          <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onDeletePlan(p.id);
                                setConfirmDeletePlanId(null);
                              }}
                              className="rounded-lg bg-red-600 px-2.5 py-1 text-[11px] font-bold text-white hover:bg-red-700 transition-colors shadow-2xs"
                            >
                              Delete
                            </button>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setConfirmDeletePlanId(null);
                              }}
                              className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[11px] font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : plans.length > 1 ? (
                          <button
                            type="button"
                            onClick={(e) => handleDeletePlanClick(p, e)}
                            className="rounded-lg p-2 text-slate-400 hover:bg-red-50 hover:text-red-600 transition-colors"
                            title="Delete Plan"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Quick Preset Buttons */}
              <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50/50 p-4 space-y-2 mt-4">
                <span className="text-[11px] font-semibold text-slate-600 uppercase tracking-wide block">
                  Quick Create Duration Presets
                </span>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setNewPlanName('3-Day Push / Pull / Legs');
                      setNewPlanDaysCount(3);
                      setStarterTemplate('template');
                      setView('create');
                    }}
                    className="rounded-xl border border-slate-200 bg-white p-2.5 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all shadow-2xs"
                  >
                    <span className="font-bold text-slate-900 block text-xs">3-Day Plan</span>
                    <span className="text-[10px] text-slate-500">Push / Pull / Legs</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewPlanName('4-Day Upper / Lower');
                      setNewPlanDaysCount(4);
                      setStarterTemplate('template');
                      setView('create');
                    }}
                    className="rounded-xl border border-slate-200 bg-white p-2.5 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all shadow-2xs"
                  >
                    <span className="font-bold text-slate-900 block text-xs">4-Day Plan</span>
                    <span className="text-[10px] text-slate-500">Upper & Lower Split</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setNewPlanName('5-Day Bodypart Split');
                      setNewPlanDaysCount(5);
                      setStarterTemplate('template');
                      setView('create');
                    }}
                    className="rounded-xl border border-slate-200 bg-white p-2.5 text-center hover:border-blue-400 hover:bg-blue-50/30 transition-all shadow-2xs"
                  >
                    <span className="font-bold text-slate-900 block text-xs">5-Day Plan</span>
                    <span className="text-[10px] text-slate-500">Chest, Back, Arms...</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* VIEW: Create New Plan */}
          {view === 'create' && (
            <form onSubmit={handleCreatePlanSubmit} className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide block mb-1">
                  Plan Name *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 3-Day Push Pull Legs, 5-Day Hypertrophy, etc."
                  value={newPlanName}
                  onChange={(e) => setNewPlanName(e.target.value)}
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs text-slate-900 outline-none focus:border-blue-500 shadow-2xs"
                />
              </div>

              {/* Number of Workout Days */}
              <div>
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide block mb-1.5">
                  Select Workout Days Duration
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[2, 3, 4, 5].map((count) => (
                    <button
                      key={count}
                      type="button"
                      onClick={() => setNewPlanDaysCount(count)}
                      className={`flex flex-col items-center justify-center rounded-xl p-3 border transition-all ${
                        newPlanDaysCount === count
                          ? 'border-blue-500 bg-blue-50 text-blue-700 font-bold shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      <span className="text-base">{count}</span>
                      <span className="text-[10px] text-slate-500">Days Plan</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Starter Template vs Blank */}
              <div>
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide block mb-1.5">
                  Starter Setup
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setStarterTemplate('template')}
                    className={`rounded-xl p-3 border text-left transition-all ${
                      starterTemplate === 'template'
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-bold text-xs block">Pre-Filled Exercises</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Includes proven exercises for each day based on duration
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStarterTemplate('blank')}
                    className={`rounded-xl p-3 border text-left transition-all ${
                      starterTemplate === 'blank'
                        ? 'border-blue-500 bg-blue-50 text-blue-800'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                    }`}
                  >
                    <span className="font-bold text-xs block">Blank Schedule</span>
                    <span className="text-[11px] text-slate-500 block mt-0.5">
                      Start empty and select each exercise manually
                    </span>
                  </button>
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Back to Plans
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2.5 font-bold text-white hover:bg-blue-500 shadow-sm active:scale-95 transition-all text-xs"
                >
                  <Check className="h-4 w-4" />
                  <span>Create & Open Plan</span>
                </button>
              </div>
            </form>
          )}

          {/* VIEW: Edit Days of a Plan */}
          {view === 'edit-days' && editingPlan && (
            <div className="space-y-4">
              <div>
                <label className="text-[11px] font-semibold text-slate-700 uppercase tracking-wide block mb-1">
                  Plan Name
                </label>
                <input
                  type="text"
                  value={editingPlan.name}
                  onChange={(e) =>
                    setEditingPlan({ ...editingPlan, name: e.target.value })
                  }
                  className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2 text-xs text-slate-900 outline-none focus:border-blue-500 shadow-2xs font-semibold"
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="font-semibold text-slate-900 uppercase tracking-wide text-[11px]">
                  Workout Days ({editingPlan.days.length})
                </span>
                <button
                  type="button"
                  onClick={handleAddDayToEditingPlan}
                  className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>Add Day</span>
                </button>
              </div>

              <div className="space-y-2">
                {editingPlan.days.map((day, idx) => (
                  <div
                    key={day.id}
                    className="rounded-xl border border-slate-200 bg-slate-50/60 p-3 space-y-2"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex-1 space-y-1">
                        <input
                          type="text"
                          value={day.title}
                          onChange={(e) => {
                            const updated = [...editingPlan.days];
                            updated[idx] = { ...day, title: e.target.value };
                            setEditingPlan({ ...editingPlan, days: updated });
                          }}
                          className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-900 outline-none focus:border-blue-500"
                          placeholder="Day Title (e.g. Upper Body A)"
                        />
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={day.dayShort}
                            onChange={(e) => {
                              const updated = [...editingPlan.days];
                              updated[idx] = { ...day, dayShort: e.target.value };
                              setEditingPlan({ ...editingPlan, days: updated });
                            }}
                            className="w-24 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] font-semibold text-slate-700 outline-none focus:border-blue-500"
                            placeholder="Short Tag"
                          />
                          <input
                            type="text"
                            value={day.subtitle}
                            onChange={(e) => {
                              const updated = [...editingPlan.days];
                              updated[idx] = { ...day, subtitle: e.target.value };
                              setEditingPlan({ ...editingPlan, days: updated });
                            }}
                            className="flex-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-[11px] text-slate-500 outline-none focus:border-blue-500"
                            placeholder="Subtitle or focus cue"
                          />
                        </div>
                      </div>

                      {confirmDeleteDayIndex === idx ? (
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => {
                              const updatedDays = editingPlan.days.filter((_, i) => i !== idx);
                              setEditingPlan({ ...editingPlan, days: updatedDays });
                              setConfirmDeleteDayIndex(null);
                            }}
                            className="rounded-lg bg-red-600 px-2 py-1 text-[10px] font-bold text-white hover:bg-red-700 transition-colors shadow-2xs"
                          >
                            Delete
                          </button>
                          <button
                            type="button"
                            onClick={() => setConfirmDeleteDayIndex(null)}
                            className="rounded-lg border border-slate-200 bg-white px-2 py-1 text-[10px] font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => handleRemoveDayFromEditingPlan(idx)}
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Remove Day"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>

                    <div className="text-[11px] text-slate-500 flex items-center justify-between pt-1 border-t border-slate-200">
                      <span>{day.exercises.length} exercises configured</span>
                      <label className="flex items-center gap-1.5 cursor-pointer text-slate-600">
                        <input
                          type="checkbox"
                          checked={day.isRestDay}
                          onChange={(e) => {
                            const updated = [...editingPlan.days];
                            updated[idx] = { ...day, isRestDay: e.target.checked };
                            setEditingPlan({ ...editingPlan, days: updated });
                          }}
                          className="rounded text-blue-600"
                        />
                        <span>Rest & Recovery Day</span>
                      </label>
                    </div>
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="flex items-center justify-between pt-3 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setView('list')}
                  className="rounded-xl px-4 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSaveEditedPlan}
                  className="flex items-center gap-1.5 rounded-xl bg-blue-600 px-5 py-2 font-bold text-white hover:bg-blue-500 shadow-sm active:scale-95 transition-all text-xs"
                >
                  <Check className="h-4 w-4" />
                  <span>Save Plan Changes</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

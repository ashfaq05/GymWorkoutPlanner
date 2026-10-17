import React from 'react';
import { DayRoutine } from '../types';
import { CheckCircle2, Plus, SlidersHorizontal } from 'lucide-react';

interface WorkoutDayBarProps {
  days: DayRoutine[];
  activeDayId: string;
  onSelectDay: (dayId: string) => void;
  completedDayIds: Set<string>;
  onAddDay?: () => void;
}

export const WorkoutDayBar: React.FC<WorkoutDayBarProps> = ({
  days,
  activeDayId,
  onSelectDay,
  completedDayIds,
  onAddDay,
}) => {
  return (
    <div className="w-full bg-white border-b border-slate-200 px-3 py-2.5 shadow-2xs">
      <div className="max-w-2xl mx-auto flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
        {days.map((day, index) => {
          const isActive = day.id === activeDayId || day.dayKey === activeDayId;
          const isCompleted = completedDayIds.has(day.id) || completedDayIds.has(day.dayKey);

          return (
            <button
              key={day.id || day.dayKey}
              onClick={() => onSelectDay(day.id || day.dayKey)}
              className={`relative flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs transition-all shrink-0 select-none active:scale-95 ${
                isActive
                  ? 'bg-slate-900 text-white font-bold shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50 hover:border-slate-300 font-medium'
              }`}
            >
              {/* Day title / short tag */}
              <span>{day.dayShort || `Day ${index + 1}`}</span>

              {/* Tag indicator */}
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded font-normal ${
                  isActive
                    ? 'bg-white/20 text-slate-100'
                    : day.isRestDay
                    ? 'bg-slate-100 text-slate-500'
                    : 'bg-slate-100 text-slate-600'
                }`}
              >
                {day.isRestDay ? 'Rest' : day.title.replace('Body ', '')}
              </span>

              {/* Completed checkmark */}
              {isCompleted && (
                <CheckCircle2
                  className={`h-3.5 w-3.5 shrink-0 ${
                    isActive ? 'text-emerald-300' : 'text-emerald-600'
                  }`}
                />
              )}
            </button>
          );
        })}

        {onAddDay && (
          <button
            type="button"
            onClick={onAddDay}
            className="flex items-center gap-1 rounded-xl border border-dashed border-slate-300 bg-white px-2.5 py-2 text-xs font-semibold text-slate-500 hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/20 transition-all shrink-0 active:scale-95"
            title="Add another workout day to this plan"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>Day</span>
          </button>
        )}
      </div>
    </div>
  );
};

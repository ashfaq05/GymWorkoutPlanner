import React from 'react';
import { DayRoutine, DayKey } from '../types';
import { CheckCircle2 } from 'lucide-react';

interface DaySelectorProps {
  days: DayRoutine[];
  activeDayKey: DayKey;
  onSelectDay: (dayKey: DayKey) => void;
  todayKey: DayKey;
  completedDayKeys: Set<DayKey>;
}

export const DaySelector: React.FC<DaySelectorProps> = ({
  days,
  activeDayKey,
  onSelectDay,
  todayKey,
  completedDayKeys,
}) => {
  return (
    <div className="w-full bg-neutral-900/90 border-y border-neutral-800/80 px-2 py-2.5 backdrop-blur-md">
      <div className="max-w-2xl mx-auto flex items-center justify-between gap-1 overflow-x-auto no-scrollbar py-0.5">
        {days.map((day) => {
          const isActive = day.dayKey === activeDayKey;
          const isToday = day.dayKey === todayKey;
          const isCompleted = completedDayKeys.has(day.dayKey);

          return (
            <button
              key={day.dayKey}
              onClick={() => onSelectDay(day.dayKey)}
              className={`relative flex flex-1 min-w-[50px] flex-col items-center justify-center rounded-xl py-2 px-1 transition-all select-none active:scale-95 ${
                isActive
                  ? 'bg-neutral-100 text-neutral-950 font-semibold shadow-md'
                  : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
              }`}
            >
              {/* Today indicator dot */}
              {isToday && (
                <span
                  className={`absolute top-1 right-1.5 h-1.5 w-1.5 rounded-full ${
                    isActive ? 'bg-blue-600' : 'bg-blue-400 ring-2 ring-neutral-900'
                  }`}
                  title="Today"
                />
              )}

              {/* Day short name (MON, TUE...) */}
              <span className={`text-[11px] font-mono tracking-wider uppercase leading-tight ${
                isActive ? 'text-neutral-900 font-bold' : 'text-neutral-400'
              }`}>
                {day.dayShort}
              </span>

              {/* Routine short tag or Rest */}
              <span
                className={`text-[10px] mt-0.5 max-w-full truncate px-1 rounded-sm leading-tight ${
                  day.isRestDay
                    ? isActive
                      ? 'text-neutral-600'
                      : 'text-neutral-500'
                    : isActive
                    ? 'text-neutral-900 font-medium'
                    : 'text-neutral-300 font-medium'
                }`}
              >
                {day.isRestDay ? 'Rest' : day.title.replace('Body ', '')}
              </span>

              {/* Completed check badge */}
              {isCompleted && (
                <CheckCircle2
                  className={`h-3 w-3 mt-1 ${
                    isActive ? 'text-emerald-700' : 'text-emerald-400'
                  }`}
                />
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
};

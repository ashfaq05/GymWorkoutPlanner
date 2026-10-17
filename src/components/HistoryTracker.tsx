import React, { useState } from 'react';
import { WorkoutSessionLog, UserPreferences } from '../types';
import {
  Calendar,
  Trophy,
  Dumbbell,
  Trash2,
  ChevronDown,
  ChevronUp,
  Download,
  Upload,
  CheckCircle2,
} from 'lucide-react';
import { getPersonalRecords } from '../utils/storage';

interface HistoryTrackerProps {
  logs: WorkoutSessionLog[];
  preferences: UserPreferences;
  onDeleteLog: (id: string) => void;
  onImportLogs: (logs: WorkoutSessionLog[]) => void;
}

export const HistoryTracker: React.FC<HistoryTrackerProps> = ({
  logs,
  preferences,
  onDeleteLog,
  onImportLogs,
}) => {
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<'history' | 'prs'>('history');
  const [confirmDeleteLogId, setConfirmDeleteLogId] = useState<string | null>(null);

  const personalRecords = getPersonalRecords();
  const prEntries = Object.entries(personalRecords);

  const totalWorkouts = logs.filter((l) => l.completed).length;

  const handleExportData = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `gymtrack-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const [importMessage, setImportMessage] = useState<string | null>(null);

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        if (Array.isArray(parsed)) {
          onImportLogs(parsed);
          setImportMessage(`Successfully imported ${parsed.length} workout logs.`);
          setTimeout(() => setImportMessage(null), 3500);
        }
      } catch (err) {
        setImportMessage('Invalid JSON file format.');
        setTimeout(() => setImportMessage(null), 3500);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  return (
    <div className="max-w-2xl mx-auto px-3.5 py-4 space-y-4 pb-28">
      {importMessage && (
        <div className="rounded-xl border border-blue-200 bg-blue-50 p-3 text-xs text-blue-900 font-medium">
          {importMessage}
        </div>
      )}
      {/* Overview Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Workouts Logged
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-mono text-2xl font-bold text-slate-900">
              {totalWorkouts}
            </span>
            <span className="text-xs text-slate-500">sessions</span>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Personal Records
          </div>
          <div className="mt-1 flex items-baseline gap-1">
            <span className="font-mono text-2xl font-bold text-amber-600">
              {prEntries.length}
            </span>
            <span className="text-xs text-slate-500">exercises</span>
          </div>
        </div>

        <div className="col-span-2 sm:col-span-1 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs flex flex-col justify-between">
          <div className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Data Backup
          </div>
          <div className="flex items-center gap-1.5 mt-2">
            <button
              onClick={handleExportData}
              className="flex-1 flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 active:scale-95 transition-all shadow-2xs"
              title="Download backup JSON"
            >
              <Download className="h-3 w-3" />
              <span>Export</span>
            </button>
            <label className="flex-1 flex items-center justify-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-100 active:scale-95 transition-all shadow-2xs cursor-pointer">
              <Upload className="h-3 w-3" />
              <span>Import</span>
              <input
                type="file"
                accept=".json"
                onChange={handleImportData}
                className="hidden"
              />
            </label>
          </div>
        </div>
      </div>

      {/* Tabs: Workout Logs vs PRs */}
      <div className="flex border-b border-slate-200 bg-white rounded-xl p-1 border shadow-2xs">
        <button
          onClick={() => setViewTab('history')}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
            viewTab === 'history'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Calendar className="h-3.5 w-3.5" />
          <span>Session Log History ({logs.length})</span>
        </button>
        <button
          onClick={() => setViewTab('prs')}
          className={`flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-xs font-bold transition-all ${
            viewTab === 'prs'
              ? 'bg-slate-900 text-white shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Trophy className="h-3.5 w-3.5" />
          <span>Personal Best Records</span>
        </button>
      </div>

      {/* Logs View */}
      {viewTab === 'history' && (
        <div className="space-y-2.5">
          {logs.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 shadow-xs">
              No workouts logged yet. Complete sets in your workout plan and tap "Finish & Save Workout"!
            </div>
          ) : (
            logs.map((log) => {
              const isExpanded = expandedLogId === log.id;
              const completedSetsCount = log.exercises.reduce(
                (sum, ex) => sum + ex.sets.filter((s) => s.completed).length,
                0
              );
              const totalVolume = log.exercises.reduce((acc, ex) => {
                return (
                  acc +
                  ex.sets.reduce((sAcc, s) => {
                    return s.completed ? sAcc + (s.weight || 0) * (s.reps || 0) : sAcc;
                  }, 0)
                );
              }, 0);

              return (
                <div
                  key={log.id}
                  className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-2xs transition-all hover:border-slate-300"
                >
                  {/* Summary Bar */}
                  <div
                    onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                    className="flex items-center justify-between p-3.5 cursor-pointer hover:bg-slate-50/70 select-none"
                  >
                    <div className="min-w-0 flex items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-800 border border-slate-200">
                        <Dumbbell className="h-4 w-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-slate-900 truncate">
                            {log.dayTitle}
                          </span>
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                            {log.date}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-500 mt-0.5 flex items-center gap-2">
                          <span>{completedSetsCount} sets finished</span>
                          {totalVolume > 0 && (
                            <>
                              <span>•</span>
                              <span className="font-mono text-slate-700 font-semibold">
                                {totalVolume.toLocaleString()} {preferences.weightUnit} total
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {confirmDeleteLogId === log.id ? (
                        <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteLog(log.id);
                              setConfirmDeleteLogId(null);
                            }}
                            className="rounded-lg bg-red-600 px-2 py-0.5 text-[10px] font-bold text-white hover:bg-red-700 transition-colors shadow-2xs"
                          >
                            Delete
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setConfirmDeleteLogId(null);
                            }}
                            className="rounded-lg border border-slate-200 bg-white px-1.5 py-0.5 text-[10px] font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setConfirmDeleteLogId(log.id);
                          }}
                          className="p-1.5 text-slate-300 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete log"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </button>
                      )}
                      {isExpanded ? (
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                      ) : (
                        <ChevronDown className="h-4 w-4 text-slate-400" />
                      )}
                    </div>
                  </div>

                  {/* Expanded Breakdown */}
                  {isExpanded && (
                    <div className="border-t border-slate-200 bg-slate-50/60 p-3.5 space-y-2 text-xs">
                      {log.exercises.map((ex) => {
                        const completedSets = ex.sets.filter((s) => s.completed);
                        if (completedSets.length === 0) return null;

                        return (
                          <div
                            key={ex.exerciseId}
                            className="rounded-xl border border-slate-200 bg-white p-2.5"
                          >
                            <div className="font-bold text-slate-800">
                              {ex.exerciseName}
                            </div>
                            <div className="flex flex-wrap gap-1.5 mt-1.5">
                              {completedSets.map((s) => (
                                <span
                                  key={s.setNumber}
                                  className="inline-flex items-center gap-1 rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-mono text-slate-700"
                                >
                                  <span className="text-slate-400">#{s.setNumber}:</span>
                                  <span className="font-bold text-slate-900">
                                    {s.weight}{preferences.weightUnit} × {s.reps}
                                  </span>
                                </span>
                              ))}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      )}

      {/* PRs View */}
      {viewTab === 'prs' && (
        <div className="space-y-2">
          {prEntries.length === 0 ? (
            <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center text-xs text-slate-500 shadow-xs">
              No PRs yet. As you log sets, your heaviest weight per exercise will appear here automatically!
            </div>
          ) : (
            prEntries.map(([exerciseId, record]) => (
              <div
                key={exerciseId}
                className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-3.5 text-xs shadow-2xs hover:border-slate-300"
              >
                <div>
                  <div className="font-bold text-slate-900 capitalize">
                    {exerciseId.replace(/-/g, ' ')}
                  </div>
                  <div className="text-[11px] text-slate-500 mt-0.5">
                    Achieved on {record.date}
                  </div>
                </div>

                <div className="flex items-center gap-1.5 font-mono text-sm font-bold text-amber-600 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                  <Trophy className="h-4 w-4 text-amber-600" />
                  <span>
                    {record.maxWeight} {preferences.weightUnit} × {record.reps}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

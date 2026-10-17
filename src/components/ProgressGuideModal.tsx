import React from 'react';
import { X, TrendingUp, Info, HelpCircle, CheckCircle } from 'lucide-react';
import { ExerciseClipart } from './ExerciseClipart';

interface ProgressGuideModalProps {
  onClose: () => void;
}

export const ProgressGuideModal: React.FC<ProgressGuideModalProps> = ({ onClose }) => {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs px-4 overflow-y-auto modal-safe-overlay">
      <div className="my-auto flex max-h-[88vh] w-full max-w-lg flex-col rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-slate-50/80">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4 text-emerald-600" />
            <h2 className="text-sm font-bold text-slate-900">
              Training Principles & Guide
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-200 hover:text-slate-700"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs text-slate-700 leading-relaxed">
          {/* Rule of thumb */}
          <div className="rounded-2xl border border-emerald-200 bg-emerald-50/60 p-4 space-y-2">
            <div className="font-bold text-emerald-950 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
              <span className="h-2 w-2 rounded-full bg-emerald-600" />
              How To Progress (Rule of Thumb)
            </div>
            <p className="text-emerald-900 font-medium italic">
              "When you hit the top of the rep range on every set, add a small amount of weight next session. Stop each set 1–2 reps before failure, keep good form, and write every workout down."
            </p>
          </div>

          {/* Reading the diagrams */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-2">
            <div className="font-bold text-slate-900 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5 text-blue-600" />
              Reading The Diagrams
            </div>
            <div className="flex items-center gap-3 py-1">
              <ExerciseClipart type="bench-press" size="md" className="border-slate-200 bg-white text-slate-800" />
              <div className="space-y-1 text-slate-600">
                <div>• <strong className="text-slate-900">Faded figure:</strong> The start position.</div>
                <div>• <strong className="text-slate-900">Solid figure:</strong> The finish position.</div>
                <div>• <strong className="text-slate-900">Arrow:</strong> Direction of the movement.</div>
              </div>
            </div>
          </div>

          {/* Rest Period Guidance */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-1.5">
            <div className="font-bold text-slate-900 uppercase tracking-wide text-[11px]">
              Rest Intervals
            </div>
            <p className="text-slate-600">
              Heavy compound presses (Bench Press, Smith Press, Squats) benefit from 2–3 minutes of rest for optimal recovery. Isolation lifts (curls, calf raises, lateral raises) use 60–90 seconds. You can tap the rest timer button anytime during workouts.
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-slate-200 bg-slate-50/80 px-5 py-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2 text-xs font-bold text-white hover:bg-slate-800"
          >
            Got It
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
import { Play, Pause, RotateCcw, Plus, X, Volume2, VolumeX, Bell } from 'lucide-react';

interface RestTimerProps {
  initialSeconds: number;
  isActive: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  vibrateEnabled?: boolean;
}

// Gentle Web Audio beep chime
function playTimerCompleteChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // First tone
    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sine';
    osc1.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
    gain1.gain.setValueAtTime(0.15, ctx.currentTime);
    gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);
    osc1.connect(gain1);
    gain1.connect(ctx.destination);
    osc1.start();
    osc1.stop(ctx.currentTime + 0.3);

    // Second higher tone
    const osc2 = ctx.createOscillator();
    const gain2 = ctx.createGain();
    osc2.type = 'sine';
    osc2.frequency.setValueAtTime(880, ctx.currentTime + 0.2); // A5
    gain2.gain.setValueAtTime(0.18, ctx.currentTime + 0.2);
    gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc2.connect(gain2);
    gain2.connect(ctx.destination);
    osc2.start(ctx.currentTime + 0.2);
    osc2.stop(ctx.currentTime + 0.6);
  } catch (e) {
    console.warn('Audio chime unsupported:', e);
  }
}

export const RestTimer: React.FC<RestTimerProps> = ({
  initialSeconds,
  isActive,
  onClose,
  soundEnabled,
  onToggleSound,
  vibrateEnabled = true,
}) => {
  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const [isRunning, setIsRunning] = useState(isActive);
  const [totalTime, setTotalTime] = useState(initialSeconds);

  useEffect(() => {
    setTimeLeft(initialSeconds);
    setTotalTime(initialSeconds);
    setIsRunning(isActive);
  }, [initialSeconds, isActive]);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;

    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (soundEnabled) {
              playTimerCompleteChime();
            }
            if (vibrateEnabled && typeof navigator !== 'undefined' && navigator.vibrate) {
              try {
                navigator.vibrate([200, 100, 200]);
              } catch (_) {}
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    } else if (timeLeft === 0) {
      setIsRunning(false);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, soundEnabled, vibrateEnabled]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const progressPercent = totalTime > 0 ? ((totalTime - timeLeft) / totalTime) * 100 : 100;
  const isFinished = timeLeft === 0;

  return (
    <div className="fixed timer-safe-bottom sm:bottom-6 left-1/2 -translate-x-1/2 z-40 w-11/12 max-w-md">
      <div className={`relative overflow-hidden rounded-2xl border shadow-lg backdrop-blur-md p-3.5 transition-all ${
        isFinished 
          ? 'border-emerald-500 bg-emerald-900 text-white shadow-emerald-950/20' 
          : 'border-slate-800 bg-slate-900 text-white'
      }`}>
        {/* Subtle Progress Bar */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-slate-800">
          <div
            className={`h-full transition-all duration-300 ${isFinished ? 'bg-emerald-400' : 'bg-blue-500'}`}
            style={{ width: `${Math.min(100, progressPercent)}%` }}
          />
        </div>

        <div className="flex items-center justify-between gap-3 pt-0.5">
          {/* Time display */}
          <div className="flex items-center gap-2.5">
            <div className={`flex h-10 w-10 items-center justify-center rounded-xl font-mono text-xs font-semibold ${
              isFinished ? 'bg-emerald-800 text-emerald-200' : 'bg-slate-800 text-slate-300'
            }`}>
              <Bell className={`h-4 w-4 ${isRunning ? 'animate-pulse text-blue-400' : ''}`} />
            </div>
            <div>
              <div className="text-[10px] font-bold tracking-wide uppercase text-slate-400">
                {isFinished ? 'Rest Finished!' : 'Rest Interval'}
              </div>
              <div className="font-mono text-2xl font-bold tracking-tight">
                {formatTime(timeLeft)}
              </div>
            </div>
          </div>

          {/* Quick controls */}
          <div className="flex items-center gap-1.5">
            <button
              type="button"
              onClick={() => {
                setTimeLeft((prev) => prev + 30);
                setTotalTime((prev) => prev + 30);
              }}
              className="flex h-8 items-center gap-0.5 rounded-lg border border-slate-700 bg-slate-800 px-2 text-xs font-semibold text-slate-200 hover:bg-slate-700 active:scale-95 transition-all"
              title="Add 30 seconds"
            >
              <Plus className="h-3 w-3" />
              30s
            </button>

            <button
              type="button"
              onClick={() => setIsRunning(!isRunning)}
              className={`flex h-8 w-8 items-center justify-center rounded-lg active:scale-95 transition-all ${
                isRunning
                  ? 'bg-amber-500 text-slate-900 hover:bg-amber-400'
                  : 'bg-blue-600 text-white hover:bg-blue-500'
              }`}
              title={isRunning ? 'Pause' : 'Play'}
            >
              {isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5 fill-current" />}
            </button>

            <button
              type="button"
              onClick={() => {
                setTimeLeft(totalTime);
                setIsRunning(true);
              }}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 active:scale-95 transition-all"
              title="Reset"
            >
              <RotateCcw className="h-3.5 w-3.5" />
            </button>

            <button
              type="button"
              onClick={onToggleSound}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition-all"
              title={soundEnabled ? 'Mute chime' : 'Enable chime'}
            >
              {soundEnabled ? <Volume2 className="h-3.5 w-3.5" /> : <VolumeX className="h-3.5 w-3.5 text-slate-600" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white active:scale-95 transition-all ml-1"
              title="Close Timer"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

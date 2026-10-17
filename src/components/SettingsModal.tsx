import React, { useState } from 'react';
import { UserPreferences } from '../types';
import {
  X,
  User as UserIcon,
  LogOut,
  Smartphone,
  Download,
  Upload,
  Moon,
  Sun,
  RotateCcw,
  Cloud,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ShieldCheck,
  Flame,
} from 'lucide-react';
import { User } from 'firebase/auth';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { CloudSyncStatus } from '../utils/firebase';

interface SettingsModalProps {
  preferences: UserPreferences;
  onUpdatePreferences: (updated: UserPreferences) => void;
  currentUser: User | null;
  cloudSyncStatus: CloudSyncStatus;
  onSignInGoogle: () => Promise<void>;
  onSignInGuest: () => Promise<void>;
  onSignOut: () => Promise<void>;
  onSyncCloudNow: () => Promise<void>;
  onClose: () => void;
  onExportData: () => void;
  onImportData: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onResetPlan: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  preferences,
  onUpdatePreferences,
  currentUser,
  cloudSyncStatus,
  onSignInGoogle,
  onSignInGuest,
  onSignOut,
  onSyncCloudNow,
  onClose,
  onExportData,
  onImportData,
  onResetPlan,
}) => {
  const { isInstallable, isInstalled, install } = usePWAInstall();
  const [authLoading, setAuthLoading] = useState(false);
  const [toastMsg, setToastMsg] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  const formatFriendlyError = (e: any): string => {
    if (!e) return 'Please try again.';
    const raw = e.message || String(e);
    try {
      const parsed = JSON.parse(raw);
      if (parsed.error) return parsed.error;
    } catch (_) {}
    return raw;
  };

  const handleGoogleSignIn = async () => {
    try {
      setAuthLoading(true);
      await onSignInGoogle();
      setToastMsg({
        text: 'Signed in with Google! Your workout plans and history are synced to Firestore.',
        type: 'success',
      });
      setTimeout(() => setToastMsg(null), 4000);
    } catch (e: any) {
      setToastMsg({
        text: `Sign-in error: ${formatFriendlyError(e)}`,
        type: 'error',
      });
    } finally {
      setAuthLoading(false);
    }
  };

  const handleGuestAuth = async () => {
    try {
      setAuthLoading(true);
      await onSignInGuest();
      setToastMsg({ text: 'Continuing in local Guest Athlete mode.', type: 'success' });
      setTimeout(() => setToastMsg(null), 3000);
    } catch (e: any) {
      setToastMsg({ text: `Guest mode error: ${formatFriendlyError(e)}`, type: 'error' });
    } finally {
      setAuthLoading(false);
    }
  };

  const [showSignOutConfirm, setShowSignOutConfirm] = useState(false);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);

  const handleExecuteSignOut = async () => {
    try {
      setIsSigningOut(true);
      await onSignOut();
      setToastMsg({
        text: 'Signed out of Google account. Local guest session active.',
        type: 'success',
      });
      setShowSignOutConfirm(false);
      setTimeout(() => setToastMsg(null), 3500);
    } catch (e: any) {
      setToastMsg({
        text: `Sign-out error: ${formatFriendlyError(e)}`,
        type: 'error',
      });
    } finally {
      setIsSigningOut(false);
    }
  };

  const handleSyncClick = async () => {
    try {
      await onSyncCloudNow();
      setToastMsg({ text: 'Synchronized with Firebase Firestore!', type: 'success' });
      setTimeout(() => setToastMsg(null), 3000);
    } catch (e: any) {
      setToastMsg({ text: formatFriendlyError(e), type: 'error' });
    }
  };

  const isGuest = currentUser?.isAnonymous ?? true;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs px-3 sm:px-4 overflow-y-auto modal-safe-overlay">
      <div className="my-auto flex max-h-[92vh] w-full max-w-xl flex-col rounded-2xl border border-slate-200 bg-white shadow-xl overflow-hidden">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4 bg-slate-50/80">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              Settings & Account
            </h2>
            <p className="text-xs text-slate-500">
              Google Account sign-in, Firebase Firestore cloud sync, and preferences
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

        {/* Settings Body */}
        <div className="flex-1 overflow-y-auto p-5 space-y-5 text-xs text-slate-700">
          {/* Toast Message */}
          {toastMsg && (
            <div
              className={`rounded-xl border p-3 text-xs flex items-center gap-2 ${
                toastMsg.type === 'success'
                  ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                  : 'border-red-200 bg-red-50 text-red-900'
              }`}
            >
              {toastMsg.type === 'success' ? (
                <CheckCircle2 className="h-4 w-4 text-emerald-600 shrink-0" />
              ) : (
                <AlertCircle className="h-4 w-4 text-red-600 shrink-0" />
              )}
              <span>{toastMsg.text}</span>
            </div>
          )}

          {/* 1. Account & Firebase Firestore Cloud Sync */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3.5">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                <Cloud className="h-3.5 w-3.5 text-blue-600" />
                Firebase Cloud Storage
              </span>

              {currentUser && !isGuest ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Firestore Synced
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-slate-200 px-2 py-0.5 text-[10px] font-medium text-slate-700">
                  Guest Mode (Local Only)
                </span>
              )}
            </div>

            {/* Privacy & UID Isolation Notice */}
            <div className="flex items-start gap-2 rounded-xl bg-white border border-slate-200 p-3 text-[11px] text-slate-600">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <strong>Secure Per-User Isolation:</strong> All workout plans, exercise logs, and preferences are linked directly to your authenticated Firebase UID in Firestore. No other user can access or view your training data.
              </div>
            </div>

            {currentUser && !isGuest ? (
              <div className="space-y-3">
                <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white p-3 shadow-2xs">
                  <div className="flex items-center gap-2.5 min-w-0">
                    {currentUser.photoURL ? (
                      <img
                        src={currentUser.photoURL}
                        alt="Profile"
                        className="h-8 w-8 rounded-full border border-slate-200 shrink-0"
                      />
                    ) : (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-blue-600 font-bold text-white text-xs shrink-0">
                        {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                      </div>
                    )}
                    <div className="min-w-0">
                      <div className="font-bold text-slate-900 truncate">
                        {currentUser.displayName || 'Google Account User'}
                      </div>
                      <div className="text-[11px] text-slate-500 truncate">
                        {currentUser.email}
                      </div>
                      <div className="text-[9px] font-mono text-slate-400 truncate">
                        UID: {currentUser.uid}
                      </div>
                    </div>
                  </div>

                  {showSignOutConfirm ? (
                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        type="button"
                        disabled={isSigningOut}
                        onClick={handleExecuteSignOut}
                        className="flex items-center gap-1 rounded-lg bg-red-600 px-2.5 py-1.5 text-[11px] font-bold text-white hover:bg-red-700 transition-colors shadow-2xs active:scale-95"
                      >
                        {isSigningOut ? (
                          <RefreshCw className="h-3 w-3 animate-spin" />
                        ) : (
                          <LogOut className="h-3 w-3" />
                        )}
                        <span>{isSigningOut ? 'Signing Out...' : 'Confirm'}</span>
                      </button>
                      <button
                        type="button"
                        disabled={isSigningOut}
                        onClick={() => setShowSignOutConfirm(false)}
                        className="rounded-lg border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-medium text-slate-600 hover:bg-slate-100 transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => setShowSignOutConfirm(true)}
                      className="flex items-center gap-1.5 rounded-lg border border-red-200 bg-red-50/70 px-2.5 py-1.5 text-[11px] font-bold text-red-700 hover:bg-red-100 hover:border-red-300 transition-colors shrink-0 shadow-2xs active:scale-95"
                      title="Sign out and clear session from this device"
                    >
                      <LogOut className="h-3 w-3" />
                      <span>Sign Out</span>
                    </button>
                  )}
                </div>

                {/* Firestore Cloud Sync Status & Action */}
                <div className="rounded-xl border border-slate-200 bg-white p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-slate-900 text-xs flex items-center gap-1.5">
                        {cloudSyncStatus.state === 'saved' && (
                          <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                        )}
                        {cloudSyncStatus.state === 'saving' && (
                          <RefreshCw className="h-3.5 w-3.5 text-blue-600 animate-spin" />
                        )}
                        {cloudSyncStatus.state === 'offline' && (
                          <Cloud className="h-3.5 w-3.5 text-amber-500" />
                        )}
                        {cloudSyncStatus.state === 'error' && (
                          <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                        )}
                        <span>
                          {cloudSyncStatus.state === 'saving'
                            ? 'Saving to Firestore...'
                            : cloudSyncStatus.state === 'saved'
                            ? 'Synchronized with Firestore'
                            : cloudSyncStatus.state === 'offline'
                            ? 'Offline (changes cached locally)'
                            : cloudSyncStatus.state === 'error'
                            ? 'Sync error'
                            : 'Auto-sync active'}
                        </span>
                      </div>
                      {cloudSyncStatus.lastSyncedAt && (
                        <div className="text-[10px] text-slate-500 mt-0.5">
                          Last synced: {new Date(cloudSyncStatus.lastSyncedAt).toLocaleTimeString()}
                        </div>
                      )}
                      {cloudSyncStatus.errorMessage && (
                        <div className="text-[10px] text-red-600 mt-0.5">
                          {cloudSyncStatus.errorMessage}
                        </div>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={handleSyncClick}
                      disabled={cloudSyncStatus.state === 'saving'}
                      className="flex items-center gap-1 rounded-xl bg-blue-600 px-3 py-1.5 font-bold text-white hover:bg-blue-500 disabled:opacity-50 transition-all text-xs shadow-2xs shrink-0"
                    >
                      <RefreshCw
                        className={`h-3 w-3 ${
                          cloudSyncStatus.state === 'saving' ? 'animate-spin' : ''
                        }`}
                      />
                      <span>Sync Cloud</span>
                    </button>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-slate-600 text-xs leading-relaxed">
                  Sign in with your Google account to automatically store, restore, and sync your workout plans, custom exercises, and session history across all devices.
                </p>

                {/* Official styled Google Sign In button */}
                <div className="flex flex-col sm:flex-row gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleGoogleSignIn}
                    disabled={authLoading}
                    className="flex-1 flex items-center justify-center gap-2.5 rounded-xl bg-white border border-slate-300 px-4 py-2.5 font-bold text-slate-800 hover:bg-slate-50 hover:border-slate-400 active:scale-95 transition-all text-xs shadow-2xs"
                  >
                    <svg className="h-4 w-4 shrink-0" viewBox="0 0 24 24">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      />
                    </svg>
                    <span>{authLoading ? 'Signing in...' : 'Sign in with Google'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleGuestAuth}
                    disabled={authLoading}
                    className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-200 bg-slate-50 px-4 py-2.5 font-semibold text-slate-700 hover:bg-slate-100 transition-colors text-xs"
                  >
                    <UserIcon className="h-3.5 w-3.5 text-slate-500" />
                    <span>Continue as Guest</span>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* 2. Android App Installation */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-900 uppercase tracking-wide text-[11px] flex items-center gap-1.5">
                <Smartphone className="h-3.5 w-3.5 text-emerald-600" />
                Android & Mobile Setup
              </span>

              {isInstalled && (
                <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-[10px] font-bold text-emerald-700 border border-emerald-200">
                  Installed App
                </span>
              )}
            </div>

            <p className="text-slate-600 text-xs leading-relaxed">
              GymTrack is optimized for Android with full offline storage in the gym, screen wake-lock, and status-bar safe area padding.
            </p>

            {isInstallable && (
              <button
                type="button"
                onClick={install}
                className="w-full flex items-center justify-center gap-2 rounded-xl bg-emerald-600 py-2.5 font-bold text-white hover:bg-emerald-500 active:scale-95 transition-all text-xs shadow-xs"
              >
                <Smartphone className="h-4 w-4" />
                <span>Install GymTrack on Your Android Phone</span>
              </button>
            )}
          </div>

          {/* 3. Display & Theme Options */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
            <span className="font-bold text-slate-900 uppercase tracking-wide text-[11px] block">
              Display & Theme
            </span>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => onUpdatePreferences({ ...preferences, theme: 'light' })}
                className={`flex flex-col items-center justify-center rounded-xl p-2.5 border transition-all ${
                  preferences.theme === 'light'
                    ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold shadow-2xs ring-1 ring-blue-500'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Sun className="h-4 w-4 mb-1 text-amber-500" />
                <span className="text-[11px]">Clean White</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdatePreferences({ ...preferences, theme: 'dark' })}
                className={`flex flex-col items-center justify-center rounded-xl p-2.5 border transition-all ${
                  preferences.theme === 'dark'
                    ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold shadow-2xs ring-1 ring-blue-500'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <Moon className="h-4 w-4 mb-1 text-blue-500" />
                <span className="text-[11px]">Dark Slate</span>
              </button>

              <button
                type="button"
                onClick={() => onUpdatePreferences({ ...preferences, theme: 'amoled' })}
                className={`flex flex-col items-center justify-center rounded-xl p-2.5 border transition-all ${
                  preferences.theme === 'amoled'
                    ? 'border-blue-500 bg-blue-50 text-blue-900 font-bold shadow-2xs ring-1 ring-blue-500'
                    : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
                }`}
              >
                <div className="h-4 w-4 mb-1 rounded-full bg-slate-950 border border-slate-600 flex items-center justify-center text-[8px] font-bold text-white">
                  O
                </div>
                <span className="text-[11px]">Pure AMOLED</span>
              </button>
            </div>

            {/* Screen Wake Lock */}
            <div className="flex items-center justify-between pt-2 border-t border-slate-200">
              <div>
                <div className="font-bold text-slate-900 text-xs">Keep Screen Awake (Wake Lock)</div>
                <div className="text-[11px] text-slate-500">
                  Prevents phone screen from sleeping during a workout
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  onUpdatePreferences({
                    ...preferences,
                    wakeLockEnabled: !preferences.wakeLockEnabled,
                  })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.wakeLockEnabled ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.wakeLockEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 4. Workout & Rest Timer Preferences */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
            <span className="font-bold text-slate-900 uppercase tracking-wide text-[11px] block">
              Gym Timer & Logging Preferences
            </span>

            {/* Weight Unit */}
            <div className="flex items-center justify-between">
              <span className="font-medium text-slate-800">Weight Unit</span>
              <div className="flex rounded-xl border border-slate-300 bg-white p-0.5 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => onUpdatePreferences({ ...preferences, weightUnit: 'kg' })}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    preferences.weightUnit === 'kg'
                      ? 'bg-slate-900 text-white font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  KG
                </button>
                <button
                  type="button"
                  onClick={() => onUpdatePreferences({ ...preferences, weightUnit: 'lbs' })}
                  className={`px-3 py-1 rounded-lg transition-colors ${
                    preferences.weightUnit === 'lbs'
                      ? 'bg-slate-900 text-white font-bold'
                      : 'text-slate-500 hover:text-slate-900'
                  }`}
                >
                  LBS
                </button>
              </div>
            </div>

            {/* Auto rest timer toggle */}
            <div className="flex items-center justify-between border-t border-slate-200 pt-2">
              <div>
                <div className="font-bold text-slate-900">Auto-Start Rest Timer</div>
                <div className="text-[11px] text-slate-500">
                  Starts countdown automatically when a completed set is checked
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  onUpdatePreferences({
                    ...preferences,
                    autoRestTimer: !preferences.autoRestTimer,
                  })
                }
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  preferences.autoRestTimer ? 'bg-blue-600' : 'bg-slate-300'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.autoRestTimer ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* 5. Data Backup & Reset */}
          <div className="rounded-2xl border border-slate-200 bg-slate-50/60 p-4 space-y-3">
            <span className="font-bold text-slate-900 uppercase tracking-wide text-[11px] block">
              Data Management & Backup
            </span>
            <p className="text-[11px] text-slate-600">
              Download a local JSON backup of all your workout plans, custom images, and logs, or restore a previous backup.
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={onExportData}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white py-2 font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all text-xs shadow-2xs"
              >
                <Download className="h-3.5 w-3.5" />
                <span>Export JSON Backup</span>
              </button>

              <label className="flex-1 flex items-center justify-center gap-1.5 rounded-xl border border-slate-300 bg-white py-2 font-semibold text-slate-700 hover:bg-slate-50 active:scale-95 transition-all text-xs cursor-pointer shadow-2xs">
                <Upload className="h-3.5 w-3.5" />
                <span>Import JSON Backup</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={onImportData}
                  className="hidden"
                />
              </label>
            </div>

            <div className="pt-2 border-t border-slate-200">
              {showResetConfirm ? (
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-xl bg-red-50 border border-red-200">
                  <span className="text-xs text-red-900 font-medium">Reset routine to default 4-day plan?</span>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <button
                      type="button"
                      onClick={() => {
                        onResetPlan();
                        setShowResetConfirm(false);
                        setToastMsg({ text: 'Workout routine reset to default 4-day plan.', type: 'success' });
                        setTimeout(() => setToastMsg(null), 3000);
                      }}
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
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setShowResetConfirm(true)}
                  className="flex items-center gap-1 text-xs text-slate-500 hover:text-red-600 transition-colors"
                >
                  <RotateCcw className="h-3 w-3" />
                  <span>Reset Default 4-Day Plan</span>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Modal Bottom Close */}
        <div className="border-t border-slate-200 bg-slate-50/80 px-5 py-3 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl bg-slate-900 px-5 py-2 font-bold text-xs text-white hover:bg-slate-800 shadow-xs transition-all"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

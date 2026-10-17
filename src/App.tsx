import React, { useState, useEffect, useRef } from 'react';
import {
  WorkoutPlan,
  WorkoutSessionLog,
  UserPreferences,
  DayRoutine,
} from './types';
import {
  getAllPlans,
  saveAllPlans,
  getActivePlan,
  saveActivePlan,
  getActivePlanId,
  setActivePlanId,
  addWorkoutPlan,
  deleteWorkoutPlan,
  getSessionLogs,
  appendSessionLog,
  deleteSessionLog,
  saveSessionLogs,
  getUserPreferences,
  saveUserPreferences,
  getTodayDateString,
  setActiveUserScope,
  clearCurrentSessionData,
} from './utils/storage';
import {
  subscribeToAuth,
  signInWithGoogle,
  signInAsGuest,
  logOutUser,
  loadAllUserDataFromFirestore,
  syncPlanToFirestore,
  deletePlanFromFirestore,
  syncSessionLogToFirestore,
  deleteSessionLogFromFirestore,
  saveUserProfile,
  queueFirestoreSync,
  subscribeToCloudSyncStatus,
  CloudSyncStatus,
} from './utils/firebase';
import { User } from 'firebase/auth';
import { WorkoutDayBar } from './components/WorkoutDayBar';
import { WorkoutLogger } from './components/WorkoutLogger';
import { RestTimer } from './components/RestTimer';
import { PlanManagerModal } from './components/PlanManagerModal';
import { CustomPlanModal } from './components/CustomPlanModal';
import { HistoryTracker } from './components/HistoryTracker';
import { ProgressGuideModal } from './components/ProgressGuideModal';
import { SettingsModal } from './components/SettingsModal';
import { DEFAULT_4DAY_PLAN } from './data/defaultPlan';
import {
  Dumbbell,
  Calendar,
  Settings as SettingsIcon,
  HelpCircle,
  Plus,
  ChevronDown,
  Cloud,
  CheckCircle2,
  RefreshCw,
  AlertCircle,
  Layers,
} from 'lucide-react';
import { usePWAInstall } from './hooks/usePWAInstall';
import { useAndroidSafeArea } from './hooks/useAndroidSafeArea';

export default function App() {
  useAndroidSafeArea();
  const [plans, setPlans] = useState<WorkoutPlan[]>(() => getAllPlans());
  const [activePlanId, setActivePlanIdState] = useState<string>(() => getActivePlanId());
  const [preferences, setPreferences] = useState<UserPreferences>(() =>
    getUserPreferences()
  );
  const [sessionLogs, setSessionLogs] = useState<WorkoutSessionLog[]>(() =>
    getSessionLogs()
  );
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [cloudSyncStatus, setCloudSyncStatus] = useState<CloudSyncStatus>({
    state: 'idle',
    lastSyncedAt: null,
    errorMessage: null,
  });

  // Active workout plan
  const activePlan = plans.find((p) => p.id === activePlanId) || plans[0] || DEFAULT_4DAY_PLAN;

  // Selected Day ID in active plan
  const [selectedDayId, setSelectedDayId] = useState<string>(() => {
    return activePlan.days[0]?.id || activePlan.days[0]?.dayKey || 'day-1';
  });

  // Keep selectedDayId in sync if plan changes
  useEffect(() => {
    const dayExists = activePlan.days.some((d) => d.id === selectedDayId || d.dayKey === selectedDayId);
    if (!dayExists && activePlan.days.length > 0) {
      setSelectedDayId(activePlan.days[0].id || activePlan.days[0].dayKey);
    }
  }, [activePlanId, activePlan]);

  // Active tab: 'workout' | 'history'
  const [activeTab, setActiveTab] = useState<'workout' | 'history'>('workout');

  // Modals
  const [showPlanManager, setShowPlanManager] = useState(false);
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Rest Timer State
  const [timerSeconds, setTimerSeconds] = useState(90);
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [showTimer, setShowTimer] = useState(false);

  // Screen Wake Lock
  const wakeLockRef = useRef<any>(null);

  // Synchronize Theme (Clean White / Dark Slate / AMOLED) with DOM
  useEffect(() => {
    const isDark = preferences.theme === 'dark' || preferences.theme === 'amoled';
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.setAttribute('data-theme', preferences.theme || 'dark');
      document.body.classList.add('dark');
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) {
        meta.setAttribute('content', preferences.theme === 'amoled' ? '#000000' : '#0b0f19');
      }
    } else {
      root.classList.remove('dark');
      root.removeAttribute('data-theme');
      document.body.classList.remove('dark');
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) {
        meta.setAttribute('content', '#ffffff');
      }
    }
  }, [preferences.theme]);

  // Subscribe to Cloud Sync Status
  useEffect(() => {
    const unsub = subscribeToCloudSyncStatus((status) => {
      setCloudSyncStatus(status);
    });
    return () => unsub();
  }, []);

  // Listen to Firebase Auth State and handle automatic cross-device sync
  useEffect(() => {
    const unsubscribe = subscribeToAuth(async (user) => {
      setCurrentUser(user);

      if (user && !user.isAnonymous) {
        // Set user isolated storage scope using user UID
        setActiveUserScope(user.uid);

        try {
          // Load existing user data from Firestore using UID
          const cloudData = await loadAllUserDataFromFirestore(user.uid);

          if (cloudData.plans && cloudData.plans.length > 0) {
            setPlans(cloudData.plans);
            saveAllPlans(cloudData.plans, user.uid);
          } else {
            // New user account: seed initial default plan in Firestore
            const initialPlans = getAllPlans(user.uid);
            await Promise.all(
              initialPlans.map((p) => syncPlanToFirestore(user.uid, p))
            );
          }

          if (cloudData.activePlanId) {
            setActivePlanIdState(cloudData.activePlanId);
            setActivePlanId(cloudData.activePlanId, user.uid);
          }

          if (cloudData.logs) {
            setSessionLogs(cloudData.logs);
            saveSessionLogs(cloudData.logs, user.uid);
          }

          if (cloudData.preferences) {
            setPreferences(cloudData.preferences);
            saveUserPreferences(cloudData.preferences, user.uid);
          }
        } catch (e) {
          console.warn('Initial Firestore user data load error:', e);
        }
      } else {
        // Guest user or signed out: clear active user session
        setActiveUserScope(null);
        const guestPlans = getAllPlans('guest');
        const guestLogs = getSessionLogs('guest');
        const guestPrefs = getUserPreferences('guest');
        const guestActiveId = getActivePlanId('guest');
        setPlans(guestPlans);
        setSessionLogs(guestLogs);
        setPreferences(guestPrefs);
        setActivePlanIdState(guestActiveId);
        setSelectedDayId(guestPlans[0]?.days[0]?.id || 'day-1');
      }
    });

    return () => unsubscribe();
  }, []);

  // Screen Wake Lock Effect
  useEffect(() => {
    async function requestWakeLock() {
      if (preferences.wakeLockEnabled && 'wakeLock' in navigator) {
        try {
          wakeLockRef.current = await (navigator as any).wakeLock.request('screen');
        } catch (err) {
          console.warn('Wake Lock request failed:', err);
        }
      } else if (wakeLockRef.current) {
        try {
          await wakeLockRef.current.release();
          wakeLockRef.current = null;
        } catch (_) {}
      }
    }
    requestWakeLock();

    return () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {});
      }
    };
  }, [preferences.wakeLockEnabled]);

  // Plan Management Handlers with Firestore Auto-Sync
  const handleSelectPlan = (planId: string) => {
    setActivePlanId(planId);
    setActivePlanIdState(planId);
    const targetPlan = plans.find((p) => p.id === planId);
    if (targetPlan && targetPlan.days.length > 0) {
      setSelectedDayId(targetPlan.days[0].id || targetPlan.days[0].dayKey);
    }
    setShowPlanManager(false);

    if (currentUser && !currentUser.isAnonymous) {
      queueFirestoreSync(currentUser.uid, { activePlanId: planId });
    }
  };

  const handleCreatePlan = async (newPlan: WorkoutPlan) => {
    const updated = addWorkoutPlan(newPlan);
    setPlans(updated);
    setActivePlanIdState(newPlan.id);
    setSelectedDayId(newPlan.days[0]?.id || newPlan.days[0]?.dayKey || 'day-1');
    setShowPlanManager(false);

    if (currentUser && !currentUser.isAnonymous) {
      queueFirestoreSync(currentUser.uid, {
        activePlan: newPlan,
        allPlans: updated,
        activePlanId: newPlan.id,
      });
    }
  };

  const handleUpdatePlan = (updatedPlan: WorkoutPlan) => {
    saveActivePlan(updatedPlan);
    const updatedList = plans.map((p) => (p.id === updatedPlan.id ? updatedPlan : p));
    setPlans(updatedList);

    if (currentUser && !currentUser.isAnonymous) {
      queueFirestoreSync(currentUser.uid, { activePlan: updatedPlan });
    }
  };

  const handleDeletePlan = async (planId: string) => {
    const { updatedPlans, nextActiveId } = deleteWorkoutPlan(planId);
    setPlans(updatedPlans);
    setActivePlanIdState(nextActiveId);

    if (currentUser && !currentUser.isAnonymous) {
      try {
        await deletePlanFromFirestore(currentUser.uid, planId);
        queueFirestoreSync(currentUser.uid, {
          allPlans: updatedPlans,
          activePlanId: nextActiveId,
        });
      } catch (e) {
        console.warn('Failed to delete plan from Firestore:', e);
      }
    }
  };

  const handleUpdateDayRoutine = (updatedDay: DayRoutine) => {
    const updatedDays = activePlan.days.map((d) =>
      d.id === updatedDay.id || d.dayKey === updatedDay.dayKey ? updatedDay : d
    );
    const updatedPlan = { ...activePlan, days: updatedDays };
    handleUpdatePlan(updatedPlan);
  };

  const handleSaveSession = async (newLog: WorkoutSessionLog) => {
    appendSessionLog(newLog);
    const updatedLogs = getSessionLogs();
    setSessionLogs(updatedLogs);

    if (currentUser && !currentUser.isAnonymous) {
      queueFirestoreSync(currentUser.uid, { sessionLog: newLog });
    }
  };

  const handleDeleteLog = async (id: string) => {
    const updated = deleteSessionLog(id);
    setSessionLogs(updated);

    if (currentUser && !currentUser.isAnonymous) {
      try {
        await deleteSessionLogFromFirestore(currentUser.uid, id);
      } catch (e) {
        console.warn('Failed to delete log from Firestore:', e);
      }
    }
  };

  const handleImportLogs = (imported: WorkoutSessionLog[]) => {
    saveSessionLogs(imported);
    setSessionLogs(imported);
  };

  const handleUpdatePreferences = (updated: UserPreferences) => {
    setPreferences(updated);
    saveUserPreferences(updated);

    if (currentUser && !currentUser.isAnonymous) {
      queueFirestoreSync(currentUser.uid, { preferences: updated });
    }
  };

  const handleToggleWeightUnit = () => {
    const nextUnit = preferences.weightUnit === 'kg' ? 'lbs' : 'kg';
    handleUpdatePreferences({ ...preferences, weightUnit: nextUnit });
  };

  const handleToggleSound = () => {
    handleUpdatePreferences({
      ...preferences,
      soundEnabled: !preferences.soundEnabled,
    });
  };

  const handleStartRestTimer = (seconds: number) => {
    setTimerSeconds(seconds || preferences.defaultRestDuration || 90);
    setIsTimerActive(true);
    setShowTimer(true);
  };

  // Auth Handlers (Google Sign In through Firebase Authentication)
  const handleSignInGoogle = async () => {
    const user = await signInWithGoogle();
    setActiveUserScope(user.uid);

    // Sync cloud data
    const cloudData = await loadAllUserDataFromFirestore(user.uid);
    if (cloudData.plans && cloudData.plans.length > 0) {
      setPlans(cloudData.plans);
      saveAllPlans(cloudData.plans, user.uid);
    }
    if (cloudData.activePlanId) {
      setActivePlanIdState(cloudData.activePlanId);
      setActivePlanId(cloudData.activePlanId, user.uid);
    }
    if (cloudData.logs) {
      setSessionLogs(cloudData.logs);
      saveSessionLogs(cloudData.logs, user.uid);
    }
    if (cloudData.preferences) {
      setPreferences(cloudData.preferences);
      saveUserPreferences(cloudData.preferences, user.uid);
    }
  };

  const handleSignOut = async () => {
    try {
      await logOutUser();
      clearCurrentSessionData();
      setActiveUserScope(null);
      setCurrentUser(null);

      // Reset view to fresh guest defaults so no previous user data remains visible
      const guestPlans = getAllPlans('guest');
      const guestLogs = getSessionLogs('guest');
      const guestPrefs = getUserPreferences('guest');
      const guestActiveId = getActivePlanId('guest');
      setPlans(guestPlans);
      setSessionLogs(guestLogs);
      setPreferences(guestPrefs);
      setActivePlanIdState(guestActiveId);
      setSelectedDayId(guestPlans[0]?.days[0]?.id || 'day-1');
    } catch (err) {
      console.error('Sign-out error:', err);
      throw err;
    }
  };

  const handleManualSyncNow = async () => {
    if (!currentUser || currentUser.isAnonymous) {
      await handleSignInGoogle();
      return;
    }
    await Promise.all([
      ...plans.map((p) => syncPlanToFirestore(currentUser.uid, p)),
      saveUserProfile(currentUser.uid, {
        preferences,
        activePlanId,
        weightUnit: preferences.weightUnit,
      }),
    ]);
  };

  const handleExportData = () => {
    const payload = {
      appName: 'GymTrack',
      version: 1,
      exportedAt: new Date().toISOString(),
      user: currentUser
        ? { uid: currentUser.uid, email: currentUser.email, displayName: currentUser.displayName }
        : null,
      activePlanId,
      plans,
      sessionLogs,
      preferences,
    };
    const dataStr =
      'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(payload, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute(
      'download',
      `gymtrack-backup-${new Date().toISOString().slice(0, 10)}.json`
    );
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const parsed = JSON.parse(event.target?.result as string);
        let nextPlans = plans;
        let nextLogs = sessionLogs;
        let nextPrefs = preferences;
        let nextActiveId = activePlanId;

        if (parsed.plans && Array.isArray(parsed.plans)) {
          nextPlans = parsed.plans;
          setPlans(parsed.plans);
          saveAllPlans(parsed.plans);
        }
        if (parsed.sessionLogs && Array.isArray(parsed.sessionLogs)) {
          nextLogs = parsed.sessionLogs;
          setSessionLogs(parsed.sessionLogs);
          saveSessionLogs(parsed.sessionLogs);
        } else if (parsed.logs && Array.isArray(parsed.logs)) {
          nextLogs = parsed.logs;
          setSessionLogs(parsed.logs);
          saveSessionLogs(parsed.logs);
        }
        if (parsed.preferences) {
          nextPrefs = parsed.preferences;
          setPreferences(parsed.preferences);
          saveUserPreferences(parsed.preferences);
        }
        if (parsed.activePlanId) {
          nextActiveId = parsed.activePlanId;
          setActivePlanIdState(parsed.activePlanId);
          setActivePlanId(parsed.activePlanId);
        }

        if (currentUser && !currentUser.isAnonymous) {
          queueFirestoreSync(currentUser.uid, {
            allPlans: nextPlans,
            preferences: nextPrefs,
            activePlanId: nextActiveId,
          });
        }
      } catch (err) {
        console.error('Import error:', err);
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const handleResetDefaultPlan = () => {
    const defaultClone = JSON.parse(JSON.stringify(DEFAULT_4DAY_PLAN));
    const updated = plans.some((p) => p.id === DEFAULT_4DAY_PLAN.id)
      ? plans.map((p) => (p.id === DEFAULT_4DAY_PLAN.id ? defaultClone : p))
      : [...plans, defaultClone];
    setPlans(updated);
    saveAllPlans(updated);
    handleSelectPlan(DEFAULT_4DAY_PLAN.id);

    if (currentUser && !currentUser.isAnonymous) {
      queueFirestoreSync(currentUser.uid, {
        activePlan: defaultClone,
        allPlans: updated,
        activePlanId: DEFAULT_4DAY_PLAN.id,
      });
    }
  };

  // Completed days in session logs
  const todayDate = getTodayDateString();
  const completedDayIds = new Set<string>();
  sessionLogs.forEach((log) => {
    if (log.completed && log.planId === activePlan.id) {
      completedDayIds.add(log.dayKey);
    }
  });

  const activeDayRoutine: DayRoutine =
    activePlan.days.find(
      (d) => d.id === selectedDayId || d.dayKey === selectedDayId
    ) || activePlan.days[0];

  const existingTodayLog = sessionLogs.find(
    (l) =>
      (l.dayKey === selectedDayId ||
        l.dayKey === activeDayRoutine?.id ||
        l.dayKey === activeDayRoutine?.dayKey) &&
      l.date === todayDate &&
      l.planId === activePlan.id
  );

  const activeDayIndex = activePlan.days.findIndex(
    (d) => d.id === selectedDayId || d.dayKey === selectedDayId
  );

  const isDark = preferences.theme === 'dark' || preferences.theme === 'amoled';

  return (
    <div
      className={`min-h-screen flex flex-col font-sans transition-colors duration-150 ${
        isDark
          ? 'bg-slate-950 text-slate-100 selection:bg-blue-900 selection:text-white'
          : 'bg-white text-slate-900 selection:bg-slate-100'
      }`}
    >
      {/* 1. Modern Clean White App Bar */}
      <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/95 backdrop-blur-md px-3.5 shadow-2xs header-safe-top">
        <div className="max-w-2xl mx-auto flex items-center justify-between gap-2">
          {/* Left: Brand + Active Plan Dropdown trigger */}
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-900 text-white font-bold shrink-0 shadow-2xs">
              <Dumbbell className="h-4 w-4" />
            </div>

            {/* Plan switcher button */}
            <button
              type="button"
              onClick={() => setShowPlanManager(true)}
              className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-left hover:bg-slate-50 hover:border-slate-300 transition-all min-w-0 shadow-2xs"
              title="Switch or manage workout plans"
            >
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-xs text-slate-900 truncate">
                    {activePlan.name}
                  </span>
                  <span className="rounded-md bg-slate-100 border border-slate-200 px-1.5 py-0.2 text-[10px] font-bold text-slate-700 font-mono">
                    {activePlan.days.length}D
                  </span>
                </div>
              </div>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 shrink-0 ml-0.5" />
            </button>
          </div>

          {/* Right Action Controls */}
          <div className="flex items-center gap-1.5 shrink-0">
            {/* Account & Firestore Cloud Sync Status Badge */}
            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              className={`flex items-center gap-1.5 rounded-xl border px-2 py-1.5 text-xs transition-all shadow-2xs active:scale-95 ${
                currentUser && !currentUser.isAnonymous
                  ? cloudSyncStatus.state === 'saving'
                    ? 'border-blue-200 bg-blue-50 text-blue-700 font-medium'
                    : cloudSyncStatus.state === 'error'
                    ? 'border-red-200 bg-red-50 text-red-700 font-bold'
                    : cloudSyncStatus.state === 'offline'
                    ? 'border-amber-200 bg-amber-50 text-amber-700 font-medium'
                    : 'border-emerald-200 bg-emerald-50 text-emerald-800 font-bold'
                  : 'border-slate-200 bg-white text-slate-600 hover:bg-slate-50'
              }`}
              title={
                currentUser && !currentUser.isAnonymous
                  ? `Signed in as ${currentUser.displayName || currentUser.email || 'User'} (Click for Account & Settings)`
                  : 'Sign in with Google for Firestore cloud backup'
              }
            >
              {currentUser && !currentUser.isAnonymous ? (
                <>
                  {currentUser.photoURL ? (
                    <img
                      src={currentUser.photoURL}
                      alt="Profile"
                      className="h-4 w-4 rounded-full border border-slate-200 shrink-0"
                    />
                  ) : (
                    <div className="flex h-4 w-4 items-center justify-center rounded-full bg-blue-600 font-bold text-white text-[9px] shrink-0">
                      {currentUser.displayName ? currentUser.displayName[0] : 'U'}
                    </div>
                  )}
                  {cloudSyncStatus.state === 'saving' ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-blue-600" />
                  ) : cloudSyncStatus.state === 'error' ? (
                    <AlertCircle className="h-3.5 w-3.5 text-red-600" />
                  ) : cloudSyncStatus.state === 'offline' ? (
                    <Cloud className="h-3.5 w-3.5 text-amber-600" />
                  ) : (
                    <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                  )}
                  <span className="hidden sm:inline text-[11px]">
                    {cloudSyncStatus.state === 'saving'
                      ? 'Saving...'
                      : cloudSyncStatus.state === 'error'
                      ? 'Sync Error'
                      : cloudSyncStatus.state === 'offline'
                      ? 'Offline'
                      : 'Synced'}
                  </span>
                </>
              ) : (
                <>
                  <Cloud className="h-3.5 w-3.5 text-blue-500" />
                  <span className="hidden sm:inline text-[11px] font-semibold text-slate-700">
                    Sign In
                  </span>
                </>
              )}
            </button>

            {/* Add Workout Plan button */}
            <button
              type="button"
              onClick={() => setShowPlanManager(true)}
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-bold text-slate-800 hover:bg-slate-50 hover:border-slate-300 shadow-2xs transition-all active:scale-95"
              title="Add Workout Plan"
            >
              <Plus className="h-3.5 w-3.5 text-blue-600" />
              <span className="hidden xs:inline">Add Plan</span>
            </button>

            {/* Weight Unit Switcher */}
            <button
              type="button"
              onClick={handleToggleWeightUnit}
              className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white px-2 py-1.5 text-xs font-mono font-bold text-slate-700 hover:bg-slate-50 transition-all active:scale-95 shadow-2xs"
              title="Toggle KG / LBS"
            >
              <span
                className={
                  preferences.weightUnit === 'kg'
                    ? 'text-slate-950 font-bold'
                    : 'text-slate-400 font-normal'
                }
              >
                KG
              </span>
              <span className="text-slate-300">/</span>
              <span
                className={
                  preferences.weightUnit === 'lbs'
                    ? 'text-slate-950 font-bold'
                    : 'text-slate-400 font-normal'
                }
              >
                LBS
              </span>
            </button>

            {/* Guide Button */}
            <button
              type="button"
              onClick={() => setShowGuideModal(true)}
              className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-500 hover:text-slate-900 hover:bg-slate-50 shadow-2xs transition-all active:scale-95"
              title="How to Progress & Form Guide"
            >
              <HelpCircle className="h-4 w-4" />
            </button>

            {/* Settings & Account */}
            <button
              type="button"
              onClick={() => setShowSettingsModal(true)}
              className="relative flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-600 hover:text-slate-900 hover:bg-slate-50 shadow-2xs transition-all active:scale-95"
              title="Settings & Cloud Account"
            >
              <SettingsIcon className="h-4 w-4" />
              {currentUser && !currentUser.isAnonymous && (
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-emerald-500 ring-2 ring-white" />
              )}
            </button>
          </div>
        </div>
      </header>

      {/* 2. Focused Workout Days Bar */}
      {activeTab === 'workout' && activePlan && (
        <WorkoutDayBar
          days={activePlan.days}
          activeDayId={selectedDayId}
          onSelectDay={(dayId) => setSelectedDayId(dayId)}
          completedDayIds={completedDayIds}
          onAddDay={() => {
            const nextIdx = activePlan.days.length + 1;
            const newDay: DayRoutine = {
              id: `day-${Date.now()}-${nextIdx}`,
              dayKey: `day-${nextIdx}`,
              dayShort: `Day ${nextIdx}`,
              dayName: `Day ${nextIdx}`,
              title: `Workout Day ${nextIdx}`,
              subtitle: 'Custom target session',
              isRestDay: false,
              accent: 'blue',
              exercises: [],
            };
            const updatedPlan = {
              ...activePlan,
              days: [...activePlan.days, newDay],
            };
            handleUpdatePlan(updatedPlan);
            setSelectedDayId(newDay.id);
          }}
        />
      )}

      {/* 3. Main Workspace */}
      <main className="flex-1 bg-white">
        {activeTab === 'workout' && activeDayRoutine ? (
          <WorkoutLogger
            key={`${activePlan.id}-${activeDayRoutine.id || activeDayRoutine.dayKey}`}
            dayRoutine={activeDayRoutine}
            planId={activePlan.id}
            preferences={preferences}
            onSaveSession={handleSaveSession}
            onStartRestTimer={handleStartRestTimer}
            onUpdateDayRoutine={handleUpdateDayRoutine}
            onOpenLibraryToAdd={() => setShowCustomModal(true)}
            existingSessionLog={existingTodayLog}
          />
        ) : (
          <HistoryTracker
            logs={sessionLogs}
            preferences={preferences}
            onDeleteLog={handleDeleteLog}
            onImportLogs={handleImportLogs}
          />
        )}
      </main>

      {/* 4. Floating Rest Timer */}
      {showTimer && (
        <RestTimer
          initialSeconds={timerSeconds}
          isActive={isTimerActive}
          onClose={() => setShowTimer(false)}
          soundEnabled={preferences.soundEnabled}
          vibrateEnabled={preferences.vibrateEnabled}
          onToggleSound={handleToggleSound}
        />
      )}

      {/* 5. Plan Manager Modal (Add / Edit / Delete / Switch Plans) */}
      {showPlanManager && (
        <PlanManagerModal
          plans={plans}
          activePlanId={activePlan.id}
          onSelectPlan={handleSelectPlan}
          onCreatePlan={handleCreatePlan}
          onUpdatePlan={handleUpdatePlan}
          onDeletePlan={handleDeletePlan}
          onClose={() => setShowPlanManager(false)}
        />
      )}

      {/* 6. Exercise Library & Custom Exercise Modal */}
      {showCustomModal && (
        <CustomPlanModal
          currentPlan={activePlan}
          initialTab="browse-library"
          initialDayIndex={activeDayIndex >= 0 ? activeDayIndex : 0}
          onSavePlan={handleUpdatePlan}
          onClose={() => setShowCustomModal(false)}
        />
      )}

      {/* 7. Progress Guide Modal */}
      {showGuideModal && (
        <ProgressGuideModal onClose={() => setShowGuideModal(false)} />
      )}

      {/* 8. Settings & Account Modal */}
      {showSettingsModal && (
        <SettingsModal
          preferences={preferences}
          onUpdatePreferences={handleUpdatePreferences}
          currentUser={currentUser}
          cloudSyncStatus={cloudSyncStatus}
          onSignInGoogle={handleSignInGoogle}
          onSignInGuest={async () => {
            await signInAsGuest();
          }}
          onSignOut={handleSignOut}
          onSyncCloudNow={handleManualSyncNow}
          onClose={() => setShowSettingsModal(false)}
          onExportData={handleExportData}
          onImportData={handleImportData}
          onResetPlan={handleResetDefaultPlan}
        />
      )}

      {/* 9. Clean White Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur-md px-3 shadow-xs nav-safe-bottom">
        <div className="max-w-md mx-auto grid grid-cols-4 gap-1">
          <button
            type="button"
            onClick={() => setActiveTab('workout')}
            className={`flex flex-col items-center justify-center rounded-xl py-1 transition-all select-none ${
              activeTab === 'workout'
                ? 'text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-700 font-medium'
            }`}
          >
            <Dumbbell
              className={`h-4 w-4 ${
                activeTab === 'workout' ? 'text-blue-600 stroke-[2.5]' : ''
              }`}
            />
            <span className="text-[10px] mt-1">Workout</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`flex flex-col items-center justify-center rounded-xl py-1 transition-all select-none ${
              activeTab === 'history'
                ? 'text-slate-950 font-bold'
                : 'text-slate-400 hover:text-slate-700 font-medium'
            }`}
          >
            <Calendar
              className={`h-4 w-4 ${
                activeTab === 'history' ? 'text-blue-600 stroke-[2.5]' : ''
              }`}
            />
            <span className="text-[10px] mt-1">Day Track</span>
          </button>

          <button
            type="button"
            onClick={() => setShowPlanManager(true)}
            className="flex flex-col items-center justify-center rounded-xl py-1 text-slate-400 hover:text-slate-700 transition-all select-none font-medium"
          >
            <Layers className="h-4 w-4" />
            <span className="text-[10px] mt-1">Plans</span>
          </button>

          <button
            type="button"
            onClick={() => setShowSettingsModal(true)}
            className="flex flex-col items-center justify-center rounded-xl py-1 text-slate-400 hover:text-slate-700 transition-all select-none font-medium"
          >
            <SettingsIcon className="h-4 w-4" />
            <span className="text-[10px] mt-1">Settings</span>
          </button>
        </div>
      </nav>
    </div>
  );
}

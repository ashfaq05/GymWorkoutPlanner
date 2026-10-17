import { WorkoutPlan, WorkoutSessionLog, UserPreferences } from '../types';
import { DEFAULT_4DAY_PLAN } from '../data/defaultPlan';

let currentScopeUserId: string | null = null;

export function setActiveUserScope(userId: string | null) {
  currentScopeUserId = userId;
}

export function getActiveUserScope(): string | null {
  return currentScopeUserId;
}

function getKey(key: string, customUserId?: string | null): string {
  const uid = customUserId !== undefined ? customUserId : currentScopeUserId;
  if (!uid || uid === 'guest') {
    return `gymtrack_guest_${key}`;
  }
  return `gymtrack_usr_${uid}_${key}`;
}

export const DEFAULT_PREFS: UserPreferences = {
  weightUnit: 'kg',
  theme: 'light', // Clean white UI by default
  autoRestTimer: true,
  soundEnabled: true,
  vibrateEnabled: true,
  wakeLockEnabled: false,
  defaultRestDuration: 90,
  compactMode: false,
};

/**
 * Loads all workout plans for the active user account.
 * Initializes with default 4-day plan if empty.
 */
export function getAllPlans(customUserId?: string | null): WorkoutPlan[] {
  const storageKey = getKey('plans_v2', customUserId);
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }

    // Check fallback legacy non-scoped storage for backward compatibility
    if (!customUserId || customUserId === 'guest') {
      const legacyRaw = localStorage.getItem('gymtrack_all_plans_v2');
      if (legacyRaw) {
        const parsed = JSON.parse(legacyRaw);
        if (Array.isArray(parsed) && parsed.length > 0) {
          localStorage.setItem(storageKey, legacyRaw);
          return parsed;
        }
      }
    }
  } catch (e) {
    console.error('Failed to load plans', e);
  }

  // Fallback to initial 4-Day Plan
  const initial = [DEFAULT_4DAY_PLAN];
  saveAllPlans(initial, customUserId);
  return initial;
}

export function saveAllPlans(plans: WorkoutPlan[], customUserId?: string | null): void {
  const storageKey = getKey('plans_v2', customUserId);
  try {
    localStorage.setItem(storageKey, JSON.stringify(plans));
  } catch (e) {
    console.error('Failed to save plans', e);
  }
}

export function getActivePlanId(customUserId?: string | null): string {
  const storageKey = getKey('active_plan_id', customUserId);
  try {
    const storedId = localStorage.getItem(storageKey);
    if (storedId) return storedId;
  } catch (_) {}
  const all = getAllPlans(customUserId);
  return all[0]?.id || DEFAULT_4DAY_PLAN.id;
}

export function setActivePlanId(id: string, customUserId?: string | null): void {
  const storageKey = getKey('active_plan_id', customUserId);
  try {
    localStorage.setItem(storageKey, id);
  } catch (_) {}
}

export function getActivePlan(customUserId?: string | null): WorkoutPlan {
  const all = getAllPlans(customUserId);
  const activeId = getActivePlanId(customUserId);
  const found = all.find((p) => p.id === activeId);
  if (found) return found;
  return all[0] || DEFAULT_4DAY_PLAN;
}

export function saveActivePlan(updatedPlan: WorkoutPlan, customUserId?: string | null): void {
  const all = getAllPlans(customUserId);
  const exists = all.some((p) => p.id === updatedPlan.id);
  const updatedAll = exists
    ? all.map((p) => (p.id === updatedPlan.id ? updatedPlan : p))
    : [...all, updatedPlan];
  saveAllPlans(updatedAll, customUserId);
  setActivePlanId(updatedPlan.id, customUserId);
}

export function addWorkoutPlan(newPlan: WorkoutPlan, customUserId?: string | null): WorkoutPlan[] {
  const all = getAllPlans(customUserId);
  const updated = [...all, newPlan];
  saveAllPlans(updated, customUserId);
  setActivePlanId(newPlan.id, customUserId);
  return updated;
}

export function deleteWorkoutPlan(
  planId: string,
  customUserId?: string | null
): { updatedPlans: WorkoutPlan[]; nextActiveId: string } {
  const all = getAllPlans(customUserId);
  let updatedPlans = all.filter((p) => p.id !== planId);

  // If user deleted all plans, keep a fresh copy of default 4-day plan
  if (updatedPlans.length === 0) {
    updatedPlans = [{ ...DEFAULT_4DAY_PLAN, id: `plan-${Date.now()}` }];
  }

  saveAllPlans(updatedPlans, customUserId);
  const currentActive = getActivePlanId(customUserId);
  let nextActiveId = currentActive;

  if (currentActive === planId) {
    nextActiveId = updatedPlans[0].id;
    setActivePlanId(nextActiveId, customUserId);
  }

  return { updatedPlans, nextActiveId };
}

export function getSessionLogs(customUserId?: string | null): WorkoutSessionLog[] {
  const storageKey = getKey('session_logs', customUserId);
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      return JSON.parse(raw);
    }

    // Check legacy non-scoped storage for guest
    if (!customUserId || customUserId === 'guest') {
      const legacyRaw = localStorage.getItem('gymtrack_session_logs_v1');
      if (legacyRaw) {
        const parsed = JSON.parse(legacyRaw);
        if (Array.isArray(parsed)) {
          localStorage.setItem(storageKey, legacyRaw);
          return parsed;
        }
      }
    }
  } catch (e) {
    console.error('Failed to load session logs', e);
  }
  return [];
}

export function saveSessionLogs(logs: WorkoutSessionLog[], customUserId?: string | null): void {
  const storageKey = getKey('session_logs', customUserId);
  try {
    localStorage.setItem(storageKey, JSON.stringify(logs));
  } catch (e) {
    console.error('Failed to save session logs', e);
  }
}

export function appendSessionLog(log: WorkoutSessionLog, customUserId?: string | null): void {
  const current = getSessionLogs(customUserId);
  const filtered = current.filter((item) => item.id !== log.id);
  const updated = [log, ...filtered];
  saveSessionLogs(updated, customUserId);
}

export function deleteSessionLog(logId: string, customUserId?: string | null): WorkoutSessionLog[] {
  const current = getSessionLogs(customUserId);
  const updated = current.filter((l) => l.id !== logId);
  saveSessionLogs(updated, customUserId);
  return updated;
}

export function getUserPreferences(customUserId?: string | null): UserPreferences {
  const storageKey = getKey('user_prefs', customUserId);
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      return { ...DEFAULT_PREFS, ...JSON.parse(raw) };
    }

    if (!customUserId || customUserId === 'guest') {
      const legacyRaw = localStorage.getItem('gymtrack_user_prefs_v2');
      if (legacyRaw) {
        return { ...DEFAULT_PREFS, ...JSON.parse(legacyRaw) };
      }
    }
  } catch (e) {
    console.error('Failed to load user preferences', e);
  }
  return DEFAULT_PREFS;
}

export function saveUserPreferences(prefs: UserPreferences, customUserId?: string | null): void {
  const storageKey = getKey('user_prefs', customUserId);
  try {
    localStorage.setItem(storageKey, JSON.stringify(prefs));
  } catch (e) {
    console.error('Failed to save user preferences', e);
  }
}

/**
 * Clear all private user data in active application session when signing out.
 */
export function clearCurrentSessionData(): void {
  currentScopeUserId = null;
}

/**
 * Find the most recent recorded sets for an exercise ID from session logs.
 */
export function getPreviousExercisePerformance(
  exerciseId: string,
  customUserId?: string | null
): { weight: number; reps: number; date: string }[] | null {
  const logs = getSessionLogs(customUserId);
  for (const session of logs) {
    const exerciseEntry = session.exercises.find((e) => e.exerciseId === exerciseId);
    if (exerciseEntry && exerciseEntry.sets.length > 0) {
      const completedSets = exerciseEntry.sets.filter((s) => s.completed);
      if (completedSets.length > 0) {
        return completedSets.map((s) => ({
          weight: s.weight,
          reps: s.reps,
          date: session.date,
        }));
      }
    }
  }
  return null;
}

/**
 * Calculates current personal records (PRs) per exercise
 */
export function getPersonalRecords(
  customUserId?: string | null
): Record<string, { maxWeight: number; reps: number; date: string }> {
  const logs = getSessionLogs(customUserId);
  const prs: Record<string, { maxWeight: number; reps: number; date: string }> = {};

  for (const session of logs) {
    for (const ex of session.exercises) {
      for (const set of ex.sets) {
        if (set.completed && set.weight > 0) {
          const currentPr = prs[ex.exerciseId];
          if (!currentPr || set.weight > currentPr.maxWeight) {
            prs[ex.exerciseId] = {
              maxWeight: set.weight,
              reps: set.reps,
              date: session.date,
            };
          }
        }
      }
    }
  }
  return prs;
}

export function getTodayDateString(): string {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function getDayKeyFromDate(date: Date = new Date()): string {
  const days = ['sun', 'mon', 'tue', 'wed', 'thu', 'fri', 'sat'];
  return days[date.getDay()];
}

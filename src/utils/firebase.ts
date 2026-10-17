import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  signInWithPopup,
  signInAnonymously,
  signOut as fbSignOut,
  onAuthStateChanged,
  User,
} from 'firebase/auth';
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  collection,
  getDocs,
  deleteDoc,
  getDocFromServer,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import { WorkoutPlan, WorkoutSessionLog, UserPreferences } from '../types';

// Initialize Firebase App & Services
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
export const db = (firebaseConfig as any).firestoreDatabaseId
  ? getFirestore(app, (firebaseConfig as any).firestoreDatabaseId)
  : getFirestore(app);
export const auth = getAuth(app);

// Google Sign-In Provider (Authentication only - no Drive scope)
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

// Verify initial connection
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.warn('Firebase client is offline or initializing.');
    }
  }
}
testConnection();

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo:
        auth.currentUser?.providerData?.map((p) => ({
          providerId: p.providerId,
          email: p.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

// ==========================================
// Authentication Functions
// ==========================================

export async function signInWithGoogle(): Promise<User> {
  try {
    const result = await signInWithPopup(auth, googleProvider);
    if (result.user) {
      await saveUserProfile(result.user.uid, {
        email: result.user.email,
        displayName: result.user.displayName,
        photoURL: result.user.photoURL,
        isGuest: false,
      });
    }
    return result.user;
  } catch (error) {
    console.error('Google sign-in error:', error);
    throw error;
  }
}

export async function signInAsGuest(): Promise<User> {
  try {
    const result = await signInAnonymously(auth);
    if (result.user) {
      await saveUserProfile(result.user.uid, {
        email: null,
        displayName: 'Guest Athlete',
        photoURL: null,
        isGuest: true,
      });
    }
    return result.user;
  } catch (error) {
    console.error('Guest sign-in error:', error);
    throw error;
  }
}

export async function logOutUser(): Promise<void> {
  try {
    await fbSignOut(auth);
  } catch (error) {
    console.error('Sign-out error:', error);
    throw error;
  }
}

export function subscribeToAuth(callback: (user: User | null) => void) {
  return onAuthStateChanged(auth, callback);
}

// ==========================================
// Firestore Persistence & Sync
// ==========================================

export interface UserProfileData {
  userId: string;
  email?: string | null;
  displayName?: string | null;
  photoURL?: string | null;
  isGuest?: boolean;
  activePlanId?: string;
  preferences?: string;
  weightUnit?: 'kg' | 'lbs';
  updatedAt?: string;
}

export async function saveUserProfile(
  userId: string,
  data: {
    email?: string | null;
    displayName?: string | null;
    photoURL?: string | null;
    isGuest?: boolean;
    activePlanId?: string;
    preferences?: UserPreferences;
    weightUnit?: 'kg' | 'lbs';
  }
) {
  const path = `users/${userId}`;
  try {
    const payload: Record<string, any> = {
      userId,
      updatedAt: new Date().toISOString(),
    };

    if (data.email !== undefined) {
      payload.email = data.email;
    }
    if (data.displayName !== undefined) {
      payload.displayName = data.displayName;
    }
    if (data.photoURL !== undefined) {
      payload.photoURL = data.photoURL;
    }
    if (data.isGuest !== undefined) {
      payload.isGuest = data.isGuest;
    }
    if (data.activePlanId !== undefined) {
      payload.activePlanId = data.activePlanId;
    }
    if (data.weightUnit !== undefined) {
      payload.weightUnit = data.weightUnit;
    }
    if (data.preferences !== undefined) {
      payload.preferences = JSON.stringify(data.preferences);
    }

    await setDoc(doc(db, 'users', userId), payload, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function fetchUserProfile(userId: string): Promise<UserProfileData | null> {
  const path = `users/${userId}`;
  try {
    const snap = await getDoc(doc(db, 'users', userId));
    if (snap.exists()) {
      return snap.data() as UserProfileData;
    }
    return null;
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}

export async function syncPlanToFirestore(userId: string, plan: WorkoutPlan): Promise<void> {
  const path = `users/${userId}/plans/${plan.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'plans', plan.id), {
      id: plan.id,
      userId,
      name: plan.name,
      description: plan.description || '',
      daysCount: plan.daysCount || plan.days?.length || 4,
      isCustom: Boolean(plan.isCustom),
      days: JSON.stringify(plan.days || []),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deletePlanFromFirestore(userId: string, planId: string): Promise<void> {
  const path = `users/${userId}/plans/${planId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'plans', planId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchAllPlansFromFirestore(userId: string): Promise<WorkoutPlan[]> {
  const path = `users/${userId}/plans`;
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'plans'));
    const plans: WorkoutPlan[] = [];
    snap.forEach((d) => {
      const data = d.data();
      plans.push({
        id: data.id || d.id,
        name: data.name,
        description: data.description || '',
        daysCount: data.daysCount,
        isCustom: data.isCustom,
        days: data.days ? JSON.parse(data.days) : [],
      });
    });
    return plans;
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

export async function syncSessionLogToFirestore(
  userId: string,
  log: WorkoutSessionLog
): Promise<void> {
  const path = `users/${userId}/logs/${log.id}`;
  try {
    await setDoc(doc(db, 'users', userId, 'logs', log.id), {
      id: log.id,
      userId,
      planId: log.planId,
      dayKey: log.dayKey,
      dayTitle: log.dayTitle,
      date: log.date,
      timestamp: log.timestamp,
      completed: log.completed,
      durationSeconds: log.durationSeconds || 0,
      exercises: JSON.stringify(log.exercises || []),
      updatedAt: new Date().toISOString(),
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function deleteSessionLogFromFirestore(
  userId: string,
  logId: string
): Promise<void> {
  const path = `users/${userId}/logs/${logId}`;
  try {
    await deleteDoc(doc(db, 'users', userId, 'logs', logId));
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, path);
  }
}

export async function fetchAllSessionLogsFromFirestore(
  userId: string
): Promise<WorkoutSessionLog[]> {
  const path = `users/${userId}/logs`;
  try {
    const snap = await getDocs(collection(db, 'users', userId, 'logs'));
    const logs: WorkoutSessionLog[] = [];
    snap.forEach((d) => {
      const data = d.data();
      logs.push({
        id: data.id || d.id,
        planId: data.planId,
        dayKey: data.dayKey,
        dayTitle: data.dayTitle,
        date: data.date,
        timestamp: data.timestamp,
        completed: data.completed,
        durationSeconds: data.durationSeconds || 0,
        exercises: data.exercises ? JSON.parse(data.exercises) : [],
      });
    });
    return logs.sort((a, b) => b.timestamp - a.timestamp);
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, path);
  }
}

/**
 * Loads all user data (plans, logs, preferences, activePlanId) from Firestore for a given user UID.
 */
export async function loadAllUserDataFromFirestore(userId: string): Promise<{
  profile: UserProfileData | null;
  plans: WorkoutPlan[];
  logs: WorkoutSessionLog[];
  preferences: UserPreferences | null;
  activePlanId: string | null;
}> {
  const [profile, plans, logs] = await Promise.all([
    fetchUserProfile(userId),
    fetchAllPlansFromFirestore(userId),
    fetchAllSessionLogsFromFirestore(userId),
  ]);

  let parsedPrefs: UserPreferences | null = null;
  if (profile?.preferences) {
    try {
      parsedPrefs = JSON.parse(profile.preferences);
    } catch (_) {}
  }

  return {
    profile,
    plans,
    logs,
    preferences: parsedPrefs,
    activePlanId: profile?.activePlanId || null,
  };
}

// ==========================================
// Cloud Sync Status Tracking & Queue
// ==========================================

export type CloudSyncState = 'idle' | 'saving' | 'saved' | 'offline' | 'error';

export interface CloudSyncStatus {
  state: CloudSyncState;
  lastSyncedAt: string | null;
  errorMessage: string | null;
}

let syncStatus: CloudSyncStatus = {
  state: 'idle',
  lastSyncedAt: null,
  errorMessage: null,
};

type SyncStatusListener = (status: CloudSyncStatus) => void;
const syncListeners = new Set<SyncStatusListener>();

export function subscribeToCloudSyncStatus(listener: SyncStatusListener) {
  syncListeners.add(listener);
  listener(syncStatus);
  return () => {
    syncListeners.delete(listener);
  };
}

function updateSyncStatus(updates: Partial<CloudSyncStatus>) {
  syncStatus = { ...syncStatus, ...updates };
  syncListeners.forEach((fn) => fn(syncStatus));
}

let autoSaveTimer: any = null;

/**
 * Debounced automatic push to Firestore for all user-specific data
 */
export function queueFirestoreSync(
  userId: string,
  payload: {
    activePlan?: WorkoutPlan;
    allPlans?: WorkoutPlan[];
    sessionLog?: WorkoutSessionLog;
    preferences?: UserPreferences;
    activePlanId?: string;
  },
  delayMs = 800
) {
  if (!userId || userId === 'guest') return;

  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    updateSyncStatus({
      state: 'offline',
      errorMessage: 'Offline. Workouts saved locally, will sync when reconnected.',
    });
    const handleOnline = () => {
      window.removeEventListener('online', handleOnline);
      queueFirestoreSync(userId, payload, 300);
    };
    window.addEventListener('online', handleOnline);
    return;
  }

  if (autoSaveTimer) {
    clearTimeout(autoSaveTimer);
  }

  updateSyncStatus({ state: 'saving', errorMessage: null });

  autoSaveTimer = setTimeout(async () => {
    autoSaveTimer = null;
    try {
      const promises: Promise<any>[] = [];

      // Sync active plan or all plans
      if (payload.activePlan) {
        promises.push(syncPlanToFirestore(userId, payload.activePlan));
      }
      if (payload.allPlans) {
        payload.allPlans.forEach((p) => {
          promises.push(syncPlanToFirestore(userId, p));
        });
      }

      // Sync session log if provided
      if (payload.sessionLog) {
        promises.push(syncSessionLogToFirestore(userId, payload.sessionLog));
      }

      // Sync user profile preferences and active plan selection
      if (payload.preferences || payload.activePlanId) {
        promises.push(
          saveUserProfile(userId, {
            preferences: payload.preferences,
            activePlanId: payload.activePlanId,
            weightUnit: payload.preferences?.weightUnit,
          })
        );
      }

      await Promise.all(promises);

      updateSyncStatus({
        state: 'saved',
        lastSyncedAt: new Date().toISOString(),
        errorMessage: null,
      });
    } catch (err: any) {
      console.error('Firestore Auto-Sync Error:', err);
      updateSyncStatus({
        state: 'error',
        errorMessage: err.message || 'Failed to sync with cloud database.',
      });
    }
  }, delayMs);
}

import { useEffect, useState, useCallback, useMemo } from 'react';
import { AppState } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import createContextHook from '@nkzw/create-context-hook';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/config/firebase';
import { useAuth } from '@/providers/AuthProvider';
import { Habit, Routine, HealthMetric } from '@/types';
import { DEFAULT_HABITS, DEFAULT_ROUTINES } from '@/constants/defaults';
import { getToday, calculateStreak } from '@/utils/date';

const HABITS_KEY = 'mantrack_habits';
const ROUTINES_KEY = 'mantrack_routines';
const METRICS_KEY = 'mantrack_metrics';
const INITIALIZED_KEY = 'mantrack_initialized';

function generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substring(2, 9);
}

export const [ManTrackProvider, useManTrack] = createContextHook(() => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [habits, setHabits] = useState<Habit[]>([]);
    const [routines, setRoutines] = useState<Routine[]>([]);
    const [metrics, setMetrics] = useState<HealthMetric[]>([]);
    const [currentDate, setCurrentDate] = useState(getToday());

    // Listen to app state (e.g., coming from background) to update the currentDate
    // if midnight has passed.
    useEffect(() => {
        const subscription = AppState.addEventListener('change', (nextAppState) => {
            if (nextAppState === 'active') {
                const today = getToday();
                if (today !== currentDate) {
                    setCurrentDate(today);
                }
            }
        });
        return () => subscription.remove();
    }, [currentDate]);

    const syncToFirestore = async (newHabits: Habit[], newRoutines: Routine[], newMetrics: HealthMetric[]) => {
        if (!user) return;
        const userDocRef = doc(db, 'users', user.uid);
        await setDoc(userDocRef, {
            habits: newHabits,
            routines: newRoutines,
            metrics: newMetrics
        }, { merge: true });
    };

    // Firestore sync effect for data if logged in
    useEffect(() => {
        if (!user) return;

        const userDocRef = doc(db, 'users', user.uid);

        const unsubscribe = onSnapshot(userDocRef, (docSnap) => {
            if (docSnap.exists()) {
                const data = docSnap.data();
                let needsHabitsUpdate = false;
                let processedHabits = data.habits || [];

                if (data.habits) {
                    processedHabits = data.habits.map((h: Habit) => {
                        const actualStreak = calculateStreak(h.completedDates, currentDate);
                        if (actualStreak !== h.streak) {
                            needsHabitsUpdate = true;
                            return { ...h, streak: actualStreak };
                        }
                        return h;
                    });
                    setHabits(processedHabits);
                }

                if (data.routines) {
                    let needsRoutinesReset = false;
                    const processedRoutines = data.routines.map((r: Routine) => {
                        // Check if it's a new day for this routine
                        if (r.lastResetDate !== currentDate) {
                            needsRoutinesReset = true;
                            return {
                                ...r,
                                lastResetDate: currentDate,
                                tasks: r.tasks.map(t => ({ ...t, completed: false }))
                            };
                        }
                        return r;
                    });

                    setRoutines(processedRoutines);

                    // If we automatically reset tasks or broken streaks, sync it back
                    if (needsRoutinesReset || needsHabitsUpdate) {
                        syncToFirestore(processedHabits, processedRoutines, data.metrics || []);
                    }
                }

                if (data.metrics) setMetrics(data.metrics);
            } else {
                // Initialize new user with default data
                const initialHabits = DEFAULT_HABITS.map((h) => ({
                    ...h, id: generateId(), streak: 0, bestStreak: 0, completedDates: [], createdAt: new Date().toISOString()
                }));
                const initialRoutines = DEFAULT_ROUTINES.map((r) => ({
                    ...r, id: generateId(), createdAt: new Date().toISOString(), lastResetDate: currentDate
                }));

                setDoc(userDocRef, {
                    habits: initialHabits,
                    routines: initialRoutines,
                    metrics: []
                });
            }
        });

        return unsubscribe;
    }, [user, currentDate]);

    // For unauthenticated flow (if any fallback needed), otherwise the onSnapshot handles local state.
    // We still provide mutation functions that update both local state and firestore for optimistic updates.

    const toggleHabit = useCallback((habitId: string) => {
        if (!user) return;
        setHabits((prev) => {
            const updated = prev.map((h) => {
                if (h.id !== habitId) return h;
                const alreadyDone = h.completedDates.includes(currentDate);
                const newDates = alreadyDone
                    ? h.completedDates.filter((d) => d !== currentDate)
                    : [...h.completedDates, currentDate];
                const newStreak = calculateStreak(newDates, currentDate);
                return {
                    ...h,
                    completedDates: newDates,
                    streak: newStreak,
                    bestStreak: Math.max(h.bestStreak, newStreak),
                };
            });
            syncToFirestore(updated, routines, metrics);
            return updated;
        });
    }, [user, routines, metrics]);

    const addHabit = useCallback((habit: Omit<Habit, 'id' | 'streak' | 'bestStreak' | 'completedDates' | 'createdAt'>) => {
        if (!user) return;
        setHabits((prev) => {
            const newHabit: Habit = {
                ...habit,
                id: generateId(),
                streak: 0,
                bestStreak: 0,
                completedDates: [],
                createdAt: new Date().toISOString(),
            };
            const updated = [...prev, newHabit];
            syncToFirestore(updated, routines, metrics);
            return updated;
        });
    }, [user, routines, metrics]);

    const deleteHabit = useCallback((habitId: string) => {
        if (!user) return;
        setHabits((prev) => {
            const updated = prev.filter((h) => h.id !== habitId);
            syncToFirestore(updated, routines, metrics);
            return updated;
        });
    }, [user, routines, metrics]);

    const toggleRoutineTask = useCallback((routineId: string, taskId: string) => {
        if (!user) return;
        setRoutines((prev) => {
            const updated = prev.map((r) => {
                if (r.id !== routineId) return r;
                return {
                    ...r,
                    tasks: r.tasks.map((t) =>
                        t.id === taskId ? { ...t, completed: !t.completed } : t
                    ),
                };
            });
            syncToFirestore(habits, updated, metrics);
            return updated;
        });
    }, [user, habits, metrics]);

    const addRoutine = useCallback((routine: Omit<Routine, 'id' | 'createdAt'>) => {
        if (!user) return;
        setRoutines((prev) => {
            const newRoutine: Routine = {
                ...routine,
                id: generateId(),
                createdAt: new Date().toISOString(),
            };
            const updated = [...prev, newRoutine];
            syncToFirestore(habits, updated, metrics);
            return updated;
        });
    }, [user, habits, metrics]);

    const deleteRoutine = useCallback((routineId: string) => {
        if (!user) return;
        setRoutines((prev) => {
            const updated = prev.filter((r) => r.id !== routineId);
            syncToFirestore(habits, updated, metrics);
            return updated;
        });
    }, [user, habits, metrics]);

    const resetRoutineTasks = useCallback((routineId: string) => {
        if (!user) return;
        setRoutines((prev) => {
            const updated = prev.map((r) => {
                if (r.id !== routineId) return r;
                return { ...r, tasks: r.tasks.map((t) => ({ ...t, completed: false })) };
            });
            syncToFirestore(habits, updated, metrics);
            return updated;
        });
    }, [user, habits, metrics]);

    const logMetric = useCallback((metric: Omit<HealthMetric, 'id'>) => {
        if (!user) return;
        setMetrics((prev) => {
            const existing = prev.findIndex(
                (m) => m.type === metric.type && m.date === metric.date
            );
            let updated: HealthMetric[];
            if (existing >= 0) {
                updated = prev.map((m, i) =>
                    i === existing ? { ...m, value: metric.value } : m
                );
            } else {
                updated = [...prev, { ...metric, id: generateId() }];
            }
            syncToFirestore(habits, routines, updated);
            return updated;
        });
    }, [user, habits, routines]);

    const todayCompletedCount = useMemo(() => {
        return habits.filter((h) => h.completedDates.includes(currentDate)).length;
    }, [habits, currentDate]);

    const todayCompletionRate = useMemo(() => {
        if (habits.length === 0) return 0;
        return todayCompletedCount / habits.length;
    }, [habits, todayCompletedCount]);

    const totalStreaks = useMemo(() => {
        return habits.reduce((sum, h) => sum + h.streak, 0);
    }, [habits]);

    const isLoading = false; // with realtime snapshot, if not loaded we could track it, but for UI smooth we just default to false

    return {
        habits,
        routines,
        metrics,
        isLoading,
        toggleHabit,
        addHabit,
        deleteHabit,
        toggleRoutineTask,
        addRoutine,
        deleteRoutine,
        resetRoutineTasks,
        logMetric,
        todayCompletedCount,
        todayCompletionRate,
        totalStreaks,
        currentDate,
    };
});

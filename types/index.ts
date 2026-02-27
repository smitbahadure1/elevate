export interface Habit {
    id: string;
    name: string;
    icon: string;
    color: string;
    category: 'grooming' | 'fitness' | 'wellness' | 'productivity';
    streak: number;
    bestStreak: number;
    completedDates: string[];
    createdAt: string;
    reminderTime?: string;
}

export interface RoutineTask {
    id: string;
    name: string;
    completed: boolean;
}

export interface Routine {
    id: string;
    name: string;
    icon: string;
    color: string;
    type: 'morning' | 'night' | 'gym' | 'custom';
    tasks: RoutineTask[];
    scheduledDays: number[];
    createdAt: string;
    lastResetDate?: string;
}

export interface HealthMetric {
    id: string;
    type: 'weight' | 'water' | 'sleep' | 'steps';
    value: number;
    unit: string;
    date: string;
}

export interface DayLog {
    date: string;
    completedHabits: string[];
    completedRoutines: string[];
    metrics: HealthMetric[];
}

export type HabitCategory = Habit['category'];
export type RoutineType = Routine['type'];
export type MetricType = HealthMetric['type'];

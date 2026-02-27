import { Habit, Routine } from '@/types';
import Colors from '@/constants/colors';

export const DEFAULT_HABITS: Omit<Habit, 'id' | 'streak' | 'bestStreak' | 'completedDates' | 'createdAt'>[] = [
  { name: 'Skincare', icon: 'Sparkles', color: Colors.dark.teal, category: 'grooming' },
  { name: 'Workout', icon: 'Dumbbell', color: Colors.dark.error, category: 'fitness' },
  { name: 'Water Intake', icon: 'Droplets', color: Colors.dark.blue, category: 'wellness' },
  { name: 'Sleep 7h+', icon: 'Moon', color: Colors.dark.purple, category: 'wellness' },
  { name: 'Meditation', icon: 'Brain', color: Colors.dark.accent, category: 'wellness' },
  { name: 'Beard Care', icon: 'Scissors', color: Colors.dark.warning, category: 'grooming' },
  { name: 'Read 20min', icon: 'BookOpen', color: Colors.dark.success, category: 'productivity' },
  { name: 'Cold Shower', icon: 'Snowflake', color: Colors.dark.teal, category: 'wellness' },
];

export const DEFAULT_ROUTINES: Omit<Routine, 'id' | 'createdAt'>[] = [
  {
    name: 'Morning Routine',
    icon: 'Sun',
    color: Colors.dark.accent,
    type: 'morning',
    scheduledDays: [0, 1, 2, 3, 4, 5, 6],
    tasks: [
      { id: 't1', name: 'Wake up early', completed: false },
      { id: 't2', name: 'Cold shower', completed: false },
      { id: 't3', name: 'Skincare routine', completed: false },
      { id: 't4', name: 'Healthy breakfast', completed: false },
      { id: 't5', name: 'Plan the day', completed: false },
    ],
  },
  {
    name: 'Night Routine',
    icon: 'Moon',
    color: Colors.dark.purple,
    type: 'night',
    scheduledDays: [0, 1, 2, 3, 4, 5, 6],
    tasks: [
      { id: 't6', name: 'No screens 30min before bed', completed: false },
      { id: 't7', name: 'Night skincare', completed: false },
      { id: 't8', name: 'Journal / reflect', completed: false },
      { id: 't9', name: 'Prepare tomorrow', completed: false },
    ],
  },
  {
    name: 'Gym Session',
    icon: 'Dumbbell',
    color: Colors.dark.error,
    type: 'gym',
    scheduledDays: [1, 3, 5],
    tasks: [
      { id: 't10', name: 'Warm up (10 min)', completed: false },
      { id: 't11', name: 'Main workout', completed: false },
      { id: 't12', name: 'Cool down & stretch', completed: false },
      { id: 't13', name: 'Protein shake', completed: false },
    ],
  },
];

export const METRIC_CONFIG: Record<string, { unit: string; icon: string; color: string; label: string; min: number; max: number; step: number; defaultValue: number }> = {
  weight: { unit: 'lbs', icon: 'Scale', color: Colors.dark.accent, label: 'Weight', min: 50, max: 400, step: 0.5, defaultValue: 170 },
  water: { unit: 'glasses', icon: 'Droplets', color: Colors.dark.blue, label: 'Water', min: 0, max: 20, step: 1, defaultValue: 8 },
  sleep: { unit: 'hours', icon: 'Moon', color: Colors.dark.purple, label: 'Sleep', min: 0, max: 14, step: 0.5, defaultValue: 7 },
  steps: { unit: 'steps', icon: 'Footprints', color: Colors.dark.success, label: 'Steps', min: 0, max: 50000, step: 500, defaultValue: 8000 },
};

import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, ScrollView, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { X, Plus, Trash2 } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useManTrack } from '@/providers/ManTrackProvider';
import { RoutineType, RoutineTask } from '@/types';

const TYPES: { key: RoutineType; label: string }[] = [
  { key: 'morning', label: 'Morning' },
  { key: 'night', label: 'Night' },
  { key: 'gym', label: 'Gym' },
  { key: 'custom', label: 'Custom' },
];

const TYPE_COLORS: Record<RoutineType, string> = {
  morning: Colors.dark.accent,
  night: Colors.dark.purple,
  gym: Colors.dark.error,
  custom: Colors.dark.blue,
};

const TYPE_ICONS: Record<RoutineType, string> = {
  morning: 'Sun',
  night: 'Moon',
  gym: 'Dumbbell',
  custom: 'LayoutList',
};

const DAY_LABELS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function generateTaskId(): string {
  return 'task_' + Date.now().toString(36) + Math.random().toString(36).substring(2, 6);
}

export default function AddRoutineScreen() {
  const router = useRouter();
  const { addRoutine } = useManTrack();
  const [name, setName] = useState('');
  const [selectedType, setSelectedType] = useState<RoutineType>('morning');
  const [tasks, setTasks] = useState<RoutineTask[]>([]);
  const [newTaskName, setNewTaskName] = useState('');
  const [scheduledDays, setScheduledDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  const handleAddTask = useCallback(() => {
    if (!newTaskName.trim()) return;
    setTasks((prev) => [...prev, { id: generateTaskId(), name: newTaskName.trim(), completed: false }]);
    setNewTaskName('');
  }, [newTaskName]);

  const handleRemoveTask = useCallback((taskId: string) => {
    setTasks((prev) => prev.filter((t) => t.id !== taskId));
  }, []);

  const toggleDay = useCallback((day: number) => {
    setScheduledDays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    );
  }, []);

  const handleSave = useCallback(() => {
    if (!name.trim() || tasks.length === 0) return;
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    addRoutine({
      name: name.trim(),
      icon: TYPE_ICONS[selectedType],
      color: TYPE_COLORS[selectedType],
      type: selectedType,
      tasks,
      scheduledDays,
    });
    router.back();
  }, [name, selectedType, tasks, scheduledDays, addRoutine, router]);

  const canSave = name.trim().length > 0 && tasks.length > 0;

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'New Routine',
          headerStyle: { backgroundColor: Colors.dark.background },
          headerTintColor: Colors.dark.text,
          headerTitleStyle: { fontWeight: '700' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
              <X size={22} color={Colors.dark.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSave}
              disabled={!canSave}
              style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
            >
              <Text style={[styles.saveBtnText, !canSave && styles.saveBtnTextDisabled]}>Save</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Routine Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Morning Routine"
          placeholderTextColor={Colors.dark.textTertiary}
          autoFocus
        />

        <Text style={styles.label}>Type</Text>
        <View style={styles.typeRow}>
          {TYPES.map((type) => (
            <TouchableOpacity
              key={type.key}
              style={[
                styles.typeChip,
                selectedType === type.key && { backgroundColor: TYPE_COLORS[type.key] },
              ]}
              onPress={() => setSelectedType(type.key)}
              activeOpacity={0.7}
            >
              <Text
                style={[
                  styles.typeText,
                  selectedType === type.key && { color: Colors.dark.background },
                ]}
              >
                {type.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Schedule</Text>
        <View style={styles.daysRow}>
          {DAY_LABELS.map((label, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.dayBtn, scheduledDays.includes(index) && styles.dayBtnActive]}
              onPress={() => toggleDay(index)}
              activeOpacity={0.7}
            >
              <Text style={[styles.dayText, scheduledDays.includes(index) && styles.dayTextActive]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Tasks</Text>
        {tasks.map((task) => (
          <View key={task.id} style={styles.taskItem}>
            <Text style={styles.taskName}>{task.name}</Text>
            <TouchableOpacity onPress={() => handleRemoveTask(task.id)}>
              <Trash2 size={16} color={Colors.dark.error} />
            </TouchableOpacity>
          </View>
        ))}

        <View style={styles.addTaskRow}>
          <TextInput
            style={styles.taskInput}
            value={newTaskName}
            onChangeText={setNewTaskName}
            placeholder="Add a task..."
            placeholderTextColor={Colors.dark.textTertiary}
            onSubmitEditing={handleAddTask}
            returnKeyType="done"
          />
          <TouchableOpacity
            style={[styles.addTaskBtn, !newTaskName.trim() && styles.addTaskBtnDisabled]}
            onPress={handleAddTask}
            disabled={!newTaskName.trim()}
            activeOpacity={0.7}
          >
            <Plus size={18} color={newTaskName.trim() ? Colors.dark.background : Colors.dark.textTertiary} />
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.dark.background,
  },
  closeBtn: {
    padding: 4,
  },
  saveBtn: {
    backgroundColor: Colors.dark.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveBtnDisabled: {
    backgroundColor: Colors.dark.surfaceLight,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.dark.background,
  },
  saveBtnTextDisabled: {
    color: Colors.dark.textTertiary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.dark.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: Colors.dark.text,
    borderWidth: 1,
    borderColor: Colors.dark.surfaceBorder,
    marginBottom: 24,
  },
  typeRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  typeChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.dark.surfaceLight,
  },
  typeText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.dark.textSecondary,
  },
  daysRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 24,
  },
  dayBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.dark.surfaceBorder,
  },
  dayBtnActive: {
    backgroundColor: Colors.dark.accent,
    borderColor: Colors.dark.accent,
  },
  dayText: {
    fontSize: 11,
    fontWeight: '600' as const,
    color: Colors.dark.textSecondary,
  },
  dayTextActive: {
    color: Colors.dark.background,
  },
  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.dark.surfaceBorder,
  },
  taskName: {
    fontSize: 14,
    color: Colors.dark.text,
    flex: 1,
  },
  addTaskRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  taskInput: {
    flex: 1,
    backgroundColor: Colors.dark.surface,
    borderRadius: 12,
    padding: 14,
    fontSize: 14,
    color: Colors.dark.text,
    borderWidth: 1,
    borderColor: Colors.dark.surfaceBorder,
  },
  addTaskBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: Colors.dark.accent,
    alignItems: 'center',
    justifyContent: 'center',
  },
  addTaskBtnDisabled: {
    backgroundColor: Colors.dark.surfaceLight,
  },
});

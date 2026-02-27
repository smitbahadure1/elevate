import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Animated, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
  Sun, Moon, Dumbbell, LayoutList, Check, ChevronRight, RotateCcw,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Routine } from '@/types';

const ROUTINE_ICONS: Record<string, React.ComponentType<{ size: number; color: string }>> = {
  Sun,
  Moon,
  Dumbbell,
  LayoutList,
};

interface RoutineCardProps {
  routine: Routine;
  onToggleTask: (routineId: string, taskId: string) => void;
  onReset: (routineId: string) => void;
  onDelete?: (routineId: string) => void;
  expanded: boolean;
  onExpand: (routineId: string) => void;
}

export default React.memo(function RoutineCard({
  routine,
  onToggleTask,
  onReset,
  expanded,
  onExpand,
}: RoutineCardProps) {
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const completedTasks = routine.tasks.filter((t) => t.completed).length;
  const totalTasks = routine.tasks.length;
  const progress = totalTasks > 0 ? completedTasks / totalTasks : 0;
  const IconComponent = ROUTINE_ICONS[routine.icon] ?? LayoutList;

  const handlePress = useCallback(() => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    onExpand(routine.id);
  }, [routine.id, onExpand]);

  const handleTaskToggle = useCallback((taskId: string) => {
    if (Platform.OS !== 'web') {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    }
    Animated.sequence([
      Animated.timing(scaleAnim, { toValue: 0.97, duration: 60, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 1, duration: 100, useNativeDriver: true }),
    ]).start();
    onToggleTask(routine.id, taskId);
  }, [routine.id, onToggleTask, scaleAnim]);

  return (
    <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
      <View style={styles.card} testID={`routine-card-${routine.id}`}>
        <TouchableOpacity style={styles.header} onPress={handlePress} activeOpacity={0.7}>
          <View style={styles.headerLeft}>
            <View style={[styles.iconContainer, { backgroundColor: routine.color + '20' }]}>
              <IconComponent size={20} color={routine.color} />
            </View>
            <View style={styles.headerInfo}>
              <Text style={styles.name}>{routine.name}</Text>
              <Text style={styles.progress}>
                {completedTasks}/{totalTasks} tasks
              </Text>
            </View>
          </View>
          <View style={styles.headerRight}>
            <View style={styles.progressBarBg}>
              <View
                style={[
                  styles.progressBarFill,
                  { width: `${progress * 100}%`, backgroundColor: routine.color },
                ]}
              />
            </View>
            <ChevronRight
              size={18}
              color={Colors.dark.textTertiary}
              style={{ transform: [{ rotate: expanded ? '90deg' : '0deg' }] }}
            />
          </View>
        </TouchableOpacity>

        {expanded && (
          <View style={styles.tasksContainer}>
            {routine.tasks.map((task) => (
              <TouchableOpacity
                key={task.id}
                style={styles.taskRow}
                onPress={() => handleTaskToggle(task.id)}
                activeOpacity={0.7}
              >
                <View
                  style={[
                    styles.taskCheckbox,
                    task.completed && {
                      backgroundColor: routine.color,
                      borderColor: routine.color,
                    },
                  ]}
                >
                  {task.completed && <Check size={12} color={Colors.dark.background} />}
                </View>
                <Text style={[styles.taskName, task.completed && styles.taskCompleted]}>
                  {task.name}
                </Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={styles.resetBtn}
              onPress={() => onReset(routine.id)}
              activeOpacity={0.7}
            >
              <RotateCcw size={14} color={Colors.dark.textTertiary} />
              <Text style={styles.resetText}>Reset tasks</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </Animated.View>
  );
});

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: Colors.dark.surfaceBorder,
    overflow: 'hidden',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: 12,
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerInfo: {
    flex: 1,
    gap: 3,
  },
  name: {
    fontSize: 15,
    fontWeight: '600' as const,
    color: Colors.dark.text,
  },
  progress: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  progressBarBg: {
    width: 48,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.dark.surfaceLight,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    borderRadius: 2,
  },
  tasksContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 2,
  },
  taskRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    gap: 12,
  },
  taskCheckbox: {
    width: 22,
    height: 22,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.dark.surfaceBorder,
    alignItems: 'center',
    justifyContent: 'center',
  },
  taskName: {
    fontSize: 14,
    color: Colors.dark.text,
    flex: 1,
  },
  taskCompleted: {
    color: Colors.dark.textTertiary,
    textDecorationLine: 'line-through',
  },
  resetBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 10,
    alignSelf: 'flex-start',
  },
  resetText: {
    fontSize: 12,
    color: Colors.dark.textTertiary,
  },
});

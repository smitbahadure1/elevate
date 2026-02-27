import React, { useRef, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Animated, Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import {
    Sparkles, Dumbbell, Droplets, Moon, Brain, Scissors,
    BookOpen, Snowflake, Check, Flame, CircleDot,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { Habit } from '@/types';
import { useManTrack } from '@/providers/ManTrackProvider';

const ICON_MAP: Record<string, React.ComponentType<{ size: number; color: string }>> = {
    Sparkles,
    Dumbbell,
    Droplets,
    Moon,
    Brain,
    Scissors,
    BookOpen,
    Snowflake,
};

interface HabitCardProps {
    habit: Habit;
    onToggle: (id: string) => void;
    onLongPress?: (id: string) => void;
}

export default React.memo(function HabitCard({ habit, onToggle, onLongPress }: HabitCardProps) {
    const { currentDate } = useManTrack();
    const scaleAnim = useRef(new Animated.Value(1)).current;
    const isCompleted = habit.completedDates.includes(currentDate);
    const IconComponent = ICON_MAP[habit.icon] ?? CircleDot;

    const handlePress = useCallback(() => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        Animated.sequence([
            Animated.timing(scaleAnim, { toValue: 0.92, duration: 80, useNativeDriver: true }),
            Animated.timing(scaleAnim, { toValue: 1, duration: 120, useNativeDriver: true }),
        ]).start();
        onToggle(habit.id);
    }, [habit.id, onToggle, scaleAnim]);

    const handleLongPress = useCallback(() => {
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        }
        onLongPress?.(habit.id);
    }, [habit.id, onLongPress]);

    return (
        <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
            <TouchableOpacity
                style={[styles.card, isCompleted && styles.cardCompleted]}
                onPress={handlePress}
                onLongPress={handleLongPress}
                activeOpacity={0.7}
                testID={`habit-card-${habit.id}`}
            >
                <View style={styles.left}>
                    <View style={[styles.iconContainer, { backgroundColor: habit.color + '20' }]}>
                        <IconComponent size={20} color={habit.color} />
                    </View>
                    <View style={styles.info}>
                        <Text style={[styles.name, isCompleted && styles.nameCompleted]}>{habit.name}</Text>
                        {habit.streak > 0 && (
                            <View style={styles.streakRow}>
                                <Flame size={12} color={Colors.dark.accent} />
                                <Text style={styles.streakText}>{habit.streak} day streak</Text>
                            </View>
                        )}
                    </View>
                </View>
                <View style={[styles.checkbox, isCompleted && { backgroundColor: habit.color, borderColor: habit.color }]}>
                    {isCompleted && <Check size={14} color={Colors.dark.background} />}
                </View>
            </TouchableOpacity>
        </Animated.View>
    );
});

const styles = StyleSheet.create({
    card: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: Colors.dark.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.dark.surfaceBorder,
    },
    cardCompleted: {
        borderColor: Colors.dark.accent + '30',
        backgroundColor: Colors.dark.accent + '08',
    },
    left: {
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
    info: {
        flex: 1,
        gap: 3,
    },
    name: {
        fontSize: 15,
        fontWeight: '600' as const,
        color: Colors.dark.text,
    },
    nameCompleted: {
        color: Colors.dark.textSecondary,
    },
    streakRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 4,
    },
    streakText: {
        fontSize: 12,
        color: Colors.dark.accent,
        fontWeight: '500' as const,
    },
    checkbox: {
        width: 26,
        height: 26,
        borderRadius: 8,
        borderWidth: 2,
        borderColor: Colors.dark.surfaceBorder,
        alignItems: 'center',
        justifyContent: 'center',
    },
});

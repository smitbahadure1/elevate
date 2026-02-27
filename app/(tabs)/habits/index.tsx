import React, { useMemo, useCallback, useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Alert, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, Flame, Calendar } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useManTrack } from '@/providers/ManTrackProvider';
import HabitCard from '@/components/HabitCard';
import { getToday, getLast7Days } from '@/utils/date';
import { HabitCategory } from '@/types';

const CATEGORIES: { key: HabitCategory | 'all'; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'grooming', label: 'Grooming' },
    { key: 'fitness', label: 'Fitness' },
    { key: 'wellness', label: 'Wellness' },
    { key: 'productivity', label: 'Productivity' },
];

export default function HabitsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { habits, toggleHabit, deleteHabit, currentDate } = useManTrack();
    const [selectedCategory, setSelectedCategory] = useState<HabitCategory | 'all'>('all');
    const today = currentDate;

    const filteredHabits = useMemo(() => {
        if (selectedCategory === 'all') return habits;
        return habits.filter((h) => h.category === selectedCategory);
    }, [habits, selectedCategory]);

    const completedToday = useMemo(() => {
        return habits.filter((h) => h.completedDates.includes(today)).length;
    }, [habits, today]);

    const weekData = useMemo(() => {
        const days = getLast7Days();
        return days.map((date) => {
            const completed = habits.filter((h) => h.completedDates.includes(date)).length;
            const isCurrentDay = date === today;
            return { date, completed, total: habits.length, isToday: isCurrentDay };
        });
    }, [habits, today]);

    const handleLongPress = useCallback((habitId: string) => {
        const habit = habits.find((h) => h.id === habitId);
        if (!habit) return;
        Alert.alert(
            habit.name,
            `Streak: ${habit.streak} days\nBest: ${habit.bestStreak} days`,
            [
                { text: 'Cancel', style: 'cancel' },
                { text: 'Delete', style: 'destructive', onPress: () => deleteHabit(habitId) },
            ]
        );
    }, [habits, deleteHabit]);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Habits</Text>
                    <Text style={styles.subtitle}>
                        {completedToday}/{habits.length} completed today
                    </Text>
                </View>
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => router.push('/add-habit')}
                    activeOpacity={0.7}
                >
                    <Plus size={20} color={Colors.dark.background} />
                </TouchableOpacity>
            </View>

            <View style={styles.weekStrip}>
                {weekData.map((day) => {
                    const pct = day.total > 0 ? day.completed / day.total : 0;
                    const dayLabel = new Date(day.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'narrow' });
                    return (
                        <View key={day.date} style={styles.weekDay}>
                            <Text style={[styles.weekDayLabel, day.isToday && styles.weekDayLabelActive]}>{dayLabel}</Text>
                            <View style={[styles.weekDot, { backgroundColor: pct > 0 ? Colors.dark.accent : Colors.dark.surfaceLight }]}>
                                {pct >= 1 && <Flame size={10} color={Colors.dark.background} />}
                            </View>
                            <Text style={[styles.weekDayNum, day.isToday && styles.weekDayNumActive]}>
                                {new Date(day.date + 'T00:00:00').getDate()}
                            </Text>
                        </View>
                    );
                })}
            </View>

            <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.filterScroll}
                contentContainerStyle={styles.filterContent}
            >
                {CATEGORIES.map((cat) => (
                    <TouchableOpacity
                        key={cat.key}
                        style={[styles.filterChip, selectedCategory === cat.key && styles.filterChipActive]}
                        onPress={() => setSelectedCategory(cat.key)}
                        activeOpacity={0.7}
                    >
                        <Text style={[styles.filterText, selectedCategory === cat.key && styles.filterTextActive]}>
                            {cat.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>

            <ScrollView
                style={styles.list}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            >
                {filteredHabits.length === 0 ? (
                    <View style={styles.emptyState}>
                        <Calendar size={48} color={Colors.dark.textTertiary} />
                        <Text style={styles.emptyText}>No habits yet</Text>
                        <Text style={styles.emptySubtext}>Tap + to add your first habit</Text>
                    </View>
                ) : (
                    filteredHabits.map((habit) => (
                        <HabitCard
                            key={habit.id}
                            habit={habit}
                            onToggle={toggleHabit}
                            onLongPress={handleLongPress}
                        />
                    ))
                )}
                <View style={{ height: 20 }} />
            </ScrollView>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 16,
    },
    title: {
        fontSize: 28,
        fontWeight: '800' as const,
        color: Colors.dark.text,
    },
    subtitle: {
        fontSize: 13,
        color: Colors.dark.textSecondary,
        marginTop: 2,
    },
    addBtn: {
        width: 40,
        height: 40,
        borderRadius: 12,
        backgroundColor: Colors.dark.accent,
        alignItems: 'center',
        justifyContent: 'center',
    },
    weekStrip: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        paddingHorizontal: 20,
        marginBottom: 16,
        backgroundColor: Colors.dark.surface,
        marginHorizontal: 20,
        borderRadius: 16,
        padding: 14,
        borderWidth: 1,
        borderColor: Colors.dark.surfaceBorder,
    },
    weekDay: {
        alignItems: 'center',
        gap: 6,
        flex: 1,
    },
    weekDayLabel: {
        fontSize: 11,
        color: Colors.dark.textTertiary,
        fontWeight: '500' as const,
    },
    weekDayLabelActive: {
        color: Colors.dark.accent,
    },
    weekDot: {
        width: 24,
        height: 24,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    weekDayNum: {
        fontSize: 12,
        color: Colors.dark.textSecondary,
        fontWeight: '600' as const,
    },
    weekDayNumActive: {
        color: Colors.dark.text,
    },
    filterScroll: {
        maxHeight: 44,
        marginBottom: 12,
    },
    filterContent: {
        paddingHorizontal: 20,
        gap: 8,
    },
    filterChip: {
        paddingHorizontal: 16,
        paddingVertical: 8,
        borderRadius: 10,
        backgroundColor: Colors.dark.surfaceLight,
    },
    filterChipActive: {
        backgroundColor: Colors.dark.accent,
    },
    filterText: {
        fontSize: 13,
        color: Colors.dark.textSecondary,
        fontWeight: '600' as const,
    },
    filterTextActive: {
        color: Colors.dark.background,
    },
    list: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 20,
        gap: 10,
        paddingBottom: 40,
    },
    emptyState: {
        alignItems: 'center',
        paddingTop: 60,
        gap: 8,
    },
    emptyText: {
        fontSize: 18,
        fontWeight: '600' as const,
        color: Colors.dark.textSecondary,
    },
    emptySubtext: {
        fontSize: 14,
        color: Colors.dark.textTertiary,
    },
});

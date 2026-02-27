import React, { useMemo, useCallback } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Flame, Target, TrendingUp, Zap, Plus, ChevronRight } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useManTrack } from '@/providers/ManTrackProvider';
import ProgressRing from '@/components/ProgressRing';
import StatCard from '@/components/StatCard';
import HabitCard from '@/components/HabitCard';
import MetricCard from '@/components/MetricCard';
import WeeklyChart from '@/components/WeeklyChart';
import { getToday, getLast7Days } from '@/utils/date';

export default function DashboardScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const {
        habits, metrics, routines, toggleHabit,
        todayCompletedCount, todayCompletionRate, totalStreaks, isLoading, currentDate
    } = useManTrack();

    const today = currentDate;
    const [refreshing, setRefreshing] = React.useState(false);

    const onRefresh = useCallback(() => {
        setRefreshing(true);
        setTimeout(() => setRefreshing(false), 500);
    }, []);

    const weeklyHabitData = useMemo(() => {
        const days = getLast7Days();
        return days.map((date) => ({
            date,
            value: habits.filter((h) => h.completedDates.includes(date)).length,
        }));
    }, [habits]);

    const topHabits = useMemo(() => {
        return habits.slice(0, 4);
    }, [habits]);

    const bestStreak = useMemo(() => {
        return habits.reduce((max, h) => Math.max(max, h.bestStreak), 0);
    }, [habits]);

    const activeRoutines = useMemo(() => {
        const dayOfWeek = new Date(currentDate + 'T00:00:00').getDay();
        return routines.filter((r) => r.scheduledDays.includes(dayOfWeek));
    }, [routines, currentDate]);

    const routineProgress = useMemo(() => {
        if (activeRoutines.length === 0) return 0;
        const total = activeRoutines.reduce((s, r) => s + r.tasks.length, 0);
        const done = activeRoutines.reduce((s, r) => s + r.tasks.filter((t) => t.completed).length, 0);
        return total > 0 ? done / total : 0;
    }, [activeRoutines]);

    const getLatestMetric = useCallback((type: string) => {
        const sorted = metrics.filter((m) => m.type === type).sort((a, b) => b.date.localeCompare(a.date));
        return sorted[0]?.value;
    }, [metrics]);

    const getPreviousMetric = useCallback((type: string) => {
        const sorted = metrics.filter((m) => m.type === type).sort((a, b) => b.date.localeCompare(a.date));
        return sorted[1]?.value;
    }, [metrics]);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.dark.accent} />
                }
            >
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.greeting}>Good {getGreeting()}</Text>
                        <Text style={styles.subtitle}>Let's crush today</Text>
                    </View>
                    <View style={styles.dateChip}>
                        <Text style={styles.dateText}>{formatTodayDate()}</Text>
                    </View>
                </View>

                <View style={styles.ringSection}>
                    <ProgressRing
                        progress={todayCompletionRate}
                        size={150}
                        strokeWidth={12}
                        label="completed"
                        labelSize={32}
                    />
                    <View style={styles.ringSideStats}>
                        <View style={styles.ringStat}>
                            <Text style={styles.ringStatValue}>{todayCompletedCount}</Text>
                            <Text style={styles.ringStatLabel}>Done</Text>
                        </View>
                        <View style={styles.ringDivider} />
                        <View style={styles.ringStat}>
                            <Text style={styles.ringStatValue}>{habits.length - todayCompletedCount}</Text>
                            <Text style={styles.ringStatLabel}>Left</Text>
                        </View>
                        <View style={styles.ringDivider} />
                        <View style={styles.ringStat}>
                            <Text style={[styles.ringStatValue, { color: Colors.dark.accent }]}>
                                {Math.round(routineProgress * 100)}%
                            </Text>
                            <Text style={styles.ringStatLabel}>Routines</Text>
                        </View>
                    </View>
                </View>

                <View style={styles.statsRow}>
                    <StatCard
                        label="Streaks"
                        value={totalStreaks}
                        icon={<Flame size={18} color={Colors.dark.accent} />}
                        color={Colors.dark.accent}
                    />
                    <StatCard
                        label="Best"
                        value={bestStreak}
                        icon={<TrendingUp size={18} color={Colors.dark.success} />}
                        color={Colors.dark.success}
                        subtitle="day streak"
                    />
                    <StatCard
                        label="Habits"
                        value={habits.length}
                        icon={<Target size={18} color={Colors.dark.blue} />}
                        color={Colors.dark.blue}
                    />
                </View>

                <View style={styles.section}>
                    <View style={styles.sectionHeader}>
                        <Text style={styles.sectionTitle}>Today's Habits</Text>
                        <TouchableOpacity
                            onPress={() => router.push('/(tabs)/habits')}
                            style={styles.seeAllBtn}
                        >
                            <Text style={styles.seeAllText}>See all</Text>
                            <ChevronRight size={14} color={Colors.dark.textSecondary} />
                        </TouchableOpacity>
                    </View>
                    <View style={styles.habitsList}>
                        {topHabits.map((habit) => (
                            <HabitCard key={habit.id} habit={habit} onToggle={toggleHabit} />
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Health Metrics</Text>
                    <View style={styles.metricsGrid}>
                        {['weight', 'water', 'sleep', 'steps'].map((type) => (
                            <MetricCard
                                key={type}
                                type={type}
                                latestValue={getLatestMetric(type)}
                                previousValue={getPreviousMetric(type)}
                                onPress={() => router.push({ pathname: '/log-metric', params: { type } })}
                            />
                        ))}
                    </View>
                </View>

                <View style={styles.section}>
                    <Text style={styles.sectionTitle}>Weekly Activity</Text>
                    <View style={styles.chartCard}>
                        <WeeklyChart
                            data={weeklyHabitData}
                            maxValue={habits.length}
                            label="Habits completed"
                            unit="per day"
                        />
                    </View>
                </View>

                <View style={{ height: 20 }} />
            </ScrollView>
        </View>
    );
}

function getGreeting(): string {
    const hour = new Date().getHours();
    if (hour < 12) return 'morning';
    if (hour < 17) return 'afternoon';
    return 'evening';
}

function formatTodayDate(): string {
    return new Date().toLocaleDateString('en-US', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
    });
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: Colors.dark.background,
    },
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 12,
        paddingBottom: 40,
    },
    headerRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 24,
    },
    greeting: {
        fontSize: 28,
        fontWeight: '800' as const,
        color: Colors.dark.text,
        textTransform: 'capitalize',
    },
    subtitle: {
        fontSize: 15,
        color: Colors.dark.textSecondary,
        marginTop: 2,
    },
    dateChip: {
        backgroundColor: Colors.dark.surfaceLight,
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 10,
        marginTop: 4,
    },
    dateText: {
        fontSize: 12,
        color: Colors.dark.textSecondary,
        fontWeight: '500' as const,
    },
    ringSection: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 28,
        marginBottom: 24,
        backgroundColor: Colors.dark.surface,
        borderRadius: 20,
        padding: 24,
        borderWidth: 1,
        borderColor: Colors.dark.surfaceBorder,
    },
    ringSideStats: {
        gap: 16,
    },
    ringStat: {
        alignItems: 'center',
        gap: 2,
    },
    ringStatValue: {
        fontSize: 22,
        fontWeight: '700' as const,
        color: Colors.dark.text,
    },
    ringStatLabel: {
        fontSize: 11,
        color: Colors.dark.textSecondary,
        fontWeight: '500' as const,
    },
    ringDivider: {
        width: 32,
        height: 1,
        backgroundColor: Colors.dark.surfaceBorder,
        alignSelf: 'center',
    },
    statsRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 28,
    },
    section: {
        marginBottom: 24,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 14,
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700' as const,
        color: Colors.dark.text,
        marginBottom: 14,
    },
    seeAllBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 2,
        marginBottom: 14,
    },
    seeAllText: {
        fontSize: 13,
        color: Colors.dark.textSecondary,
    },
    habitsList: {
        gap: 10,
    },
    metricsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
    },
    chartCard: {
        backgroundColor: Colors.dark.surface,
        borderRadius: 16,
        padding: 18,
        borderWidth: 1,
        borderColor: Colors.dark.surfaceBorder,
    },
});

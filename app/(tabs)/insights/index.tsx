import React, { useMemo } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { TrendingUp, Award, Target, Zap, BarChart3, ArrowUpRight, ArrowDownRight, User } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useManTrack } from '@/providers/ManTrackProvider';
import WeeklyChart from '@/components/WeeklyChart';
import { getLast7Days, getLast30Days } from '@/utils/date';

export default function InsightsScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { habits, metrics, routines } = useManTrack();

    const weeklyHabitData = useMemo(() => {
        const days = getLast7Days();
        return days.map((date) => ({
            date,
            value: habits.filter((h) => h.completedDates.includes(date)).length,
        }));
    }, [habits]);

    const weeklyWaterData = useMemo(() => {
        const days = getLast7Days();
        return days.map((date) => {
            const metric = metrics.find((m) => m.type === 'water' && m.date === date);
            return { date, value: metric?.value ?? 0 };
        });
    }, [metrics]);

    const weeklySleepData = useMemo(() => {
        const days = getLast7Days();
        return days.map((date) => {
            const metric = metrics.find((m) => m.type === 'sleep' && m.date === date);
            return { date, value: metric?.value ?? 0 };
        });
    }, [metrics]);

    const stats = useMemo(() => {
        const last7 = getLast7Days();
        const last30 = getLast30Days();

        const weeklyCompletions = last7.reduce(
            (sum, d) => sum + habits.filter((h) => h.completedDates.includes(d)).length,
            0
        );
        const totalPossibleWeek = habits.length * 7;
        const weeklyRate = totalPossibleWeek > 0 ? Math.round((weeklyCompletions / totalPossibleWeek) * 100) : 0;

        const monthlyCompletions = last30.reduce(
            (sum, d) => sum + habits.filter((h) => h.completedDates.includes(d)).length,
            0
        );
        const totalPossibleMonth = habits.length * 30;
        const monthlyRate = totalPossibleMonth > 0 ? Math.round((monthlyCompletions / totalPossibleMonth) * 100) : 0;

        const longestStreak = habits.reduce((max, h) => Math.max(max, h.bestStreak), 0);
        const avgStreak = habits.length > 0 ? Math.round(habits.reduce((s, h) => s + h.streak, 0) / habits.length) : 0;

        const topHabit = [...habits].sort((a, b) => b.completedDates.length - a.completedDates.length)[0];
        const needsWork = [...habits].sort((a, b) => a.completedDates.length - b.completedDates.length)[0];

        return { weeklyRate, monthlyRate, longestStreak, avgStreak, topHabit, needsWork, weeklyCompletions };
    }, [habits]);

    const consistencyScore = useMemo(() => {
        if (habits.length === 0) return 0;
        const last30 = getLast30Days();
        const daysWithActivity = last30.filter((d) =>
            habits.some((h) => h.completedDates.includes(d))
        ).length;
        return Math.round((daysWithActivity / 30) * 100);
    }, [habits]);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <ScrollView
                style={styles.scroll}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
            >
                <View style={styles.headerRow}>
                    <View>
                        <Text style={styles.title}>Insights</Text>
                        <Text style={styles.subtitle}>Your performance overview</Text>
                    </View>
                    <TouchableOpacity
                        style={styles.profileBtn}
                        onPress={() => router.push('/profile')}
                        activeOpacity={0.7}
                    >
                        <User size={18} color={Colors.dark.accent} />
                    </TouchableOpacity>
                </View>

                <View style={styles.scoreCard}>
                    <View style={styles.scoreHeader}>
                        <View style={styles.scoreBadge}>
                            <Zap size={18} color={Colors.dark.accent} />
                        </View>
                        <Text style={styles.scoreLabel}>Consistency Score</Text>
                    </View>
                    <Text style={styles.scoreValue}>{consistencyScore}</Text>
                    <Text style={styles.scoreUnit}>/ 100</Text>
                    <View style={styles.scoreBarBg}>
                        <View style={[styles.scoreBarFill, { width: `${consistencyScore}%` }]} />
                    </View>
                    <Text style={styles.scoreDesc}>
                        {consistencyScore >= 80 ? 'Outstanding! Keep up the discipline.' :
                            consistencyScore >= 50 ? 'Good progress. Push for more consistency.' :
                                'Room for improvement. Start small, stay consistent.'}
                    </Text>
                </View>

                <View style={styles.rateRow}>
                    <View style={styles.rateCard}>
                        <View style={styles.rateHeader}>
                            <Text style={styles.rateLabel}>Weekly</Text>
                            <ArrowUpRight size={14} color={Colors.dark.success} />
                        </View>
                        <Text style={[styles.rateValue, { color: Colors.dark.success }]}>{stats.weeklyRate}%</Text>
                        <Text style={styles.rateDesc}>completion rate</Text>
                    </View>
                    <View style={styles.rateCard}>
                        <View style={styles.rateHeader}>
                            <Text style={styles.rateLabel}>Monthly</Text>
                            <BarChart3 size={14} color={Colors.dark.blue} />
                        </View>
                        <Text style={[styles.rateValue, { color: Colors.dark.blue }]}>{stats.monthlyRate}%</Text>
                        <Text style={styles.rateDesc}>completion rate</Text>
                    </View>
                </View>

                <View style={styles.rateRow}>
                    <View style={styles.rateCard}>
                        <View style={styles.rateHeader}>
                            <Text style={styles.rateLabel}>Best Streak</Text>
                            <Award size={14} color={Colors.dark.accent} />
                        </View>
                        <Text style={[styles.rateValue, { color: Colors.dark.accent }]}>{stats.longestStreak}</Text>
                        <Text style={styles.rateDesc}>days</Text>
                    </View>
                    <View style={styles.rateCard}>
                        <View style={styles.rateHeader}>
                            <Text style={styles.rateLabel}>Avg Streak</Text>
                            <TrendingUp size={14} color={Colors.dark.purple} />
                        </View>
                        <Text style={[styles.rateValue, { color: Colors.dark.purple }]}>{stats.avgStreak}</Text>
                        <Text style={styles.rateDesc}>days</Text>
                    </View>
                </View>

                {stats.topHabit && (
                    <View style={styles.insightCard}>
                        <View style={styles.insightHeader}>
                            <ArrowUpRight size={16} color={Colors.dark.success} />
                            <Text style={styles.insightTitle}>Top Habit</Text>
                        </View>
                        <Text style={styles.insightValue}>{stats.topHabit.name}</Text>
                        <Text style={styles.insightDesc}>
                            Completed {stats.topHabit.completedDates.length} times • {stats.topHabit.streak} day streak
                        </Text>
                    </View>
                )}

                {stats.needsWork && habits.length > 1 && (
                    <View style={[styles.insightCard, { borderColor: Colors.dark.warning + '30' }]}>
                        <View style={styles.insightHeader}>
                            <ArrowDownRight size={16} color={Colors.dark.warning} />
                            <Text style={styles.insightTitle}>Needs Attention</Text>
                        </View>
                        <Text style={styles.insightValue}>{stats.needsWork.name}</Text>
                        <Text style={styles.insightDesc}>
                            {stats.needsWork.completedDates.length === 0
                                ? 'Not yet started — take the first step!'
                                : `Only ${stats.needsWork.completedDates.length} completions. Focus here!`}
                        </Text>
                    </View>
                )}

                <View style={styles.chartSection}>
                    <Text style={styles.chartSectionTitle}>Weekly Habits</Text>
                    <View style={styles.chartCard}>
                        <WeeklyChart
                            data={weeklyHabitData}
                            maxValue={habits.length}
                            label="Completed"
                            unit="habits / day"
                        />
                    </View>
                </View>

                <View style={styles.chartSection}>
                    <Text style={styles.chartSectionTitle}>Water Intake</Text>
                    <View style={styles.chartCard}>
                        <WeeklyChart
                            data={weeklyWaterData}
                            color={Colors.dark.blue}
                            label="Glasses"
                            unit="per day"
                        />
                    </View>
                </View>

                <View style={styles.chartSection}>
                    <Text style={styles.chartSectionTitle}>Sleep Hours</Text>
                    <View style={styles.chartCard}>
                        <WeeklyChart
                            data={weeklySleepData}
                            color={Colors.dark.purple}
                            label="Hours"
                            unit="per night"
                        />
                    </View>
                </View>

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
    profileBtn: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: Colors.dark.accentDim,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 2,
        borderColor: Colors.dark.accent,
        marginTop: 4,
    },
    scoreCard: {
        backgroundColor: Colors.dark.surface,
        borderRadius: 20,
        padding: 24,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.dark.accent + '30',
        marginBottom: 16,
    },
    scoreHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 8,
        marginBottom: 12,
    },
    scoreBadge: {
        width: 32,
        height: 32,
        borderRadius: 8,
        backgroundColor: Colors.dark.accentDim,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scoreLabel: {
        fontSize: 14,
        fontWeight: '600' as const,
        color: Colors.dark.textSecondary,
    },
    scoreValue: {
        fontSize: 56,
        fontWeight: '800' as const,
        color: Colors.dark.accent,
        lineHeight: 60,
    },
    scoreUnit: {
        fontSize: 16,
        color: Colors.dark.textTertiary,
        marginBottom: 16,
    },
    scoreBarBg: {
        width: '100%',
        height: 6,
        borderRadius: 3,
        backgroundColor: Colors.dark.surfaceLight,
        marginBottom: 12,
        overflow: 'hidden',
    },
    scoreBarFill: {
        height: '100%',
        borderRadius: 3,
        backgroundColor: Colors.dark.accent,
    },
    scoreDesc: {
        fontSize: 13,
        color: Colors.dark.textSecondary,
        textAlign: 'center',
    },
    rateRow: {
        flexDirection: 'row',
        gap: 10,
        marginBottom: 10,
    },
    rateCard: {
        flex: 1,
        backgroundColor: Colors.dark.surface,
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: Colors.dark.surfaceBorder,
    },
    rateHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 8,
    },
    rateLabel: {
        fontSize: 12,
        color: Colors.dark.textSecondary,
        fontWeight: '500' as const,
    },
    rateValue: {
        fontSize: 28,
        fontWeight: '800' as const,
    },
    rateDesc: {
        fontSize: 11,
        color: Colors.dark.textTertiary,
        marginTop: 2,
    },
    insightCard: {
        backgroundColor: Colors.dark.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: Colors.dark.success + '30',
    },
    insightHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        marginBottom: 8,
    },
    insightTitle: {
        fontSize: 13,
        color: Colors.dark.textSecondary,
        fontWeight: '600' as const,
    },
    insightValue: {
        fontSize: 18,
        fontWeight: '700' as const,
        color: Colors.dark.text,
    },
    insightDesc: {
        fontSize: 12,
        color: Colors.dark.textTertiary,
        marginTop: 4,
    },
    chartSection: {
        marginTop: 14,
    },
    chartSectionTitle: {
        fontSize: 16,
        fontWeight: '700' as const,
        color: Colors.dark.text,
        marginBottom: 10,
    },
    chartCard: {
        backgroundColor: Colors.dark.surface,
        borderRadius: 16,
        padding: 18,
        borderWidth: 1,
        borderColor: Colors.dark.surfaceBorder,
    },
});

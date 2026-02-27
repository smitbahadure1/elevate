import React, { useMemo } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import {
    X, User, Flame, Target, TrendingUp, Calendar, Award, Dumbbell,
    Droplets, Moon, Footprints, ChevronRight, Shield,
} from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useManTrack } from '@/providers/ManTrackProvider';
import { useAuth } from '@/providers/AuthProvider';
import { getLast30Days } from '@/utils/date';

export default function ProfileScreen() {
    const router = useRouter();
    const insets = useSafeAreaInsets();
    const { user, signOut } = useAuth();
    const { habits, routines, metrics, totalStreaks } = useManTrack();

    const memberSince = useMemo(() => {
        const dates = habits.map((h) => h.createdAt).filter(Boolean).sort();
        if (dates.length === 0) return 'Today';
        return new Date(dates[0]).toLocaleDateString('en-US', {
            month: 'long',
            year: 'numeric',
        });
    }, [habits]);

    const totalCompletions = useMemo(() => {
        return habits.reduce((sum, h) => sum + h.completedDates.length, 0);
    }, [habits]);

    const activeDays = useMemo(() => {
        const last30 = getLast30Days();
        return last30.filter((d) =>
            habits.some((h) => h.completedDates.includes(d))
        ).length;
    }, [habits]);

    const bestStreak = useMemo(() => {
        return habits.reduce((max, h) => Math.max(max, h.bestStreak), 0);
    }, [habits]);

    const totalMetricsLogged = useMemo(() => {
        return metrics.length;
    }, [metrics]);

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Profile',
                    headerStyle: { backgroundColor: Colors.dark.background },
                    headerTintColor: Colors.dark.text,
                    headerTitleStyle: { fontWeight: '700' },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                            <X size={22} color={Colors.dark.text} />
                        </TouchableOpacity>
                    ),
                }}
            />

            <ScrollView
                style={styles.scroll}
                contentContainerStyle={[styles.scrollContent, { paddingBottom: insets.bottom + 40 }]}
                showsVerticalScrollIndicator={false}
            >
                {/* Avatar & Name */}
                <View style={styles.avatarSection}>
                    <View style={styles.avatar}>
                        <User size={40} color={Colors.dark.accent} />
                    </View>
                    <Text style={styles.userName}>{user?.email || 'Elevate User'}</Text>
                    <Text style={styles.memberSince}>Member since {memberSince}</Text>
                </View>

                {/* Quick Stats */}
                <View style={styles.quickStatsRow}>
                    <View style={styles.quickStat}>
                        <Text style={[styles.quickStatValue, { color: Colors.dark.accent }]}>{totalCompletions}</Text>
                        <Text style={styles.quickStatLabel}>Completions</Text>
                    </View>
                    <View style={styles.quickStatDivider} />
                    <View style={styles.quickStat}>
                        <Text style={[styles.quickStatValue, { color: Colors.dark.success }]}>{bestStreak}</Text>
                        <Text style={styles.quickStatLabel}>Best Streak</Text>
                    </View>
                    <View style={styles.quickStatDivider} />
                    <View style={styles.quickStat}>
                        <Text style={[styles.quickStatValue, { color: Colors.dark.blue }]}>{activeDays}</Text>
                        <Text style={styles.quickStatLabel}>Active Days</Text>
                    </View>
                </View>

                {/* Overview Cards */}
                <Text style={styles.sectionTitle}>Overview</Text>

                <View style={styles.overviewCard}>
                    <View style={styles.overviewRow}>
                        <View style={[styles.overviewIcon, { backgroundColor: Colors.dark.accentDim }]}>
                            <Target size={18} color={Colors.dark.accent} />
                        </View>
                        <View style={styles.overviewInfo}>
                            <Text style={styles.overviewLabel}>Total Habits</Text>
                            <Text style={styles.overviewSub}>Tracking daily</Text>
                        </View>
                        <Text style={[styles.overviewValue, { color: Colors.dark.accent }]}>{habits.length}</Text>
                    </View>
                </View>

                <View style={styles.overviewCard}>
                    <View style={styles.overviewRow}>
                        <View style={[styles.overviewIcon, { backgroundColor: Colors.dark.purpleDim }]}>
                            <Calendar size={18} color={Colors.dark.purple} />
                        </View>
                        <View style={styles.overviewInfo}>
                            <Text style={styles.overviewLabel}>Routines</Text>
                            <Text style={styles.overviewSub}>Structured workflows</Text>
                        </View>
                        <Text style={[styles.overviewValue, { color: Colors.dark.purple }]}>{routines.length}</Text>
                    </View>
                </View>

                <View style={styles.overviewCard}>
                    <View style={styles.overviewRow}>
                        <View style={[styles.overviewIcon, { backgroundColor: Colors.dark.blueDim }]}>
                            <TrendingUp size={18} color={Colors.dark.blue} />
                        </View>
                        <View style={styles.overviewInfo}>
                            <Text style={styles.overviewLabel}>Metrics Logged</Text>
                            <Text style={styles.overviewSub}>Health data entries</Text>
                        </View>
                        <Text style={[styles.overviewValue, { color: Colors.dark.blue }]}>{totalMetricsLogged}</Text>
                    </View>
                </View>

                <View style={styles.overviewCard}>
                    <View style={styles.overviewRow}>
                        <View style={[styles.overviewIcon, { backgroundColor: Colors.dark.successDim }]}>
                            <Flame size={18} color={Colors.dark.success} />
                        </View>
                        <View style={styles.overviewInfo}>
                            <Text style={styles.overviewLabel}>Total Streaks</Text>
                            <Text style={styles.overviewSub}>Combined active streaks</Text>
                        </View>
                        <Text style={[styles.overviewValue, { color: Colors.dark.success }]}>{totalStreaks}</Text>
                    </View>
                </View>

                {/* Achievements */}
                <Text style={styles.sectionTitle}>Achievements</Text>

                <View style={styles.achievementsGrid}>
                    {totalCompletions >= 1 && (
                        <View style={styles.badge}>
                            <Award size={24} color={Colors.dark.accent} />
                            <Text style={styles.badgeLabel}>First Step</Text>
                        </View>
                    )}
                    {bestStreak >= 7 && (
                        <View style={styles.badge}>
                            <Flame size={24} color={Colors.dark.error} />
                            <Text style={styles.badgeLabel}>7-Day Fire</Text>
                        </View>
                    )}
                    {habits.length >= 5 && (
                        <View style={styles.badge}>
                            <Target size={24} color={Colors.dark.blue} />
                            <Text style={styles.badgeLabel}>5 Habits</Text>
                        </View>
                    )}
                    {totalMetricsLogged >= 10 && (
                        <View style={styles.badge}>
                            <TrendingUp size={24} color={Colors.dark.success} />
                            <Text style={styles.badgeLabel}>Data Driven</Text>
                        </View>
                    )}
                    {bestStreak >= 30 && (
                        <View style={styles.badge}>
                            <Shield size={24} color={Colors.dark.purple} />
                            <Text style={styles.badgeLabel}>30-Day King</Text>
                        </View>
                    )}
                    {activeDays >= 1 && totalCompletions < 1 && (
                        <View style={styles.badgeLocked}>
                            <Award size={24} color={Colors.dark.textTertiary} />
                            <Text style={styles.badgeLabelLocked}>Locked</Text>
                        </View>
                    )}
                </View>
                {user?.email === 'nirajgtm26@gmail.com' && (
                    <TouchableOpacity
                        style={[styles.signOutBtn, { borderColor: Colors.dark.blue, marginBottom: 12 }]}
                        onPress={() => router.push('/admin')}
                    >
                        <Text style={[styles.signOutBtnText, { color: Colors.dark.blue }]}>Admin Dashboard</Text>
                    </TouchableOpacity>
                )}

                <TouchableOpacity style={styles.signOutBtn} onPress={signOut}>
                    <Text style={styles.signOutBtnText}>Sign Out</Text>
                </TouchableOpacity>

                <View style={styles.footer}>
                    <Text style={styles.footerText}>Elevate v1.0</Text>
                    <Text style={styles.footerSubtext}>Stay consistent. Stay sharp.</Text>
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
    scroll: {
        flex: 1,
    },
    scrollContent: {
        paddingHorizontal: 20,
        paddingTop: 20,
    },
    avatarSection: {
        alignItems: 'center',
        marginBottom: 28,
    },
    avatar: {
        width: 88,
        height: 88,
        borderRadius: 44,
        backgroundColor: Colors.dark.accentDim,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 14,
        borderWidth: 3,
        borderColor: Colors.dark.accent,
    },
    userName: {
        fontSize: 24,
        fontWeight: '800' as const,
        color: Colors.dark.text,
    },
    memberSince: {
        fontSize: 13,
        color: Colors.dark.textSecondary,
        marginTop: 4,
    },
    quickStatsRow: {
        flexDirection: 'row',
        backgroundColor: Colors.dark.surface,
        borderRadius: 20,
        padding: 20,
        marginBottom: 28,
        borderWidth: 1,
        borderColor: Colors.dark.surfaceBorder,
        alignItems: 'center',
    },
    quickStat: {
        flex: 1,
        alignItems: 'center',
        gap: 4,
    },
    quickStatValue: {
        fontSize: 24,
        fontWeight: '700' as const,
    },
    quickStatLabel: {
        fontSize: 11,
        color: Colors.dark.textSecondary,
        fontWeight: '500' as const,
    },
    quickStatDivider: {
        width: 1,
        height: 36,
        backgroundColor: Colors.dark.surfaceBorder,
    },
    sectionTitle: {
        fontSize: 16,
        fontWeight: '700' as const,
        color: Colors.dark.text,
        marginBottom: 14,
    },
    overviewCard: {
        backgroundColor: Colors.dark.surface,
        borderRadius: 16,
        padding: 16,
        marginBottom: 10,
        borderWidth: 1,
        borderColor: Colors.dark.surfaceBorder,
    },
    overviewRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
    },
    overviewIcon: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    overviewInfo: {
        flex: 1,
        gap: 2,
    },
    overviewLabel: {
        fontSize: 15,
        fontWeight: '600' as const,
        color: Colors.dark.text,
    },
    overviewSub: {
        fontSize: 12,
        color: Colors.dark.textTertiary,
    },
    overviewValue: {
        fontSize: 22,
        fontWeight: '700' as const,
    },
    achievementsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 28,
    },
    badge: {
        backgroundColor: Colors.dark.surface,
        borderRadius: 14,
        padding: 16,
        alignItems: 'center',
        gap: 8,
        width: '30%',
        borderWidth: 1,
        borderColor: Colors.dark.accent + '30',
    },
    badgeLabel: {
        fontSize: 11,
        fontWeight: '600' as const,
        color: Colors.dark.text,
        textAlign: 'center',
    },
    badgeLocked: {
        backgroundColor: Colors.dark.surface,
        borderRadius: 14,
        padding: 16,
        alignItems: 'center',
        gap: 8,
        width: '30%',
        borderWidth: 1,
        borderColor: Colors.dark.surfaceBorder,
        opacity: 0.5,
    },
    badgeLabelLocked: {
        fontSize: 11,
        fontWeight: '600' as const,
        color: Colors.dark.textTertiary,
        textAlign: 'center',
    },
    footer: {
        alignItems: 'center',
        paddingVertical: 20,
        gap: 4,
    },
    footerText: {
        fontSize: 13,
        color: Colors.dark.textTertiary,
        fontWeight: '600' as const,
    },
    footerSubtext: {
        fontSize: 12,
        color: Colors.dark.textTertiary,
    },
    signOutBtn: {
        backgroundColor: Colors.dark.surface,
        borderWidth: 1,
        borderColor: Colors.dark.error + '40',
        borderRadius: 12,
        padding: 16,
        alignItems: 'center',
        marginTop: 20,
    },
    signOutBtnText: {
        color: Colors.dark.error,
        fontWeight: '600',
        fontSize: 16,
    },
});

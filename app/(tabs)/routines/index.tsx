import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Plus, LayoutList } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useManTrack } from '@/providers/ManTrackProvider';
import RoutineCard from '@/components/RoutineCard';

export default function RoutinesScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { routines, toggleRoutineTask, resetRoutineTasks, deleteRoutine, currentDate } = useManTrack();
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const handleExpand = useCallback((id: string) => {
        setExpandedId((prev) => (prev === id ? null : id));
    }, []);

    const handleDelete = useCallback((id: string) => {
        const routine = routines.find((r) => r.id === id);
        if (!routine) return;
        Alert.alert('Delete Routine', `Are you sure you want to delete "${routine.name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            { text: 'Delete', style: 'destructive', onPress: () => deleteRoutine(id) },
        ]);
    }, [routines, deleteRoutine]);

    const todayRoutines = useMemo(() => {
        const dayOfWeek = new Date(currentDate + 'T00:00:00').getDay();
        return routines.filter((r) => r.scheduledDays.includes(dayOfWeek));
    }, [routines, currentDate]);

    const otherRoutines = useMemo(() => {
        const dayOfWeek = new Date(currentDate + 'T00:00:00').getDay();
        return routines.filter((r) => !r.scheduledDays.includes(dayOfWeek));
    }, [routines, currentDate]);

    const overallProgress = useMemo(() => {
        if (todayRoutines.length === 0) return 0;
        const total = todayRoutines.reduce((s, r) => s + r.tasks.length, 0);
        const done = todayRoutines.reduce((s, r) => s + r.tasks.filter((t) => t.completed).length, 0);
        return total > 0 ? Math.round((done / total) * 100) : 0;
    }, [todayRoutines]);

    return (
        <View style={[styles.container, { paddingTop: insets.top }]}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.title}>Routines</Text>
                    <Text style={styles.subtitle}>{overallProgress}% of today's tasks done</Text>
                </View>
                <TouchableOpacity
                    style={styles.addBtn}
                    onPress={() => router.push('/add-routine')}
                    activeOpacity={0.7}
                >
                    <Plus size={20} color={Colors.dark.background} />
                </TouchableOpacity>
            </View>

            <ScrollView
                style={styles.list}
                contentContainerStyle={styles.listContent}
                showsVerticalScrollIndicator={false}
            >
                {todayRoutines.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Today</Text>
                        <View style={styles.routinesList}>
                            {todayRoutines.map((routine) => (
                                <RoutineCard
                                    key={routine.id}
                                    routine={routine}
                                    onToggleTask={toggleRoutineTask}
                                    onReset={resetRoutineTasks}
                                    onDelete={handleDelete}
                                    expanded={expandedId === routine.id}
                                    onExpand={handleExpand}
                                />
                            ))}
                        </View>
                    </View>
                )}

                {otherRoutines.length > 0 && (
                    <View style={styles.section}>
                        <Text style={styles.sectionLabel}>Other Routines</Text>
                        <View style={styles.routinesList}>
                            {otherRoutines.map((routine) => (
                                <RoutineCard
                                    key={routine.id}
                                    routine={routine}
                                    onToggleTask={toggleRoutineTask}
                                    onReset={resetRoutineTasks}
                                    onDelete={handleDelete}
                                    expanded={expandedId === routine.id}
                                    onExpand={handleExpand}
                                />
                            ))}
                        </View>
                    </View>
                )}

                {routines.length === 0 && (
                    <View style={styles.emptyState}>
                        <LayoutList size={48} color={Colors.dark.textTertiary} />
                        <Text style={styles.emptyText}>No routines yet</Text>
                        <Text style={styles.emptySubtext}>Create your first routine to get started</Text>
                    </View>
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
    list: {
        flex: 1,
    },
    listContent: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    section: {
        marginBottom: 24,
    },
    sectionLabel: {
        fontSize: 14,
        fontWeight: '600' as const,
        color: Colors.dark.textSecondary,
        marginBottom: 12,
        textTransform: 'uppercase',
        letterSpacing: 0.8,
    },
    routinesList: {
        gap: 10,
    },
    emptyState: {
        alignItems: 'center',
        paddingTop: 80,
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

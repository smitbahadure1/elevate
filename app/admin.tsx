import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Text, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter, Stack } from 'expo-router';
import { X, Users, Activity, BarChart2 } from 'lucide-react-native';
import { collection, getDocs, query } from 'firebase/firestore';
import { db } from '@/config/firebase';
import Colors from '@/constants/colors';
import { useAuth } from '@/providers/AuthProvider';

interface UserData {
    id: string;
    habitsCount: number;
    routinesCount: number;
    metricsCount: number;
    totalStreaks: number;
}

export default function AdminScreen() {
    const insets = useSafeAreaInsets();
    const router = useRouter();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [usersData, setUsersData] = useState<UserData[]>([]);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!user || user.email !== 'nirajgtm26@gmail.com') {
            setError('Unauthorized access');
            setLoading(false);
            return;
        }

        const fetchAllUsers = async () => {
            try {
                const usersCol = collection(db, 'users');
                const q = query(usersCol);
                const querySnapshot = await getDocs(q);

                const data: UserData[] = [];
                querySnapshot.forEach((doc) => {
                    const userData = doc.data();
                    const habitsCount = userData.habits?.length || 0;
                    const routinesCount = userData.routines?.length || 0;
                    const metricsCount = userData.metrics?.length || 0;
                    const totalStreaks = (userData.habits || []).reduce((sum: number, h: any) => sum + (h.streak || 0), 0);

                    data.push({
                        id: doc.id,
                        habitsCount,
                        routinesCount,
                        metricsCount,
                        totalStreaks
                    });
                });
                setUsersData(data);
            } catch (err: any) {
                setError(err.message || 'Failed to fetch users');
            } finally {
                setLoading(false);
            }
        };

        fetchAllUsers();
    }, [user]);

    if (error) {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ title: 'Admin Dashboard', presentation: 'modal' }} />
                <View style={styles.center}>
                    <Text style={styles.errorText}>{error}</Text>
                    <TouchableOpacity style={styles.goBackBtn} onPress={() => router.back()}>
                        <Text style={styles.goBackText}>Go Back</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: 'Admin Dashboard',
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

            <ScrollView contentContainerStyle={[styles.content, { paddingBottom: insets.bottom + 20 }]}>
                {loading ? (
                    <View style={styles.center}>
                        <ActivityIndicator size="large" color={Colors.dark.accent} />
                        <Text style={styles.loadingText}>Loading user data...</Text>
                    </View>
                ) : (
                    <>
                        <View style={styles.statCards}>
                            <View style={styles.statCard}>
                                <Users size={24} color={Colors.dark.blue} />
                                <Text style={styles.statValue}>{usersData.length}</Text>
                                <Text style={styles.statLabel}>Total Users</Text>
                            </View>
                            <View style={styles.statCard}>
                                <Activity size={24} color={Colors.dark.success} />
                                <Text style={styles.statValue}>
                                    {usersData.reduce((sum, u) => sum + u.habitsCount, 0)}
                                </Text>
                                <Text style={styles.statLabel}>Total Habits</Text>
                            </View>
                        </View>

                        <Text style={styles.sectionTitle}>User List</Text>

                        <View style={styles.table}>
                            <View style={styles.tableHeader}>
                                <Text style={[styles.tableCol, styles.colFlex2]}>User ID</Text>
                                <Text style={[styles.tableCol, styles.colFlex1, styles.textCenter]}>Habits</Text>
                                <Text style={[styles.tableCol, styles.colFlex1, styles.textCenter]}>Streaks</Text>
                            </View>

                            {usersData.map((u, index) => (
                                <View key={u.id} style={[styles.tableRow, index % 2 === 0 ? styles.rowEven : styles.rowOdd]}>
                                    <Text style={[styles.tableCell, styles.colFlex2]} numberOfLines={1}>
                                        {u.id}
                                    </Text>
                                    <Text style={[styles.tableCell, styles.colFlex1, styles.textCenter]}>{u.habitsCount}</Text>
                                    <Text style={[styles.tableCell, styles.colFlex1, styles.textCenter]}>{u.totalStreaks}</Text>
                                </View>
                            ))}
                        </View>
                    </>
                )}
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
    center: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 20,
        height: 400,
    },
    errorText: {
        color: Colors.dark.error,
        fontSize: 18,
        fontWeight: '600',
        marginBottom: 20,
    },
    goBackBtn: {
        backgroundColor: Colors.dark.surface,
        paddingHorizontal: 20,
        paddingVertical: 12,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: Colors.dark.surfaceBorder,
    },
    goBackText: {
        color: Colors.dark.text,
        fontWeight: '600',
    },
    loadingText: {
        color: Colors.dark.textSecondary,
        marginTop: 12,
        fontSize: 16,
    },
    content: {
        padding: 20,
    },
    statCards: {
        flexDirection: 'row',
        gap: 12,
        marginBottom: 30,
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.dark.surface,
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.dark.surfaceBorder,
    },
    statValue: {
        fontSize: 28,
        fontWeight: '800',
        color: Colors.dark.text,
        marginTop: 12,
        marginBottom: 4,
    },
    statLabel: {
        fontSize: 13,
        color: Colors.dark.textSecondary,
        fontWeight: '600',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: '700',
        color: Colors.dark.text,
        marginBottom: 16,
    },
    table: {
        backgroundColor: Colors.dark.surface,
        borderRadius: 12,
        overflow: 'hidden',
        borderWidth: 1,
        borderColor: Colors.dark.surfaceBorder,
    },
    tableHeader: {
        flexDirection: 'row',
        paddingVertical: 12,
        paddingHorizontal: 16,
        backgroundColor: Colors.dark.surfaceLight,
        borderBottomWidth: 1,
        borderBottomColor: Colors.dark.surfaceBorder,
    },
    tableCol: {
        color: Colors.dark.textSecondary,
        fontSize: 12,
        fontWeight: '700',
        textTransform: 'uppercase',
    },
    tableRow: {
        flexDirection: 'row',
        paddingVertical: 14,
        paddingHorizontal: 16,
        borderBottomWidth: 1,
        borderBottomColor: Colors.dark.surfaceBorder,
    },
    rowEven: {
        backgroundColor: Colors.dark.surface,
    },
    rowOdd: {
        backgroundColor: Colors.dark.background,
    },
    tableCell: {
        color: Colors.dark.text,
        fontSize: 14,
    },
    colFlex1: {
        flex: 1,
    },
    colFlex2: {
        flex: 2,
    },
    textCenter: {
        textAlign: 'center',
    }
});

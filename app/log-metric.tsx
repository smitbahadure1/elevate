import React, { useState, useCallback, useMemo } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, Platform } from 'react-native';
import { useRouter, useLocalSearchParams, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { X, Minus, Plus, Scale, Droplets, Moon, Footprints } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useManTrack } from '@/providers/ManTrackProvider';
import { METRIC_CONFIG } from '@/constants/defaults';
import { MetricType } from '@/types';

const METRIC_ICONS: Record<string, React.ComponentType<{ size: number; color: string }>> = {
    Scale,
    Droplets,
    Moon,
    Footprints,
};

export default function LogMetricScreen() {
    const router = useRouter();
    const params = useLocalSearchParams<{ type: string }>();
    const { logMetric, metrics, currentDate } = useManTrack();
    const type = (params.type || 'water') as MetricType;
    const config = METRIC_CONFIG[type];

    const todayMetric = useMemo(() => {
        return metrics.find((m) => m.type === type && m.date === currentDate);
    }, [metrics, type, currentDate]);

    const [value, setValue] = useState<number>(todayMetric?.value ?? config?.defaultValue ?? 0);

    const IconComponent = METRIC_ICONS[config?.icon ?? 'Scale'] ?? Scale;

    const increment = useCallback(() => {
        if (!config) return;
        setValue((prev) => Math.min(prev + config.step, config.max));
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    }, [config]);

    const decrement = useCallback(() => {
        if (!config) return;
        setValue((prev) => Math.max(prev - config.step, config.min));
        if (Platform.OS !== 'web') {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
    }, [config]);

    const handleSave = useCallback(() => {
        if (!config) return;
        if (Platform.OS !== 'web') {
            Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        }
        logMetric({
            type,
            value,
            unit: config.unit,
            date: currentDate,
        });
        router.back();
    }, [type, value, config, logMetric, router]);

    if (!config) {
        return (
            <View style={styles.container}>
                <Stack.Screen options={{ title: 'Log Metric' }} />
                <Text style={styles.errorText}>Unknown metric type</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <Stack.Screen
                options={{
                    title: `Log ${config.label}`,
                    headerStyle: { backgroundColor: Colors.dark.background },
                    headerTintColor: Colors.dark.text,
                    headerTitleStyle: { fontWeight: '700' },
                    headerLeft: () => (
                        <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
                            <X size={22} color={Colors.dark.text} />
                        </TouchableOpacity>
                    ),
                    headerRight: () => (
                        <TouchableOpacity onPress={handleSave} style={styles.saveBtn}>
                            <Text style={styles.saveBtnText}>Save</Text>
                        </TouchableOpacity>
                    ),
                }}
            />

            <View style={styles.content}>
                <View style={[styles.iconContainer, { backgroundColor: config.color + '15' }]}>
                    <IconComponent size={40} color={config.color} />
                </View>

                <Text style={styles.dateText}>Today, {new Date(currentDate + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</Text>

                <View style={styles.valueContainer}>
                    <TouchableOpacity style={styles.adjustBtn} onPress={decrement} activeOpacity={0.6}>
                        <Minus size={24} color={Colors.dark.text} />
                    </TouchableOpacity>

                    <View style={styles.valueDisplay}>
                        <Text style={[styles.valueText, { color: config.color }]}>{value}</Text>
                        <Text style={styles.unitText}>{config.unit}</Text>
                    </View>

                    <TouchableOpacity style={styles.adjustBtn} onPress={increment} activeOpacity={0.6}>
                        <Plus size={24} color={Colors.dark.text} />
                    </TouchableOpacity>
                </View>

                <View style={styles.rangeInfo}>
                    <Text style={styles.rangeText}>Min: {config.min}</Text>
                    <Text style={styles.rangeText}>Step: {config.step}</Text>
                    <Text style={styles.rangeText}>Max: {config.max}</Text>
                </View>

                <TouchableOpacity style={[styles.bigSaveBtn, { backgroundColor: config.color }]} onPress={handleSave} activeOpacity={0.7}>
                    <Text style={styles.bigSaveBtnText}>Log {config.label}</Text>
                </TouchableOpacity>
            </View>
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
    saveBtnText: {
        fontSize: 14,
        fontWeight: '600' as const,
        color: Colors.dark.background,
    },
    content: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: 20,
        gap: 20,
    },
    iconContainer: {
        width: 80,
        height: 80,
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    dateText: {
        fontSize: 14,
        color: Colors.dark.textSecondary,
    },
    valueContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 24,
    },
    adjustBtn: {
        width: 56,
        height: 56,
        borderRadius: 16,
        backgroundColor: Colors.dark.surface,
        alignItems: 'center',
        justifyContent: 'center',
        borderWidth: 1,
        borderColor: Colors.dark.surfaceBorder,
    },
    valueDisplay: {
        alignItems: 'center',
        minWidth: 120,
    },
    valueText: {
        fontSize: 56,
        fontWeight: '800' as const,
        lineHeight: 64,
    },
    unitText: {
        fontSize: 14,
        color: Colors.dark.textSecondary,
        marginTop: 4,
    },
    rangeInfo: {
        flexDirection: 'row',
        gap: 20,
    },
    rangeText: {
        fontSize: 12,
        color: Colors.dark.textTertiary,
    },
    bigSaveBtn: {
        width: '100%',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 20,
    },
    bigSaveBtnText: {
        fontSize: 16,
        fontWeight: '700' as const,
        color: Colors.dark.background,
    },
    errorText: {
        fontSize: 16,
        color: Colors.dark.textSecondary,
        textAlign: 'center',
        marginTop: 100,
    },
});

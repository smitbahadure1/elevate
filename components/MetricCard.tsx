import React from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Scale, Droplets, Moon, Footprints, ArrowUpRight, ArrowDownRight, Minus } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { METRIC_CONFIG } from '@/constants/defaults';

const METRIC_ICONS: Record<string, React.ComponentType<{ size: number; color: string }>> = {
    Scale,
    Droplets,
    Moon,
    Footprints,
};

interface MetricCardProps {
    type: string;
    latestValue?: number;
    previousValue?: number;
    onPress?: () => void;
}

export default React.memo(function MetricCard({ type, latestValue, previousValue, onPress }: MetricCardProps) {
    const config = METRIC_CONFIG[type];
    if (!config) return null;

    const IconComponent = METRIC_ICONS[config.icon] ?? Scale;
    const hasData = latestValue !== undefined;
    const trend = hasData && previousValue !== undefined
        ? latestValue! > previousValue ? 'up' : latestValue! < previousValue ? 'down' : 'same'
        : 'same';

    return (
        <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
            <View style={[styles.iconContainer, { backgroundColor: config.color + '15' }]}>
                <IconComponent size={20} color={config.color} />
            </View>
            <Text style={styles.label}>{config.label}</Text>
            {hasData ? (
                <View style={styles.valueRow}>
                    <Text style={[styles.value, { color: config.color }]}>{latestValue}</Text>
                    <Text style={styles.unit}>{config.unit}</Text>
                </View>
            ) : (
                <Text style={styles.noData}>Tap to log</Text>
            )}
            {hasData && trend !== 'same' && (
                <View style={styles.trendRow}>
                    {trend === 'up' ? (
                        <ArrowUpRight size={12} color={Colors.dark.success} />
                    ) : (
                        <ArrowDownRight size={12} color={Colors.dark.error} />
                    )}
                </View>
            )}
        </TouchableOpacity>
    );
});

const styles = StyleSheet.create({
    card: {
        width: '48%',
        backgroundColor: Colors.dark.surface,
        borderRadius: 16,
        padding: 16,
        alignItems: 'center',
        gap: 8,
        borderWidth: 1,
        borderColor: Colors.dark.surfaceBorder,
    },
    iconContainer: {
        width: 40,
        height: 40,
        borderRadius: 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    label: {
        fontSize: 13,
        fontWeight: '600' as const,
        color: Colors.dark.textSecondary,
    },
    valueRow: {
        flexDirection: 'row',
        alignItems: 'baseline',
        gap: 4,
    },
    value: {
        fontSize: 22,
        fontWeight: '700' as const,
    },
    unit: {
        fontSize: 11,
        color: Colors.dark.textTertiary,
    },
    noData: {
        fontSize: 13,
        color: Colors.dark.textTertiary,
        fontStyle: 'italic',
    },
    trendRow: {
        flexDirection: 'row',
        alignItems: 'center',
    },
});

import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Text, Animated } from 'react-native';
import Colors from '@/constants/colors';
import { getLast7Days, formatDateShort, isToday } from '@/utils/date';

interface WeeklyChartProps {
  data: { date: string; value: number }[];
  maxValue?: number;
  color?: string;
  height?: number;
  label?: string;
  unit?: string;
}

export default function WeeklyChart({
  data,
  maxValue,
  color = Colors.dark.accent,
  height = 140,
  label,
  unit,
}: WeeklyChartProps) {
  const animValue = useRef(new Animated.Value(0)).current;
  const days = getLast7Days();
  const max = maxValue ?? Math.max(...data.map((d) => d.value), 1);

  useEffect(() => {
    Animated.timing(animValue, {
      toValue: 1,
      duration: 800,
      useNativeDriver: false,
    }).start();
  }, [animValue]);

  return (
    <View style={styles.container}>
      {label && (
        <View style={styles.header}>
          <Text style={styles.label}>{label}</Text>
          {unit && <Text style={styles.unit}>{unit}</Text>}
        </View>
      )}
      <View style={[styles.chartContainer, { height }]}>
        {days.map((date) => {
          const entry = data.find((d) => d.date === date);
          const value = entry?.value ?? 0;
          const barHeight = max > 0 ? (value / max) * (height - 30) : 0;
          const today = isToday(date);

          return (
            <View key={date} style={styles.barColumn}>
              <View style={styles.barWrapper}>
                <Animated.View
                  style={[
                    styles.bar,
                    {
                      height: animValue.interpolate({
                        inputRange: [0, 1],
                        outputRange: [0, Math.max(barHeight, 3)],
                      }),
                      backgroundColor: today ? color : color + '60',
                      borderRadius: 4,
                    },
                  ]}
                />
              </View>
              <Text style={[styles.dayLabel, today && { color: Colors.dark.text }]}>
                {formatDateShort(date).charAt(0)}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  label: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.dark.text,
  },
  unit: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
  },
  chartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    gap: 8,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
  },
  barWrapper: {
    flex: 1,
    justifyContent: 'flex-end',
    width: '100%',
    alignItems: 'center',
  },
  bar: {
    width: '70%',
    minWidth: 12,
    maxWidth: 32,
  },
  dayLabel: {
    fontSize: 11,
    color: Colors.dark.textTertiary,
    marginTop: 6,
    fontWeight: '500' as const,
  },
});

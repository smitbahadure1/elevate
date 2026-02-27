import React from 'react';
import { View, StyleSheet, Text } from 'react-native';
import Colors from '@/constants/colors';

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color?: string;
  subtitle?: string;
}

export default React.memo(function StatCard({ label, value, icon, color = Colors.dark.accent, subtitle }: StatCardProps) {
  return (
    <View style={styles.card} testID="stat-card">
      <View style={[styles.iconWrap, { backgroundColor: color + '15' }]}>
        {icon}
      </View>
      <Text style={[styles.value, { color }]}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    flex: 1,
    backgroundColor: Colors.dark.surface,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 6,
    borderWidth: 1,
    borderColor: Colors.dark.surfaceBorder,
  },
  iconWrap: {
    width: 36,
    height: 36,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: '700' as const,
  },
  label: {
    fontSize: 12,
    color: Colors.dark.textSecondary,
    fontWeight: '500' as const,
  },
  subtitle: {
    fontSize: 10,
    color: Colors.dark.textTertiary,
  },
});

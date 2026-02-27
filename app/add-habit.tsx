import React, { useState, useCallback } from 'react';
import { View, StyleSheet, Text, TouchableOpacity, TextInput, ScrollView, Platform } from 'react-native';
import { useRouter, Stack } from 'expo-router';
import * as Haptics from 'expo-haptics';
import { X, Sparkles, Dumbbell, Droplets, Moon, Brain, Scissors, BookOpen, Snowflake, CircleDot, Heart, Coffee, Pencil, Eye } from 'lucide-react-native';
import Colors from '@/constants/colors';
import { useManTrack } from '@/providers/ManTrackProvider';
import { HabitCategory } from '@/types';

const ICONS: { name: string; component: React.ComponentType<{ size: number; color: string }> }[] = [
  { name: 'Sparkles', component: Sparkles },
  { name: 'Dumbbell', component: Dumbbell },
  { name: 'Droplets', component: Droplets },
  { name: 'Moon', component: Moon },
  { name: 'Brain', component: Brain },
  { name: 'Scissors', component: Scissors },
  { name: 'BookOpen', component: BookOpen },
  { name: 'Snowflake', component: Snowflake },
  { name: 'Heart', component: Heart },
  { name: 'Coffee', component: Coffee },
  { name: 'Pencil', component: Pencil },
  { name: 'Eye', component: Eye },
];

const COLORS = [
  Colors.dark.accent,
  Colors.dark.blue,
  Colors.dark.success,
  Colors.dark.purple,
  Colors.dark.error,
  Colors.dark.warning,
  Colors.dark.teal,
];

const CATEGORIES: { key: HabitCategory; label: string }[] = [
  { key: 'grooming', label: 'Grooming' },
  { key: 'fitness', label: 'Fitness' },
  { key: 'wellness', label: 'Wellness' },
  { key: 'productivity', label: 'Productivity' },
];

export default function AddHabitScreen() {
  const router = useRouter();
  const { addHabit } = useManTrack();
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('Sparkles');
  const [selectedColor, setSelectedColor] = useState(Colors.dark.accent);
  const [selectedCategory, setSelectedCategory] = useState<HabitCategory>('wellness');

  const handleSave = useCallback(() => {
    if (!name.trim()) return;
    if (Platform.OS !== 'web') {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    }
    addHabit({
      name: name.trim(),
      icon: selectedIcon,
      color: selectedColor,
      category: selectedCategory,
    });
    router.back();
  }, [name, selectedIcon, selectedColor, selectedCategory, addHabit, router]);

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          title: 'New Habit',
          headerStyle: { backgroundColor: Colors.dark.background },
          headerTintColor: Colors.dark.text,
          headerTitleStyle: { fontWeight: '700' },
          headerLeft: () => (
            <TouchableOpacity onPress={() => router.back()} style={styles.closeBtn}>
              <X size={22} color={Colors.dark.text} />
            </TouchableOpacity>
          ),
          headerRight: () => (
            <TouchableOpacity
              onPress={handleSave}
              disabled={!name.trim()}
              style={[styles.saveBtn, !name.trim() && styles.saveBtnDisabled]}
            >
              <Text style={[styles.saveBtnText, !name.trim() && styles.saveBtnTextDisabled]}>Save</Text>
            </TouchableOpacity>
          ),
        }}
      />

      <ScrollView style={styles.scroll} contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Habit Name</Text>
        <TextInput
          style={styles.input}
          value={name}
          onChangeText={setName}
          placeholder="e.g. Morning jog"
          placeholderTextColor={Colors.dark.textTertiary}
          autoFocus
          testID="habit-name-input"
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryRow}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat.key}
              style={[styles.categoryChip, selectedCategory === cat.key && styles.categoryChipActive]}
              onPress={() => setSelectedCategory(cat.key)}
              activeOpacity={0.7}
            >
              <Text style={[styles.categoryText, selectedCategory === cat.key && styles.categoryTextActive]}>
                {cat.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Icon</Text>
        <View style={styles.iconGrid}>
          {ICONS.map((icon) => {
            const IconComp = icon.component;
            const isSelected = selectedIcon === icon.name;
            return (
              <TouchableOpacity
                key={icon.name}
                style={[styles.iconBtn, isSelected && { backgroundColor: selectedColor + '25', borderColor: selectedColor }]}
                onPress={() => setSelectedIcon(icon.name)}
                activeOpacity={0.7}
              >
                <IconComp size={22} color={isSelected ? selectedColor : Colors.dark.textSecondary} />
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Color</Text>
        <View style={styles.colorRow}>
          {COLORS.map((color) => (
            <TouchableOpacity
              key={color}
              style={[styles.colorBtn, { backgroundColor: color }, selectedColor === color && styles.colorBtnActive]}
              onPress={() => setSelectedColor(color)}
              activeOpacity={0.7}
            />
          ))}
        </View>

        <View style={styles.preview}>
          <View style={[styles.previewIcon, { backgroundColor: selectedColor + '20' }]}>
            {(() => {
              const Icon = ICONS.find((i) => i.name === selectedIcon)?.component ?? CircleDot;
              return <Icon size={28} color={selectedColor} />;
            })()}
          </View>
          <Text style={styles.previewName}>{name || 'Habit name'}</Text>
          <Text style={styles.previewCategory}>{CATEGORIES.find((c) => c.key === selectedCategory)?.label}</Text>
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
  saveBtn: {
    backgroundColor: Colors.dark.accent,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  saveBtnDisabled: {
    backgroundColor: Colors.dark.surfaceLight,
  },
  saveBtnText: {
    fontSize: 14,
    fontWeight: '600' as const,
    color: Colors.dark.background,
  },
  saveBtnTextDisabled: {
    color: Colors.dark.textTertiary,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 40,
  },
  label: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.dark.textSecondary,
    marginBottom: 10,
    textTransform: 'uppercase',
    letterSpacing: 0.8,
  },
  input: {
    backgroundColor: Colors.dark.surface,
    borderRadius: 14,
    padding: 16,
    fontSize: 16,
    color: Colors.dark.text,
    borderWidth: 1,
    borderColor: Colors.dark.surfaceBorder,
    marginBottom: 24,
  },
  categoryRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 24,
  },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    backgroundColor: Colors.dark.surfaceLight,
  },
  categoryChipActive: {
    backgroundColor: Colors.dark.accent,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '600' as const,
    color: Colors.dark.textSecondary,
  },
  categoryTextActive: {
    color: Colors.dark.background,
  },
  iconGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 24,
  },
  iconBtn: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: Colors.dark.surface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: Colors.dark.surfaceBorder,
  },
  colorRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 32,
  },
  colorBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
  },
  colorBtnActive: {
    borderWidth: 3,
    borderColor: Colors.dark.text,
  },
  preview: {
    alignItems: 'center',
    backgroundColor: Colors.dark.surface,
    borderRadius: 20,
    padding: 28,
    borderWidth: 1,
    borderColor: Colors.dark.surfaceBorder,
    gap: 8,
  },
  previewIcon: {
    width: 56,
    height: 56,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
  },
  previewName: {
    fontSize: 18,
    fontWeight: '700' as const,
    color: Colors.dark.text,
  },
  previewCategory: {
    fontSize: 13,
    color: Colors.dark.textSecondary,
  },
});

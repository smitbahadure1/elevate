import { Tabs } from 'expo-router';
import { LayoutDashboard, CheckSquare, ListChecks, BarChart3 } from 'lucide-react-native';
import React from 'react';
import { Platform, Pressable } from 'react-native';
import * as Haptics from 'expo-haptics';
import Colors from '@/constants/colors';

function HapticTab({ children, onPress, ...rest }: any) {
    return (
        <Pressable
            {...rest}
            onPress={(e) => {
                if (Platform.OS !== 'web') {
                    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
                }
                onPress?.(e);
            }}
        >
            {children}
        </Pressable>
    );
}

export default function TabLayout() {
    return (
        <Tabs
            screenOptions={{
                headerShown: false,
                tabBarActiveTintColor: Colors.dark.accent,
                tabBarInactiveTintColor: Colors.dark.tabBarInactive,
                tabBarButton: HapticTab,
                tabBarStyle: {
                    backgroundColor: Colors.dark.tabBar,
                    borderTopColor: Colors.dark.tabBarBorder,
                    borderTopWidth: 1,
                },
                tabBarLabelStyle: {
                    fontSize: 11,
                    fontWeight: '600',
                },
            }}
        >
            <Tabs.Screen
                name="(dashboard)"
                options={{
                    title: 'Dashboard',
                    tabBarIcon: ({ color, size }) => <LayoutDashboard size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="habits"
                options={{
                    title: 'Habits',
                    tabBarIcon: ({ color, size }) => <CheckSquare size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="routines"
                options={{
                    title: 'Routines',
                    tabBarIcon: ({ color, size }) => <ListChecks size={size} color={color} />,
                }}
            />
            <Tabs.Screen
                name="insights"
                options={{
                    title: 'Insights',
                    tabBarIcon: ({ color, size }) => <BarChart3 size={size} color={color} />,
                }}
            />
        </Tabs>
    );
}

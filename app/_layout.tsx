import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import React, { useEffect } from 'react';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import Colors from '@/constants/colors';
import { ManTrackProvider } from '@/providers/ManTrackProvider';
import { AuthProvider } from '@/providers/AuthProvider';

SplashScreen.preventAutoHideAsync();

const queryClient = new QueryClient();

function RootLayoutNav() {
    return (
        <Stack
            screenOptions={{
                headerBackTitle: 'Back',
                headerStyle: { backgroundColor: Colors.dark.background },
                headerTintColor: Colors.dark.text,
                contentStyle: { backgroundColor: Colors.dark.background },
            }}
        >
            <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
            <Stack.Screen name="(auth)" options={{ headerShown: false }} />
            <Stack.Screen name="add-habit" options={{ presentation: 'modal', headerShown: true }} />
            <Stack.Screen name="add-routine" options={{ presentation: 'modal', headerShown: true }} />
            <Stack.Screen name="log-metric" options={{ presentation: 'modal', headerShown: true }} />
            <Stack.Screen name="profile" options={{ presentation: 'modal', headerShown: true }} />
            <Stack.Screen name="admin" options={{ presentation: 'modal', headerShown: true, title: 'Admin Dashboard' }} />
        </Stack>
    );
}

export default function RootLayout() {
    useEffect(() => {
        SplashScreen.hideAsync();
    }, []);

    return (
        <QueryClientProvider client={queryClient}>
            <GestureHandlerRootView style={{ flex: 1 }}>
                <AuthProvider>
                    <ManTrackProvider>
                        <StatusBar style="light" />
                        <RootLayoutNav />
                    </ManTrackProvider>
                </AuthProvider>
            </GestureHandlerRootView>
        </QueryClientProvider>
    );
}

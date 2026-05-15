import { Stack } from 'expo-router';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import { SafeAreaProvider, initialWindowMetrics } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ErrorLogger } from '../components/ErrorLogger';
import { logger } from '../components/SimpleLogger';
import { useEffect } from 'react';
import { Platform } from 'react-native';

export default function RootLayout() {
  useEffect(() => {
    try {
      logger.log('info', 'App starting', { platform: Platform.OS });

      if (Platform.OS === 'android') {
        logger.log('info', 'Setting up Android-specific error handling');

        // Add global error handler for Android
        const originalConsoleError = console.error;
        console.error = (...args) => {
          logger.log('error', 'Console error caught', { args: args.join(' ') });
          originalConsoleError(...args);
        };
      }
    } catch (error) {
      console.error('Error in RootLayout useEffect:', error);
    }
  }, []);
  return (
    <SafeAreaProvider initialMetrics={initialWindowMetrics}>
      {/* translucent status bar so we can manually inset content underneath
          the status bar / notch / Dynamic Island via useSafeAreaInsets() */}
      <StatusBar style="light" translucent backgroundColor="transparent" />
      <ErrorLogger>
        <LanguageProvider>
          <AuthProvider>
            <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#64a8d1' } }}>
              <Stack.Screen name="index" />
              <Stack.Screen name="(tabs)" />
              <Stack.Screen name="auth/login" />
              <Stack.Screen name="auth/register" />
              <Stack.Screen name="auth/reset-password" />
              <Stack.Screen name="auth/choose-account" />
              <Stack.Screen name="cancel-lesson" />
              <Stack.Screen name="class-lessons" />
            </Stack>
          </AuthProvider>
        </LanguageProvider>
      </ErrorLogger>
    </SafeAreaProvider>
  );
}

import React, { useEffect, useState } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { router } from 'expo-router';
import { localStorage } from '@/app/lib/localStorage';
import { logger } from '@/components/SimpleLogger';

export default function IndexScreen() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      logger.log('info', 'Starting auth check', { platform: Platform.OS });
      
      const user = await localStorage.getUser();
      logger.log('info', 'Auth check result', { hasUser: !!user });
      
      if (user) {
        logger.log('info', 'Navigating to tabs');
        router.replace('/(tabs)');
      } else {
        logger.log('info', 'Navigating to login');
        router.replace('/auth/login');
      }
    } catch (error) {
      logger.log('error', 'Auth check error', { error: error.toString() });
      console.error('Auth check error:', error);
      router.replace('/auth/login');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color="#64a8d1" />
      </View>
    );
  }

  return null;
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
});
import React from 'react';
import { View, Text, ActivityIndicator, StyleSheet } from 'react-native';
import { useLanguage } from '@/app/contexts/LanguageContext';

const LoadingScreen: React.FC = () => {
  const { t } = useLanguage();
  
  return (
    <View style={styles.container}>
      <ActivityIndicator size="large" color="#64a8d1" style={styles.spinner} />
      <Text style={styles.text}>{t('dataLoading')}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  spinner: {
    marginBottom: 20,
  },
  text: {
    fontSize: 16,
    color: '#333',
    fontWeight: '500',
  },
});

export default LoadingScreen;
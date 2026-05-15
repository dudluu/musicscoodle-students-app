import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, Linking, TouchableOpacity } from 'react-native';

import Header from '@/components/Header';
import Footer from '@/components/Footer';
import UpcomingLessons from '@/components/UpcomingLessons';
import PastLessons from '@/components/PastLessons';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const HomeScreen: React.FC = () => {
  const { t } = useLanguage();
  const { user, wixData, loading, chosenIndex } = useAuth();
  const [showPastLessons, setShowPastLessons] = useState(false);

  const getFullName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    
    const selectedOption = wixData?.options?.[chosenIndex] || wixData?.options?.[0];
    const studentData = selectedOption?.studentData;
    if (studentData?.vorname && studentData?.nachname) {
      return `${studentData.vorname} ${studentData.nachname}`;
    }
    
    return user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  };

  const renderTextWithLinks = (text: string) => {
    if (!text) return null;
    
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return (
      <Text style={styles.sectionContent}>
        {parts.map((part, index) => {
          if (part.match(urlRegex)) {
            return (
              <Text
                key={index}
                style={styles.linkText}
                onPress={() => Linking.openURL(part)}
              >
                {part}
              </Text>
            );
          }
          return <Text key={index}>{part}</Text>;
        })}
      </Text>
    );
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <Text>{t('loading')}</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>

        <View style={styles.welcomeCard}>
          <Text style={styles.welcomeText}>
            {t('welcome')}{'\n'}{getFullName()}!
          </Text>
        </View>
        
        <View style={styles.sectionCard}>
          <Text style={styles.sectionTitle}>{t('homeTraining')}</Text>
          {(() => {
            const selectedOption = wixData?.options?.[chosenIndex] || wixData?.options?.[0];
            const nextAufgaben = selectedOption?.lessonsData?.nextAufgaben;
            const displayText = nextAufgaben === 'Keine Aufgaben vermerkt' 
              ? t('noTrainingAssigned')
              : nextAufgaben || t('noTrainingAssigned');
            
            return renderTextWithLinks(displayText);
          })()}
        </View>

        
        <View style={styles.sectionCard}>
          <View style={styles.switchContainer}>
            <TouchableOpacity 
              style={[styles.switchButton, !showPastLessons && styles.switchButtonActive]}
              onPress={() => setShowPastLessons(false)}
            >
              <Text style={[styles.switchButtonText, !showPastLessons && styles.switchButtonTextActive]}>
                {t('upcomingLessons')}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity 
              style={[styles.switchButton, showPastLessons && styles.switchButtonActive]}
              onPress={() => setShowPastLessons(true)}
            >
              <Text style={[styles.switchButtonText, showPastLessons && styles.switchButtonTextActive]}>
                {t('pastLessons')}
              </Text>
            </TouchableOpacity>
          </View>
          
          {showPastLessons ? <PastLessons /> : <UpcomingLessons />}
        </View>
      </ScrollView>
      <Footer />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  welcomeCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  welcomeText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  sectionCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  sectionContent: {
    fontSize: 16,
    color: '#666',
    lineHeight: 22,
  },
  linkText: {
    fontSize: 16,
    color: '#007AFF',
    textDecorationLine: 'underline',
    lineHeight: 22,
  },
  switchContainer: {
    flexDirection: 'row',
    marginBottom: 15,
    borderRadius: 8,
    backgroundColor: '#f0f0f0',
    padding: 4,
  },
  switchButton: {
    flex: 1,
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 6,
    alignItems: 'center',
  },
  switchButtonActive: {
    backgroundColor: '#64a8d1',
  },

  switchButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
  },
  switchButtonTextActive: {
    color: 'white',
  },
});

export default HomeScreen;

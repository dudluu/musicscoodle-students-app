import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export default function TeacherInfoScreen() {
  const { t, language } = useLanguage();
  const { wixData, loading, chosenIndex, user } = useAuth();

  const handleCall = (phoneNumber: string) => {
    Linking.openURL(`tel:${phoneNumber}`);
  };

  const handleEmail = (email: string) => {
    const userFullName = user?.user_metadata?.full_name || user?.email || 'User';
    const subject = `Email from ${userFullName}`;
    const encodedSubject = encodeURIComponent(subject);
    Linking.openURL(`mailto:${email}?subject=${encodedSubject}`);
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

  const selectedOption = wixData?.options?.[chosenIndex] || wixData?.options?.[0];
  const teacherData = selectedOption?.teacherData; // Use teacherData from chosenIndex

  if (!teacherData) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.content}>
          <Text style={styles.title}>{t('teacherInfo')}</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>{t('teacherInfoNotAvailable') || 'Teacher information not available'}</Text>
          </View>
        </View>
      </View>
    );
  }

  const teacherName = teacherData.vorname && teacherData.nachname 
    ? `${teacherData.vorname} ${teacherData.nachname}` 
    : teacherData.vorname || teacherData.nachname || 'Teacher';

  const teacherAddress = teacherData.adresse ? 
    `${teacherData.adresse}\n${teacherData.plz || ''} ${teacherData.ort || ''}`.trim() :
    '';

  return (
    <View style={styles.container}>
      <Header />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>

        <Text style={styles.title}>{t('teacherInfo')}</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.iconRow}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.leftIcon} />
            <View style={styles.textContainer}>
              <Text style={styles.infoTitle}>{t('teacherName')}:</Text>
              <Text style={styles.infoText}>
                {teacherName !== 'Teacher' ? teacherName : 'Not available'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.iconRow}>
            <TouchableOpacity 
              onPress={() => teacherData.teacherEmail && handleEmail(teacherData.teacherEmail)}
              disabled={!teacherData.teacherEmail}
            >
              <Ionicons name="mail" size={20} color="#666" style={styles.leftIcon} />
            </TouchableOpacity>
            <View style={styles.textContainer}>
              <Text style={styles.infoTitle}>Email:</Text>
              <Text style={styles.infoText}>
                {teacherData.teacherEmail || 'Not available'}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.iconRow}>
            <TouchableOpacity 
              onPress={() => teacherData.teacherPhone && handleCall(teacherData.teacherPhone)}
              disabled={!teacherData.teacherPhone}
            >
              <Ionicons name="call" size={20} color="#666" style={styles.leftIcon} />
            </TouchableOpacity>
            <View style={styles.textContainer}>
              <Text style={styles.infoTitle}>{t('phone')}:</Text>
              <Text style={styles.infoText}>
                {teacherData.teacherPhone === '---' ? 
                  (language === 'de' ? 'nicht verfügbar' : 'not available') : 
                  (teacherData.teacherPhone || (language === 'de' ? 'nicht verfügbar' : 'not available'))
                }
              </Text>
            </View>
          </View>
        </View>

        {teacherAddress && (
          <View style={styles.infoCard}>
            <View style={styles.iconRow}>
              <Ionicons name="home-outline" size={20} color="#666" style={styles.leftIcon} />
              <View style={styles.textContainer}>
                <Text style={styles.infoTitle}>{t('address')}:</Text>
                <Text style={styles.infoText}>{teacherAddress}</Text>
              </View>
            </View>
          </View>
        )}

        {teacherData.fach && (
          <View style={styles.infoCard}>
            <View style={styles.iconRow}>
              <Ionicons name="school-outline" size={20} color="#666" style={styles.leftIcon} />
              <View style={styles.textContainer}>
                <Text style={styles.infoTitle}>{t('subject')}:</Text>
                <Text style={styles.infoText}>{teacherData.fach}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
      <Footer />
    </View>
  );
}

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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  infoCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  infoTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  infoText: {
    fontSize: 16,
    color: '#666',
  },
  iconRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  leftIcon: {
    marginRight: 15,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
});
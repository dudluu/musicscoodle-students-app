import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Constants from 'expo-constants';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import ChangePasswordModal from '@/components/ChangePasswordModal';
import LanguageSelector from '@/components/LanguageSelector';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

const APP_VERSION =
  (Constants.expoConfig as any)?.version ||
  (Constants.manifest as any)?.version ||
  '';



export default function ProfileScreen() {
  const { t, language } = useLanguage();
  const { user, wixData, loading, chosenIndex, setChosenIndex, logout } = useAuth();
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  const handleLogout = async () => {
    try {
      console.log('Profile logout button clicked');
      await logout();
    } catch (error) {
      console.error('Error during logout:', error);
      Alert.alert('Error', 'Failed to log out');
    }
  };

  const handleDeleteAccount = async () => {
    try {
      await Linking.openURL('https://www.musicscoodle.com/deletestudentappaccount');
    } catch (error) {
      console.error('Error opening delete account URL:', error);
      Alert.alert('Error', 'Could not open the delete account page');
    }
  };

  const handleChooseDifferentAccount = () => {
    if (wixData?.options) {
      router.push({
        pathname: '/auth/choose-account',
        params: {
          options: JSON.stringify(wixData.options)
        }
      });
    }
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
  const studentData = selectedOption?.studentData;
  const teacherData = selectedOption?.teacherData;
  const hasMultipleAccounts = wixData?.options && wixData.options.length > 1;
  
  const studentAddress = studentData?.adresse ? 
    `${studentData.adresse}\n${studentData.plz || ''} ${studentData.ort || ''}`.trim() :
    '';
  const fullName = studentData?.vorname && studentData?.nachname 
    ? `${studentData.vorname} ${studentData.nachname}` 
    : (studentData?.vorname || studentData?.nachname || 'Not available');

  return (
    <View style={styles.container}>
      <Header />
      
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>

        <Text style={styles.title}>{t('profile')}</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.iconRow}>
            <Ionicons name="person-outline" size={20} color="#666" style={styles.leftIcon} />
            <View style={styles.textContainer}>
              <Text style={styles.infoTitle}>{t('name') || 'Name'}:</Text>
              <Text style={styles.infoText}>{fullName}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.iconRow}>
            <Ionicons name="mail-outline" size={20} color="#666" style={styles.leftIcon} />
            <View style={styles.textContainer}>
              <Text style={styles.infoTitle}>Email:</Text>
              <Text style={styles.infoText}>{studentData?.email || t('notAvailable')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.iconRow}>
            <Ionicons name="call-outline" size={20} color="#666" style={styles.leftIcon} />
            <View style={styles.textContainer}>
              <Text style={styles.infoTitle}>{t('phone')}:</Text>
              <Text style={styles.infoText}>{studentData?.tel || t('notAvailable')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.iconRow}>
            <Ionicons name="home-outline" size={20} color="#666" style={styles.leftIcon} />
            <View style={styles.textContainer}>
              <Text style={styles.infoTitle}>{t('address')}:</Text>
              <Text style={styles.infoText}>{studentAddress || t('notAvailable')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.iconRow}>
            <Ionicons name="globe-outline" size={20} color="#666" style={styles.leftIcon} />
            <View style={styles.textContainer}>
              <Text style={styles.infoTitle}>{t('language')}:</Text>
              <LanguageSelector />
            </View>
          </View>
        </View>

        <TouchableOpacity 
          style={styles.actionButton}
          onPress={() => setShowPasswordModal(true)}
        >
          <Ionicons name="key-outline" size={20} color="white" />
          <Text style={styles.buttonText}>{t('changePassword')}</Text>
        </TouchableOpacity>

        {(teacherData?.abo === 0 || teacherData?.abo === 2) && (
          <View style={styles.advisoryCard}>
            <Text style={styles.advisoryText}>
              {language === 'de' 
                ? 'Warum fehlen die Angaben zum Ort der Lektion und zur Schule? Deine Lehrperson hat ein MusicScoodle-Abo, das diese Informationen nicht erfasst.'
                : 'Why are the details about the lesson location and the school missing? Your teacher has a MusicScoodle subscription that doesn\'t capture this information.'
              }
            </Text>
          </View>
        )}

        {hasMultipleAccounts && (
          <>
            <View style={styles.advisoryCard}>
              <Text style={styles.advisoryText}>
                {language === 'de' 
                  ? `Deine Lehrperson hat mehrere Einträge mit der Email ${user?.email}\nerstellt. Klicke auf "Wähle anderen Eintrag" wenn Du einen anderen Datensatz laden willst`
                  : `Your teacher has made several entries with the email ${user?.email}.\nClick the button "Choose different account" if you want to choose another set of data`
                }
              </Text>
            </View>
            <TouchableOpacity 
              style={[styles.actionButton, styles.secondaryButton]}
              onPress={handleChooseDifferentAccount}
            >
              <Ionicons name="swap-horizontal-outline" size={20} color="#64a8d1" />
              <Text style={[styles.buttonText, styles.secondaryButtonText]}>
                {language === 'de' ? 'Wähle anderen Eintrag' : 'Choose different account'}
              </Text>
            </TouchableOpacity>
          </>
        )}

        <TouchableOpacity 
          style={[styles.actionButton, styles.logoutButton]}
          onPress={handleLogout}
        >
          <Ionicons name="log-out-outline" size={20} color="white" />
          <Text style={styles.buttonText}>{t('logout')}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={styles.deleteAccountLink}
          onPress={handleDeleteAccount}
        >
          <Text style={styles.deleteAccountText}>{t('deleteAccount')}</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>version {APP_VERSION}</Text>
      </ScrollView>
      <Footer />

      <ChangePasswordModal 
        visible={showPasswordModal}
        onClose={() => setShowPasswordModal(false)}
      />
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
  actionButton: {
    backgroundColor: '#64a8d1',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  secondaryButton: {
    backgroundColor: 'white',
    borderWidth: 2,
    borderColor: '#64a8d1',
  },
  logoutButton: {
    backgroundColor: '#dc3545',
  },
  buttonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  secondaryButtonText: {
    color: '#64a8d1',
  },
  advisoryCard: {
    backgroundColor: '#e3f2fd',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    borderLeftWidth: 4,
    borderLeftColor: '#64a8d1',
  },
  advisoryText: {
    fontSize: 14,
    color: '#1976d2',
    lineHeight: 20,
  },
  deleteAccountLink: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  deleteAccountText: {
    fontSize: 14,
    color: '#dc3545',
    textDecorationLine: 'underline',
  },
  versionText: {
    fontSize: 12,
    color: '#999',
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
});

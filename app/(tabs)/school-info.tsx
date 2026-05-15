import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export default function SchoolInfoScreen() {
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

  const handleWebsite = (website: string) => {
    const url = website.startsWith('http') ? website : `https://${website}`;
    Linking.openURL(url);
  };

  const handleMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    Linking.openURL(`https://maps.google.com/?q=${encodedAddress}`);
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
  const agData = selectedOption?.agData; // Use agData from chosenIndex

  if (!agData) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.content}>
          <Text style={styles.title}>{t('schoolInfo')}</Text>
          <View style={styles.infoCard}>
            <Text style={styles.infoText}>{t('notAvailable')}</Text>
          </View>
        </View>
      </View>
    );
  }

  const schoolAddress = agData.adresse ? 
    `${agData.adresse}\n${agData.plz || ''} ${agData.ort || ''}`.trim() :
    '';
  const fullAddress = agData.adresse ? 
    `${agData.adresse} ${agData.plz || ''} ${agData.ort || ''}`.trim() :
    '';

  return (
    <View style={styles.container}>
      <Header />
      
      <ScrollView style={styles.content} contentContainerStyle={{ paddingBottom: 30 }} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>

        <Text style={styles.title}>{t('schoolInfo')}</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.iconRow}>
            <Ionicons name="home-outline" size={20} color="#666" style={styles.leftIcon} />
            <View style={styles.textContainer}>
              <Text style={styles.infoTitle}>{t('schoolName')}:</Text>
              <Text style={styles.infoText}>
                {agData.name || t('notAvailable')}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.iconRow}>
            <TouchableOpacity 
              onPress={() => fullAddress && handleMaps(fullAddress)}
              disabled={!fullAddress}
            >
              <Ionicons name="map" size={20} color="#666" style={styles.leftIcon} />
            </TouchableOpacity>
            <View style={styles.textContainer}>
              <Text style={styles.infoTitle}>{t('address')}:</Text>
              <Text style={styles.infoText}>
                {(() => {
                  if (!schoolAddress || schoolAddress.trim() === '') {
                    return language === 'de' ? 'nicht verfügbar' : 'not available';
                  }
                  // Check if address contains only "---" values
                  const addressParts = schoolAddress.split('\n');
                  const hasOnlyDashes = addressParts.every(part => 
                    part.trim() === '---' || part.trim() === '' || part.trim() === '--- ---'
                  );
                  
                  if (hasOnlyDashes) {
                    return language === 'de' ? 'nicht verfügbar' : 'not available';
                  }
                  
                  return schoolAddress.replace(/---/g, language === 'de' ? 'nicht verfügbar' : 'not available');
                })()}
              </Text>
            </View>
            </View>
          </View>

        <View style={styles.infoCard}>
          <View style={styles.iconRow}>
            <TouchableOpacity 
              onPress={() => agData.emailAllg && handleEmail(agData.emailAllg)}
              disabled={!agData.emailAllg}
            >
              <Ionicons name="mail" size={20} color="#666" style={styles.leftIcon} />
            </TouchableOpacity>
            <View style={styles.textContainer}>
              <Text style={styles.infoTitle}>Email:</Text>
              <Text style={styles.infoText}>
                {agData.emailAllg || t('notAvailable')}
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.iconRow}>
            <TouchableOpacity 
              onPress={() => agData.telAllg && handleCall(agData.telAllg)}
              disabled={!agData.telAllg}
            >
              <Ionicons name="call" size={20} color="#666" style={styles.leftIcon} />
            </TouchableOpacity>
            <View style={styles.textContainer}>
              <Text style={styles.infoTitle}>{t('phone')}:</Text>
              <Text style={styles.infoText}>
                {agData.telAllg || t('notAvailable')}
              </Text>
            </View>
          </View>
        </View>

        {agData.website && (
          <View style={styles.infoCard}>
            <View style={styles.iconRow}>
              <TouchableOpacity onPress={() => handleWebsite(agData.website)}>
                <Ionicons name="globe" size={20} color="#666" style={styles.leftIcon} />
              </TouchableOpacity>
              <View style={styles.textContainer}>
                <Text style={styles.infoTitle}>{t('website')}:</Text>
                <Text style={styles.infoText}>{agData.website}</Text>
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
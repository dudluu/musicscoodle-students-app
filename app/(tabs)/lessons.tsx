import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, TouchableOpacity, ActivityIndicator, Linking } from 'react-native';
import { StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import { supabase } from '../lib/supabase';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { router } from 'expo-router';

export default function LessonsScreen() {
  const { user, selectedAccount, wixData, chosenIndex } = useAuth();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    console.log('LESSONS PAGE LOAD:');
    console.log('- selectedAccount:', selectedAccount);
    console.log('- wixData:', wixData);
    console.log('- chosenIndex:', chosenIndex);
    console.log('- user:', user);
    setLoading(false);
  }, [selectedAccount, wixData, chosenIndex, user]);

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    
    const [hours, minutes] = timeString.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) return timeString;
    
    if (language === 'en') {
      const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      return `${hour12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    } else {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} h`;
    }
  };

  const formatDateString = (dateStr: string) => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      const parts = dateStr.split(/[-\/\.]/);
      if (parts.length === 3) {
        const [y, m, d] = parts;
        if (language === 'de') {
          return `${d.padStart(2, '0')}/${m.padStart(2, '0')}/${y}`;
        } else {
          return `${m.padStart(2, '0')}/${d.padStart(2, '0')}/${y}`;
        }
      }
      return dateStr;
    }
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    if (language === 'de') {
      return `${day}/${month}/${year}`;
    } else {
      return `${month}/${day}/${year}`;
    }
  };


  const openMaps = (address: string) => {
    const url = `https://maps.google.com/?q=${encodeURIComponent(address)}`;
    Linking.openURL(url);
  };

  const handleCancelLesson = () => {
    const selectedOption = wixData?.options?.[chosenIndex] || wixData?.options?.[0];
    const studentData = selectedOption?.studentData;
    
    if (!studentData) {
      return;
    }

    const lessonData = {
      studentId: studentData._id,
      date: new Date().toLocaleDateString(),
      time: `${formatTime(studentData.unterrichtsAnfang?.toString() || '00:00')} - ${formatTime(studentData.unterrichtsEnde?.toString() || '00:00')}`,
      day: studentData.unterrichtsTag,
      duration: studentData.lektionsdauer,
      type: studentData.lektionsart
    };

    router.push({
      pathname: '/cancel-lesson',
      params: {
        date: lessonData.date,
        time: lessonData.time,
        title: `${studentData.unterrichtsTag} Lesson`,
        lessonData: JSON.stringify(lessonData)
      }
    });
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#64a8d1" />
        </View>
      </View>
    );
  }

  const selectedOption = wixData?.options?.[chosenIndex] || wixData?.options?.[0];
  const lessonsData = selectedOption?.lessonsData; // Use lessonsData from chosenIndex
  const classesData = selectedOption?.classesData || [];
  const studentData = selectedOption?.studentData;
  const teacherData = selectedOption?.teacherData;
  const uoData = selectedOption?.uoData;

  const studentName = selectedOption?.name || 'Student';
  
  // Check if teacher has limited subscription
  const hasLimitedSubscription = teacherData?.abo === 0 || teacherData?.abo === 2;
  
  // Helper function to translate weekdays to English
  const translateWeekday = (weekday: string) => {
    if (language === 'en') {
      const weekdayMap: { [key: string]: string } = {
        'Montag': 'Monday',
        'Dienstag': 'Tuesday', 
        'Mittwoch': 'Wednesday',
        'Donnerstag': 'Thursday',
        'Freitag': 'Friday',
        'Samstag': 'Saturday',
        'Sonntag': 'Sunday'
      };
      return weekdayMap[weekday] || weekday;
    }
    return weekday;
  };

  // Handle lesson time with proper fallbacks
  const lessonTime = (() => {
    if (!studentData?.unterrichtsTag || studentData.unterrichtsTag.trim() === '') {
      return language === 'de' ? 'Keine Lektionszeit verfügbar' : 'No lesson time available';
    }
    const translatedWeekday = translateWeekday(studentData.unterrichtsTag);
    return `${translatedWeekday} ${language === 'de' ? 'von' : 'from'} ${formatTime(studentData.unterrichtsAnfang?.toString() || '00:00')} ${language === 'de' ? 'bis' : 'until'} ${formatTime(studentData.unterrichtsEnde?.toString() || '00:00')}`;
  })();

  const lessonLocation = (() => {
    if (studentData?.lektionsart === 'ensembles') {
      return language === 'de' ? 'Siehe Klassen' : 'See classes';
    }
    return uoData ? `${uoData.gebaeude}, ${uoData.zimmer}` : 'Not specified';
  })();

  const locationAddress = (() => {
    if (!uoData?.adresse) {
      return language === 'de' ? 'Keine Informationen verfügbar - siehe Klassen' : 'No information available - see Classes';
    }
    return `${uoData.adresse}\n${uoData.plz} ${uoData.ort}`;
  })();
  const classNames = classesData.map(cls => cls.ensembleName).join(', ');

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 30 }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >

        <Text style={styles.title}>{language === 'de' ? 'Lektionsinfos' : 'Lesson Info'}</Text>
        
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color="#666" style={styles.icon} />
            <View style={styles.textContainer}>
              <Text style={styles.infoTitle}>{language === 'de' ? 'Lektionszeit' : 'Lesson Time'}</Text>
              <Text style={styles.infoText}>{lessonTime}</Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={20} color="#666" style={styles.icon} />
            <View style={styles.textContainer}>
              <Text style={styles.infoTitle}>{language === 'de' ? 'Lektionsdauer' : 'Lesson Length'}</Text>
              <Text style={styles.infoText}>
                {!studentData?.lektionsdauer ? 
                  (language === 'de' ? 'Keine Lektionsdauer verfügbar' : 'No lesson length available') :
                  `${studentData.lektionsdauer} min.`
                }
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Ionicons name="calendar-outline" size={20} color="#666" style={styles.icon} />
            <View style={styles.textContainer}>
              <Text style={styles.infoTitle}>{language === 'de' ? 'Lektionskadenz' : 'Lesson Cadence'}</Text>
              <Text style={styles.infoText}>
                 {!studentData?.lektionskadenz || studentData.lektionskadenz === '' || studentData.lektionskadenz === null || studentData.lektionskadenz === undefined ? 
                  (language === 'de' ? 'Keine Information verfügbar' : 'No information available') :
                  (studentData.lektionskadenz === 'week' ? (language === 'de' ? 'Wöchentlich' : 'Weekly') : 
                   studentData.lektionskadenz === 'fortnight' ? (language === 'de' ? '14-täglich' : 'Every 2 weeks') : 
                   studentData.lektionskadenz === 'abo' ? (language === 'de' ? 'im Abo' : 'Lesson Package') :
                   studentData.lektionskadenz)
                }
              </Text>
            </View>
          </View>
        </View>

        {studentData?.lektionskadenz === 'abo' && (
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="albums-outline" size={20} color="#666" style={styles.icon} />
              <View style={styles.textContainer}>
                <Text style={styles.infoTitle}>{language === 'de' ? 'Abos' : 'Packages'}</Text>
                
                {/* Current Package */}
                <View style={styles.aboSection}>
                  <Text style={styles.aboSectionTitle}>
                    {language === 'de' ? 'Laufendes Abo:' : 'Current Package:'}
                  </Text>
                  {!studentData?.aboData?.validAbos || studentData.aboData.validAbos.length === 0 ? (
                    <Text style={styles.infoText}>
                      {language === 'de' 
                        ? 'Du hast kein gültiges Abo' 
                        : 'You dont have a valid lesson package'}
                    </Text>
                  ) : (
                    <Text style={styles.infoText}>
                      {language === 'de'
                        ? `Gültig vom ${formatDateString(studentData.aboData.validAbos[0].aboStartDate)} bis ${formatDateString(studentData.aboData.validAbos[0].aboEndDate)}\nBezogene Lektionen: ${studentData.aboData.validAbos[0].aboUsed}/${studentData.aboData.validAbos[0].aboAnz}`
                        : `Valid from ${formatDateString(studentData.aboData.validAbos[0].aboStartDate)} to ${formatDateString(studentData.aboData.validAbos[0].aboEndDate)}\nUsed Lessons: ${studentData.aboData.validAbos[0].aboUsed}/${studentData.aboData.validAbos[0].aboAnz}`
                      }

                    </Text>
                  )}
                </View>

                {/* Past Packages */}
                {studentData?.aboData?.terminatedAbos && studentData.aboData.terminatedAbos.length > 0 && (
                  <View style={styles.aboSection}>
                    <Text style={styles.aboSectionTitle}>
                      {language === 'de' ? 'Vergangene Abos:' : 'Past Packages:'}
                    </Text>
                    {studentData.aboData.terminatedAbos.map((abo: any, aboIndex: number) => (
                      <Text key={aboIndex} style={[styles.infoText, styles.aboItem]}>
                        {language === 'de'
                          ? `Gültig vom ${formatDateString(abo.aboStartDate)} bis ${formatDateString(abo.aboEndDate)}\nBezogene Lektionen: ${abo.aboUsed}/${abo.aboAnz}`
                          : `Valid from ${formatDateString(abo.aboStartDate)} to ${formatDateString(abo.aboEndDate)}\nUsed Lessons: ${abo.aboUsed}/${abo.aboAnz}`
                        }

                      </Text>
                    ))}
                  </View>
                )}
              </View>
            </View>
          </View>
        )}



        {!hasLimitedSubscription && (
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="location-outline" size={20} color="#666" style={styles.icon} />
              <View style={styles.textContainer}>
                <Text style={styles.infoTitle}>{language === 'de' ? 'Ort der Lektion' : 'Lesson Location'}</Text>
                <Text style={styles.infoText}>{lessonLocation}</Text>
              </View>
            </View>
          </View>
        )}

        {!hasLimitedSubscription && (
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <TouchableOpacity 
                style={styles.mapsButton}
                onPress={() => openMaps(locationAddress.replace('\n', ' '))}
              >
                <Ionicons name="map" size={20} color="#666" style={styles.icon} />
              </TouchableOpacity>
              <View style={styles.textContainer}>
                <Text style={styles.infoTitle}>{language === 'de' ? 'Ort der Lektion Adresse' : 'Location Address'}</Text>
                <Text style={styles.infoText}>{locationAddress}</Text>
              </View>
            </View>
          </View>
        )}
        {classesData.length > 0 && (
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="people-outline" size={20} color="#666" style={styles.icon} />
              <View style={styles.flex1}>
                <Text style={styles.infoTitle}>{language === 'de' ? 'Meine Klassen' : 'My Classes'}</Text>
                <Text style={styles.infoSubtext}>{classNames}</Text>
                <TouchableOpacity 
                  style={styles.viewClassesButton}
                  onPress={() => router.push('/class-info')}
                >
                  <Text style={styles.viewClassesButtonText}>{language === 'de' ? 'Klassen anzeigen' : 'View Classes'}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        <TouchableOpacity 
          style={styles.availabilitiesButton}
          onPress={() => router.push('/(tabs)/availabilities')}
        >
          <Text style={styles.buttonText}>{language === 'de' ? 'Deine Verfügbarkeiten anzeigen' : 'View your availabilities'}</Text>
        </TouchableOpacity>
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
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  icon: {
    marginRight: 15,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
    justifyContent: 'flex-start',
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
    flex: 1,
  },
  infoSubtext: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  flex1: {
    flex: 1,
  },
  viewClassesButton: {
    backgroundColor: '#64a8d1',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  viewClassesButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  mapsButton: {
    padding: 0,
    marginRight: 15,
    marginTop: 2,
  },
  availabilitiesButton: {
    backgroundColor: '#64a8d1',
    padding: 15,
    borderRadius: 10,
    marginTop: 10,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  debugCard: {
    backgroundColor: '#ffeb3b',
    padding: 10,
    borderRadius: 5,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#fbc02d',
  },
  debugText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  aboSection: {
    marginTop: 8,
    marginBottom: 8,
  },
  aboSectionTitle: {
    fontSize: 15,
    fontWeight: '600',
    color: '#444',
    marginBottom: 4,
  },
  aboItem: {
    marginBottom: 6,
  },
});
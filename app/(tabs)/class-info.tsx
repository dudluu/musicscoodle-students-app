import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Header from '@/components/Header';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export default function ClassInfoScreen() {
  const { t, language } = useLanguage();
  const { wixData, loading, chosenIndex } = useAuth();

  const handleMaps = (address: string) => {
    const encodedAddress = encodeURIComponent(address);
    Linking.openURL(`https://maps.google.com/?q=${encodedAddress}`);
  };

  const handleClassLessons = (classIndex: number) => {
    router.push({
      pathname: '/class-lessons',
      params: { classIndex: classIndex.toString() }
    });
  };

  const formatTime = (timeValue: string) => {
    if (!timeValue || typeof timeValue !== 'string') return '';
    
    if (!timeValue.includes(':')) return timeValue;
    
    const parts = timeValue.split(':');
    if (parts.length !== 2) return timeValue;
    
    const hours = parseInt(parts[0], 10);
    const minutes = parseInt(parts[1], 10);
    
    if (isNaN(hours) || isNaN(minutes)) return timeValue;
    
    if (language === 'en') {
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    } else {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} h`;
    }
  };

  const getCadenceText = (cadence: string) => {
    if (cadence === 'week') {
      return language === 'de' ? 'Wöchentlich' : 'Weekly';
    } else if (cadence === 'fortnight') {
      return language === 'de' ? '14-täglich' : 'Every 2 weeks';
    } else if (cadence === 'abo') {
      return language === 'de' ? 'im Abo' : 'Lesson Package';
    }
    return cadence;
  };

  const formatDateString = (dateStr: string) => {
    if (!dateStr) return '';
    // Try to parse the date string
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) {
      // If Date parsing fails, try to handle common formats like "YYYY-MM-DD"
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
  const classesData = selectedOption?.classesData || [];
  const teacherData = selectedOption?.teacherData;

  if (!selectedOption) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.loadingContainer}>
          <Text>No class data available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Header />
      
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>

        <Text style={styles.title}>{t('lessonsInfo')}</Text>
        
        {classesData.map((currentClass, index) => {
          const className = currentClass.ensembleName || 'Music Class';
          const participants = currentClass.members || [];
          const getWeekdayTranslation = (weekday: string) => {
            const weekdayMap: { [key: string]: string } = {
              'Monday': t('monday'),
              'Tuesday': t('tuesday'),
              'Wednesday': t('wednesday'),
              'Thursday': t('thursday'),
              'Friday': t('friday'),
              'Saturday': t('saturday'),
              'Sunday': t('sunday'),
              'Montag': t('monday'),
              'Dienstag': t('tuesday'),
              'Mittwoch': t('wednesday'),
              'Donnerstag': t('thursday'),
              'Freitag': t('friday'),
              'Samstag': t('saturday'),
              'Sonntag': t('sunday')
            };
            return weekdayMap[weekday] || weekday;
          };
          
          const classTime = currentClass.unterrichtsTag ? 
            `${getWeekdayTranslation(currentClass.unterrichtsTag)} ${t('from')} ${formatTime(currentClass.unterrichtsAnfang)} ${t('to')} ${formatTime(currentClass.unterrichtsEnde)}` : 
            '';
          const classLocation = currentClass.gebaeude && currentClass.zimmer ? 
            `${currentClass.gebaeude}, ${currentClass.zimmer}` : '';
          const locationAddress = currentClass.adresse ? 
            `${currentClass.adresse}\n${currentClass.plz || ''} ${currentClass.ort || ''}` : '';
          
          const hasClassTime = currentClass.unterrichtsTag && 
                              (currentClass.unterrichtsAnfang || currentClass.unterrichtsEnde);
          
          return (
            <View key={index} style={styles.infoCard}>
              <Text style={styles.lessonTitle}>{className}</Text>
              
              {(teacherData?.abo === 0 || teacherData?.abo === 2) && teacherData?.fach && (
                <View style={styles.infoRow}>
                  <Ionicons name="book-outline" size={20} color="#666" style={styles.icon} />
                  <View style={styles.textContainer}>
                    <Text style={styles.infoLabel}>{t('lessonSubject')}:</Text>
                    <Text style={styles.infoValue}>{teacherData.fach}</Text>
                  </View>
                </View>
              )}
              {participants.length > 0 && (
                <View style={styles.infoRow}>
                  <Ionicons name="people-outline" size={20} color="#666" style={styles.icon} />
                  <View style={styles.textContainer}>
                    <Text style={styles.infoLabel}>{t('participants')}:</Text>
                    {participants.map((participant, pIndex) => (
                      <Text key={pIndex} style={styles.infoValue}>• {participant}</Text>
                    ))}
                  </View>
                </View>
              )}
              
              {currentClass.lektionsdauer && (
                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={20} color="#666" style={styles.icon} />
                  <View style={styles.textContainer}>
                    <Text style={styles.infoLabel}>{language === 'de' ? 'Lektionsdauer:' : 'Lesson Length:'}</Text>
                    <Text style={styles.infoValue}>{currentClass.lektionsdauer} min.</Text>
                  </View>
                </View>
              )}
              
              {classTime && (
                <View style={styles.infoRow}>
                  <Ionicons name="time-outline" size={20} color="#666" style={styles.icon} />
                  <View style={styles.textContainer}>
                    <Text style={styles.infoLabel}>{t('lessonTime')}:</Text>
                    <Text style={styles.infoValue}>{classTime}</Text>
                  </View>
                </View>
              )}
              {(selectedOption.lektionskadenz || selectedOption.studentData?.lektionskadenz) && (
                <View style={styles.infoRow}>
                  <Ionicons name="repeat-outline" size={20} color="#666" style={styles.icon} />
                  <View style={styles.textContainer}>
                    <Text style={styles.infoLabel}>{t('lessonCadence')}:</Text>
                    <Text style={styles.infoValue}>
                      {getCadenceText(selectedOption.studentData?.lektionskadenz || selectedOption.lektionskadenz)}
                    </Text>
                  </View>
                </View>
              )}

              
              {!teacherData || (teacherData.abo !== 0 && teacherData.abo !== 2) ? (
                <>
                  {classLocation && (
                    <View style={styles.infoRow}>
                      <Ionicons name="location-outline" size={20} color="#666" style={styles.icon} />
                      <View style={styles.textContainer}>
                        <Text style={styles.infoLabel}>{t('lessonLocation')}:</Text>
                        <Text style={styles.infoValue}>{classLocation}</Text>
                      </View>
                    </View>
                  )}
                  
                  {locationAddress && (
                    <View style={styles.addressSection}>
                      <TouchableOpacity 
                        onPress={() => handleMaps(locationAddress.replace('\n', ' '))}
                        style={styles.addressButton}
                      >
                        <Ionicons name="map" size={20} color="#666" style={styles.icon} />
                        <View style={styles.textContainer}>
                          <Text style={styles.infoLabel}>{t('locationAddress')}:</Text>
                          <Text style={styles.infoValue}>
                            {locationAddress === '---' || locationAddress.includes('---') ? 
                              (language === 'de' ? 'nicht verfügbar' : 'not available') : 
                              locationAddress
                            }
                          </Text>
                        </View>
                      </TouchableOpacity>
                    </View>
                  )}
                </>
              ) : null}


              
              {hasClassTime && (
                <TouchableOpacity 
                  style={styles.classLessonsButton}
                  onPress={() => handleClassLessons(index)}
                >
                  <Text style={styles.classLessonsButtonText}>{t('viewClasses')}</Text>
                </TouchableOpacity>
              )}


            </View>
          );
        })}

        {(selectedOption.studentData?.lektionskadenz === 'abo' || selectedOption.lektionskadenz === 'abo') && (
          <View style={styles.infoCard}>
            <Text style={styles.lessonTitle}>
              {language === 'de' ? 'Abos' : 'Packages'}
            </Text>

            {/* Current Package */}
            <View style={styles.aboSection}>
              <Text style={styles.aboSectionTitle}>
                {language === 'de' ? 'Laufendes Abo:' : 'Current Package:'}
              </Text>
              {!selectedOption.studentData?.aboData?.validAbos || selectedOption.studentData.aboData.validAbos.length === 0 ? (
                <Text style={styles.infoValue}>
                  {language === 'de' 
                    ? 'Du hast kein gültiges Abo' 
                    : 'You dont have a valid lesson package'}
                </Text>
              ) : (
                <Text style={styles.infoValue}>
                  {language === 'de'
                    ? `Gültig vom ${formatDateString(selectedOption.studentData.aboData.validAbos[0].aboStartDate)} bis ${formatDateString(selectedOption.studentData.aboData.validAbos[0].aboEndDate)} Bezogene Lektionen: ${selectedOption.studentData.aboData.validAbos[0].aboUsed}/${selectedOption.studentData.aboData.validAbos[0].aboAnz}`
                    : `Valid from ${formatDateString(selectedOption.studentData.aboData.validAbos[0].aboStartDate)} to ${formatDateString(selectedOption.studentData.aboData.validAbos[0].aboEndDate)} Used Lessons: ${selectedOption.studentData.aboData.validAbos[0].aboUsed}/${selectedOption.studentData.aboData.validAbos[0].aboAnz}`
                  }
                </Text>
              )}
            </View>

            {/* Past Packages */}
            {selectedOption.studentData?.aboData?.terminatedAbos && selectedOption.studentData.aboData.terminatedAbos.length > 0 && (
              <View style={styles.aboSection}>
                <Text style={styles.aboSectionTitle}>
                  {language === 'de' ? 'Vergangene Abos:' : 'Past Packages:'}
                </Text>
                {selectedOption.studentData.aboData.terminatedAbos.map((abo: any, aboIndex: number) => (
                  <Text key={aboIndex} style={[styles.infoValue, styles.aboItem]}>
                    {language === 'de'
                      ? `Gültig vom ${formatDateString(abo.aboStartDate)} bis ${formatDateString(abo.aboEndDate)} Bezogene Lektionen: ${abo.aboUsed}/${abo.aboAnz}`
                      : `Valid from ${formatDateString(abo.aboStartDate)} to ${formatDateString(abo.aboEndDate)} Used Lessons: ${abo.aboUsed}/${abo.aboAnz}`
                    }
                  </Text>
                ))}
              </View>
            )}
          </View>
        )}

        {classesData.length === 0 && (
          <View style={styles.infoCard}>
            <Text style={styles.infoValue}>No classes available</Text>
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoCard: {
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 12,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  icon: {
    marginRight: 8,
    marginTop: 2,
  },
  textContainer: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#666',
    marginBottom: 2,
  },
  infoValue: {
    fontSize: 14,
    color: '#333',
    lineHeight: 20,
  },
  addressSection: {
    marginTop: 8,
  },
  addressButton: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  classLessonsButton: {
    backgroundColor: '#64a8d1',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    marginTop: 12,
    alignItems: 'center',
  },
  availabilitiesButton: {
    backgroundColor: '#6c757d',
    marginTop: 8,
  },
  classLessonsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  aboSection: {
    marginBottom: 12,
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
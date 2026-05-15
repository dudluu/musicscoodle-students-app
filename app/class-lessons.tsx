import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import { useAuth } from './contexts/AuthContext';
import { useLanguage } from './contexts/LanguageContext';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useLocalSearchParams } from 'expo-router';
import { styles } from './class-lessons-styles';

export default function ClassLessonsScreen() {
  const { user, selectedAccount, wixData, chosenIndex } = useAuth();
  const { language } = useLanguage();
  const [loading, setLoading] = useState(true);
  const params = useLocalSearchParams();
  const classIndex = parseInt(params.classIndex as string) || 0;

  useEffect(() => {
    setLoading(false);
  }, []);

  const formatTime = (timeString: string) => {
    if (!timeString) return '';
    
    const [hours, minutes] = timeString.split(':').map(Number);
    
    if (isNaN(hours) || isNaN(minutes)) return timeString;
    
    if (language === 'en') {
      const hour12 = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      const ampm = hours >= 12 ? 'PM' : 'AM';
      return `${hour12.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} ${ampm}`;
    } else {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} Uhr`;
    }
  };

  const formatLessonDate = (dateString: string) => {
    if (!dateString) return 'No date';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'No date';
      
      if (language === 'de') {
        const weekdays = ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'];
        const months = ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'];
        const weekday = weekdays[date.getDay()];
        const day = date.getDate();
        const month = months[date.getMonth()];
        const year = date.getFullYear();
        return `${weekday}, ${day}. ${month} ${year}`;
      } else {
        const options: Intl.DateTimeFormatOptions = { 
          weekday: 'long', 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        };
        return date.toLocaleDateString('en-US', options);
      }
    } catch (error) {
      return 'No date';
    }
  };

  const getLessonStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'confirmed':
        return '#4CAF50';
      case 'pending':
        return '#FF9800';
      case 'cancelled':
        return '#F44336';
      default:
        return '#64a8d1';
    }
  };

  const getLessonBackgroundColor = (status: string) => {
    if (!status) return '#ffebee'; // light red for unknown status
    
    const upperStatus = status.toUpperCase();
    
    if (upperStatus === 'FE') {
      return '#fff3e0'; // light orange
    } else if (['OK', 'KL', 'SV', 'FU'].includes(upperStatus)) {
      return '#e8f5e8'; // light green
    } else {
      return '#ffebee'; // light red
    }
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
  const classesData = selectedOption?.classesData || [];
  const currentClass = classesData[classIndex];

  if (!currentClass) {
    return (
      <View style={styles.container}>
        <Header />
        <View style={styles.content}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <Ionicons name="arrow-back" size={24} color="#64a8d1" />
            <Text style={styles.backText}>Back</Text>
          </TouchableOpacity>
          <Text style={styles.title}>Class not found</Text>
        </View>
      </View>
    );
  }

  const className = currentClass.ensembleName || 'Unknown Class';
  const homework = currentClass.classLessonsData?.nextAufgaben || '';
  const futureLessons = currentClass.classLessonsData?.futureLessons || [];
  const lessonStartTime = formatTime(currentClass.unterrichtsAnfang || '');
  const lessonEndTime = formatTime(currentClass.unterrichtsEnde || '');

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView 
        style={styles.content}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#64a8d1" />
          <Text style={styles.backText}>{language === 'de' ? 'Zurück' : 'Back'}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>
          {language === 'de' ? `Lektionen der Klasse${'\n'}${className}` : `Lessons of Class${'\n'}${className}`}
        </Text>
        
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{language === 'de' ? 'Training Aufgaben' : 'Home Training'}</Text>
          <View style={styles.homeworkCard}>
            <Text style={styles.homeworkText}>
              {homework || 'No homework assigned'}
            </Text>
          </View>
        </View>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{language === 'de' ? 'Nächste Lektionen' : 'Upcoming Lessons'}</Text>
          {futureLessons.length > 0 ? (
            futureLessons.map((lesson: any, index: number) => {
              const uniqueKey = `${lesson.date || lesson.datum}-${index}`;
              return (
                <View key={uniqueKey} style={[styles.lessonCard, { backgroundColor: getLessonBackgroundColor(lesson.status) }]}>
                  <View style={styles.lessonHeader}>
                    <Text style={styles.lessonDate}>{formatLessonDate(lesson.date || lesson.datum)}</Text>
                  </View>
                  
                  {lesson.status === 'FE' && lesson.bemerkung ? (
                    <Text style={[styles.lessonTime, { color: '#FF9800' }]}>{lesson.bemerkung}</Text>
                  ) : (
                    <Text style={styles.lessonTime}>
                      {formatTime(currentClass.unterrichtsAnfang)} - {formatTime(currentClass.unterrichtsEnde)}
                    </Text>
                  )}
                </View>
              );
            })
          ) : (
            <View style={styles.noLessonsCard}>
              <Text style={styles.noLessonsText}>No upcoming lessons</Text>
            </View>
          )}
        </View>
      </ScrollView>
      <Footer />
    </View>
  );
}
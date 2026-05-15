import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLanguage } from '../app/contexts/LanguageContext';

interface LessonData {
  datum: string;
  unterrichtsAnfang: string;
  unterrichtsEnde: string;
  status: string;
  bemerkung?: string;
}

interface LessonCardEnhancedProps {
  lessonData: LessonData;
  onPress?: () => void;
}

export default function LessonCardEnhanced({ lessonData, onPress }: LessonCardEnhancedProps) {
  const { t, language } = useLanguage();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const weekdays = {
      de: ['Sonntag', 'Montag', 'Dienstag', 'Mittwoch', 'Donnerstag', 'Freitag', 'Samstag'],
      en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
    };
    
    const months = {
      de: ['Januar', 'Februar', 'März', 'April', 'Mai', 'Juni', 'Juli', 'August', 'September', 'Oktober', 'November', 'Dezember'],
      en: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
    };

    const weekday = weekdays[language as keyof typeof weekdays][date.getDay()];
    const day = date.getDate();
    const month = months[language as keyof typeof months][date.getMonth()];
    const year = date.getFullYear();

    if (language === 'de') {
      return `${weekday}\n${day}. ${month} ${year}`;
    } else {
      return `${weekday}\n${month} ${day} ${year}`;
    }
  };

  const formatTime = (start: string, end: string) => {
    if (language === 'de') {
      return `${start} bis ${end}`;
    } else {
      return `${start} - ${end}`;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'OK': return t('normalLesson');
      case 'KL': return t('classLesson');
      case 'SV': return t('substituteLesson');
      case 'FU': return t('onlineLesson');
      case 'SK': return t('cancelledStudentIll');
      case 'SA': return t('cancelledStudentAway');
      case 'SU': return t('cancelledStudentUnexcused');
      case 'LK': return t('cancelledTeacherIll');
      case 'LA': return t('cancelledTeacherAway');
      case 'MS': return t('cancelledSchoolClosed');
      case 'AG': return t('cancelledUnknownReason');
      case 'FE': return lessonData.bemerkung || status;
      default: return status;
    }
  };

  const getButtonText = () => {
    if (lessonData.status === 'OK' || lessonData.status === 'KL' || lessonData.status === 'SV' || lessonData.status === 'FU') {
      return t('cancelLessonBtn');
    } else {
      return t('editCancellationBtn');
    }
  };

  const isSpecialStatus = lessonData.status === 'FE' && lessonData.bemerkung;

  return (
    <View style={styles.card}>
      <View style={styles.dateSection}>
        <Text style={styles.dateText}>{formatDate(lessonData.datum)}</Text>
      </View>
      
      <View style={styles.contentSection}>
        <Text style={styles.timeText}>{formatTime(lessonData.unterrichtsAnfang, lessonData.unterrichtsEnde)}</Text>
        
        <Text style={[styles.statusText, isSpecialStatus && styles.orangeText]}>
          {getStatusText(lessonData.status)}
        </Text>
        
        {onPress && (
          <TouchableOpacity style={styles.button} onPress={onPress}>
            <Text style={styles.buttonText}>{getButtonText()}</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
  },
  dateSection: {
    marginRight: 16,
    justifyContent: 'center',
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
  },
  contentSection: {
    flex: 1,
    justifyContent: 'space-between',
  },
  timeText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  statusText: {
    fontSize: 14,
    color: '#333',
    marginBottom: 12,
  },
  orangeText: {
    color: '#FF8C00',
  },
  button: {
    backgroundColor: '#64a8d1',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  buttonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: '600',
  },
});
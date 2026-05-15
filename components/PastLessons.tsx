import React from 'react';
import { View, Text, StyleSheet, Linking } from 'react-native';
import { useLanguage } from '../app/contexts/LanguageContext';
import { useAuth } from '../app/contexts/AuthContext';

interface PastLesson {
  date: string;
  status: string;
  bemerkungAbsenz?: string;
  aufgaben?: string;
  bemerkung?: string;
}



const PastLessons: React.FC = () => {
  const { t, language } = useLanguage();
  const { wixData, chosenIndex } = useAuth();
  
  const renderTextWithLinks = (text: string) => {
    if (!text) return null;
    
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    const parts = text.split(urlRegex);
    
    return (
      <Text style={styles.aufgabenContent}>
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
          return <Text key={index} style={styles.aufgabenContent}>{part}</Text>;
        })}
      </Text>
    );
  };

  
  const getFullWeekday = (dateString: string) => {
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
      return `${weekday} ${day}. ${month} ${year}`;
    } else {
      return `${weekday} ${month} ${day} ${year}`;
    }
  };


  const getStatusInfo = (status: string, bemerkung?: string) => {
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
        case 'FE': return bemerkung || status;
        default: return status;
      }
    };

    const statusMap: { [key: string]: { color: string; bgColor: string } } = {
      'OK': { color: '#4CAF50', bgColor: '#E8F5E8' },
      'KL': { color: '#4CAF50', bgColor: '#E8F5E8' },
      'SV': { color: '#4CAF50', bgColor: '#E8F5E8' },
      'FU': { color: '#4CAF50', bgColor: '#E8F5E8' },
      'SK': { color: '#F44336', bgColor: '#FFEBEE' },
      'SA': { color: '#F44336', bgColor: '#FFEBEE' },
      'SU': { color: '#F44336', bgColor: '#FFEBEE' },
      'LK': { color: '#F44336', bgColor: '#FFEBEE' },
      'LA': { color: '#F44336', bgColor: '#FFEBEE' },
      'MS': { color: '#F44336', bgColor: '#FFEBEE' },
      'FE': { color: '#FF9800', bgColor: '#FFF3E0' },
      'AG': { color: '#F44336', bgColor: '#FFEBEE' }
    };
    
    const colorInfo = statusMap[status] || { color: '#666', bgColor: 'white' };
    return {
      text: getStatusText(status),
      color: colorInfo.color,
      bgColor: colorInfo.bgColor
    };
  };

  const selectedOption = wixData?.options?.[chosenIndex] || wixData?.options?.[0];
  const lessonsData = selectedOption?.lessonsData;
  const pastLessons: PastLesson[] = lessonsData?.pastLessons || [];

  const uniqueLessons = pastLessons.filter((lesson, index, self) => 
    index === self.findIndex(l => l.date === lesson.date && l.status === lesson.status)
  ).reverse();


  return (
    <View style={styles.container}>
      {uniqueLessons.length === 0 ? (
        <View style={styles.lessonCard}>
          <Text style={styles.noLessons}>{t('noLessons')}</Text>
        </View>
      ) : (
        uniqueLessons.map((lesson, index) => {
          const statusInfo = getStatusInfo(lesson.status, lesson.bemerkung);
          
          return (
            <View key={`${lesson.date}-${lesson.status}-${index}`} style={[
              styles.lessonCard, 
              { backgroundColor: statusInfo.bgColor },
              index !== 0 && styles.smallerCard
            ]}>
              <Text style={[styles.lessonDate, index !== 0 && styles.smallerText]}>
                {getFullWeekday(lesson.date)}
              </Text>
              <Text style={[
                styles.status, 
                { color: statusInfo.color },
                index !== 0 && styles.smallerText
              ]}>
                {statusInfo.text}
              </Text>
              {lesson.bemerkungAbsenz && (
                <View style={[styles.bemerkung, index !== 0 && styles.smallerText]}>
                  <Text style={[styles.bemerkungText, index !== 0 && styles.smallerText]}>
                    {t('bemerkung')}:{' '}
                  </Text>
                  <Text style={[styles.bemerkungContent, index !== 0 && styles.smallerText]}>
                    {lesson.bemerkungAbsenz}
                  </Text>
                </View>
              )}
              {lesson.bemerkung && lesson.bemerkung.length > 0 && lesson.status !== 'FE' && (
                <View style={[styles.bemerkung, index !== 0 && styles.smallerText]}>
                  <Text style={[styles.bemerkungText, index !== 0 && styles.smallerText]}>
                    {t('remark')}:{' '}
                  </Text>
                  <Text style={[styles.bemerkungContent, index !== 0 && styles.smallerText]}>
                    {lesson.bemerkung}
                  </Text>
                </View>
              )}

              {lesson.aufgaben && (
                <View style={[styles.aufgaben, index !== 0 && styles.smallerText]}>
                  <Text style={[styles.aufgabenText, index !== 0 && styles.smallerText]}>
                    {t('training')}:{' '}
                  </Text>
                  {renderTextWithLinks(lesson.aufgaben)}
                </View>
              )}

            </View>

          );
        })
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  lessonCard: {
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  smallerCard: {
    padding: 10,
    marginBottom: 8,
  },
  lessonDate: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  smallerText: {
    fontSize: 14,
    marginBottom: 4,
  },
  status: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 10,
  },
  aufgaben: {
    marginTop: 5,
    marginBottom: 10,
    width: '100%',
  },
  aufgabenText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  aufgabenContent: {
    fontSize: 14,
    color: '#333',
    flexWrap: 'wrap',
  },
  linkText: {
    fontSize: 14,
    color: '#007AFF',
    textDecorationLine: 'underline',
    flexWrap: 'wrap',
  },
  bemerkung: {
    marginTop: 5,
    marginBottom: 10,
    width: '100%',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  bemerkungText: {
    fontSize: 14,
    color: '#000',
    fontWeight: '600',
  },
  bemerkungContent: {
    fontSize: 14,
    color: '#333',
    flexWrap: 'wrap',
    flexShrink: 1,
  },
  noLessons: {
    fontSize: 14,
    color: '#666',
    fontStyle: 'italic',
  },
});

export default PastLessons;

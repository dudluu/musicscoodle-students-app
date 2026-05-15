import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { useLanguage } from '../app/contexts/LanguageContext';

interface AvailabilityCardProps {
  index: number;
  weekday: string;
  start: string;
  end: string;
  onEdit?: () => void;
  onDelete?: () => void;
  showButtons?: boolean;
}

export default function AvailabilityCard({ index, weekday, start, end, onEdit, onDelete, showButtons = true }: AvailabilityCardProps) {
  const { t, language } = useLanguage();

  const weekdayTranslations = {
    'Montag': { en: 'Monday', fr: 'Lundi' },
    'Dienstag': { en: 'Tuesday', fr: 'Mardi' },
    'Mittwoch': { en: 'Wednesday', fr: 'Mercredi' },
    'Donnerstag': { en: 'Thursday', fr: 'Jeudi' },
    'Freitag': { en: 'Friday', fr: 'Vendredi' },
    'Samstag': { en: 'Saturday', fr: 'Samedi' },
    'Sonntag': { en: 'Sunday', fr: 'Dimanche' },
    'Lundi': { en: 'Monday', de: 'Montag' },
    'Mardi': { en: 'Tuesday', de: 'Dienstag' },
    'Mercredi': { en: 'Wednesday', de: 'Mittwoch' },
    'Jeudi': { en: 'Thursday', de: 'Donnerstag' },
    'Vendredi': { en: 'Friday', de: 'Freitag' },
    'Samedi': { en: 'Saturday', de: 'Samstag' },
    'Dimanche': { en: 'Sunday', de: 'Sonntag' },
    'Monday': { de: 'Montag', fr: 'Lundi' },
    'Tuesday': { de: 'Dienstag', fr: 'Mardi' },
    'Wednesday': { de: 'Mittwoch', fr: 'Mercredi' },
    'Thursday': { de: 'Donnerstag', fr: 'Jeudi' },
    'Friday': { de: 'Freitag', fr: 'Vendredi' },
    'Saturday': { de: 'Samstag', fr: 'Samedi' },
    'Sunday': { de: 'Sonntag', fr: 'Dimanche' }
  };

  function translateWeekday(weekday: string): string {
    if (!weekday) return weekday;
    const translations = weekdayTranslations[weekday as keyof typeof weekdayTranslations];
    if (translations && translations[language as keyof typeof translations]) {
      return translations[language as keyof typeof translations];
    }
    return weekday;
  }

  const formatTime = (time: string): string => {
    if (!time || typeof time !== 'string') return '00:00';
    
    // Time is already in string format like "14:45" or "7:20"
    if (time.includes(':')) {
      const [hoursStr, minutesStr] = time.split(':');
      const hours = parseInt(hoursStr, 10);
      const minutes = parseInt(minutesStr, 10);
      
      if (isNaN(hours) || isNaN(minutes)) return '00:00';
      
      if (language === 'en') {
        const period = hours >= 12 ? 'PM' : 'AM';
        const displayHours = hours > 12 ? hours - 12 : hours === 0 ? 12 : hours;
        return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
      } else {
        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')} h`;
      }
    }
    
    return time;
  };

  const translatedWeekday = translateWeekday(weekday);
  const title = `${t('availability')} ${index + 1}`;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>{title}</Text>
        {showButtons && (
          <View style={styles.buttonContainer}>
            {onEdit && (
              <TouchableOpacity style={styles.editButton} onPress={onEdit}>
                <Text style={styles.editButtonText}>{t('edit')}</Text>
              </TouchableOpacity>
            )}
            {onDelete && (
              <TouchableOpacity style={styles.deleteButton} onPress={onDelete}>
                <Text style={styles.deleteButtonText}>{t('delete')}</Text>
              </TouchableOpacity>
            )}
          </View>
        )}
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{t('weekday')}:</Text>
        <Text style={styles.value}>{translatedWeekday}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{t('start')}:</Text>
        <Text style={styles.value}>{formatTime(start)}</Text>
      </View>
      <View style={styles.row}>
        <Text style={styles.label}>{t('end')}:</Text>
        <Text style={styles.value}>{formatTime(end)}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  buttonContainer: {
    flexDirection: 'column',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  editButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
  },
  row: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  label: {
    fontSize: 14,
    color: '#666',
    width: 80,
    fontWeight: '500',
  },
  value: {
    fontSize: 14,
    color: '#333',
    flex: 1,
  },
});
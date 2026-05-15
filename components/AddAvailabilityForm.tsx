import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import TimeSelector from './TimeSelector';
import { useLanguage } from '../app/contexts/LanguageContext';
import { styles, modalStyles } from './AddAvailabilityFormStyles';

interface Availability {
  title: string;
  weekday: string;
  start: string;
  end: string;
}

interface AddAvailabilityFormProps {
  existingAvailabilities: Availability[];
  onAddAvailability: (availability: Availability) => void;
  editingAvailability?: Availability | null;
  onCancelEdit?: () => void;
  editingIndex?: number | null;
  onUpdateAvailability?: (index: number, availability: Availability) => void;
}

export default function AddAvailabilityForm({ 
  existingAvailabilities, 
  onAddAvailability, 
  editingAvailability,
  onCancelEdit,
  editingIndex,
  onUpdateAvailability
}: AddAvailabilityFormProps) {
  const { t, language } = useLanguage();
  const [selectedWeekday, setSelectedWeekday] = useState('');
  const [startTime, setStartTime] = useState('');
  const [endTime, setEndTime] = useState('');
  const [weekdayModalVisible, setWeekdayModalVisible] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const weekdays = [
    { label: t('monday'), value: t('monday') },
    { label: t('tuesday'), value: t('tuesday') },
    { label: t('wednesday'), value: t('wednesday') },
    { label: t('thursday'), value: t('thursday') },
    { label: t('friday'), value: t('friday') },
    { label: t('saturday'), value: t('saturday') },
    { label: t('sunday'), value: t('sunday') },
  ];

  function validateAvailability(): boolean {
    setErrorMessage('');
    
    if (!selectedWeekday || !startTime || !endTime) {
      setErrorMessage('Please fill all fields');
      return false;
    }

    if (endTime <= startTime) {
      setErrorMessage('End time must be after start time');
      return false;
    }

    return true;
  }

  const handleAdd = () => {
    if (!validateAvailability()) return;

    const newAvailability: Availability = {
      title: `Availability ${existingAvailabilities.length + 1}`,
      weekday: selectedWeekday,
      start: startTime,
      end: endTime,
    };
    
    onAddAvailability(newAvailability);
    
    setSelectedWeekday('');
    setStartTime('');
    setEndTime('');
    setErrorMessage('');
    
    if (onCancelEdit) onCancelEdit();
  };

  const handleWeekdaySelect = (weekday: string) => {
    setSelectedWeekday(weekday);
    setWeekdayModalVisible(false);
    setErrorMessage('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{t('addAvailability')}</Text>
      
      {errorMessage ? (
        <Text style={styles.errorText}>{errorMessage}</Text>
      ) : null}
      
      <View style={styles.fieldContainer}>
        <Text style={styles.label}>{t('weekday')}</Text>
        <TouchableOpacity 
          style={styles.selector} 
          onPress={() => setWeekdayModalVisible(true)}
        >
          <Text style={styles.selectorText}>
            {selectedWeekday || t('selectWeekday')}
          </Text>
        </TouchableOpacity>
      </View>

      <TimeSelector
        label={t('startTime')}
        value={startTime}
        onValueChange={setStartTime}
      />

      <TimeSelector
        label={t('endTime')}
        value={endTime}
        onValueChange={setEndTime}
      />

      <TouchableOpacity style={styles.addButton} onPress={handleAdd}>
        <Text style={styles.addButtonText}>{t('addAvailability')}</Text>
      </TouchableOpacity>

      <Modal
        visible={weekdayModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setWeekdayModalVisible(false)}
      >
        <View style={modalStyles.modalOverlay}>
          <View style={modalStyles.modalContent}>
            <Text style={modalStyles.modalTitle}>{t('selectWeekday')}</Text>
            <FlatList
              data={weekdays}
              keyExtractor={(item) => item.value}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}

              renderItem={({ item }) => (
                <TouchableOpacity
                  style={modalStyles.weekdayOption}
                  onPress={() => handleWeekdaySelect(item.value)}
                >
                  <Text style={modalStyles.weekdayOptionText}>{item.label}</Text>
                </TouchableOpacity>
              )}
            />
            <TouchableOpacity
              style={modalStyles.modalCancelButton}
              onPress={() => setWeekdayModalVisible(false)}
            >
              <Text style={modalStyles.modalCancelButtonText}>{t('abbrechen')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}
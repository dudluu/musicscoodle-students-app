import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Modal, FlatList } from 'react-native';
import TimeSelector from './TimeSelector';
import { useLanguage } from '../app/contexts/LanguageContext';
import { styles, modalStyles } from './AddAvailabilityFormStyles';

interface Availability {
  weekday: string;
  start: string;
  end: string;
}

interface AddAvailabilityFormEnhancedProps {
  existingAvailabilities: Availability[];
  onAddAvailability: (availability: Availability) => void;
  editingAvailability?: Availability | null;
  onCancelEdit?: () => void;
  editingIndex?: number | null;
  onUpdateAvailability?: (index: number, availability: Availability) => void;
}

export default function AddAvailabilityFormEnhanced({ 
  existingAvailabilities, 
  onAddAvailability, 
  editingAvailability,
  onCancelEdit,
  editingIndex,
  onUpdateAvailability
}: AddAvailabilityFormEnhancedProps) {
  const { t } = useLanguage();
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

  // Load editing data when editing mode is activated
  useEffect(() => {
    if (editingAvailability) {
      setSelectedWeekday(editingAvailability.weekday);
      setStartTime(editingAvailability.start);
      setEndTime(editingAvailability.end);
      setErrorMessage('');
    }
  }, [editingAvailability]);

  function timeToMinutes(time: string): number {
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
  }

  function checkOverlap(newAvail: Availability): boolean {
    const newStart = timeToMinutes(newAvail.start);
    const newEnd = timeToMinutes(newAvail.end);
    
    for (let i = 0; i < existingAvailabilities.length; i++) {
      if (editingIndex !== null && i === editingIndex) continue; // Skip the one being edited
      
      const existing = existingAvailabilities[i];
      if (existing.weekday !== newAvail.weekday) continue;
      
      const existingStart = timeToMinutes(existing.start);
      const existingEnd = timeToMinutes(existing.end);
      
      // Check if times overlap (not just touching)
      if (newStart < existingEnd && newEnd > existingStart) {
        return true;
      }
    }
    return false;
  }

  function mergeAdjacent(newAvail: Availability): Availability | null {
    for (let i = 0; i < existingAvailabilities.length; i++) {
      if (editingIndex !== null && i === editingIndex) continue;
      
      const existing = existingAvailabilities[i];
      if (existing.weekday !== newAvail.weekday) continue;
      
      const newStart = timeToMinutes(newAvail.start);
      const newEnd = timeToMinutes(newAvail.end);
      const existingStart = timeToMinutes(existing.start);
      const existingEnd = timeToMinutes(existing.end);
      
      // If new start equals existing end, extend existing
      if (newStart === existingEnd) {
        // Remove the existing one and return extended version
        existingAvailabilities.splice(i, 1);
        return { ...existing, end: newAvail.end };
      }
      
      // If new end equals existing start, extend existing
      if (newEnd === existingStart) {
        // Remove the existing one and return extended version
        existingAvailabilities.splice(i, 1);
        return { ...existing, start: newAvail.start };
      }
    }
    return null;
  }

  function validateAvailability(): boolean {
    setErrorMessage('');
    
    if (!selectedWeekday || !startTime || !endTime) {
      setErrorMessage(t('fillAllFieldsError'));
      return false;
    }

    if (endTime <= startTime) {
      setErrorMessage(t('endTimeAfterStartError'));
      return false;
    }

    const newAvail = { weekday: selectedWeekday, start: startTime, end: endTime };
    
    if (checkOverlap(newAvail)) {
      setErrorMessage(t('overlapError'));
      return false;
    }

    return true;
  }

  const handleAdd = () => {
    if (!validateAvailability()) return;

    const newAvailability: Availability = {
      weekday: selectedWeekday,
      start: startTime,
      end: endTime,
    };

    // Check for adjacent merging
    const merged = mergeAdjacent(newAvailability);
    const finalAvailability = merged || newAvailability;
    
    if (editingIndex !== null && onUpdateAvailability) {
      onUpdateAvailability(editingIndex, finalAvailability);
    } else {
      onAddAvailability(finalAvailability);
    }
    
    // Reset form
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

  const isEditing = editingAvailability !== null;
  const formTitle = isEditing ? t('editAvailability') : t('addAvailability');
  const buttonText = t('addAvailability'); // Always show "Add Availability"
  return (
    <View style={styles.container}>
      <Text style={styles.title}>{formTitle}</Text>
      
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

      <TouchableOpacity style={[styles.addButton, { backgroundColor: '#007AFF' }]} onPress={handleAdd}>
        <Text style={styles.addButtonText}>{buttonText}</Text>
      </TouchableOpacity>

      {isEditing && (
        <TouchableOpacity style={[styles.addButton, { backgroundColor: '#ccc', marginTop: 10 }]} onPress={onCancelEdit}>
          <Text style={styles.addButtonText}>{t('abbrechen')}</Text>
        </TouchableOpacity>
      )}

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
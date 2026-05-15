import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, FlatList } from 'react-native';
import { useLanguage } from '../app/contexts/LanguageContext';

interface TimeSelectorProps {
  label: string;
  value: string;
  onValueChange: (value: string) => void;
}

export default function TimeSelector({ label, value, onValueChange }: TimeSelectorProps) {
  const { t, language } = useLanguage();

  const [modalVisible, setModalVisible] = React.useState(false);

  const generateTimeOptions = () => {
    const options = [];
    for (let hour = 7; hour <= 23; hour++) {
      for (let minute = 0; minute < 60; minute += 5) {
        if (hour === 23 && minute > 55) break;
        const timeStr = `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`;
        options.push(timeStr);
      }
    }
    return options;
  };

  const formatTimeDisplay = (timeStr: string) => {
    if (!timeStr) return t('selectTime');
    
    if (language === 'en') {
      const [hours, minutes] = timeStr.split(':').map(Number);
      const period = hours >= 12 ? 'PM' : 'AM';
      const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours;
      return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`;
    } else {
      return `${timeStr} h`;
    }
  };

  const timeOptions = generateTimeOptions();

  const handleSelect = (time: string) => {
    onValueChange(time);
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TouchableOpacity 
        style={styles.selector} 
        onPress={() => setModalVisible(true)}
      >
        <Text style={styles.selectorText}>
          {formatTimeDisplay(value)}
        </Text>
      </TouchableOpacity>
      
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>{t('selectTime')}</Text>
            <FlatList
              data={timeOptions}
              keyExtractor={(item) => item}
              showsVerticalScrollIndicator={false}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={styles.timeOption}
                  onPress={() => handleSelect(item)}
                >
                  <Text style={styles.timeOptionText}>{formatTimeDisplay(item)}</Text>
                </TouchableOpacity>
              )}
              style={styles.timeList}
            />

            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelButtonText}>{t('abbrechen')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  selector: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    padding: 15,
    minHeight: 50,
    justifyContent: 'center',
  },
  selectorText: {
    fontSize: 16,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  timeList: {
    maxHeight: 300,
  },
  timeOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  timeOptionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  cancelButton: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  cancelButtonText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});
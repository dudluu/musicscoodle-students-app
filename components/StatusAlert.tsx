import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface StudentOption {
  _id: string;
  vorname: string;
  nachname: string;
}

interface StatusAlertProps {
  visible: boolean;
  status: string;
  email?: string;
  displayName?: string;
  options?: StudentOption[];
  onClose: () => void;
  onSelectStudent?: (studentId: string) => void;
}

export default function StatusAlert({ 
  visible, 
  status, 
  email = '', 
  displayName = '', 
  options = [],
  onClose,
  onSelectStudent 
}: StatusAlertProps) {
  const { t } = useLanguage();
  const [selectedStudentId, setSelectedStudentId] = useState<string>('');

  const getMessage = () => {
    switch (status) {
      case 'noStudent':
        return t('noStudentFound').replace('EMAIL_PLACEHOLDER', email);
      case 'noMatchingStudent':
        return t('noMatchingStudent').replace('USER_DISPLAY_NAME', displayName);
      case 'multipleMatchingStudent':
        return t('multipleMatchingStudent').replace('USER_DISPLAY_NAME', displayName);
      case 'noMusicscoodle':
        return t('noMusicscoodle');
      case 'noValidMusicscoodle':
        return t('noValidMusicscoodle');
      default:
        return '';
    }
  };

  const handleOkPress = () => {
    if (status === 'multipleMatchingStudent' && selectedStudentId && onSelectStudent) {
      onSelectStudent(selectedStudentId);
    } else {
      onClose();
    }
  };

  const isMultipleStudent = status === 'multipleMatchingStudent';

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>

            <Text style={styles.message}>{getMessage()}</Text>
            
            {isMultipleStudent && options.length > 0 && (
              <View style={styles.optionsContainer}>
                {options.map((option) => (
                  <TouchableOpacity
                    key={option._id}
                    style={styles.optionRow}
                    onPress={() => setSelectedStudentId(option._id)}
                  >
                    <View style={styles.radioButton}>
                      {selectedStudentId === option._id && <View style={styles.radioButtonInner} />}
                    </View>
                    <Text style={styles.optionText}>
                      {option.vorname} {option.nachname}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </ScrollView>
          
          <TouchableOpacity 
            style={[
              styles.okButton, 
              isMultipleStudent && !selectedStudentId && styles.disabledButton
            ]} 
            onPress={handleOkPress}
            disabled={isMultipleStudent && !selectedStudentId}
          >
            <Text style={styles.okButtonText}>{t('ok')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  alertContainer: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
    maxWidth: '90%',
    maxHeight: '80%',
    minWidth: 280,
  },
  scrollView: {
    maxHeight: 400,
  },
  message: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 20,
    textAlign: 'center',
  },
  optionsContainer: {
    marginBottom: 20,
  },
  optionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 5,
  },
  radioButton: {
    height: 20,
    width: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#007AFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  radioButtonInner: {
    height: 10,
    width: 10,
    borderRadius: 5,
    backgroundColor: '#007AFF',
  },
  optionText: {
    fontSize: 16,
    flex: 1,
  },
  okButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 8,
    alignSelf: 'center',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
  okButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
import React from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useLanguage } from '@/app/contexts/LanguageContext';

interface NoStudentAlertProps {
  visible: boolean;
  email: string;
  onClose: () => void;
}

export default function NoStudentAlert({ visible, email, onClose }: NoStudentAlertProps) {
  const { t } = useLanguage();

  const message = t('noStudentFound').replace('EMAIL_PLACEHOLDER', email);

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.alertContainer}>
          <Text style={styles.message}>{message}</Text>
          <TouchableOpacity 
            style={styles.okButton} 
            onPress={onClose}
          >
            <Text style={styles.okButtonText}>OK</Text>
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
    minWidth: 280,
    maxWidth: '90%',
  },
  message: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 22,
    color: '#333',
  },
  okButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  okButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});
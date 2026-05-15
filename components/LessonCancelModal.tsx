import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Modal, StyleSheet, Alert, TextInput } from 'react-native';
import { supabase } from '@/app/lib/supabase';

interface Props {
  visible: boolean;
  onClose: () => void;
  lessonId: string;
  onCancel: () => void;
}

export default function LessonCancelModal({ visible, onClose, lessonId, onCancel }: Props) {
  const [selectedReason, setSelectedReason] = useState('');
  const [customReason, setCustomReason] = useState('');
  const [loading, setLoading] = useState(false);

  const reasons = ['Illness', 'Family Emergency', 'Schedule Conflict', 'Other'];

  const handleCancel = async () => {
    const reason = selectedReason === 'Other' ? customReason : selectedReason;
    
    if (!reason.trim()) {
      Alert.alert('Error', 'Please select or enter a reason for cancellation');
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('lessons')
        .update({ 
          status: 'cancelled',
          cancel_reason: reason 
        })
        .eq('id', lessonId);

      if (error) {
        Alert.alert('Error', 'Failed to cancel lesson');
        return;
      }

      Alert.alert('Success', 'Lesson cancelled successfully');
      onCancel();
      onClose();
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.container}>
          <Text style={styles.title}>Cancel Lesson</Text>
          <Text style={styles.subtitle}>Please select a reason for cancellation:</Text>
          
          {reasons.map((reason) => (
            <TouchableOpacity
              key={reason}
              style={[
                styles.reasonButton,
                selectedReason === reason && styles.selectedReason
              ]}
              onPress={() => setSelectedReason(reason)}
            >
              <Text style={[
                styles.reasonText,
                selectedReason === reason && styles.selectedReasonText
              ]}>
                {reason}
              </Text>
            </TouchableOpacity>
          ))}
          
          {selectedReason === 'Other' && (
            <TextInput
              style={styles.textInput}
              placeholder="Please specify..."
              value={customReason}
              onChangeText={setCustomReason}
              multiline
            />
          )}
          
          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={onClose}
            >
              <Text style={styles.cancelButtonText}>Back</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.confirmButton, loading && styles.buttonDisabled]}
              onPress={handleCancel}
              disabled={loading}
            >
              <Text style={styles.confirmButtonText}>
                {loading ? 'Cancelling...' : 'Cancel Lesson'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  container: {
    backgroundColor: 'white',
    margin: 20,
    padding: 20,
    borderRadius: 10,
    width: '90%',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 20,
    color: '#666',
  },
  reasonButton: {
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    marginBottom: 10,
  },
  selectedReason: {
    backgroundColor: '#64a8d1',
    borderColor: '#64a8d1',
  },
  reasonText: {
    fontSize: 16,
    color: '#333',
  },
  selectedReasonText: {
    color: 'white',
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 15,
    marginBottom: 20,
    minHeight: 80,
    textAlignVertical: 'top',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  cancelButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginRight: 10,
  },
  cancelButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  confirmButton: {
    flex: 1,
    padding: 15,
    borderRadius: 8,
    backgroundColor: '#ff4444',
    marginLeft: 10,
  },
  confirmButtonText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
});
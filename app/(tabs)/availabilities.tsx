import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import Header from '@/components/Header';
import AvailabilityCard from '@/components/AvailabilityCard';
import AddAvailabilityFormEnhanced from '@/components/AddAvailabilityFormEnhanced';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../lib/supabase';
import Footer from '@/components/Footer';

interface Availability {
  weekday: string;
  start: string;
  end: string;
}

export default function AvailabilitiesScreen() {
  const { t } = useLanguage();
  const { user, wixData, refreshWixData, chosenIndex } = useAuth();
  const [editingAvailability, setEditingAvailability] = useState<Availability | null>(null);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [availabilities, setAvailabilities] = useState<Availability[]>(() => getInitialAvailabilities());
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error' | 'tooLate'>('idle');

  function getInitialAvailabilities(): Availability[] {
    const selectedOption = wixData?.options?.[chosenIndex] || wixData?.options?.[0];
    const studentData = selectedOption?.studentData;
    
    if (!studentData) {
      return [];
    }
    
    const availabilities: Availability[] = [];
    const slots = ['A', 'B', 'C', 'D', 'E'];
    
    slots.forEach((slot, index) => {
      const weekdayKey = `slotTag${slot}` as keyof typeof studentData;
      const startKey = `slotAnfang${slot}` as keyof typeof studentData;
      const endKey = `slotEnde${slot}` as keyof typeof studentData;
      
      const weekday = studentData[weekdayKey] as string;
      const start = studentData[startKey] as string;
      const end = studentData[endKey] as string;
      
      if (weekday && start && end) {
        availabilities.push({
          weekday,
          start,
          end
        });
      }
    });
    
    return availabilities;
  }

  const getFullName = () => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    
    const selectedOption = wixData?.options?.[chosenIndex] || wixData?.options?.[0];
    const studentData = selectedOption?.studentData;
    if (studentData?.vorname && studentData?.nachname) {
      return `${studentData.vorname} ${studentData.nachname}`;
    }
    
    return user?.user_metadata?.name || user?.email?.split('@')[0] || 'User';
  };

  const isDeadlinePassed = () => {
    const selectedOption = wixData?.options?.[chosenIndex] || wixData?.options?.[0];
    const enterAvailableDateUntil = selectedOption?.studentData?.enterAvailableDateUntil;
    
    // If the key is not available, treat the deadline as passed (canUpdate = false)
    if (!enterAvailableDateUntil) return true;
    
    const deadline = new Date(enterAvailableDateUntil);
    
    // If parsing failed, treat as deadline passed
    if (isNaN(deadline.getTime())) return true;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    deadline.setHours(0, 0, 0, 0);
    
    // deadline < today => passed (canUpdate = false)
    // deadline >= today => not passed (canUpdate = true)
    return deadline < today;
  };


  const handleAddAvailability = (newAvailability: Availability) => {
    setAvailabilities(prev => [...prev, newAvailability]);
  };

  const handleUpdateAvailability = (index: number, updatedAvailability: Availability) => {
    setAvailabilities(prev => {
      const updated = [...prev];
      updated[index] = updatedAvailability;
      return updated;
    });
    setEditingAvailability(null);
    setEditingIndex(null);
  };

  const handleEditAvailability = (availability: Availability, index: number) => {
    // Remove from list and put into edit mode
    setAvailabilities(prev => prev.filter((_, i) => i !== index));
    setEditingAvailability(availability);
    setEditingIndex(index);
  };

  const handleDeleteAvailability = (index: number) => {
    setAvailabilities(prev => prev.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingAvailability(null);
      setEditingIndex(null);
    }
  };

  const handleCancelEdit = () => {
    // Restore the original availability back to the list
    if (editingAvailability && editingIndex !== null) {
      setAvailabilities(prev => {
        const updated = [...prev];
        updated.splice(editingIndex, 0, editingAvailability);
        return updated;
      });
    }
    setEditingAvailability(null);
    setEditingIndex(null);
  };

  const handleSaveAvailabilities = async () => {
    if (isDeadlinePassed()) {
      setSaveStatus('tooLate');
      return;
    }

    setSaveStatus('saving');
    
    try {
      const selectedOption = wixData?.options?.[chosenIndex] || wixData?.options?.[0];
      const studentData = selectedOption?.studentData;
      const teacherData = selectedOption?.teacherData;
      
      if (!studentData?._id) {
        throw new Error('Student ID not found');
      }

      // Convert availabilities to the slots format required by the API
      const slots: any = {};
      const slotLetters = ['A', 'B', 'C', 'D', 'E'];
      
      availabilities.forEach((availability, index) => {
        if (index < 5) { // Support up to 5 slots (A, B, C, D, E)
          const letter = slotLetters[index];
          slots[`slotTag${letter}`] = availability.weekday;
          slots[`slotAnfang${letter}`] = availability.start;
          slots[`slotEnde${letter}`] = availability.end;
        }
      });

      const body = {
        id: studentData._id,
        slots: slots,
        teacherEmail: teacherData?.teacherEmail || '',
        schEmail: studentData.email || '',
        schName: `${studentData.vorname || ''} ${studentData.nachname || ''}`.trim()
      };

      console.log("Sending body object:", body);
      console.log("Request body JSON:", JSON.stringify(body, null, 2));
      
      const options = {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(body)
      };
      
      const url = "https://grvqawjtobuqyuggaouj.supabase.co/functions/v1/save-availability-proxy";
      console.log("Making request to:", url);
      console.log("Fetch options:", options);
      
      const response = await fetch(url, options);
      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log("Response data:", data);
      
      setSaveStatus('success');
      
      // Refresh data to get updated information but stay on this page
      await refreshWixData();
      
      // Update local state with fresh data after refresh
      const updatedAvailabilities = getInitialAvailabilities();
      setAvailabilities(updatedAvailabilities);
      
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving availabilities:', error);
      Alert.alert('Error', `Failed to save availabilities: ${error.message}`);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const showAddForm = availabilities.length < 5 && !isDeadlinePassed();
  const canUpdate = !isDeadlinePassed();

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.push('/(tabs)/lessons')}
        >
          <Ionicons name="arrow-back" size={24} color="#64a8d1" />
          <Text style={styles.backText}>{t('back')}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{t('availabilities')}</Text>
        
        {availabilities.length === 0 && (
          <View style={styles.noAvailabilitiesContainer}>
            <Text style={styles.noAvailabilitiesText}>
              {t('noAvailabilitiesMessage')}
            </Text>
          </View>
        )}
        
        {!canUpdate && (
          <View style={styles.infoContainer}>
            <Text style={styles.infoText}>
              {t('cannotUpdateAvailabilities')}
            </Text>
          </View>
        )}
        
        {availabilities.length > 0 && availabilities.map((availability, index) => (
          <AvailabilityCard
            key={`${availability.weekday}-${availability.start}-${availability.end}-${index}`}
            index={index}
            weekday={availability.weekday}
            start={availability.start}
            end={availability.end}
            onEdit={() => handleEditAvailability(availability, index)}
            onDelete={() => handleDeleteAvailability(index)}
            showButtons={canUpdate}
          />
        ))}
        
        
        {canUpdate && (
          <TouchableOpacity 
            style={[
              styles.saveButton,
              saveStatus === 'saving' && styles.saveButtonDisabled
            ]}
            onPress={handleSaveAvailabilities}
            disabled={saveStatus === 'saving'}
          >
            <Text style={styles.saveButtonText}>
              {saveStatus === 'saving' ? t('processing') : t('saveAvailabilities')}
            </Text>
          </TouchableOpacity>
        )}

        {saveStatus === 'success' && (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>{t('success')}</Text>
          </View>
        )}

        {saveStatus === 'error' && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{t('error')}</Text>
          </View>
        )}

        {saveStatus === 'tooLate' && (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{t('cannotUpdateAvailabilities')}</Text>
          </View>
        )}
        
        {showAddForm && (
          <AddAvailabilityFormEnhanced
            existingAvailabilities={availabilities}
            onAddAvailability={handleAddAvailability}
            editingAvailability={editingAvailability}
            onCancelEdit={handleCancelEdit}
            editingIndex={editingIndex}
            onUpdateAvailability={handleUpdateAvailability}
          />
        )}
      </ScrollView>
      <Footer />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#64a8d1',
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  noAvailabilitiesContainer: {
    backgroundColor: '#f0f8ff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  noAvailabilitiesText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    fontStyle: 'italic',
  },
  infoContainer: {
    backgroundColor: '#e8f4fd',
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
  },
  saveButton: {
    backgroundColor: '#dc3545', // Red color like other red buttons
    padding: 15,
    borderRadius: 8,
    marginVertical: 20,
    alignItems: 'center',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
  },
  saveButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  successContainer: {
    backgroundColor: '#d4edda',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#28a745',
  },
  successText: {
    color: '#155724',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
  errorContainer: {
    backgroundColor: '#f8d7da',
    padding: 15,
    borderRadius: 8,
    marginVertical: 10,
    borderLeftWidth: 4,
    borderLeftColor: '#dc3545',
  },
  errorText: {
    color: '#721c24',
    fontSize: 16,
    textAlign: 'center',
    fontWeight: '500',
  },
});
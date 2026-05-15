import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, ActivityIndicator } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { fetchWixData } from '../lib/wixApi';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';

export default function ChooseAccountScreen() {
  const { t, language } = useLanguage();
  const { setWixData } = useAuth();
  const insets = useSafeAreaInsets();
  const [loadingIndex, setLoadingIndex] = useState<number | null>(null);
  const [students, setStudents] = useState<any[]>([]);
  const params = useLocalSearchParams();

  useEffect(() => {
    console.log('ChooseAccount params:', params);
    try {
      if (params.students && typeof params.students === 'string') {
        const parsedStudents = JSON.parse(params.students);
        console.log('Parsed students:', parsedStudents);
        setStudents(parsedStudents);
      }
    } catch (error) {
      console.error('Error parsing students:', error);
      Alert.alert('Error', 'Failed to load student options');
    }
  }, [params.students]);

  const handleSelectStudent = async (selectedStudent: any, index: number) => {
    setLoadingIndex(index);

    try {
      console.log('Selected student:', selectedStudent);
      const email = params.originalEmail as string;
      const studentName = `${selectedStudent.vorname} ${selectedStudent.nachname}`;

      console.log('Calling fetchAppData with:', { email, studentName });

      // Call appData with user email and selected student name
      const appDataResponse = await fetchWixData(email, studentName, selectedStudent._id);
      console.log('appData response:', appDataResponse);

      if (appDataResponse?.options?.[0]) {
        setWixData(appDataResponse);
        router.replace('/(tabs)');
      } else {
        Alert.alert('Error', 'Unable to load student data');
      }
    } catch (error) {
      console.error('Error loading student data:', error);
      Alert.alert('Error', 'Failed to load student data');
    } finally {
      setLoadingIndex(null);
    }
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 },
      ]}
    >
      <Text style={styles.title}>Choose Student Account</Text>
      <Text style={styles.subtitle}>
        Multiple students found with this email. Please select the correct one:
      </Text>

      <ScrollView
        style={styles.optionsContainer}
        contentContainerStyle={{ paddingBottom: insets.bottom + 20 }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >

        {students.map((student, index) => (
          <View key={index} style={styles.optionCard}>
            <View style={styles.optionInfo}>
              <Text style={styles.studentName}>
                {student.vorname} {student.nachname}
              </Text>
              <Text style={styles.school}>Email: {student.email}</Text>
              {student.unterrichtsTag && (
                <Text style={styles.details}>
                  Lessons: {student.unterrichtsTag} {student.unterrichtsAnfang}-{student.unterrichtsEnde}
                </Text>
              )}
            </View>

            <TouchableOpacity
              style={[styles.selectButton, loadingIndex === index && styles.buttonDisabled]}
              onPress={() => handleSelectStudent(student, index)}
              disabled={loadingIndex !== null}
            >
              {loadingIndex === index ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <Text style={styles.selectButtonText}>
                  {language === 'en'
                    ? `Use ${student.vorname} ${student.nachname}`
                    : `${student.vorname} ${student.nachname} verwenden`}
                </Text>
              )}
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
    color: '#64a8d1',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: '#666',
  },
  optionsContainer: {
    flex: 1,
  },
  optionCard: {
    backgroundColor: 'white',
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  optionInfo: {
    flex: 1,
  },
  studentName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 5,
  },
  school: {
    fontSize: 14,
    color: '#666',
    marginBottom: 3,
  },
  details: {
    fontSize: 12,
    color: '#888',
  },
  selectButton: {
    backgroundColor: '#64a8d1',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 5,
    minWidth: 80,
    alignItems: 'center',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  selectButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
});

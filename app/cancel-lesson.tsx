import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput, ScrollView, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, useLocalSearchParams } from 'expo-router';
import Header from '../components/Header';
import Footer from '../components/Footer';
import { useAuth } from './contexts/AuthContext';
import { useLanguage } from './contexts/LanguageContext';
import { translations } from './lib/i18n';
import { appSaveLessonCancellation } from './lib/wixApi';
import { styles } from './cancel-lesson-styles';
export default function CancelLessonScreen() {
  const params = useLocalSearchParams();
  const { date, time, title, lessonData } = params;
  const { wixData, chosenIndex, setWixData } = useAuth();
  const { language } = useLanguage();
  const t = translations[language];
  
  const [selectedReason, setSelectedReason] = useState('');
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [emailError, setEmailError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [parsedLessonData, setParsedLessonData] = useState(null);

  const reasons = [
    { label: t.iAmSick, value: 'SK' },
    { label: t.iWillBeAway, value: 'SA' }
  ];

  useEffect(() => {
    if (lessonData) {
      try {
        const parsed = typeof lessonData === 'string' ? JSON.parse(lessonData) : lessonData;
        setParsedLessonData(parsed);
        
        if (parsed.isEdit && parsed.status) {
          setIsEdit(true);
          if (parsed.status === 'SK') {
            setSelectedReason('SK');
          } else if (parsed.status === 'SA') {
            setSelectedReason('SA');
          }
          
          if (parsed.bemerkungAbsenz) {
            setRemarks(parsed.bemerkungAbsenz);
          }
        }
      } catch (error) {
        console.error('Error parsing lesson data:', error);
      }
    }
  }, [lessonData]);

  const handleCancellationAction = async (isRemoval = false) => {
    if (!selectedReason) {
      Alert.alert('Error', t.selectReasonError);
      return;
    }
    if (!wixData || !wixData.options || !wixData.options[chosenIndex]) {
      Alert.alert('Error', t.studentDataError);
      return;
    }

    if (!parsedLessonData) {
      Alert.alert('Error', t.lessonDataError);
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setEmailError('');
    
    try {
      const studentData = wixData.options[chosenIndex].studentData;
      
      const result = await appSaveLessonCancellation(
        studentData._id,
        parsedLessonData,
        selectedReason,
        remarks,
        isRemoval,
        language
      );
      
      if (result && result.journalChangeObj) {
        const { error, emailStatus } = result.journalChangeObj;
        
        if (error !== "ok") {
          setErrorMessage(result.journalChangeObj.error || 'Unknown error occurred');
          return;
        }
        
        if (result.journalChangeObj.newLessonData && result.journalChangeObj.newLessonData.futureLessons && wixData.options[chosenIndex]) {
          const updatedWixData = { ...wixData };
          if (updatedWixData.options[chosenIndex].lessonsData) {
            updatedWixData.options[chosenIndex].lessonsData = {
              ...updatedWixData.options[chosenIndex].lessonsData,
              futureLessons: result.journalChangeObj.newLessonData.futureLessons
            };
          } else {
            updatedWixData.options[chosenIndex].lessonsData = {
              futureLessons: result.journalChangeObj.newLessonData.futureLessons,
              nextAufgaben: ''
            };
          }
          setWixData(updatedWixData);
        }
        
        if (emailStatus === "sent") {
          setShowSuccess(true);
          setTimeout(() => {
            router.push('/(tabs)/');
          }, 2000);
        } else {
          setEmailError(t.emailError);
          setTimeout(() => {
            router.push('/(tabs)/');
          }, 3000);
        }
      } else {
        setErrorMessage(t.unexpectedResponseError);
      }
    } catch (error) {
      console.error('Error cancelling lesson:', error);
      setErrorMessage(t.cancellationFailedError);
    } finally {
      setLoading(false);
    }
  };

  const selectReason = (value: string) => {
    setSelectedReason(value);
    setShowDropdown(false);
  };

  const getSelectedLabel = () => {
    const reason = reasons.find(r => r.value === selectedReason);
    return reason ? reason.label : t.selectReason;
  };

  return (
    <View style={styles.container}>
      <Header />
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>

        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={24} color="#64a8d1" />
           <Text style={styles.backText}>{t.back}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{t.cancelLessonTitle}</Text>
        
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}
        
        {emailError ? (
          <View style={styles.emailErrorContainer}>
            <Text style={styles.emailErrorText}>{emailError}</Text>
          </View>
        ) : null}
        
        {showSuccess ? (
          <View style={styles.successContainer}>
            <Text style={styles.successText}>{t.emailSent}</Text>
          </View>
        ) : null}
        
        <View style={styles.lessonInfo}>
          <Text style={styles.lessonDate}>{date}</Text>
          <Text style={styles.lessonTime}>{time}</Text>
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>{t.selectReasonCancellation}</Text>
          <TouchableOpacity 
            style={styles.dropdown}
            onPress={() => setShowDropdown(!showDropdown)}
          >
            <Text style={[styles.dropdownText, !selectedReason && styles.placeholder]}>
              {getSelectedLabel()}
            </Text>
            <Ionicons 
              name={showDropdown ? "chevron-up" : "chevron-down"} 
              size={20} 
              color="#666" 
            />
          </TouchableOpacity>
          
          {showDropdown && (
            <View style={styles.dropdownOptions}>
              {reasons.map((reason) => (
                <TouchableOpacity
                  key={reason.value}
                  style={styles.dropdownOption}
                  onPress={() => selectReason(reason.value)}
                >
                  <Text style={styles.dropdownOptionText}>{reason.label}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>

        <View style={styles.formSection}>
          <Text style={styles.sectionTitle}>{t.remarksAboutCancellation}</Text>
          <TextInput
            style={styles.textInput}
            multiline
            numberOfLines={4}
            value={remarks}
            onChangeText={setRemarks}
            placeholder={t.enterRemarks}
            placeholderTextColor="#999"
          />
        </View>

        <TouchableOpacity 
          style={[styles.sendButton, loading && styles.sendButtonDisabled]}
          onPress={() => handleCancellationAction(false)}
          disabled={loading}
        >
          <Text style={styles.sendButtonText}>
            {loading ? t.sending : t.send}
          </Text>
        </TouchableOpacity>

        {isEdit && (
          <TouchableOpacity 
            style={[styles.sendButton, { backgroundColor: '#dc3545', marginTop: 10 }, loading && styles.sendButtonDisabled]}
            onPress={() => handleCancellationAction(true)}
            disabled={loading}
          >
            <Text style={styles.sendButtonText}>
              {loading ? t.processing : t.removeCancellation}
            </Text>
          </TouchableOpacity>
        )}

        <Text style={styles.disclaimer}>
          {isEdit ? t.teacherNotificationRemove : t.teacherNotificationSend}
        </Text>
      </ScrollView>
      <Footer />
    </View>
  );
}
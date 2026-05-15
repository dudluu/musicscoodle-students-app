import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';

import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/app/lib/supabase';
import { savePassword } from '@/app/lib/wixApi';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';

interface StudentData {
  vorname: string;
  nachname: string;
  email: string;
}

export default function RegisterScreen() {
  const { t, language } = useLanguage();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(false);
  const [verifyLoading, setVerifyLoading] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState<'none' | 'ok' | 'fail' | 'multiple'>('none');
  const [studentData, setStudentData] = useState<StudentData[]>([]);
  const [registrationMessage, setRegistrationMessage] = useState<{type: 'success' | 'error', text: string} | null>(null);
  // Reset verification status when email changes
  const handleEmailChange = (newEmail: string) => {
    setEmail(newEmail);
    // Reset verification state if email changes
    if (newEmail !== email) {
      setVerificationStatus('none');
      setStudentData([]);
      setRegistrationMessage(null); // Clear any registration messages
    }
  };

  // Check if email is valid
  const isEmailValid = () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
  };

  // Check if password meets requirements
  const isPasswordValid = () => {
    return password.length >= 6;
  };

  const handleVerifyEmail = async () => {
    if (!email.trim()) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }

    setVerifyLoading(true);
    setRegistrationMessage(null); // Clear any previous messages
    
    try {
      // Use direct API call to appGetCredentials
      const response = await fetch('https://www.musicscoodle.com/_functions-dev/appGetCredentials', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email
        })
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      console.log('appGetCredentials response:', data);
      
      const { sData, status } = data;

      // Only show "no students found" error if status is "fail"
      if (status === 'fail') {
        const errorMsg = language === 'de' 
          ? 'Kein Schüler mit dieser Email in der Datenbank Deiner Lehrperson gefunden'
          : 'No students found in your teachers database with this email.';
        setRegistrationMessage({
          type: 'error',
          text: errorMsg
        });
        setVerificationStatus('fail');
        return;
      }

      // If status is "ok" or "multiple", iterate through sData array
      if (status === 'ok' || status === 'multiple') {
        if (sData && sData.length > 0) {
          // Check if all students already have passwords
          const allHavePasswords = sData.every(student => 
            student.appPw && student.appPw !== null && student.appPw.length >= 1
          );

          if (allHavePasswords) {
            // All students already registered - show error message
            const errorMsg = language === 'de'
              ? 'Diese Email ist bereits registriert. Bitte einloggen'
              : 'This email is already registered. Please log in';
            setRegistrationMessage({
              type: 'error',
              text: errorMsg
            });
            // Don't change verification status - keep it as received from API
            setVerificationStatus('none'); // Reset to allow re-verification
            return;
          }

          // Some students need registration - show advisory message and password field
          setStudentData(sData || []);
          setVerificationStatus(status);
          
          // Only set advisory message if there are multiple students
          if (sData.length > 1) {
            const advisoryMsg = language === 'de'
              ? 'Alle Schüler mit dieser Email werden das neue Passwort brauchen'
              : 'All students registered with this email will use the new password';
            setRegistrationMessage({
              type: 'success',
              text: advisoryMsg
            });
          }
        }
      }

    } catch (error) {
      console.error('Verification error:', error);
      Alert.alert(t('error'), 'Verification failed');
    } finally {
      setVerifyLoading(false);
    }
  };

  const handleRegister = async () => {
    console.log("handleRegister function called!");
    console.log("email:", email);
    console.log("password:", password ? "***" : "empty");
    console.log("verificationStatus:", verificationStatus);
    
    if (!email || !password) {
      console.log("Missing email or password");
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }

    if (password.length < 6) {
      console.log("Password too short");
      Alert.alert(t('error'), t('passwordMinChars'));
      return;
    }

    console.log("Starting registration process...");
    setLoading(true);
    try {
      // Use the savePassword function from wixApi.ts instead of direct fetch
      console.log("Calling savePassword with email and password...");
      const data = await savePassword(email, password);
      console.log("returned data from savePassword:", data);
      console.log("data.status:", data.status);
      console.log("data.status === 'ok':", data.status === 'ok');
      if (data.status === 'ok') {
        console.log("Registration successful!");
        
        // Set success message in state
        setRegistrationMessage({
          type: 'success',
          text: language === 'de' 
            ? 'Registrierung erfolgreich! Sie können sich jetzt anmelden.' 
            : 'Registration successful! You may log in now.'
        });
        
        // Clear form after 3 seconds and redirect to login
        setTimeout(() => {
          setStudentData([]);
          setVerificationStatus('none');
          setEmail('');
          setPassword('');
          setRegistrationMessage(null);
          router.replace('/auth/login');
        }, 3000);
        
      } else {
        // Set error message in state
        setRegistrationMessage({
          type: 'error',
          text: language === 'de' 
            ? `Registrierung hat nicht funktioniert. Grund: ${data.status}`
            : `Registration failed. Reason: ${data.status}`
        });
      }
      
    } catch (error) {
      console.error('Password saving error:', error);
      setRegistrationMessage({
        type: 'error',
        text: language === 'de' 
          ? `Registration war nicht erfolgreich. Status: ${error}`
          : `Registration failed. Status: ${error}`
      });
    } finally {
      setLoading(false);
    }
  };

  const getStatusMessage = () => {
    const emailPlaceholder = email || 'EMAIL_PLACEHOLDER';
    const studentNames = studentData.map(s => `${s.vorname} ${s.nachname}`).join(', ');
    
    switch (verificationStatus) {
      case 'fail':
        return t('noStudentFoundWithEmail').replace('EMAIL_PLACEHOLDER', emailPlaceholder);
      case 'multiple':
        return t('multipleEntriesFound')
          .replace('LIST_OF_STUDENTS', studentNames)
          .replace('EMAIL_PLACEHOLDER', emailPlaceholder);
      case 'ok':
        // Only show message if more than 1 student
        if (studentData.length > 1) {
          return t('multipleEntriesFound')
            .replace('LIST_OF_STUDENTS', studentNames)
            .replace('EMAIL_PLACEHOLDER', emailPlaceholder);
        }
        return '';
      default:
        return '';
    }
  };
  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}

      >

        <Image 
          source={{ uri: 'https://d64gsuwffb70l.cloudfront.net/687540bb2bcf8d2e01e60ef8_1752567128415_d358ed18.jpg' }}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <Text style={styles.title}>{t('registerTitle')}</Text>
        
        <TextInput
          style={styles.input}
          placeholder={t('email')}
          placeholderTextColor="#666"
          value={email}
          onChangeText={handleEmailChange}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        
        {verificationStatus === 'none' && (
          <TouchableOpacity 
            style={[
              styles.button, 
              verifyLoading && styles.buttonDisabled,
              !verifyLoading && isEmailValid() ? styles.buttonActive : styles.buttonInactive
            ]} 
            onPress={handleVerifyEmail}
            disabled={verifyLoading || !isEmailValid()}
          >
            <Text style={[
              styles.buttonText,
              !verifyLoading && isEmailValid() ? styles.buttonTextActive : styles.buttonText
            ]}>
              {verifyLoading ? t('verifying') : t('verifyEmail')}
            </Text>
          </TouchableOpacity>
        )}

        {verificationStatus === 'fail' && (
          <>
            <Text style={styles.errorMessage}>{getStatusMessage()}</Text>
            <TouchableOpacity 
              style={[
                styles.button, 
                verifyLoading && styles.buttonDisabled,
                !verifyLoading && isEmailValid() ? styles.buttonActive : styles.buttonInactive
              ]} 
              onPress={handleVerifyEmail}
              disabled={verifyLoading || !isEmailValid()}
            >
              <Text style={[
                styles.buttonText,
                !verifyLoading && isEmailValid() ? styles.buttonTextActive : styles.buttonText
              ]}>
                {verifyLoading ? t('verifying') : t('verifyEmail')}
              </Text>
            </TouchableOpacity>
          </>
        )}

        {(verificationStatus === 'multiple' || verificationStatus === 'ok') && (
          <>
            {/* Only show advisory message if there's a message to show */}
            {getStatusMessage() && (
              <Text style={styles.successMessage}>{getStatusMessage()}</Text>
            )}
            
            <View style={styles.passwordContainer}>
              <TextInput
                style={styles.passwordInput}
                placeholder={t('passwordMinChars')}
                placeholderTextColor="#666"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardAppearance="light"
                selectionColor="#64a8d1"
                underlineColorAndroid="transparent"
              />
              {password.length > 0 && (
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off' : 'eye'}
                    size={24}
                    color="#666"
                  />
                </TouchableOpacity>
              )}
            </View>



            <TouchableOpacity 
              style={[
                styles.button, 
                (loading || !isPasswordValid()) && styles.buttonDisabled,
                isPasswordValid() ? styles.buttonActive : styles.buttonInactive
              ]} 
              onPress={handleRegister}
              disabled={loading || !isPasswordValid()}
            >
              <Text style={[
                styles.buttonText, 
                isPasswordValid() ? styles.buttonTextActive : styles.buttonText
              ]}>
                {loading ? t('creatingAccount') : t('register')}
              </Text>
            </TouchableOpacity>
          </>
        )}
        
        {/* Registration Message Card */}
        {registrationMessage && (
          <View style={[
            styles.messageCard,
            registrationMessage.type === 'success' ? styles.successCard : styles.errorCard
          ]}>
            <Text style={[
              styles.messageText,
              registrationMessage.type === 'success' ? styles.successText : styles.errorText
            ]}>
              {registrationMessage.text}
            </Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => router.push('/auth/login')}
        >
          <Text style={styles.linkText}>{t('alreadyHaveAccount')}</Text>
        </TouchableOpacity>
        <View style={styles.languageContainer}>
          <LanguageSelector />
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#64a8d1',
  },
  scrollContent: {
    flexGrow: 1,
    padding: 20,
    paddingBottom: 40,
  },
  languageContainer: {
    alignSelf: 'center',
    width: 80,
    marginTop: 20,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 20,
    marginTop: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: 'white',
  },
  studentInfo: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  studentInfoText: {
    color: 'white',
    fontSize: 16,
    marginBottom: 5,
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#000',
  },

  passwordContainer: {
    position: 'relative',
    marginBottom: 15,
  },
  passwordInput: {
    backgroundColor: 'white',
    padding: 15,
    paddingRight: 50,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#000',
  },
  eyeIcon: {
    position: 'absolute',
    right: 15,
    top: 15,
    zIndex: 1,
  },

  button: {
    backgroundColor: '#B8D4F0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonActive: {
    backgroundColor: '#dc3545',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#64a8d1',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonTextActive: {
    color: 'white',
  },
  linkButton: {
    padding: 10,
    marginBottom: 20,
  },
  linkText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  advisoryText: {
    color: 'white',
    fontSize: 12,
    textAlign: 'center',
    marginBottom: 15,
    lineHeight: 16,
    paddingHorizontal: 10,
  },
  qrButton: {
    backgroundColor: '#B8D4F0',
    padding: 12,
    borderRadius: 8,
    marginBottom: 20,
  },
  qrButtonText: {
    color: '#64a8d1',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
  },
  successMessage: {
    color: '#28a745',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 8,
  },
  errorMessage: {
    color: '#dc3545',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 15,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 10,
    borderRadius: 8,
  },
  studentOption: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  studentName: {
    fontSize: 16,
    color: '#333',
    flex: 1,
  },
  selectButton: {
    backgroundColor: '#28a745',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 5,
  },
  selectButtonText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
  },
  messageCard: {
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    borderWidth: 1,
  },
  successCard: {
    backgroundColor: '#d4edda',
    borderColor: '#28a745',
  },
  errorCard: {
    backgroundColor: '#f8d7da',
    borderColor: '#dc3545',
  },
  messageText: {
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '500',
  },
  successText: {
    color: '#28a745',
  },
  errorText: {
    color: '#dc3545',
  },
});
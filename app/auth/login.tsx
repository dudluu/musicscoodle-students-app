import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator, Linking, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Constants from 'expo-constants';

import { router } from 'expo-router';
import { supabase } from '@/app/lib/supabase';
import { getCredentials, fetchAppData, savePassword, sendEmailToUser } from '@/app/lib/wixApi';
import { useAuth } from '../contexts/AuthContext';
import { useLanguage } from '../contexts/LanguageContext';
import LanguageSelector from '@/components/LanguageSelector';
import { studentListStyles } from './login-styles';

const APP_VERSION = Constants.expoConfig?.version ?? Constants.manifest?.version ?? '2.0.0';

export default function LoginScreen() {
  const { t, language } = useLanguage();
  const { setWixData } = useAuth();
  const insets = useSafeAreaInsets();
  const [email, setEmail] = useState('');

  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [loadingData, setLoadingData] = useState(false);

  const [resetStatus, setResetStatus] = useState('');
  const [resetLoading, setResetLoading] = useState(false);
  const [students, setStudents] = useState<any[]>([]);
  const [showStudentList, setShowStudentList] = useState(false);
  const [selectedStudentIndex, setSelectedStudentIndex] = useState<number | null>(null);
  const [registeringStudentIndex, setRegisteringStudentIndex] = useState<number | null>(null);


  const clearForm = () => {
    setEmail('');
    setPassword('');
  };

  const getErrorMessage = (status: string, email: string, fullName: string) => {
    switch (status) {
      case 'noStudent':
        return `No student with the email ${email} found. Please contact your teacher and check if he has registered you in MusicScoodle with this email address.`;
      case 'noMatchingStudent':
        return `Your teacher has registered students with the email ${email}. But your name was not found among the students with this email. Please contact your teacher and check if he has registered you in MusicScoodle with the name ${fullName}.`;
      case 'noMusicscoodle':
        return 'Your teacher has no pricing plan on MusicScoodle. You can not use this app. Why not suggesting your teacher to check out musicscoodle.com?';
      case 'noValidMusicscoodle':
        return 'Your teacher has no valid pricing plan on MusicScoodle. You can not use this app. Why not suggesting your teacher to check out musicscoodle.com and purchase a pricing plan?';
      default:
        return 'An error occurred. Please try again.';
    }
  };



  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert(t('error'), t('fillAllFields'));
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert(t('error'), 'Please enter a valid email address');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    
    try {
      console.log('Attempting login with:', email.trim().toLowerCase());
      
      // Call getCredentials to get student data
      // Call getCredentials to get student data
      const credentialsResponse = await getCredentials(email.trim().toLowerCase(), password);
      console.log('appGetCredentials response:', credentialsResponse);
      
      // Check if we have valid credentials data (credentialsResponse is an array)
      // Check if we have valid credentials data (credentialsResponse is an array)
      if (Array.isArray(credentialsResponse) && credentialsResponse.length > 0) {
        // Check if any student has appPw as null or undefined
        const hasNullPassword = credentialsResponse.some((student: any) => 
          student.appPw === null || student.appPw === undefined
        );
        
        if (hasNullPassword) {
          // Email found but no password set - show registration error
          const errorMsg = language === 'de' 
            ? 'Diese Email ist nicht registriert. Bitte registrieren!'
            : 'This Email is not registered. Please register';
          setErrorMessage(errorMsg);
          setShowStudentList(false);
          setStudents([]);
          return;
        }
        
        // Check if ANY student has matching password
        const hasMatchingPassword = credentialsResponse.some((student: any) => student.appPw === password);
        
        if (!hasMatchingPassword) {
          // No student has matching password - show wrong password error
          const errorMsg = language === 'de' 
            ? 'Falsches Passwort!'
            : 'Wrong password!';
          setErrorMessage(errorMsg);
          setShowStudentList(false);
          setStudents([]);
          return;
        }
        // At least one student has matching password
        if (credentialsResponse.length === 1) {
          // Single student with matching password - go directly to appData
          console.log('Single student with matching password - proceeding:', credentialsResponse[0]);
          
          setLoadingData(true);
          setLoading(false); // Stop login loading, start data loading
          
          try {
            const firstStudent = credentialsResponse[0];
            const studentName = `${firstStudent.vorname} ${firstStudent.nachname}`;
            
            console.log('Calling fetchAppData with:', { email: email.trim().toLowerCase(), studentName });
            
            // Call appData with first student info
            const appDataResponse = await fetchAppData(email.trim().toLowerCase(), studentName, firstStudent._id);
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
            setLoadingData(false);
          }
        } else {
          // Multiple students with at least one matching password - show selection list
          console.log('Multiple students found with matching password:', credentialsResponse);
          setStudents(credentialsResponse);
          setShowStudentList(true);
        }
        
      } else {
        console.log('No valid response or no students found');
        const errorMsg = language === 'de' 
          ? `Kein Schüler mit der Email ${email.trim().toLowerCase()} gefunden`
          : `No student found with email ${email.trim().toLowerCase()}`;
        setErrorMessage(errorMsg);
      }
    } catch (error) {
      console.error('Unexpected login error:', error);
      Alert.alert(t('error'), t('unexpectedError'));
    } finally {
      setLoading(false);
    }
  };
  const handleSelectStudent = async (selectedStudent: any, index: number) => {
    setSelectedStudentIndex(index);
    setLoadingData(true);
    
    try {
      console.log('Selected student:', selectedStudent);
      const studentName = `${selectedStudent.vorname} ${selectedStudent.nachname}`;
      
      console.log('Calling fetchAppData with:', { email: email.trim().toLowerCase(), studentName });
      
      // Call appData with selected student info
      const appDataResponse = await fetchAppData(email.trim().toLowerCase(), studentName, selectedStudent._id);
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
      setLoadingData(false);
      setSelectedStudentIndex(null);
    }
  };

  const handleRegisterStudent = async (student: any, index: number) => {
    setRegisteringStudentIndex(index);
    
    try {
      console.log('Registering student:', student);
      
      // Call savePassword (appSavePassword) with email and password
      const savePasswordResponse = await savePassword(email.trim().toLowerCase(), password);
      console.log('appSavePassword response:', savePasswordResponse);
      
      if (savePasswordResponse?.status === 'ok') {
        // Update the student in the local state to mark as having valid password
        const updatedStudents = students.map((s, i) => 
          i === index ? { ...s, appPw: password } : s
        );
        setStudents(updatedStudents);
        
        // Now the button should appear as a normal red button
        console.log('Password saved successfully for student:', student);
      } else if (savePasswordResponse?.status === 'fail') {
        // Show error message from the response
        const errorMsg = savePasswordResponse.message || 'Registration failed. Please try again.';
        Alert.alert('Registration Error', errorMsg);
      } else {
        Alert.alert('Error', 'Failed to register student. Please try again.');
      }
    } catch (error: any) {
      console.error('Error registering student:', error);
      
      // Handle badRequest or other errors
      let errorMsg = 'Failed to register student. Please try again.';
      if (error?.message) {
        errorMsg = error.message;
      } else if (error?.response?.data?.message) {
        errorMsg = error.response.data.message;
      }
      
      Alert.alert('Registration Error', errorMsg);
    } finally {
      setRegisteringStudentIndex(null);
    }
  };
  // Check if login button should be red - email must be filled and password must be at least 6 characters
  const isLoginButtonActive = email.trim() && password.trim() && password.length >= 6;
  


  if (loadingData) {
    return (
      <View style={styles.loadingContainer}>
        <Image 
          source={{ uri: 'https://d64gsuwffb70l.cloudfront.net/687540bb2bcf8d2e01e60ef8_1752567128415_d358ed18.jpg' }}
          style={styles.logo}
          resizeMode="contain"
        />
        <ActivityIndicator size="large" color="#64a8d1" style={styles.spinner} />
        <Text style={styles.loadingText}>{t('dataLoading')}</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 30, paddingBottom: insets.bottom + 40 },
        ]}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}

      >

        <Image 
          source={{ uri: 'https://d64gsuwffb70l.cloudfront.net/687540bb2bcf8d2e01e60ef8_1752567128415_d358ed18.jpg' }}
          style={styles.logo}
          resizeMode="contain"
        />
        
        <Text style={styles.loginTitle}>{t('loginTitle')}</Text>
        
        {errorMessage ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{errorMessage}</Text>
          </View>
        ) : null}
        
        <TextInput
          style={styles.input}
          placeholder={t('email')}
          placeholderTextColor="#666"
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            // Clear reset status when email changes
            if (resetStatus) {
              setResetStatus('');
            }
            // Clear student list when email changes
            if (showStudentList) {
              setShowStudentList(false);
              setStudents([]);
            }
          }}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          keyboardAppearance="light"
          selectionColor="#64a8d1"
          underlineColorAndroid="transparent"
        />


        <View style={styles.passwordContainer}>
          <TextInput
            style={styles.passwordInput}
            placeholder={t('password')}
            placeholderTextColor="#666"
            value={password}
            onChangeText={(text) => {
              setPassword(text);
              // Clear reset status when password changes
              if (resetStatus) {
                setResetStatus('');
              }
            }}
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


        
        
        
        {resetStatus && (
          <View style={[
            styles.statusContainer, 
            resetStatus.includes('konnte nicht gesendet werden') || resetStatus.includes('send failed') || resetStatus.includes('Error') 
              ? styles.errorContainer 
              : styles.successContainer
          ]}>
            <Text style={[
              styles.statusText, 
              resetStatus.includes('konnte nicht gesendet werden') || resetStatus.includes('send failed') || resetStatus.includes('Error')
                ? styles.errorText 
                : styles.successText
            ]}>
              {resetStatus}
            </Text>
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.forgotPasswordButton}
          onPress={async () => {
            if (!email.trim()) {
              setResetStatus(t('noEmailAvailable'));
              return;
            }
            
            // Show initial sending message
            const isGerman = language === 'de';
            const sendingMessage = isGerman 
              ? "Passwort-Änderungs-Link wird an Deine Email gesendet..."
              : "Password change request is being sent to your email...";
            
            setResetStatus(sendingMessage);
            setResetLoading(true);
            
            try {
              // Determine subject and body based on language
              const subject = isGerman 
                ? "MusicScoodle Students App Passwort-Änderung"
                : "MusicScoodle Students App Password change request";
              
              const emailBody = isGerman
                ? `Du hast eine Passwort-Änderung in der App MusicScoodle Student angefordert.<br>Um Dein Passwort zu ändern klicke auf den untenstehenden Link:<br>LINK = https://www.musicscoodle.com/apppwchange?email=${email.trim().toLowerCase()}`
                : `You have requested a change of password in the MusicScoodle Student App.<br>Follow this link to change the password:<br>LINK = https://www.musicscoodle.com/apppwchange?email=${email.trim().toLowerCase()}`;

              // Call the Wix function to send email
              const response = await sendEmailToUser(email.trim().toLowerCase(), subject, emailBody, language);
              
              // Check response and show appropriate message
              if (response?.ok === true) {
                const successMessage = isGerman
                  ? "Passwort Änderungslink wurde versandt. Überprüfe Deine Emails!"
                  : "Password change request link has been sent. Check your emails!";
                setResetStatus(successMessage);
              } else {
                const errorMessage = isGerman
                  ? "Email konnte nicht gesendet werden. Versuche es noch einmal."
                  : "Email send failed. Try again.";
                setResetStatus(errorMessage);
              }
            } catch (error) {
              console.error('Error sending password reset email:', error);
              const errorMessage = isGerman
                ? "Email konnte nicht gesendet werden. Versuche es noch einmal."
                : "Email send failed. Try again.";
              setResetStatus(errorMessage);
            } finally {
              setResetLoading(false);
            }
          }}
          disabled={resetLoading}
        >
          <Text style={styles.forgotPasswordText}>
            {resetLoading ? '...' : t('passwordForgotten')}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[
            styles.button, 
            loading && styles.buttonDisabled,
            isLoginButtonActive && styles.buttonActive
          ]} 
          onPress={handleLogin}
          disabled={loading}
        >
          <Text style={[
            styles.buttonText,
            isLoginButtonActive && styles.buttonTextActive
          ]}>
            {loading ? t('loggingIn') : t('login')}
          </Text>
        </TouchableOpacity>
        

        
        {/* Student List Section */}
        {/* Student List Section */}
        {showStudentList && students.length > 0 && (
          <View style={studentListStyles.studentListContainer}>
            <Text style={studentListStyles.studentListTitle}>
              {language === 'de' ? 'Wähle den Schüler' : 'Choose the student'}
            </Text>
            <Text style={studentListStyles.studentListSubtitle}>
              {language === 'de' 
                ? 'Mehrere Schüler unter dieser Email gefunden. Wähle den Schüler, den Du verwenden willst:' 
                : 'Multiple students found with this email. Please select one:'}
            </Text>
            {students.map((student, index) => {
              const hasValidPassword = student.appPw && student.appPw.trim() !== '';
              const studentName = `${student.vorname} ${student.nachname}`;
              
              return (
                <View key={index} style={studentListStyles.studentCard}>
                  <TouchableOpacity
                    style={[
                      studentListStyles.selectStudentButton, 
                      (selectedStudentIndex === index || registeringStudentIndex === index) && styles.buttonDisabled,
                      !hasValidPassword && studentListStyles.registerButton
                    ]}
                    onPress={() => hasValidPassword ? handleSelectStudent(student, index) : handleRegisterStudent(student, index)}
                    disabled={selectedStudentIndex !== null || registeringStudentIndex !== null}
                  >
                    {selectedStudentIndex === index || registeringStudentIndex === index ? (
                      <ActivityIndicator size="small" color="white" />
                    ) : (
                       <Text style={studentListStyles.selectStudentButtonText}>
                         {hasValidPassword ? (
                           language === 'de' 
                             ? `${studentName} verwenden`
                             : `Use ${studentName}`
                         ) : (
                           language === 'de'
                             ? `${studentName} registrieren`
                             : `Register ${studentName}`
                         )}
                       </Text>
                    )}
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        )}
        
        <TouchableOpacity 
          style={styles.linkButton}
          onPress={() => router.push('/auth/register')}
        >
          <Text style={styles.linkText}>{t('registerLink')}</Text>
        </TouchableOpacity>
        
        <Text style={styles.sectionTitle}>{t('whatIsMusicScoodle')}</Text>
        
        <Text style={styles.infoText}>
          {t('musicScoodleDescription')}
        </Text>
        

        
        
        <View style={styles.languageContainer}>
          <LanguageSelector />
        </View>
        
        <Text style={styles.versionText}>{APP_VERSION}</Text>


      </ScrollView>
    </View>
  );

}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#64a8d1',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#64a8d1',
  },
  languageContainer: {
    alignSelf: 'center',
    marginTop: 30,
    marginBottom: 20,
    width: 120,
  },
  scrollContent: {
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  logo: {
    width: 160,
    height: 160,
    alignSelf: 'center',
    marginBottom: 20,
  },
  spinner: {
    marginVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  loginTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: 'white',
  },
  errorContainer: {
    backgroundColor: '#ffebee',
    borderColor: '#f44336',
    borderWidth: 1,
    borderRadius: 8,
    padding: 15,
    marginBottom: 15,
  },
  errorText: {
    color: '#d32f2f',
    fontSize: 14,
    marginBottom: 10,
    textAlign: 'center',
  },
  editButton: {
    backgroundColor: '#64a8d1',
    padding: 8,
    borderRadius: 5,
    alignSelf: 'center',
  },
  editButtonText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
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
    marginBottom: 60,
  },
  linkText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
  sectionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 15,
  },
  infoText: {
    color: 'white',
    fontSize: 14,
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  smallInput: {
    backgroundColor: 'white',
    padding: 10,
    marginBottom: 10,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    fontSize: 14,
  },
  emailButton: {
    backgroundColor: '#B8D4F0',
    padding: 12,
    borderRadius: 6,
    marginTop: 10,
  },
  emailButtonActive: {
    backgroundColor: '#dc3545',
  },
  emailButtonText: {
    color: '#64a8d1',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: 'bold',
  },
  emailButtonTextActive: {
    color: 'white',
  },
  forgotPasswordButton: {
    alignSelf: 'center',
    marginBottom: 10,
  },
  forgotPasswordText: {
    color: 'white',
    fontSize: 12,
    textDecorationLine: 'underline',
  },
  statusContainer: {
    borderRadius: 8,
    padding: 10,
    marginBottom: 10,
  },
  successContainer: {
    backgroundColor: '#e8f5e8',
    borderColor: '#4caf50',
    borderWidth: 1,
  },
  statusText: {
    fontSize: 12,
    textAlign: 'center',
  },
  successText: {
    color: '#2e7d32',
  },
  versionText: {
    color: 'white',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
});
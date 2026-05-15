import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image, ActivityIndicator } from 'react-native';
import { router } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getCredentials, fetchWixData } from '../lib/wixApi';
import { localStorage } from '../lib/localStorage';
import { useLanguage } from '../contexts/LanguageContext';

export default function LoginNewScreen() {
  const insets = useSafeAreaInsets();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [loadingData, setLoadingData] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { t } = useLanguage();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setErrorMessage(t('pleaseEnterEmailAndPassword'));
      return;
    }

    setLoading(true);
    setErrorMessage('');
    
    try {
      console.log('Calling appGetCredentials...');
      setLoadingData(true);
      
      const credentialsResponse = await getCredentials(email.trim().toLowerCase(), password);
      console.log('appGetCredentials response:', credentialsResponse);
      
      if (credentialsResponse.status === 'ok') {
        console.log('Authentication successful, fetching data...');
        
        try {
          const wixResponse = await fetchWixData(email.trim().toLowerCase(), email.split('@')[0]);
          console.log('fetchWixData response:', wixResponse);
          
          if (wixResponse.status === 'ok' || wixResponse.status === 'okMulti') {
            // Store user data locally
            await localStorage.setUser({
              email: email.trim().toLowerCase(),
              selectedAccountIndex: 0,
              selectedAccountData: null,
              wixData: wixResponse
            });
            
            if (wixResponse.status === 'okMulti') {
              router.replace({
                pathname: '/auth/choose-user',
                params: { 
                  email: email.trim().toLowerCase(),
                  password: password
                }
              });
            } else {
              router.replace('/(tabs)');
            }
          } else {
            setErrorMessage(`No student with email ${email} found. Please contact your teacher.`);
          }
        } catch (dataError) {
          console.error('Error fetching data:', dataError);
          setErrorMessage('Failed to load student data. Please try again.');
        }
      } else {
        setErrorMessage('Invalid credentials. Please check your email and password.');
      }
    } catch (error) {
      console.error('Login error:', error);
      setErrorMessage('Unable to connect to server. Please check your internet connection and try again.');
    } finally {
      setLoading(false);
      setLoadingData(false);
    }
  };

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
    <View style={[styles.container, { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }]}>

      <Image 
        source={{ uri: 'https://d64gsuwffb70l.cloudfront.net/687540bb2bcf8d2e01e60ef8_1752567128415_d358ed18.jpg' }}
        style={styles.logo}
        resizeMode="contain"
      />
      
      <Text style={styles.title}>{t('loginTitle')}</Text>
      
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
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        autoCorrect={false}
        keyboardAppearance="light"
        selectionColor="#64a8d1"
        underlineColorAndroid="transparent"
       />
       
       <TextInput
         style={styles.input}
         placeholder={t('password')}
         placeholderTextColor="#666"
         value={password}
         onChangeText={setPassword}
         secureTextEntry
         autoCapitalize="none"
         autoCorrect={false}
         keyboardAppearance="light"
         selectionColor="#64a8d1"
         underlineColorAndroid="transparent"
       />

       
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? t('loggingIn') : t('login')}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.linkButton}
        onPress={() => router.push('/auth/register')}
      >
        <Text style={styles.linkText}>{t('registerLink')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#64a8d1',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#64a8d1',
  },
  logo: {
    width: 160,
    height: 160,
    alignSelf: 'center',
    marginBottom: 40,
  },
  spinner: {
    marginVertical: 20,
  },
  loadingText: {
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  title: {
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
    textAlign: 'center',
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
  button: {
    backgroundColor: '#dc3545',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  linkButton: {
    padding: 10,
  },
  linkText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
});
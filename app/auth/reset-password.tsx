import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, Image } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/app/lib/supabase';
import { useLanguage } from '../contexts/LanguageContext';
import * as Linking from 'expo-linking';

export default function ResetPasswordScreen() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const [loading, setLoading] = useState(false);
  const [sessionReady, setSessionReady] = useState(false);
  const params = useLocalSearchParams();

  useEffect(() => {
    // Handle tokens from URL hash and set session
    handlePasswordResetTokens();
  }, []);

  const handlePasswordResetTokens = async () => {
    try {
      // For web, use window.location to get the current URL with hash
      let currentUrl = '';
      if (typeof window !== 'undefined') {
        currentUrl = window.location.href;
      } else {
        // Fallback for mobile
        currentUrl = await Linking.getInitialURL() || '';
      }
      
      console.log('Reset password URL:', currentUrl);
      
      if (currentUrl && currentUrl.includes('#')) {
        const urlParts = currentUrl.split('#');
        if (urlParts.length > 1) {
          const fragment = urlParts[1];
          const urlParams = new URLSearchParams(fragment);
          
          const accessToken = urlParams.get('access_token');
          const refreshToken = urlParams.get('refresh_token');
          const type = urlParams.get('type');
          
          if (type === 'recovery' && accessToken) {
            console.log('Setting session from recovery tokens');
            
            const { error } = await supabase.auth.setSession({
              access_token: accessToken,
              refresh_token: refreshToken || ''
            });
            
            if (error) {
              console.error('Error setting session:', error);
              Alert.alert('Error', 'Invalid reset session. Please request a new password reset.');
              router.replace('/auth/login');
              return;
            }
            
            console.log('Session set successfully for password reset');
            setSessionReady(true);
            return;
          }
        }
      }
      
      // If no tokens in URL, check if we already have a valid session
      await checkResetSession();
    } catch (error) {
      console.error('Token handling error:', error);
      Alert.alert('Error', 'Invalid reset session. Please request a new password reset.');
      router.replace('/auth/login');
    }
  };

  const checkResetSession = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        Alert.alert('Error', 'Invalid reset session. Please request a new password reset.');
        router.replace('/auth/login');
      } else {
        setSessionReady(true);
      }
    } catch (error) {
      console.error('Reset session check error:', error);
      router.replace('/auth/login');
    }
  };

  const handleResetPassword = async () => {
    if (!password || !confirmPassword) {
      Alert.alert(t('error'), 'Please fill in both password fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert(t('error'), 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert(t('error'), 'Password must be at least 6 characters long');
      return;
    }

    setLoading(true);

    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        Alert.alert('Error', error.message);
      } else {
        Alert.alert(
          'Success', 
          'Password updated successfully!',
          [
            {
              text: 'OK',
              onPress: () => router.replace('/auth/login')
            }
          ]
        );
      }
    } catch (error) {
      console.error('Password reset error:', error);
      Alert.alert('Error', 'Failed to update password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={[styles.container, { paddingTop: insets.top + 30, paddingBottom: insets.bottom + 20 }]}>

      <Image 
        source={{ uri: 'https://d64gsuwffb70l.cloudfront.net/687540bb2bcf8d2e01e60ef8_1752567128415_d358ed18.jpg' }}
        style={styles.logo}
        resizeMode="contain"
      />
      
      <Text style={styles.title}>Reset Password</Text>
      <Text style={styles.subtitle}>Enter your new password</Text>
      
      <TextInput
        style={styles.input}
        placeholder="New Password"
        placeholderTextColor="#666"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        autoCapitalize="none"
        keyboardAppearance="light"
        selectionColor="#64a8d1"
        underlineColorAndroid="transparent"
      />
      
      <TextInput
        style={styles.input}
        placeholder="Confirm New Password"
        placeholderTextColor="#666"
        value={confirmPassword}
        onChangeText={setConfirmPassword}
        secureTextEntry
        autoCapitalize="none"
        keyboardAppearance="light"
        selectionColor="#64a8d1"
        underlineColorAndroid="transparent"
      />

      
      <TouchableOpacity 
        style={[styles.button, loading && styles.buttonDisabled]} 
        onPress={handleResetPassword}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? 'Updating...' : 'Update Password'}
        </Text>
      </TouchableOpacity>
      
      <TouchableOpacity 
        style={styles.linkButton}
        onPress={() => router.replace('/auth/login')}
      >
        <Text style={styles.linkText}>Back to Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#64a8d1',
    paddingHorizontal: 20,
    paddingTop: 60,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 30,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: 'white',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 30,
    color: 'white',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#000',
    fontSize: 16,
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
    textDecorationLine: 'underline',
  },
});
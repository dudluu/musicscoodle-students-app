import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Alert, Image, ScrollView } from 'react-native';
import { router, useLocalSearchParams } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { supabase } from '@/app/lib/supabase';
import { fetchWixData } from '@/app/lib/wixApi';
import { useLanguage } from '../contexts/LanguageContext';


interface User {
  id: string;
  email: string;
  full_name: string;
  first_name: string;
  last_name: string;
  original_email: string;
}

export default function ChooseUserScreen() {
  const { t } = useLanguage();
  const insets = useSafeAreaInsets();
  const { users: usersParam, password, originalEmail } = useLocalSearchParams();

  const users: User[] = usersParam ? JSON.parse(usersParam as string) : [];

  const handleSelectUser = async (user: User, password: string) => {
    try {
      // Use the unique auth email for login
      const { data, error } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: password,
      });

      if (error) {
        Alert.alert(t('loginError'), error.message);
        return;
      }

      if (data.user) {
        // Check Wix data
        const wixResponse = await fetchWixData(user.original_email, user.full_name);

        if (wixResponse.status !== 'ok' && wixResponse.status !== 'okMulti') {
          Alert.alert(t('error'), 'Unable to load student data');
          await supabase.auth.signOut();
          return;
        }

        router.replace('/(tabs)');
      }
    } catch (error) {
      console.error('Login error:', error);
      Alert.alert(t('error'), 'Login failed');
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        contentContainerStyle={[
          styles.scrollContent,
          { paddingTop: insets.top + 30, paddingBottom: insets.bottom + 30 },
        ]}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >

        <Image
          source={{ uri: 'https://d64gsuwffb70l.cloudfront.net/687540bb2bcf8d2e01e60ef8_1752567128415_d358ed18.jpg' }}
          style={styles.logo}
          resizeMode="contain"
        />

        <Text style={styles.title}>Choose Your Account</Text>
        <Text style={styles.subtitle}>Multiple accounts found for {originalEmail}</Text>

        {users.map((user) => (
          <TouchableOpacity
            key={user.id}
            style={styles.userOption}
            onPress={() => handleSelectUser(user, password as string)}
          >
            <Text style={styles.userName}>{user.full_name}</Text>
          </TouchableOpacity>
        ))}

        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Text style={styles.backButtonText}>Back to Login</Text>
        </TouchableOpacity>
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
    padding: 20,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 20,
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
  userOption: {
    backgroundColor: 'white',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
    color: '#333',
  },
  backButton: {
    backgroundColor: '#B8D4F0',
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
  },
  backButtonText: {
    color: '#64a8d1',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

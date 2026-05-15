import React from 'react';
import { View, Text, StyleSheet, Image, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../app/contexts/LanguageContext';
import { useAuth } from '../app/contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';

interface HeaderProps {
  title?: string;
  showLogo?: boolean;
}

const Header: React.FC<HeaderProps> = ({ title, showLogo = true }) => {
  const { t } = useLanguage();
  const { user, wixData, chosenIndex } = useAuth();
  const insets = useSafeAreaInsets();

  const getUserName = () => {
    if (wixData && wixData.length > 0 && chosenIndex !== null) {
      const student = wixData[chosenIndex];
      return student.firstName || student.name || '';
    }
    return user?.user_metadata?.full_name || user?.email?.split('@')[0] || '';
  };

  const handleProfilePress = () => {
    router.push('/(tabs)/profile');
  };

  const handleHelpPress = () => {
    router.push('/help');
  };

  return (
    <View
      style={[
        styles.header,
        {
          // Extend the blue background up into the status bar / notch area on
          // both iOS and Android (StatusBar is translucent in _layout.tsx).
          // Push the logo + buttons down so they sit at the bottom of the
          // header strip, safely clear of cameras / notches / Dynamic Island.
          paddingTop: insets.top + 14,
          paddingBottom: 10,
        },
      ]}
    >
      <View style={styles.headerContent}>
        {showLogo && (
          <Image
            source={{ uri: 'https://d64gsuwffb70l.cloudfront.net/687540bb2bcf8d2e01e60ef8_1754821058739_011452a6.jpg' }}
            style={styles.logo}
            resizeMode="contain"
          />
        )}
        {title && <Text style={styles.title}>{title}</Text>}

        <View style={styles.rightContainer}>
          <TouchableOpacity style={styles.profileContainer} onPress={handleProfilePress}>
            <Text style={styles.userName}>{getUserName()}</Text>
            <Ionicons name="person-circle-outline" size={22} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={styles.helpButton} onPress={handleHelpPress} accessibilityLabel="Help">
            <Ionicons name="help-circle-outline" size={24} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    backgroundColor: '#64a8d1',
    paddingLeft: 12,
    paddingRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },

  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  logo: {
    width: 100,
    height: 32,
    flex: 1,
  },
  title: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    flex: 1,
  },
  rightContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  userName: {
    color: 'white',
    fontSize: 13,
    fontWeight: '500',
  },
  helpButton: {
    padding: 2,
    marginLeft: 2,
  },
});

export default Header;

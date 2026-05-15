import { Tabs } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useLanguage } from '../contexts/LanguageContext';
import { useAuth } from '../contexts/AuthContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { logger } from '../../components/SimpleLogger';
import { useEffect } from 'react';
export default function TabLayout() {
  const { t } = useLanguage();
  const { wixData, chosenIndex } = useAuth();
  const insets = useSafeAreaInsets();
  
  useEffect(() => {
    logger.log('info', 'TabLayout rendering', {
      hasWixData: !!wixData,
      chosenIndex,
      optionsLength: wixData?.options?.length,
      platform: 'android'
    });
  }, [wixData, chosenIndex]);

  // Check if teacher has limited subscription
  const selectedOption = wixData?.options?.[chosenIndex] || wixData?.options?.[0];
  const teacherData = selectedOption?.teacherData;
  
  useEffect(() => {
    logger.log('info', 'Teacher data evaluation', {
      hasSelectedOption: !!selectedOption,
      hasTeacherData: !!teacherData,
      abo: teacherData?.abo,
      consentDataInStudentApp: teacherData?.consentDataInStudentApp
    });
  }, [selectedOption, teacherData]);

  const hideSchoolInfo = teacherData?.abo === 0 || teacherData?.abo === 2;
  
  // Check if teacher consents to showing data in student app
  // Only hide if we have data and consent is explicitly false
  const hideTeacherInfo = wixData && teacherData && teacherData.consentDataInStudentApp !== true;
  
  useEffect(() => {
    logger.log('info', 'Tab visibility calculated', {
      hideSchoolInfo,
      hideTeacherInfo,
      consentValue: teacherData?.consentDataInStudentApp
    });
  }, [hideSchoolInfo, hideTeacherInfo, teacherData?.consentDataInStudentApp]);
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: '#64a8d1',
        tabBarInactiveTintColor: '#999',
        tabBarPosition: 'bottom',
        tabBarStyle: {
          backgroundColor: 'white',
          borderTopWidth: 1,
          borderTopColor: '#e0e0e0',
          paddingBottom: Math.max(5, insets.bottom),
          height: 60 + insets.bottom,
        },
        headerShown: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: t('lessons'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="lessons"
        options={{
          title: t('lessonsInfo'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="musical-notes-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="files"
        options={{
          title: t('files'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="folder-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="class-info"
        options={{
          title: 'Class Info',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="library-outline" size={size} color={color} />
          ),
          href: null,
        }}
      />
      <Tabs.Screen
        name="teacher-info"
        options={{
          title: t('teacherInfo'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
          href: hideTeacherInfo ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="school-info"
        options={{
          title: t('schoolInfo'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="school-outline" size={size} color={color} />
          ),
          href: hideSchoolInfo ? null : undefined,
        }}
      />
      <Tabs.Screen
        name="availabilities"
        options={{
          title: t('availabilities'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size} color={color} />
          ),
          href: null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: t('profile'),
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
          href: null,
        }}
      />
    </Tabs>
  );
}
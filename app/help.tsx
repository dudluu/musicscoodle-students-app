import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Linking, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { router, Stack } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Header from '../components/Header';
import { useLanguage } from './contexts/LanguageContext';
import { useAuth } from './contexts/AuthContext';

type HelpSection = { title: string; body: string };

const HELP_SECTIONS_DE: HelpSection[] = [
  {
    title: 'Die Lektionen Seite',
    body: `Bei Training Aufgaben siehst Du die letzte vergebene Aufgabe.
Die vergangenen Lektionen siehst Du durch Anklicken von "Vergangene Lektionen", die nächsten Lektionen durch Anklicken von "Nächste Lektionen".
Lektion absagen: Klicke auf "Lektion absagen" bei der Lektion, die Du absagen willst: Im Fenster Lektion absagen wählst Du den Grund Deiner Absage aus und kannst noch eine Bemerkung anfügen. Klicke auf Absenden und Deine Lehrperson erhält eine Nachricht über Deine Absage.
Die Absage kannst Du auch wieder rückgängig machen: Klicke bei einer abgesagten Lektion auf Absage bearbeiten und dann kannst Du diese Absage wieder rückgängig machen indem Du unten auf Absage aufheben klickst.`,
  },
  {
    title: 'Die Lektionsinfos Seite',
    body: `Wenn Du nicht weisst, wo die Lektion stattfinden wird, dann klicke auf Ort der Lektion Adresse und es öffnet sich Deine Karten App mit Angabe des geographischen Ortes.`,
  },
  {
    title: 'Verfügbarkeiten anzeigen',
    body: `Unten auf der Lektionsinfos Seite kannst Du eine Liste mit Deinen eingetragenen Verfügbarkeiten anzeigen lassen. Hier kannst Du auch weitere Verfügbarkeiten (max. 5) eintragen oder die bestehenden bearbeiten. Falls Du hier die Verfügbarkeiten nicht bearbeiten kannst, dann ist das Eintragen von Verfügbarkeiten von Deiner Lehrperson deaktiviert. In diesem Fall kontaktiere Deine Lehrperson, wenn Du Verfügbarkeiten eintragen willst.`,
  },
  {
    title: 'Die Dateien Seite',
    body: `Hier kannst Du die von Deiner Lehrperson freigegebenen Dateien anschauen oder herunterladen.`,
  },
  {
    title: 'Seiten Lehrperson und Schule Info',
    body: `Diese Seiten listen die Kontakt-Infos der Lehrperson und der Schule auf.`,
  },
  {
    title: 'Profil Seite',
    body: `Hier siehst Du Deine bei Deiner Musiklehrperson hinterlegten Daten.
Unten kannst Du Dein Passwort ändern oder Du kannst, falls mehrere Personen mit derselben Email bei Deiner Lehrperson registriert sind, hier auf die Daten einer anderen Person wechseln.
Durch Abmelden wirst Du aus der App ausgeloggt.`,
  },
];

const HELP_SECTIONS_EN: HelpSection[] = [
  {
    title: 'The Schedule Page',
    body: `Under Home Training, you can see the last assigned task.
You can view past lessons by clicking on "Past Lessons" and upcoming lessons by clicking on "Next Lessons".
Canceling a lesson:
Click on "Cancel Lesson" for the lesson you want to cancel. In the Cancel Lesson window, select the reason for your cancellation and optionally add a remark about this cancellation. Click Send, and your teacher will receive a notification about your cancellation.
You can also undo a cancellation:
For a canceled lesson, click on "Edit cancellation". You can then undo the cancellation by clicking on "Remove Cancellation" at the bottom.`,
  },
  {
    title: 'The Lesson Info Page',
    body: `If you do not know where the lesson will take place, click on "Location Address" and your map app will open, showing the geographical location.`,
  },
  {
    title: 'Show Availability',
    body: `At the bottom of the Lesson Info page, you can view a list of your saved availabilities. Here you can also add additional availabilities (maximum 5) or edit existing ones.
If you are unable to edit availabilities here, it means that entering availabilities has been disabled by your teacher. In this case, contact your teacher if you would like to add availabilities.`,
  },
  {
    title: 'The Files Page',
    body: `Here you can view or download the files shared by your teacher.`,
  },
  {
    title: 'Teacher and School Info Pages',
    body: `These pages list the contact information of the teacher and the school.`,
  },
  {
    title: 'Profile Page',
    body: `Here you can see the data your music teacher has stored for you.
At the bottom, you can change your password or, if multiple people are registered with the same email address at your teacher's account, switch to another person's data here.
By logging out, you will be signed out of the app.`,
  },
];

export default function HelpScreen() {
  const insets = useSafeAreaInsets();
  const { language } = useLanguage();
  const { wixData } = useAuth();
  const isEN = language === 'en';

  const handleEmail = () => {
    Linking.openURL('mailto:support@musicscoodle.com');
  };

  const helpVideoLink: string | undefined =
    (wixData as any)?.helpVideos?.[0]?.youtubeLink ||
    (wixData as any)?.options?.[0]?.helpVideos?.[0]?.youtubeLink;

  const handleOpenVideo = async () => {
    if (!helpVideoLink) {
      Alert.alert(
        isEN ? 'No video available' : 'Kein Video verfügbar',
        isEN
          ? 'There is currently no help video available.'
          : 'Es ist momentan kein Hilfevideo verfügbar.'
      );
      return;
    }
    try {
      const supported = await Linking.canOpenURL(helpVideoLink);
      if (supported) {
        await Linking.openURL(helpVideoLink);
      } else {
        Alert.alert(
          isEN ? 'Cannot open link' : 'Link kann nicht geöffnet werden',
          helpVideoLink
        );
      }
    } catch (e) {
      console.error('Error opening help video:', e);
    }
  };

  const sections = isEN ? HELP_SECTIONS_EN : HELP_SECTIONS_DE;
  const faqTitle = isEN ? 'Help & Instructions' : 'Hilfe & Anleitung';
  const supportTitle = isEN ? 'Contact Support' : 'Support kontaktieren';
  const supportText = isEN
    ? 'Need more help? Feel free to send us an email.'
    : 'Du brauchst weitere Hilfe? Schreibe uns gerne eine E-Mail.';
  const supportButton = isEN ? 'Email Support' : 'E-Mail an Support';
  const backLabel = isEN ? 'Back' : 'Zurück';
  const pageTitleLabel = isEN ? 'Help' : 'Hilfe';

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerShown: false }} />
      <Header />

      <View style={styles.subHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#64a8d1" />
          <Text style={styles.backText}>{backLabel}</Text>
        </TouchableOpacity>
        <Text style={styles.pageTitle}>{pageTitleLabel}</Text>
        <TouchableOpacity
          onPress={handleOpenVideo}
          style={styles.videoButton}
          accessibilityLabel={isEN ? 'Open help video' : 'Hilfevideo öffnen'}
        >
          <Ionicons name="film-outline" size={28} color="#64a8d1" />

        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.content}
        contentContainerStyle={{ paddingBottom: insets.bottom + 30 }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="help-circle-outline" size={24} color="#64a8d1" />
            <Text style={styles.cardTitle}>{faqTitle}</Text>
          </View>

          {sections.map((section, idx) => (
            <View
              key={idx}
              style={[
                styles.sectionBlock,
                idx === sections.length - 1 && { marginBottom: 0 },
              ]}
            >
              <Text style={styles.sectionTitle}>{section.title}</Text>
              <Text style={styles.helpText}>{section.body}</Text>
            </View>
          ))}
        </View>

        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <Ionicons name="mail-outline" size={24} color="#64a8d1" />
            <Text style={styles.cardTitle}>{supportTitle}</Text>
          </View>
          <Text style={styles.answer}>{supportText}</Text>
          <TouchableOpacity style={styles.contactButton} onPress={handleEmail}>
            <Ionicons name="mail" size={18} color="white" />
            <Text style={styles.contactButtonText}>{supportButton}</Text>
          </TouchableOpacity>
          <Text style={styles.emailText}>support@musicscoodle.com</Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f7fa',
  },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: 'white',
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    minWidth: 80,
  },
  backText: {
    color: '#64a8d1',
    fontSize: 16,
    fontWeight: '500',
  },
  pageTitle: {
    flex: 1,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  videoButton: {
    minWidth: 80,
    alignItems: 'flex-end',
    paddingVertical: 4,
    paddingLeft: 8,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '600',
    color: '#333',
  },
  sectionBlock: {
    marginBottom: 14,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#222',
    marginBottom: 4,
  },
  helpText: {
    fontSize: 14,
    color: '#444',
    lineHeight: 21,
  },
  answer: {
    fontSize: 14,
    color: '#555',
    lineHeight: 20,
  },
  contactButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#64a8d1',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
    marginTop: 12,
  },
  contactButtonText: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
  },
  emailText: {
    textAlign: 'center',
    marginTop: 10,
    fontSize: 13,
    color: '#777',
  },
});

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as WebBrowser from 'expo-web-browser';

interface FileData {
  originalFileNameNoExtension: string;
  link: string;
  lernkategorie: string;
}

interface FileCardProps {
  fileData: FileData;
}

const FileCard: React.FC<FileCardProps> = ({ fileData }) => {
  const downloadFile = async () => {
    try {
      const downloadLink = fileData.link;
      
      if (!downloadLink || downloadLink.trim() === '') {
        Alert.alert('Error', 'No download link available for this file');
        return;
      }

      if (Platform.OS === 'web') {
        // For web, open in new tab for download
        window.open(downloadLink, '_blank');
        Alert.alert('Download', 'File opened in new tab for download');
      } else {
        // For mobile, use WebBrowser
        await WebBrowser.openBrowserAsync(downloadLink, {
          presentationStyle: WebBrowser.WebBrowserPresentationStyle.FULL_SCREEN,
        });
      }
      
    } catch (error) {
      console.error('Download error:', error);
      Alert.alert('Download Error', 'Failed to open download link');
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Ionicons name="document-outline" size={24} color="#64a8d1" />
        <Text style={styles.title}>{fileData.originalFileNameNoExtension}</Text>
      </View>
      
      <Text style={styles.category}>{fileData.lernkategorie}</Text>
      
      <TouchableOpacity style={styles.downloadButton} onPress={downloadFile}>
        <Ionicons name="download-outline" size={16} color="white" />
        <Text style={styles.downloadText}>Download</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 15,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginLeft: 10,
    flex: 1,
  },
  category: {
    fontSize: 14,
    color: '#666',
    marginBottom: 15,
  },
  downloadButton: {
    backgroundColor: '#64a8d1',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    borderRadius: 5,
  },
  downloadText: {
    color: 'white',
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 5,
  },
});

export default FileCard;
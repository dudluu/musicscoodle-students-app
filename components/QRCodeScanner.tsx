import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, Modal } from 'react-native';
import { CameraView, Camera } from 'expo-camera';
import { useLanguage } from '../app/contexts/LanguageContext';

interface QRCodeScannerProps {
  visible: boolean;
  onClose: () => void;
  onScanSuccess: (data: { vorname: string; nachname: string; email: string }) => void;
}

export default function QRCodeScanner({ visible, onClose, onScanSuccess }: QRCodeScannerProps) {
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const { t } = useLanguage();

  useEffect(() => {
    const getCameraPermissions = async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === 'granted');
    };

    getCameraPermissions();
  }, []);

  const handleBarCodeScanned = ({ data }: { data: string }) => {
    if (scanned) return;
    
    setScanned(true);
    
    try {
      const parsedData = JSON.parse(data);
      
      if (parsedData.vorname && parsedData.nachname && parsedData.email) {
        onScanSuccess(parsedData);
        onClose();
      } else {
        Alert.alert('Error', 'Invalid QR code format');
      }
    } catch (error) {
      Alert.alert('Error', 'Invalid QR code data');
    }
    
    setTimeout(() => setScanned(false), 2000);
  };

  if (hasPermission === null) {
    return <Text>Requesting camera permission</Text>;
  }
  if (hasPermission === false) {
    return <Text>No access to camera</Text>;
  }

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <CameraView
          style={styles.camera}
          facing="back"
          onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
        />
        <View style={styles.overlay}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text style={styles.closeButtonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  overlay: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
  },
  closeButton: {
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 15,
    borderRadius: 8,
    alignSelf: 'flex-end',
  },
  closeButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
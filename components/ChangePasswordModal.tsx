import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import { useAuth } from '@/app/contexts/AuthContext';
import { useLanguage } from '@/app/contexts/LanguageContext';
import { savePassword, getCredentials } from '@/app/lib/wixApi';

interface ChangePasswordModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ChangePasswordModal({ visible, onClose }: ChangePasswordModalProps) {
  const { t } = useLanguage();
  const { user, wixData, logout } = useAuth();
  const router = useRouter();
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const resetFields = () => {
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setStatusMessage('');
    setErrorMessage('');
  };

  const handleCancel = () => {
    resetFields();
    onClose();
  };
  const handleChangePassword = async () => {
    console.log('handleChangePassword called');
    console.log('Current password:', currentPassword);
    console.log('New password:', newPassword);
    console.log('Confirm password:', confirmPassword);
    
    // Clear previous error messages
    setErrorMessage('');
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      console.log('VALIDATION FAILED: Missing fields');
      console.log('Current password empty:', !currentPassword);
      console.log('New password empty:', !newPassword);
      console.log('Confirm password empty:', !confirmPassword);
      setErrorMessage(t('fillAllFields'));
      return;
    }

    if (newPassword !== confirmPassword) {
      console.log('VALIDATION FAILED: Passwords do not match');
      console.log('New password:', newPassword);
      console.log('Confirm password:', confirmPassword);
      setErrorMessage(t('newPasswordMismatch'));
      return;
    }

    if (newPassword.length < 6) {
      console.log('VALIDATION FAILED: Password too short');
      console.log('Password length:', newPassword.length);
      setErrorMessage(t('passwordMinChars'));
      return;
    }

    // Try to get email from multiple sources
    const studentDataEmail = wixData?.options?.[0]?.studentData?.email;
    const userEmail = user?.email;
    const email = studentDataEmail || userEmail;
    
    console.log('Email from wixData.options[0].studentData:', studentDataEmail);
    console.log('Email from user:', userEmail);
    console.log('Final email:', email);
    
    if (!email) {
      console.log('VALIDATION FAILED: No email available');
      setErrorMessage('User email not available');
      return;
    }

    console.log('All validations passed, proceeding with password change...');

    setLoading(true);
    setStatusMessage(t('oldPasswordChecking'));
    
    try {
      // Call appGetCredentials to verify current password
      const body = { email };
      console.log('Calling appGetCredentials with body:', body);
      
      const credentialsResponse = await getCredentials(email);
      console.log('appGetCredentials response:', credentialsResponse);
      
      // Check if the API call failed
      if (!credentialsResponse || credentialsResponse.length === 0) {
        setErrorMessage(t('currentPasswordWrong'));
        setLoading(false);
        setStatusMessage('');
        return;
      }
      
      // Check if any of the credentials has a matching appPw
      const passwordMatch = credentialsResponse.some((entry: any) => 
        entry.appPw === currentPassword
      );

      if (!passwordMatch) {
        setErrorMessage(t('currentPasswordWrong'));
        setLoading(false);
        setStatusMessage('');
        return;
      }

      setStatusMessage('');
      setStatusMessage(t('passwordChanging'));

      // Call appSavePassword with the new password
      const saveResponse = await savePassword(email, newPassword);
      console.log('appSavePassword response:', saveResponse);
      
      if (saveResponse.status === 'ok') {
        console.log('Password change successful');
        setStatusMessage(t('passwordChangeSuccess'));
        setTimeout(async () => {
          resetFields();
          onClose();
          // Logout and redirect to login
          await logout();
          router.replace('/auth/login');
        }, 2000);
      } else {
        console.log('Password change failed, showing error message');
        setErrorMessage(saveResponse.message || t('passwordChangeFailed'));
      }
    } catch (error: any) {
      console.error('Password change error:', error);
      setErrorMessage(t('passwordChangeFailed'));
    } finally {
      setLoading(false);
      setStatusMessage('');
    }
  };

  const isChangeButtonDisabled = loading || newPassword.length < 6;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modal}>
          <Text style={styles.title}>{t('changePassword')}</Text>
          
          {statusMessage ? (
            <Text style={styles.statusMessage}>{statusMessage}</Text>
          ) : null}
          
          {errorMessage ? (
            <Text style={styles.errorMessage}>{errorMessage}</Text>
          ) : null}
          
          <TextInput
            style={styles.input}
            placeholder={t('currentPassword')}
            placeholderTextColor="#666"
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
            autoCapitalize="none"
            keyboardAppearance="light"
            selectionColor="#007AFF"
            underlineColorAndroid="transparent"
          />
          
          <TextInput
            style={styles.input}
            placeholder={t('newPassword')}
            placeholderTextColor="#666"
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
            autoCapitalize="none"
            keyboardAppearance="light"
            selectionColor="#007AFF"
            underlineColorAndroid="transparent"
          />
          
          <TextInput
            style={styles.input}
            placeholder={t('confirmNewPassword')}
            placeholderTextColor="#666"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            autoCapitalize="none"
            keyboardAppearance="light"
            selectionColor="#007AFF"
            underlineColorAndroid="transparent"
          />

          
          <View style={styles.buttonContainer}>
            <TouchableOpacity style={styles.cancelButton} onPress={handleCancel}>
              <Text style={styles.cancelText}>{t('cancel')}</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[
                styles.changeButton, 
                isChangeButtonDisabled && styles.disabledButton
              ]} 
              onPress={() => {
                console.log('Change password button pressed');
                console.log('Button disabled:', isChangeButtonDisabled);
                console.log('Loading:', loading);
                console.log('New password length:', newPassword.length);
                handleChangePassword();
              }}
              disabled={isChangeButtonDisabled}
            >
              <Text style={styles.changeText}>
                {loading ? t('loading') : t('changePassword')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  statusMessage: {
    fontSize: 14,
    color: '#28a745',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '500',
  },
  errorMessage: {
    fontSize: 14,
    color: '#dc3545',
    textAlign: 'center',
    marginBottom: 15,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    backgroundColor: '#fff',
    padding: 12,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
    color: '#000',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 12,
    marginRight: 10,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  cancelText: {
    textAlign: 'center',
    fontSize: 16,
    color: '#666',
  },
  changeButton: {
    flex: 1,
    padding: 12,
    marginLeft: 10,
    backgroundColor: '#007AFF',
    borderRadius: 8,
  },
  changeText: {
    textAlign: 'center',
    fontSize: 16,
    color: 'white',
    fontWeight: 'bold',
  },
  disabledButton: {
    backgroundColor: '#ccc',
  },
});

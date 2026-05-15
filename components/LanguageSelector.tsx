import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import { useLanguage } from '../app/contexts/LanguageContext';
import { Language } from '../app/lib/i18n';

const languages: { code: Language; name: string }[] = [
  { code: 'de', name: 'Deutsch' },
  { code: 'en', name: 'English' },
];

export default function LanguageSelector() {
  const { language, setLanguage } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  const selectedLanguage = languages.find(lang => lang.code === language);

  const handleSelect = (langCode: Language) => {
    console.log('Language selected:', langCode);
    setLanguage(langCode);
    setIsOpen(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity 
        style={styles.dropdown}
        onPress={() => setIsOpen(true)}
      >
        <Text style={styles.dropdownText}>
          {selectedLanguage?.name || 'Select Language'}
        </Text>
        <Text style={styles.arrow}>▼</Text>
      </TouchableOpacity>

      <Modal
        visible={isOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsOpen(false)}
      >
        <TouchableOpacity 
          style={styles.overlay}
          onPress={() => setIsOpen(false)}
        >
          <View style={styles.modal}>
            {languages.map((item) => (
              <TouchableOpacity
                key={item.code}
                style={[
                  styles.option,
                  language === item.code && styles.selectedOption
                ]}
                onPress={() => handleSelect(item.code)}
              >
                <Text style={[
                  styles.optionText,
                  language === item.code && styles.selectedOptionText
                ]}>
                  {item.name}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
  },
  dropdown: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f8f9fa',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  dropdownText: {
    fontSize: 14,
    color: '#333',
  },
  arrow: {
    fontSize: 12,
    color: '#666',
  },
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: 10,
    width: 120,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    overflow: 'hidden',
  },
  option: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  selectedOption: {
    backgroundColor: '#64a8d1',
  },
  optionText: {
    fontSize: 14,
    color: '#333',
  },
  selectedOptionText: {
    color: 'white',
    fontWeight: 'bold',
  },
});
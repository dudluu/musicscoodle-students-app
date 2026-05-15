import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface QuickActionProps {
  title: string;
  icon: keyof typeof Ionicons.glyphMap;
  onPress: () => void;
  color?: string;
}

export default function QuickAction({ title, icon, onPress, color = '#64a8d1' }: QuickActionProps) {
  return (
    <TouchableOpacity style={styles.container} onPress={onPress}>
      <View style={[styles.iconContainer, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="white" />
      </View>
      <Text style={styles.title}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    paddingVertical: 16,
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
  },
});
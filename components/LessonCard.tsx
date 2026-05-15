import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LessonCardProps {
  title: string;
  time: string;
  date: string;
  teacher: string;
  status: 'upcoming' | 'completed' | 'cancelled';
  onPress: () => void;
}

export default function LessonCard({ title, time, date, teacher, status, onPress }: LessonCardProps) {
  const getStatusColor = () => {
    switch (status) {
      case 'upcoming': return '#4CAF50';
      case 'completed': return '#2196F3';
      case 'cancelled': return '#F44336';
      default: return '#64a8d1';
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'upcoming': return 'time-outline';
      case 'completed': return 'checkmark-circle-outline';
      case 'cancelled': return 'close-circle-outline';
      default: return 'musical-notes-outline';
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.cardHeader}>
        <Text style={styles.title}>{title}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
          <Ionicons name={getStatusIcon()} size={16} color="white" />
          <Text style={styles.statusText}>{status}</Text>
        </View>
      </View>
      <View style={styles.cardBody}>
        <Text style={styles.detail}>{date} at {time}</Text>
        <Text style={styles.teacher}>Teacher: {teacher}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: 'white',
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    marginHorizontal: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    color: 'white',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
    textTransform: 'capitalize',
  },
  cardBody: {
    gap: 4,
  },
  detail: {
    fontSize: 14,
    color: '#666',
  },
  teacher: {
    fontSize: 14,
    color: '#64a8d1',
    fontWeight: '500',
  },
});
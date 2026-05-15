import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, Modal, StyleSheet, Alert } from 'react-native';
import { supabase } from '@/app/lib/supabase';

interface Teacher {
  id: string;
  name: string;
  email: string;
  institute_name: string;
}

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectTeacher: (teacher: Teacher) => void;
}

export default function TeacherSearchModal({ visible, onClose, onSelectTeacher }: Props) {
  const [teachers, setTeachers] = useState<Teacher[]>([]);
  const [filteredTeachers, setFilteredTeachers] = useState<Teacher[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (visible) {
      fetchTeachers();
    }
  }, [visible]);

  useEffect(() => {
    if (searchQuery.trim() === '') {
      setFilteredTeachers(teachers);
    } else {
      const filtered = teachers.filter(teacher => 
        teacher.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        teacher.institute_name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredTeachers(filtered);
    }
  }, [searchQuery, teachers]);

  const fetchTeachers = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('teachers')
        .select(`
          id,
          name,
          email,
          institutes!inner(name)
        `);

      if (error) {
        Alert.alert('Error', 'Failed to fetch teachers');
        return;
      }

      const teachersWithInstitute = data.map(teacher => ({
        id: teacher.id,
        name: teacher.name,
        email: teacher.email,
        institute_name: teacher.institutes.name
      }));

      setTeachers(teachersWithInstitute);
      setFilteredTeachers(teachersWithInstitute);
    } catch (error) {
      Alert.alert('Error', 'An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  const renderTeacher = ({ item }: { item: Teacher }) => (
    <TouchableOpacity
      style={styles.teacherItem}
      onPress={() => onSelectTeacher(item)}
    >
      <Text style={styles.teacherName}>{item.name}</Text>
      <Text style={styles.teacherEmail}>{item.email}</Text>
      <Text style={styles.instituteName}>{item.institute_name}</Text>
    </TouchableOpacity>
  );

  return (
    <Modal visible={visible} animationType="slide">
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Select Your Teacher</Text>
          <TouchableOpacity onPress={onClose}>
            <Text style={styles.closeButton}>✕</Text>
          </TouchableOpacity>
        </View>
        
        <TextInput
          style={styles.searchInput}
          placeholder="Search teachers or institutes..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        
        <FlatList
          data={filteredTeachers}
          renderItem={renderTeacher}
          keyExtractor={(item) => item.id}
          style={styles.list}
          refreshing={loading}
          onRefresh={fetchTeachers}
          showsVerticalScrollIndicator={false}
          showsHorizontalScrollIndicator={false}
        />

      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#64a8d1',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },
  closeButton: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  searchInput: {
    backgroundColor: 'white',
    margin: 20,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  list: {
    flex: 1,
  },
  teacherItem: {
    backgroundColor: 'white',
    padding: 15,
    marginHorizontal: 20,
    marginBottom: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  teacherName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  teacherEmail: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  instituteName: {
    fontSize: 14,
    color: '#64a8d1',
    marginTop: 5,
  },
});
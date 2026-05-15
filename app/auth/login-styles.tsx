import { StyleSheet } from 'react-native';

export const studentListStyles = StyleSheet.create({
  studentListContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 10,
    padding: 20,
    marginVertical: 20,
  },
  studentListTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    textAlign: 'center',
    marginBottom: 10,
  },
  studentListSubtitle: {
    fontSize: 14,
    color: 'white',
    textAlign: 'center',
    marginBottom: 20,
    opacity: 0.9,
  },
  studentCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 8,
    marginBottom: 10,
    overflow: 'hidden',
  },
  selectStudentButton: {
    backgroundColor: '#dc3545',
    padding: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  registerButton: {
    backgroundColor: '#ffc107', // Yellow color for register buttons
  },
  selectStudentButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
  },
});
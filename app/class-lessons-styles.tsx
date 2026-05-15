import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
    paddingVertical: 10,
  },
  backText: {
    marginLeft: 8,
    fontSize: 16,
    color: '#64a8d1',
    fontWeight: '500',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#333',
  },
  homeworkCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  homeworkText: {
    fontSize: 16,
    color: '#666',
    lineHeight: 24,
  },
  lessonCard: {
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  lessonHeader: {
    marginBottom: 10,
  },
  lessonTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
  },
  lessonBody: {
    gap: 5,
  },
  lessonDetail: {
    fontSize: 16,
    color: '#666',
  },
  lessonTeacher: {
    fontSize: 14,
    color: '#888',
    fontStyle: 'italic',
  },
  noLessonsCard: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  noLessonsText: {
    fontSize: 16,
    color: '#666',
    fontStyle: 'italic',
  },
  lessonDate: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
  },
  lessonTime: {
    fontSize: 14,
    color: '#666',
  },
});
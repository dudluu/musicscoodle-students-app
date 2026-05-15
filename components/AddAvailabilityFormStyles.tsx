import { StyleSheet } from 'react-native';

export const styles = StyleSheet.create({
  container: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 20,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
  },
  errorText: {
    color: '#FF3B30',
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: '500',
  },
  fieldContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
    color: '#333',
  },
  selector: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    backgroundColor: '#fff',
    padding: 15,
    minHeight: 50,
    justifyContent: 'center',
  },
  selectorText: {
    fontSize: 16,
    color: '#333',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  addButton: {
    backgroundColor: '#007AFF',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginRight: 10,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  cancelButton: {
    backgroundColor: '#FF3B30',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 8,
    flex: 1,
    marginLeft: 10,
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

export const modalStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    width: '80%',
    maxHeight: '60%',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  weekdayOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  weekdayOptionText: {
    fontSize: 16,
    textAlign: 'center',
  },
  modalCancelButton: {
    marginTop: 15,
    padding: 15,
    backgroundColor: '#f0f0f0',
    borderRadius: 8,
  },
  modalCancelButtonText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
  },
});
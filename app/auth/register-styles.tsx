const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    justifyContent: 'center',
    backgroundColor: '#64a8d1',
  },
  languageContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 1,
    width: 200,
  },
  logo: {
    width: 120,
    height: 120,
    alignSelf: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 30,
    color: 'white',
  },
  input: {
    backgroundColor: 'white',
    padding: 15,
    marginBottom: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    color: '#000',
  },

  button: {
    backgroundColor: '#B8D4F0',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
  },
  buttonActive: {
    backgroundColor: '#dc3545',
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#64a8d1',
    textAlign: 'center',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonTextActive: {
    color: 'white',
  },
  linkButton: {
    padding: 10,
  },
  linkText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 16,
  },
});
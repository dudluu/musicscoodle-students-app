import React from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';

interface ErrorLoggerProps {
  children: React.ReactNode;
}

interface ErrorLoggerState {
  hasError: boolean;
  error?: Error;
  errorInfo?: any;
}

export class ErrorLogger extends React.Component<ErrorLoggerProps, ErrorLoggerState> {
  constructor(props: ErrorLoggerProps) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): ErrorLoggerState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: any) {
    console.error('Error caught by ErrorLogger:', error, errorInfo);
    this.setState({ error, errorInfo });
  }

  render() {
    if (this.state.hasError) {
      return (
        <View style={styles.container}>
          <Text style={styles.title}>Something went wrong</Text>
          <Text style={styles.error}>{this.state.error?.toString()}</Text>
          <ScrollView style={styles.details} showsVerticalScrollIndicator={false} showsHorizontalScrollIndicator={false}>

            <Text>{JSON.stringify(this.state.errorInfo, null, 2)}</Text>
          </ScrollView>
          <Button title="Reload" onPress={() => this.setState({ hasError: false })} />
        </View>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 18, fontWeight: 'bold', marginBottom: 10 },
  error: { color: 'red', marginBottom: 10 },
  details: { flex: 1, backgroundColor: '#f5f5f5', padding: 10 }
});
import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Button, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { logger } from '../components/SimpleLogger';

export default function DebugLogs() {
  const insets = useSafeAreaInsets();
  const [logs, setLogs] = useState<any[]>([]);

  useEffect(() => {
    loadLogs();
  }, []);

  const loadLogs = () => {
    const debugLogs = logger.getLogs();
    setLogs(debugLogs);
  };

  const clearAllLogs = () => {
    logger.clearLogs();
    setLogs([]);
  };

  return (
    <View
      style={[
        styles.container,
        { paddingTop: insets.top + 16, paddingBottom: insets.bottom + 16 },
      ]}
    >
      <Text style={styles.title}>Debug Logs</Text>

      <View style={styles.buttonContainer}>
        <Button title="Refresh" onPress={loadLogs} />
        <Button title="Clear Logs" onPress={clearAllLogs} />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={{ paddingBottom: insets.bottom + 16 }}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >

        <Text style={styles.sectionTitle}>Debug Logs ({logs.length})</Text>
        {logs.map((log, index) => (
          <View key={index} style={styles.logItem}>
            <Text style={styles.timestamp}>{log.timestamp}</Text>
            <Text style={styles.level}>[{log.level.toUpperCase()}]</Text>
            <Text>{log.message}</Text>
            {log.data && <Text style={styles.data}>{log.data}</Text>}
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  buttonContainer: { flexDirection: 'row', justifyContent: 'space-around', marginBottom: 20 },
  scrollView: { flex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginTop: 20, marginBottom: 10 },
  logItem: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  timestamp: { fontSize: 12, color: '#666', marginBottom: 5 },
  level: { fontWeight: 'bold', marginBottom: 5 },
  data: { fontSize: 12, color: '#333', fontFamily: 'monospace' }
});

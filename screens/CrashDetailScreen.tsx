import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const CrashDetailScreen = ({ route, navigation }: any) => {
  const { eventData } = route.params || {};

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>🚨 Detalles del Crash</Text>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Severidad:</Text>
          <View style={[styles.badge, styles[`badge${eventData?.severity}`]]}>
            <Text style={styles.badgeText}>{eventData?.severity || 'N/A'}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Magnitud:</Text>
          <Text style={styles.value}>{eventData?.magnitude?.toFixed(2) || 'N/A'} G</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Confianza:</Text>
          <Text style={styles.value}>{eventData?.confidence?.toFixed(0) || 'N/A'}%</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Hora:</Text>
          <Text style={styles.value}>
            {eventData?.time ? new Date(eventData.time).toLocaleString('es-AR') : 'N/A'}
          </Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Ubicación:</Text>
          <Text style={styles.value}>
            {eventData?.location?.latitude?.toFixed(4)}, {eventData?.location?.longitude?.toFixed(4)}
          </Text>
        </View>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => navigation.goBack()}>
        <Text style={styles.buttonText}>Volver</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#FF3B30',
    padding: 20,
    alignItems: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
  },
  card: {
    backgroundColor: '#fff',
    margin: 20,
    padding: 20,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  value: {
    fontSize: 16,
    color: '#666',
    flex: 1,
    textAlign: 'right',
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  badgeLOW: {
    backgroundColor: '#34C759',
  },
  badgeMEDIUM: {
    backgroundColor: '#FF9500',
  },
  badgeHIGH: {
    backgroundColor: '#FF3B30',
  },
  badgeText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 14,
  },
  button: {
    backgroundColor: '#007AFF',
    margin: 20,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default CrashDetailScreen;

import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';

const TimelineDetailScreen = ({ route, navigation }: any) => {
  const { eventData } = route.params || {};

  const getTransportIcon = (mode: string) => {
    const icons: any = {
      CAR: '🚗',
      BUS: '🚌',
      TRAIN: '🚆',
      WALKING: '🚶',
    };
    return icons[mode] || '🚶';
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {getTransportIcon(eventData?.transportMode)} Detalles del Viaje
        </Text>
      </View>

      <View style={styles.card}>
        <View style={styles.row}>
          <Text style={styles.label}>Tipo:</Text>
          <Text style={styles.value}>{eventData?.type || 'N/A'}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Modo de Transporte:</Text>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {getTransportIcon(eventData?.transportMode)} {eventData?.transportMode || 'N/A'}
            </Text>
          </View>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Ubicación:</Text>
          <Text style={styles.value}>{eventData?.location || 'N/A'}</Text>
        </View>

        <View style={styles.row}>
          <Text style={styles.label}>Hora:</Text>
          <Text style={styles.value}>
            {eventData?.time ? new Date(eventData.time).toLocaleString('es-AR') : 'N/A'}
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
    backgroundColor: '#34C759',
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
    backgroundColor: '#34C759',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
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

export default TimelineDetailScreen;

import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import MockSdkSimulator from '../services/MockSdkSimulator';
import NotificationService from '../services/NotificationService';

const HomeScreen = ({ navigation }: any) => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>🧪 SDK Listener Test</Text>
      <Text style={styles.subtitle}>
        Esta app simula listeners del SDK de Sentiance
      </Text>

      <TouchableOpacity
        style={styles.button}
        onPress={() => MockSdkSimulator.invokeDummyVehicleCrash()}
      >
        <Text style={styles.buttonText}>🚨 Simular Crash Ahora</Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={[styles.button, styles.scheduleButton]}
        onPress={async () => {
          await NotificationService.scheduleDelayedNotification(30);
          alert('✅ Notificación programada para 30 segundos.\n\nPuedes cerrar la app ahora.');
        }}
      >
        <Text style={styles.buttonText}>⏰ Programar Notificación (30s)</Text>
      </TouchableOpacity>

      <View style={styles.info}>
        <Text style={styles.infoText}>
          🚨 Botón rojo: Simula un crash inmediatamente
        </Text>
        <Text style={styles.infoText}>
          ⏰ Botón verde: Programa notificación para 30 segundos
        </Text>
        <Text style={styles.infoText}>
          🔒 La notificación programada funciona INCLUSO si cierras la app
        </Text>
        <Text style={styles.infoText}>
          📱 Toca las notificaciones para ver los detalles del evento
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 10,
    color: '#333',
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    color: '#666',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#FF3B30',
    padding: 20,
    borderRadius: 12,
    marginBottom: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  scheduleButton: {
    backgroundColor: '#34C759',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  info: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 12,
    marginTop: 20,
  },
  infoText: {
    fontSize: 14,
    color: '#666',
    marginBottom: 10,
    lineHeight: 20,
  },
});

export default HomeScreen;

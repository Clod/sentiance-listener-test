import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import MockSdkSimulator from '../services/MockSdkSimulator';

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

      <View style={styles.info}>
        <Text style={styles.infoText}>
          💡 La app generará eventos automáticamente cada 15 segundos
        </Text>
        <Text style={styles.infoText}>
          📱 Recibirás notificaciones que puedes tocar para ver detalles
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

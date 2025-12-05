import React, { useEffect, useRef } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import NotificationService from './services/NotificationService';
import MockSdkSimulator from './services/MockSdkSimulator';
import HomeScreen from './screens/HomeScreen';
import CrashDetailScreen from './screens/CrashDetailScreen';
import TimelineDetailScreen from './screens/TimelineDetailScreen';

const Stack = createNativeStackNavigator();

export default function App() {
  const navigationRef = useRef(null);

  useEffect(() => {
    // Función de inicialización
    const initialize = async () => {
      // Solicitar permisos de notificación
      await NotificationService.requestPermissions();

      // Conectar navegación con servicio de notificaciones
      NotificationService.setNavigationRef(navigationRef.current);

      // Configurar listeners de notificaciones
      const cleanup = NotificationService.setupNotificationListener();

      // Configurar listeners del SDK simulado
      const crashSubscription = MockSdkSimulator.addVehicleCrashEventListener(
        (event) => {
          console.log('📱 Crash event recibido en App:', event);
        }
      );

      const timelineSubscription = MockSdkSimulator.addTimelineUpdateListener(
        (event) => {
          console.log('📱 Timeline event recibido en App:', event);
        }
      );

      // Iniciar simulación automática cada 15 segundos
      MockSdkSimulator.startSimulation(15000);

      return () => {
        cleanup();
        crashSubscription.remove();
        timelineSubscription.remove();
        MockSdkSimulator.stopSimulation();
      };
    };

    const cleanupPromise = initialize();

    return () => {
      cleanupPromise.then((cleanup) => cleanup && cleanup());
    };
  }, []);

  return (
    <NavigationContainer ref={navigationRef}>
      <Stack.Navigator
        screenOptions={{
          headerStyle: {
            backgroundColor: '#007AFF',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
        <Stack.Screen
          name="Home"
          component={HomeScreen}
          options={{ title: '🧪 SDK Test App' }}
        />
        <Stack.Screen
          name="CrashDetail"
          component={CrashDetailScreen}
          options={{ title: 'Detalles del Crash' }}
        />
        <Stack.Screen
          name="TimelineDetail"
          component={TimelineDetailScreen}
          options={{ title: 'Detalles del Viaje' }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}

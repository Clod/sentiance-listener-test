import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

// Configurar cómo se muestran las notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

class NotificationService {
  navigationRef: any = null;

  setNavigationRef = (ref: any) => {
    this.navigationRef = ref;
  };

  // Solicitar permisos
  requestPermissions = async () => {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      alert('No se obtuvieron permisos para notificaciones');
      return false;
    }

    // Android: Configurar canal de notificación
    if (Platform.OS === 'android') {
      await Notifications.setNotificationChannelAsync('sdk-events', {
        name: 'Eventos del SDK',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF231F7C',
      });
    }

    return true;
  };

  // Mostrar notificación local
  showNotification = async (
    title: string,
    message: string,
    screen: string,
    eventData: any
  ) => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: title,
        body: message,
        sound: true,
        priority: Notifications.AndroidNotificationPriority.HIGH,
        data: {
          screen: screen,
          eventType: eventData.type,
          eventData: eventData,
        },
      },
      trigger: null, // Inmediatamente
    });
  };

  // Configurar listener para cuando se toca la notificación
  setupNotificationListener = () => {
    // Listener para cuando la app está en foreground
    const foregroundSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        console.log('Notificación recibida en foreground:', notification);
      }
    );

    // Listener para cuando se toca la notificación
    const responseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        console.log('Notificación tocada:', response);

        const { screen, eventData } = response.notification.request.content.data;

        // Navegar a la pantalla correspondiente
        if (screen && this.navigationRef) {
          this.navigationRef.navigate(screen, {
            eventData: eventData,
          });
        }
      }
    );

    return () => {
      foregroundSubscription.remove();
      responseSubscription.remove();
    };
  };

  // Cancelar todas las notificaciones
  cancelAll = async () => {
    await Notifications.cancelAllScheduledNotificationsAsync();
  };

  // Programar notificación para el futuro (funciona incluso si la app se cierra)
  scheduleDelayedNotification = async (delaySeconds: number) => {
    const random = Math.random();

    if (random < 0.5) {
      // Crash event
      const crashEvent = {
        type: 'crash_detected',
        time: Date.now() + (delaySeconds * 1000),
        location: {
          latitude: -34.6037 + (Math.random() - 0.5) * 0.1,
          longitude: -58.3816 + (Math.random() - 0.5) * 0.1,
        },
        severity: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)],
        magnitude: 2.5 + Math.random() * 5,
        confidence: 50 + Math.random() * 50,
      };

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 Colisión Detectada',
          body: `Severidad: ${crashEvent.severity}. Toca para ver detalles.`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: {
            screen: 'CrashDetail',
            eventType: crashEvent.type,
            eventData: crashEvent,
          },
        },
        trigger: { type: 'timeInterval', seconds: delaySeconds, repeats: false } as any,
      });

      console.log(`⏰ Notificación de crash programada para ${delaySeconds} segundos`);
    } else {
      // Timeline event
      const transportModes = ['CAR', 'BUS', 'TRAIN', 'WALKING'];
      const timelineEvent = {
        type: 'transport_started',
        time: Date.now() + (delaySeconds * 1000),
        transportMode: transportModes[Math.floor(Math.random() * transportModes.length)],
        location: 'Buenos Aires, Argentina',
      };

      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚗 Viaje Iniciado',
          body: `Modo: ${timelineEvent.transportMode}. Toca para ver detalles.`,
          sound: true,
          priority: Notifications.AndroidNotificationPriority.HIGH,
          data: {
            screen: 'TimelineDetail',
            eventType: timelineEvent.type,
            eventData: timelineEvent,
          },
        },
        trigger: { type: 'timeInterval', seconds: delaySeconds, repeats: false } as any,
      });

      console.log(`⏰ Notificación de timeline programada para ${delaySeconds} segundos`);
    }
  };
}

export default new NotificationService();


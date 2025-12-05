import NotificationService from './NotificationService';

interface CrashEvent {
  type: 'crash_detected';
  time: number;
  location: {
    latitude: number;
    longitude: number;
  };
  severity: 'LOW' | 'MEDIUM' | 'HIGH';
  magnitude: number;
  confidence: number;
}

interface TimelineEvent {
  type: 'transport_started' | 'transport_ended' | 'stationary';
  time: number;
  transportMode?: string;
  location: string;
}

class MockSdkSimulator {
  private timerId: NodeJS.Timeout | null = null;
  private listeners: Map<string, Function[]> = new Map();

  // Agregar listener de crash
  addVehicleCrashEventListener = (callback: (event: CrashEvent) => void) => {
    const listeners = this.listeners.get('crash') || [];
    listeners.push(callback);
    this.listeners.set('crash', listeners);

    console.log('✅ Listener de crash agregado');

    return {
      remove: () => {
        const currentListeners = this.listeners.get('crash') || [];
        const index = currentListeners.indexOf(callback);
        if (index > -1) {
          currentListeners.splice(index, 1);
        }
        console.log('❌ Listener de crash removido');
      },
    };
  };

  // Agregar listener de timeline
  addTimelineUpdateListener = (callback: (event: TimelineEvent) => void) => {
    const listeners = this.listeners.get('timeline') || [];
    listeners.push(callback);
    this.listeners.set('timeline', listeners);

    console.log('✅ Listener de timeline agregado');

    return {
      remove: () => {
        const currentListeners = this.listeners.get('timeline') || [];
        const index = currentListeners.indexOf(callback);
        if (index > -1) {
          currentListeners.splice(index, 1);
        }
        console.log('❌ Listener de timeline removido');
      },
    };
  };

  // Iniciar simulación con timer
  startSimulation = (intervalMs: number = 15000) => {
    console.log(`🔄 Iniciando simulación cada ${intervalMs / 1000} segundos`);

    this.timerId = setInterval(() => {
      const random = Math.random();

      if (random < 0.5) {
        this.simulateCrashEvent();
      } else {
        this.simulateTimelineEvent();
      }
    }, intervalMs);
  };

  // Detener simulación
  stopSimulation = () => {
    if (this.timerId) {
      clearInterval(this.timerId);
      this.timerId = null;
      console.log('⏹️ Simulación detenida');
    }
  };

  // Simular crash event
  private simulateCrashEvent = () => {
    const crashEvent: CrashEvent = {
      type: 'crash_detected',
      time: Date.now(),
      location: {
        latitude: -34.6037 + (Math.random() - 0.5) * 0.1,
        longitude: -58.3816 + (Math.random() - 0.5) * 0.1,
      },
      severity: ['LOW', 'MEDIUM', 'HIGH'][Math.floor(Math.random() * 3)] as any,
      magnitude: 2.5 + Math.random() * 5,
      confidence: 50 + Math.random() * 50,
    };

    console.log('🚨 Simulando crash event:', crashEvent);

    // Notificar a listeners
    const listeners = this.listeners.get('crash') || [];
    listeners.forEach((callback) => callback(crashEvent));

    // Mostrar notificación
    NotificationService.showNotification(
      '🚨 Colisión Detectada',
      `Severidad: ${crashEvent.severity}. Toca para ver detalles.`,
      'CrashDetail',
      crashEvent
    );
  };

  // Simular timeline event
  private simulateTimelineEvent = () => {
    const transportModes = ['CAR', 'BUS', 'TRAIN', 'WALKING'];
    const timelineEvent: TimelineEvent = {
      type: 'transport_started',
      time: Date.now(),
      transportMode: transportModes[Math.floor(Math.random() * transportModes.length)],
      location: 'Buenos Aires, Argentina',
    };

    console.log('🚗 Simulando timeline event:', timelineEvent);

    // Notificar a listeners
    const listeners = this.listeners.get('timeline') || [];
    listeners.forEach((callback) => callback(timelineEvent));

    // Mostrar notificación
    NotificationService.showNotification(
      '🚗 Viaje Iniciado',
      `Modo: ${timelineEvent.transportMode}. Toca para ver detalles.`,
      'TimelineDetail',
      timelineEvent
    );
  };

  // Invocar crash dummy
  invokeDummyVehicleCrash = () => {
    console.log('🧪 Invocando crash dummy...');
    this.simulateCrashEvent();
  };
}

export default new MockSdkSimulator();

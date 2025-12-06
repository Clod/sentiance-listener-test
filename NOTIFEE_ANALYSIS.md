# Análisis: Notifee vs expo-notifications

Evaluación técnica sobre el uso de Notifee para implementar notificaciones en pantalla completa en la app de testing de Sentiance.

## 🎯 Ventajas de Usar Notifee

### 1. Notificaciones en Pantalla Completa (Full-Screen Intent)

```typescript
await notifee.displayNotification({
  android: {
    fullScreenAction: {
      id: 'default',
    },
  },
});
```

**Beneficios:**
- ✅ La notificación **despierta la pantalla** automáticamente
- ✅ Muestra una actividad en pantalla completa (como una llamada entrante)
- ✅ Perfecto para alertas críticas (crashes, emergencias)
- ✅ Mucho más visible que una notificación normal

### 2. Más Control sobre el Diseño

- Layouts personalizados con vistas nativas
- Botones de acción más flexibles
- Mejor control de prioridad y categorías
- Soporte para notificaciones agrupadas
- Estilos personalizados (colores, iconos, imágenes grandes)

### 3. Mejor Compatibilidad Android

- Maneja mejor las diferencias entre versiones de Android (8.0+)
- Más opciones de configuración nativa
- Mejor documentación para casos avanzados
- API más cercana a las capacidades nativas de Android

### 4. Características Avanzadas

```typescript
// Ejemplo de notificación avanzada con Notifee
await notifee.displayNotification({
  title: '🚨 Colisión Detectada',
  body: 'Severidad: HIGH',
  android: {
    channelId: 'crash-alerts',
    importance: AndroidImportance.HIGH,
    fullScreenAction: { id: 'crash-detail' },
    pressAction: { id: 'crash-detail' },
    largeIcon: 'ic_launcher',
    color: '#FF0000',
    actions: [
      {
        title: 'Ver Detalles',
        pressAction: { id: 'view-details' },
      },
      {
        title: 'Descartar',
        pressAction: { id: 'dismiss' },
      },
    ],
  },
});
```

## ⚠️ Inconvenientes de Notifee

### 1. Solo Android

```
❌ No funciona en iOS
```

**Implicaciones:**
- Notifee es **exclusivo para Android**
- iOS **no soporta notificaciones de pantalla completa** de la misma manera que Android
- Para iOS necesitas una solución completamente diferente

#### Solución para iOS: CallKit + PushKit

Para lograr notificaciones de pantalla completa en iOS (especialmente para llamadas VoIP o alertas críticas), debes usar:

**CallKit:**
- Framework oficial de Apple para UI de llamadas
- Muestra pantalla completa nativa cuando el dispositivo está bloqueado
- Diseñado específicamente para llamadas entrantes
- Proporciona la misma experiencia que las llamadas telefónicas nativas

**PushKit:**
- Notificaciones VoIP que despiertan la app incluso cuando está cerrada
- Prioridad alta garantizada
- Funciona en conjunto con CallKit

**Librerías React Native para iOS:**

```bash
# Para CallKit (iOS) y ConnectionService (Android)
npm install react-native-callkeep

# Para notificaciones VoIP en iOS
npm install react-native-voip-push-notification
```

**Ejemplo de implementación:**

```typescript
import RNCallKeep from 'react-native-callkeep';
import VoipPushNotification from 'react-native-voip-push-notification';

// Configurar CallKit (iOS)
RNCallKeep.setup({
  ios: {
    appName: 'Sentiance Test',
    supportsVideo: false,
  },
  android: {
    alertTitle: 'Permissions required',
    alertDescription: 'This application needs to access your phone accounts',
  },
});

// Mostrar llamada entrante (pantalla completa en iOS)
RNCallKeep.displayIncomingCall(
  uuid,
  'Crash Alert',
  'Crash Detected',
  'generic',
  true // hasVideo
);

// Listener para cuando el usuario acepta
RNCallKeep.addEventListener('answerCall', ({ callUUID }) => {
  // Navegar a la pantalla de detalles
  navigationRef.navigate('CrashDetail', { eventData });
});
```

**Diferencias Clave iOS vs Android:**

| Aspecto | Android (Notifee) | iOS (CallKit) |
|---------|-------------------|---------------|
| **API** | Full-screen Intent | CallKit Framework |
| **Propósito** | Notificaciones generales | Específico para "llamadas" |
| **Implementación** | `fullScreenAction` | `displayIncomingCall()` |
| **Permisos** | `USE_FULL_SCREEN_INTENT` | Permisos de CallKit |
| **Restricciones** | Flexible | Debe simular una llamada |

**Limitaciones de iOS:**

❌ **No hay notificaciones de pantalla completa tradicionales**
- iOS no permite que notificaciones normales muestren pantalla completa
- Ni siquiera las notificaciones críticas (`critical`) muestran pantalla completa
- Los niveles de prioridad en iOS son:
  - Pasivas (silent)
  - Activas (banner)
  - Sensibles al tiempo (time-sensitive)
  - Críticas (critical - solo sonido fuerte, no pantalla completa)

✅ **CallKit es la única solución oficial**
- Diseñado por Apple específicamente para este propósito
- Proporciona UI nativa consistente
- Funciona incluso con el dispositivo bloqueado

**Consideraciones para tu app:**

Si necesitas pantalla completa en **ambas plataformas**:

```typescript
// Arquitectura multiplataforma
class NotificationService {
  async showCriticalAlert(crashEvent: CrashEvent) {
    if (Platform.OS === 'android') {
      // Android: Notifee con full-screen
      await notifee.displayNotification({
        android: {
          fullScreenAction: { id: 'default' },
        },
      });
    } else {
      // iOS: CallKit simulando llamada entrante
      RNCallKeep.displayIncomingCall(
        uuid,
        'Crash Alert',
        `Severity: ${crashEvent.severity}`,
        'generic',
        false
      );
    }
  }
}
```

**Implicaciones:**
- Necesitas mantener **dos implementaciones completamente diferentes**
- CallKit requiere que tu alerta se comporte como una "llamada"
- Más complejidad en testing y mantenimiento
- Diferentes UX en cada plataforma

### 2. Requiere Development Build

```
❌ No funciona en Expo Go
```

**Limitaciones:**
- Igual que con las notificaciones programadas actuales
- Necesitas hacer builds con EAS
- No puedes testear rápidamente en Expo Go
- Ciclo de desarrollo más lento para testing

### 3. Complejidad Adicional

**Configuración más compleja:**

```typescript
import notifee, { AndroidImportance } from '@notifee/react-native';

// 1. Crear canal de notificación
await notifee.createChannel({
  id: 'crash-alerts',
  name: 'Crash Alerts',
  importance: AndroidImportance.HIGH,
  sound: 'default',
  vibration: true,
  vibrationPattern: [300, 500],
});

// 2. Mostrar notificación
await notifee.displayNotification({
  title: 'Crash Detected',
  body: 'Tap to view details',
  android: {
    channelId: 'crash-alerts',
    fullScreenAction: { id: 'default' },
    pressAction: { id: 'default' },
    importance: AndroidImportance.HIGH,
  },
});
```

**vs. expo-notifications (más simple):**

```typescript
import * as Notifications from 'expo-notifications';

// Una sola llamada
await Notifications.scheduleNotificationAsync({
  content: {
    title: 'Crash Detected',
    body: 'Tap to view details',
  },
  trigger: null,
});
```

### 4. Permisos Adicionales (Android 10+)

**Configuración en `AndroidManifest.xml`:**

```xml
<manifest>
  <!-- Permiso especial para full-screen intents -->
  <uses-permission android:name="android.permission.USE_FULL_SCREEN_INTENT" />
  
  <!-- Otros permisos que ya tienes -->
  <uses-permission android:name="android.permission.VIBRATE" />
  <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
</manifest>
```

**Consideraciones:**
- Requiere permiso especial para full-screen intents
- En **Android 14+**, el usuario debe otorgar el permiso manualmente en Settings
- Más fricción en la UX inicial
- Algunos fabricantes (Samsung, Xiaomi) pueden requerir pasos adicionales

### 5. Navegación Más Compleja

**Con expo-notifications (actual):**

```typescript
// Simple y directo
Notifications.addNotificationResponseReceivedListener((response) => {
  const { screen, eventData } = response.notification.request.content.data;
  navigationRef.navigate(screen, { eventData });
});
```

**Con Notifee:**

```typescript
import notifee, { EventType } from '@notifee/react-native';

// Más complejo - necesitas manejar eventos en background
notifee.onBackgroundEvent(async ({ type, detail }) => {
  if (type === EventType.PRESS) {
    const { notification } = detail;
    const { screen, eventData } = notification.data;
    
    // Problema: navigationRef no está disponible en background
    // Solución: Usar deep linking o eventos globales
    
    // Opción 1: Deep linking
    Linking.openURL(`myapp://screen/${screen}`);
    
    // Opción 2: Evento global
    DeviceEventEmitter.emit('notification-press', { screen, eventData });
  }
});

// En App.tsx, escuchar el evento
useEffect(() => {
  const subscription = DeviceEventEmitter.addListener(
    'notification-press',
    ({ screen, eventData }) => {
      navigationRef.current?.navigate(screen, { eventData });
    }
  );
  return () => subscription.remove();
}, []);
```

### 6. Dependencia Adicional

**Impacto:**
- Aumenta el tamaño del APK (~200KB adicionales)
- Una dependencia más para mantener y actualizar
- Posibles conflictos con `expo-notifications` si se usan ambos
- Requiere configuración nativa adicional

## 📊 Comparación Detallada

| Aspecto | expo-notifications | Notifee (Android) | CallKit (iOS) |
|---------|-------------------|---------|---------------|
| **Pantalla completa** | ❌ No soportado | ✅ Full-screen intents | ✅ Llamada nativa UI |
| **Plataformas** | ✅ iOS + Android | ❌ Solo Android | ❌ Solo iOS |
| **Expo Go** | ⚠️ Limitado | ❌ No funciona | ❌ No funciona |
| **Complejidad setup** | ⭐⭐ Baja | ⭐⭐⭐⭐ Alta | ⭐⭐⭐⭐⭐ Muy alta |
| **Navegación** | ✅ Directa y simple | ⚠️ Requiere workarounds | ⚠️ Eventos de CallKit |
| **Permisos** | ✅ Básicos | ⚠️ Adicionales (Android 10+) | ⚠️ CallKit permissions |
| **Diseño personalizado** | ⚠️ Limitado | ✅ Muy flexible | ❌ UI nativa fija |
| **Documentación** | ✅ Expo docs | ✅ Notifee docs | ✅ Apple docs + RN libs |
| **Tamaño APK/IPA** | ~0KB (incluido) | ~200KB adicional | ~100KB adicional |
| **Mantenimiento** | ⭐⭐ Bajo | ⭐⭐⭐ Medio | ⭐⭐⭐⭐ Alto |
| **Curva aprendizaje** | ⭐⭐ Baja | ⭐⭐⭐⭐ Alta | ⭐⭐⭐⭐⭐ Muy alta |
| **Caso de uso ideal** | Notificaciones generales | Alertas críticas Android | "Llamadas" VoIP iOS |

## 🤔 Recomendaciones por Caso de Uso

### Mantén expo-notifications SI:

✅ **Necesitas soporte iOS**
- La app debe funcionar en ambas plataformas
- No quieres mantener dos implementaciones

✅ **Priorizas simplicidad**
- Equipo pequeño o proyecto de corto plazo
- Quieres código fácil de mantener

✅ **Las notificaciones normales son suficientes**
- No necesitas despertar la pantalla forzosamente
- Las notificaciones en la barra de estado son adecuadas

✅ **Desarrollo rápido**
- Necesitas iterar rápidamente
- Quieres testear en Expo Go cuando sea posible

### Cambia a Notifee SI:

✅ **Solo necesitas Android**
- App exclusiva para Android
- No hay planes de soporte iOS

✅ **Requieres notificaciones en pantalla completa**
- Alertas críticas que deben despertar la pantalla
- UX similar a llamadas entrantes
- Crashes vehiculares, emergencias, alarmas

✅ **Necesitas diseños muy personalizados**
- Layouts nativos complejos
- Múltiples botones de acción
- Imágenes grandes, colores personalizados

✅ **Estás dispuesto a manejar más complejidad**
- Equipo con experiencia en Android nativo
- Tiempo para implementar y testear correctamente

## 💡 Implementación Completa Multiplataforma

Si necesitas pantalla completa en **ambas plataformas**, aquí está la arquitectura completa:

### Instalación de Dependencias

```bash
# Para Android
npm install @notifee/react-native

# Para iOS
npm install react-native-callkeep
npm install react-native-voip-push-notification

# Mantener expo-notifications para fallback
# (ya está instalado)
```

### Servicio Unificado

```typescript
// services/FullScreenNotificationService.ts
import { Platform } from 'react-native';
import notifee, { AndroidImportance } from '@notifee/react-native';
import RNCallKeep from 'react-native-callkeep';
import * as Notifications from 'expo-notifications';
import uuid from 'react-native-uuid';

class FullScreenNotificationService {
  private callUUIDs: Map<string, any> = new Map();

  async initialize() {
    if (Platform.OS === 'android') {
      // Configurar Notifee para Android
      await notifee.createChannel({
        id: 'crash-alerts',
        name: 'Crash Alerts',
        importance: AndroidImportance.HIGH,
      });
    } else {
      // Configurar CallKit para iOS
      RNCallKeep.setup({
        ios: {
          appName: 'Sentiance Test',
          supportsVideo: false,
          maximumCallGroups: 1,
          maximumCallsPerCallGroup: 1,
        },
      });

      // Listener para cuando el usuario "acepta la llamada"
      RNCallKeep.addEventListener('answerCall', ({ callUUID }) => {
        const eventData = this.callUUIDs.get(callUUID);
        if (eventData) {
          // Navegar a la pantalla correspondiente
          this.navigateToScreen(eventData);
          // Terminar la "llamada" inmediatamente
          RNCallKeep.endCall(callUUID);
          this.callUUIDs.delete(callUUID);
        }
      });

      // Listener para cuando el usuario rechaza
      RNCallKeep.addEventListener('endCall', ({ callUUID }) => {
        this.callUUIDs.delete(callUUID);
      });
    }
  }

  async showCrashAlert(crashEvent: CrashEvent) {
    if (Platform.OS === 'android') {
      // Android: Notifee con pantalla completa
      await notifee.displayNotification({
        title: '🚨 Colisión Detectada',
        body: `Severidad: ${crashEvent.severity}. Toca para ver detalles.`,
        android: {
          channelId: 'crash-alerts',
          fullScreenAction: { id: 'crash-detail' },
          pressAction: { id: 'crash-detail' },
          importance: AndroidImportance.HIGH,
          color: '#FF0000',
          largeIcon: require('../assets/crash-icon.png'),
        },
        data: {
          screen: 'CrashDetail',
          eventData: JSON.stringify(crashEvent),
        },
      });
    } else {
      // iOS: CallKit simulando llamada entrante
      const callUUID = uuid.v4();
      
      // Guardar datos para recuperar después
      this.callUUIDs.set(callUUID, {
        screen: 'CrashDetail',
        eventData: crashEvent,
      });

      // Mostrar "llamada entrante" con pantalla completa
      RNCallKeep.displayIncomingCall(
        callUUID,
        'Crash Alert',
        `Severity: ${crashEvent.severity}`,
        'generic',
        false // hasVideo
      );
    }
  }

  async showTimelineAlert(timelineEvent: TimelineEvent) {
    // Para eventos menos críticos, usar notificaciones normales
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🚗 Viaje Iniciado',
        body: `Modo: ${timelineEvent.transportMode}`,
        data: {
          screen: 'TimelineDetail',
          eventData: timelineEvent,
        },
      },
      trigger: null,
    });
  }

  private navigateToScreen(data: any) {
    // Implementar navegación
    // navigationRef.current?.navigate(data.screen, { eventData: data.eventData });
  }
}

export default new FullScreenNotificationService();
```

### Configuración Nativa

**Android (`android/app/src/main/AndroidManifest.xml`):**

```xml
<manifest>
  <uses-permission android:name="android.permission.USE_FULL_SCREEN_INTENT" />
  <uses-permission android:name="android.permission.VIBRATE" />
  <uses-permission android:name="android.permission.POST_NOTIFICATIONS" />
</manifest>
```

**iOS (`ios/YourApp/Info.plist`):**

```xml
<key>UIBackgroundModes</key>
<array>
  <string>voip</string>
</array>
```

### Consideraciones Importantes

**Limitaciones de CallKit en iOS:**

⚠️ **Debe comportarse como una llamada real:**
- Apple puede rechazar tu app si usas CallKit para propósitos no relacionados con llamadas
- Está diseñado específicamente para VoIP, no para alertas generales
- Uso indebido puede resultar en rechazo del App Store

⚠️ **Alternativas para iOS sin CallKit:**

Si no puedes justificar el uso de CallKit, tus opciones en iOS son:

1. **Notificaciones Críticas (Critical Alerts)** - RECOMENDADO (requiere permiso especial de Apple):

Las notificaciones críticas son la **mejor alternativa a CallKit** para alertas importantes que no son llamadas VoIP. A diferencia de las notificaciones normales:

- ✅ **Sonido fuerte que ignora modo silencio y No Molestar**
- ✅ **Aparecen incluso con el dispositivo en modo silencio**
- ✅ **Prioridad máxima en la pantalla de bloqueo**
- ❌ **NO muestra pantalla completa** (pero es lo más cercano sin CallKit)
- ⚠️ **Requiere aprobación especial de Apple**

**Casos de uso aprobados por Apple:**
- Alertas de salud y seguridad
- Alertas de seguridad del hogar
- Alertas de emergencia pública
- Notificaciones de seguridad vehicular

📋 **Guía completa de implementación:** Ver [Notificaciones_criticas_ios.md](Notificaciones_criticas_ios.md) para instrucciones detalladas sobre cómo obtener el entitlement de Apple e implementar notificaciones críticas.

```typescript
// Ejemplo básico (ver guía completa para detalles)
await notifee.requestPermission({
  criticalAlert: true,
  alert: true,
  sound: true,
});

await Notifications.scheduleNotificationAsync({
  content: {
    title: 'Crash Alert',
    sound: 'critical-sound.wav',
    interruptionLevel: 'critical', // iOS 15+
  },
  trigger: null,
});
```

2. **Notificaciones Time-Sensitive** (iOS 15+):
   - Prioridad alta que aparece prominentemente
   - No requiere permisos especiales de Apple
   - **NO muestra pantalla completa**
   - **NO ignora modo silencio**

```typescript
await Notifications.scheduleNotificationAsync({
  content: {
    title: 'Crash Alert',
    interruptionLevel: 'timeSensitive',
  },
  trigger: null,
});
```

3. **Aceptar limitación de iOS:**
   - Usar notificaciones normales de alta prioridad
   - Confiar en que el usuario verá la notificación
   - Enfoque más realista para la mayoría de apps

**Comparación de Alternativas iOS:**

| Característica | CallKit | Critical Alerts | Time-Sensitive | Normal |
|----------------|---------|-----------------|----------------|--------|
| **Pantalla completa** | ✅ Sí | ❌ No | ❌ No | ❌ No |
| **Ignora silencio** | ✅ Sí | ✅ Sí | ❌ No | ❌ No |
| **Ignora No Molestar** | ✅ Sí | ✅ Sí | ⚠️ Parcial | ❌ No |
| **Aprobación Apple** | ⚠️ VoIP only | ⚠️ Requerida | ✅ No | ✅ No |
| **Caso de uso** | Llamadas VoIP | Emergencias/Salud | Alertas importantes | General |
| **Dificultad** | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐ | ⭐⭐ | ⭐ |

```typescript
// services/NotificationService.ts
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import notifee, { AndroidImportance } from '@notifee/react-native';

class NotificationService {
  async initialize() {
    if (Platform.OS === 'android') {
      // Configurar Notifee para Android
      await notifee.createChannel({
        id: 'crash-alerts',
        name: 'Crash Alerts',
        importance: AndroidImportance.HIGH,
      });
    }
    
    // Configurar expo-notifications para iOS
    await Notifications.requestPermissionsAsync();
  }

  async showCrashNotification(crashEvent: CrashEvent) {
    if (Platform.OS === 'android') {
      // Android: Usar Notifee con pantalla completa
      await notifee.displayNotification({
        title: '🚨 Colisión Detectada',
        body: `Severidad: ${crashEvent.severity}. Toca para ver detalles.`,
        android: {
          channelId: 'crash-alerts',
          fullScreenAction: { id: 'crash-detail' },
          pressAction: { id: 'crash-detail' },
          importance: AndroidImportance.HIGH,
          color: '#FF0000',
        },
        data: {
          screen: 'CrashDetail',
          eventData: JSON.stringify(crashEvent),
        },
      });
    } else {
      // iOS: Usar expo-notifications
      await Notifications.scheduleNotificationAsync({
        content: {
          title: '🚨 Colisión Detectada',
          body: `Severidad: ${crashEvent.severity}. Toca para ver detalles.`,
          data: {
            screen: 'CrashDetail',
            eventData: crashEvent,
          },
        },
        trigger: null,
      });
    }
  }

  async showTimelineNotification(timelineEvent: TimelineEvent) {
    // Para eventos menos críticos, usar expo-notifications en ambas plataformas
    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🚗 Viaje Iniciado',
        body: `Modo: ${timelineEvent.transportMode}`,
        data: {
          screen: 'TimelineDetail',
          eventData: timelineEvent,
        },
      },
      trigger: null,
    });
  }
}
```

**Ventajas del enfoque híbrido:**
- ✅ Pantalla completa en Android para crashes críticos
- ✅ Soporte iOS con expo-notifications
- ✅ Notificaciones normales para eventos menos importantes
- ⚠️ Más código para mantener

## 🎯 Recomendación para Tu Proyecto

### Contexto: App de Testing de Notificaciones en Background

**Objetivo:** Demostrar que las notificaciones funcionan desde background

#### Si el objetivo es solo demostrar que funciona:
**→ Mantén `expo-notifications`**
- ✅ Ya funciona correctamente
- ✅ Más simple de mantener
- ✅ Cumple el objetivo
- ✅ Código más limpio y fácil de explicar

#### Si necesitas impresionar con UX premium:
**→ Usa Notifee**
- ✅ Pantalla completa es más impactante
- ✅ Mejor para demos y presentaciones
- ✅ Muestra capacidades avanzadas de Android
- ⚠️ Solo si el público es Android-only

#### Si es para producción real de detección de crashes:
**→ Usa Notifee**
- ✅ Alertas críticas requieren pantalla completa
- ✅ Mejor UX para emergencias
- ✅ Estándar de la industria para este tipo de alertas
- ✅ Vale la pena la complejidad adicional

## 📋 Pasos para Implementar Notifee (Si Decides Usarlo)

### 1. Instalación

```bash
npm install @notifee/react-native
```

### 2. Configuración Android

```xml
<!-- android/app/src/main/AndroidManifest.xml -->
<manifest>
  <uses-permission android:name="android.permission.USE_FULL_SCREEN_INTENT" />
</manifest>
```

### 3. Crear Canales de Notificación

```typescript
// services/NotificationService.ts
import notifee, { AndroidImportance } from '@notifee/react-native';

async createChannels() {
  await notifee.createChannel({
    id: 'crash-alerts',
    name: 'Crash Alerts',
    importance: AndroidImportance.HIGH,
    sound: 'default',
  });
}
```

### 4. Mostrar Notificaciones

```typescript
async showFullScreenNotification(crashEvent: CrashEvent) {
  await notifee.displayNotification({
    title: '🚨 Colisión Detectada',
    body: `Severidad: ${crashEvent.severity}`,
    android: {
      channelId: 'crash-alerts',
      fullScreenAction: { id: 'default' },
      pressAction: { id: 'default' },
    },
    data: { screen: 'CrashDetail', eventData: JSON.stringify(crashEvent) },
  });
}
```

### 5. Manejar Navegación

```typescript
// App.tsx
import notifee, { EventType } from '@notifee/react-native';

useEffect(() => {
  return notifee.onForegroundEvent(({ type, detail }) => {
    if (type === EventType.PRESS) {
      const { screen, eventData } = detail.notification.data;
      navigationRef.current?.navigate(screen, {
        eventData: JSON.parse(eventData),
      });
    }
  });
}, []);
```

## 🔗 Recursos Adicionales

### Notifee (Android)
- [Notifee Documentation](https://notifee.app/)
- [Full-Screen Intents Guide](https://notifee.app/react-native/docs/android/behaviour#full-screen-notifications)
- [Android Notification Best Practices](https://developer.android.com/develop/ui/views/notifications)

### CallKit (iOS)
- [react-native-callkeep Documentation](https://github.com/react-native-webrtc/react-native-callkeep)
- [Apple CallKit Framework](https://developer.apple.com/documentation/callkit)
- [react-native-voip-push-notification](https://github.com/react-native-webrtc/react-native-voip-push-notification)
- [iOS VoIP Best Practices](https://developer.apple.com/documentation/pushkit/responding_to_voip_notifications_from_pushkit)

### Expo Notifications
- [expo-notifications Documentation](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [iOS Notification Levels](https://developer.apple.com/documentation/usernotifications/unnotificationinterruptionlevel)

### General
- [Push Notification Best Practices](https://documentation.onesignal.com/docs/notification-best-practices)

## 📝 Conclusión

**Para tu caso específico (app de testing):**

### Opción 1: Solo Android con Pantalla Completa
- ✅ **Usa Notifee** solo para Android
- ✅ Mantén `expo-notifications` para iOS (sin pantalla completa)
- ✅ Documenta que la pantalla completa es exclusiva de Android
- ⚠️ Diferentes experiencias en cada plataforma

### Opción 2: Pantalla Completa en Ambas Plataformas
- ⚠️ **Notifee** para Android + **CallKit** para iOS
- ❌ Muy compleja de implementar y mantener
- ❌ CallKit puede ser rechazado por Apple si no es para VoIP real
- ❌ Solo justificable para apps de producción real

### Opción 3: Mantener Simplicidad (RECOMENDADA)
- ✅ **Mantén expo-notifications** en ambas plataformas
- ✅ Notificaciones de alta prioridad son suficientes para testing
- ✅ Código simple y mantenible
- ✅ Funciona igual en iOS y Android

**Mi recomendación final:**

1. **Para testing/demo:** Mantén `expo-notifications` - cumple el objetivo sin complejidad innecesaria

2. **Para producción Android-only:** Implementa Notifee - las alertas críticas merecen pantalla completa

3. **Para producción multiplataforma:** Evalúa si realmente necesitas pantalla completa:
   - Si es para VoIP real → Usa CallKit + Notifee
   - Si es para alertas generales → Mantén expo-notifications con notificaciones críticas/time-sensitive

**Realidad de iOS:**
- No existe una forma "simple" de hacer pantalla completa en iOS
- CallKit es la única opción, pero está restringida a casos de uso de llamadas
- Para la mayoría de apps, notificaciones de alta prioridad son suficientes
- Apple es muy estricta con el uso indebido de CallKit

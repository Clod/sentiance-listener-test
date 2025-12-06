# Sentiance Listener Test App

Una aplicación de prueba para demostrar notificaciones en background en React Native/Expo, simulando eventos de un SDK de detección de colisiones y seguimiento de viajes.

## 📱 Descripción Funcional

Esta app demuestra cómo enviar notificaciones locales que funcionan **incluso cuando la aplicación está completamente cerrada**, y cómo navegar a pantallas específicas cuando el usuario toca una notificación.

### Funcionalidades

#### 1. 🚨 Simulación de Crash Inmediata
- Botón rojo que genera una notificación de colisión vehicular al instante
- Simula datos de crash: severidad, magnitud, ubicación, confianza
- Solo funciona con la app en foreground

#### 2. ⏰ Notificación Programada en Background
- Botón verde que programa una notificación para 30 segundos en el futuro (NO es exacto)
- **Funciona incluso si se cierra la app completamente** y si el teléfono está bloqueado muestra la notificación en la pantalla de bloqueo.
- Genera aleatoriamente eventos de crash o timeline (viaje)
- Demuestra que las notificaciones pueden dispararse desde background

#### 3. 📱 Navegación Contextual
- Al tocar cualquier notificación, la app se abre en la pantalla correspondiente:
  - Notificación de crash → `CrashDetailScreen`
  - Notificación de viaje → `TimelineDetailScreen`
- Los datos del evento se pasan automáticamente a la pantalla

### Tipos de Eventos

**Crash Events:**
- Severidad: LOW, MEDIUM, HIGH
- Magnitud: 2.5 - 7.5
- Confianza: 50% - 100%
- Ubicación GPS simulada (Buenos Aires)

**Timeline Events:**
- Modos de transporte: CAR, BUS, TRAIN, WALKING
- Timestamp del evento
- Ubicación

## 🛠️ Implementación Técnica

### Arquitectura

```
App.tsx
├── NotificationService (gestión de notificaciones)
├── MockSdkSimulator (simulación de eventos)
└── Navigation Stack
    ├── HomeScreen
    ├── CrashDetailScreen
    └── TimelineDetailScreen
```

### Notificaciones en Background

#### Cómo Funciona

La app usa `expo-notifications` con **scheduled notifications** (notificaciones programadas) en lugar de background tasks:

```typescript
// NotificationService.ts
await Notifications.scheduleNotificationAsync({
  content: {
    title: '🚨 Colisión Detectada',
    body: `Severidad: ${crashEvent.severity}`,
    data: {
      screen: 'CrashDetail',
      eventType: crashEvent.type,
      eventData: crashEvent
    }
  },
  trigger: { 
    type: 'timeInterval', 
    seconds: 30, 
    repeats: false 
  }
});
```

**Por qué funciona en background:**
1. La notificación se **programa** cuando presionas el botón
2. El sistema operativo almacena la notificación programada
3. Cuando llega el momento (30 segundos), **el OS dispara la notificación**
4. Esto funciona incluso si la app está cerrada porque el OS se encarga de todo

**Alternativa descartada:**
- Inicialmente se intentó usar `expo-background-fetch` para ejecutar código periódicamente en background
- **Problema**: Android restringe severamente los background tasks por ahorro de batería
- **Solución**: Usar notificaciones programadas que son manejadas nativamente por el OS

### Sistema de Navegación

#### Configuración del Handler

```typescript
// NotificationService.ts
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});
```

#### Listener de Respuesta a Notificaciones

```typescript
// NotificationService.ts
Notifications.addNotificationResponseReceivedListener((response) => {
  const { screen, eventData } = response.notification.request.content.data;
  
  if (screen && this.navigationRef) {
    this.navigationRef.navigate(screen, { eventData });
  }
});
```

**Flujo de navegación:**
1. Usuario toca la notificación
2. El listener captura el evento `NotificationResponse`
3. Extrae `screen` y `eventData` del payload de la notificación
4. Usa `navigationRef` para navegar a la pantalla correcta
5. Pasa los datos del evento como parámetros de navegación

#### Conexión con React Navigation

```typescript
// App.tsx
const navigationRef = useRef(null);

useEffect(() => {
  // Conectar la referencia de navegación con el servicio
  NotificationService.setNavigationRef(navigationRef.current);
}, []);

return (
  <NavigationContainer ref={navigationRef}>
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} />
      <Stack.Screen name="CrashDetail" component={CrashDetailScreen} />
      <Stack.Screen name="TimelineDetail" component={TimelineDetailScreen} />
    </Stack.Navigator>
  </NavigationContainer>
);
```

### Estructura de Datos

#### Payload de Notificación

```typescript
{
  content: {
    title: string,
    body: string,
    data: {
      screen: 'CrashDetail' | 'TimelineDetail',
      eventType: 'crash_detected' | 'transport_started',
      eventData: CrashEvent | TimelineEvent
    }
  },
  trigger: TimeIntervalTriggerInput | null
}
```

#### Crash Event

```typescript
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
```

#### Timeline Event

```typescript
interface TimelineEvent {
  type: 'transport_started';
  time: number;
  transportMode: 'CAR' | 'BUS' | 'TRAIN' | 'WALKING';
  location: string;
}
```

## 🚀 Instalación y Uso

### Prerrequisitos

- Node.js 18+
- npm o yarn
- Expo CLI
- Para testing en background: EAS Build (no funciona en Expo Go)

### Instalación

```bash
# Clonar el repositorio
git clone <repository-url>
cd sentiance-listener-test

# Instalar dependencias
npm install
```

### Desarrollo

```bash
# Iniciar en modo desarrollo (Expo Go)
npm start

# Nota: Las notificaciones programadas NO funcionan en Expo Go
# Solo funcionan en development builds o production builds
```

### Build para Testing en Background

```bash
# Build de desarrollo para Android
eas build --profile development --platform android

# Build de preview para Android
eas build --profile preview --platform android

# Una vez completado el build, descarga e instala el APK en tu dispositivo
```

### Cómo Probar

<img src="readme_images/download_link.png" alt="download_link" width="33%">

1. **Instala el build** en un dispositivo Android físico
2. **Abre la app** y otorga permisos de notificaciones
3. **Presiona el botón verde** "⏰ Programar Notificación (30s)"
4. **Cierra la app completamente** (desliza hacia arriba en el app switcher)
5. **Espera 30 segundos**
6. ✅ Deberías recibir una notificación
7. **Toca la notificación** para abrir la app en la pantalla de detalles

## 📦 Dependencias Principales

| Paquete | Versión | Propósito |
|---------|---------|-----------|
| `expo` | ~54.0.27 | Framework principal |
| `expo-notifications` | ~0.32.14 | Sistema de notificaciones locales |
| `@react-navigation/native` | ^7.1.24 | Navegación entre pantallas |
| `@react-navigation/native-stack` | ^7.8.5 | Stack navigator |
| `react-native` | 0.81.5 | Framework de UI |

## 📁 Estructura del Proyecto

```
sentiance-listener-test/
├── App.tsx                          # Punto de entrada, configuración de navegación
├── services/
│   ├── NotificationService.ts       # Gestión de notificaciones y navegación
│   └── MockSdkSimulator.ts          # Simulación de eventos del SDK
├── screens/
│   ├── HomeScreen.tsx               # Pantalla principal con botones
│   ├── CrashDetailScreen.tsx        # Detalles de colisión
│   └── TimelineDetailScreen.tsx     # Detalles de viaje
├── app.json                         # Configuración de Expo
└── package.json                     # Dependencias
```

## 🔧 Configuración de Notificaciones

### Android

El canal de notificaciones se configura automáticamente:

```typescript
// NotificationService.ts
await Notifications.setNotificationChannelAsync('sdk-events', {
  name: 'Eventos del SDK',
  importance: Notifications.AndroidImportance.MAX,
  vibrationPattern: [0, 250, 250, 250],
  lightColor: '#FF231F7C',
});
```

### iOS

Los permisos se solicitan automáticamente al iniciar la app:

```typescript
const { status } = await Notifications.requestPermissionsAsync();
```

## ⚠️ Limitaciones Conocidas

1. **Expo Go**: Las notificaciones programadas NO funcionan en Expo Go. Debes usar un development build o production build.

2. **Background Tasks**: No se usan background tasks periódicos porque Android los restringe severamente. En su lugar, se usan notificaciones programadas.

3. **iOS Background**: iOS tiene limitaciones más estrictas que Android para notificaciones locales en background.

4. **Timing**: El delay de 30 segundos es fijo en el código. Para cambiarlo, modifica:
   ```typescript
   // HomeScreen.tsx, línea 23
   await NotificationService.scheduleDelayedNotification(60); // 60 segundos
   ```

## 🎯 Casos de Uso

Esta app es útil para:
- Demostrar notificaciones en background en React Native
- Probar navegación contextual desde notificaciones
- Simular eventos de SDKs externos (telemetría, crash detection, etc.)
- Testing de UX de notificaciones
- Aprender sobre `expo-notifications` y React Navigation

## 📝 Notas Técnicas

### Por qué no usar Background Tasks

Inicialmente se consideró usar `expo-background-fetch` para ejecutar código periódicamente en background, pero:

- Android Doze Mode restringe severamente la ejecución en background
- Los intervalos mínimos no se respetan (15 segundos se convierte en 15+ minutos)
- Requiere que el usuario desactive la optimización de batería
- No es confiable para notificaciones en tiempo real

### Ventajas de Notificaciones Programadas

- ✅ Manejadas nativamente por el OS
- ✅ Funcionan con la app cerrada
- ✅ No requieren permisos especiales de background
- ✅ Confiables y predecibles
- ✅ Respetan el timing especificado
- ✅ No afectan la batería


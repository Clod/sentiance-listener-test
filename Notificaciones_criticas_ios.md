# Guía Completa: Notificaciones Críticas en iOS

## 📱 ¿Qué son las Notificaciones Críticas?

Las **Critical Alerts** son un tipo especial de notificación en iOS que tienen la capacidad de:

- ✅ **Ignorar el modo silencio** del dispositivo
- ✅ **Ignorar el modo No Molestar**
- ✅ **Reproducir sonido a volumen alto** incluso si el dispositivo está silenciado
- ✅ **Aparecer en la pantalla de bloqueo** con prioridad máxima
- ❌ **NO muestran pantalla completa** (para eso se necesita CallKit)

### Diferencias con Notificaciones Normales

| Característica | Normal | Time-Sensitive | Critical |
|----------------|--------|----------------|----------|
| **Ignora silencio** | ❌ No | ❌ No | ✅ Sí |
| **Ignora No Molestar** | ❌ No | ⚠️ Parcial | ✅ Sí |
| **Sonido garantizado** | ❌ No | ❌ No | ✅ Sí |
| **Pantalla completa** | ❌ No | ❌ No | ❌ No |
| **Aprobación Apple** | ✅ No | ✅ No | ⚠️ **Sí** |

## 🎯 Casos de Uso Apropiados

Apple **solo aprueba** Critical Alerts para casos específicos:

### ✅ Casos Aprobados:
- **Salud y seguridad personal:**
  - Alertas de glucosa en sangre (diabetes)
  - Alertas de ritmo cardíaco
  - Recordatorios críticos de medicación
  
- **Seguridad del hogar:**
  - Detectores de humo/monóxido de carbono
  - Sistemas de alarma de intrusión
  - Alertas de inundación o fugas

- **Emergencias públicas:**
  - Alertas meteorológicas severas
  - Alertas de terremotos
  - Notificaciones de evacuación

- **Seguridad vehicular:**
  - Alertas de colisión detectada
  - Sistemas de asistencia en carretera
  - Alertas de vehículo robado

### ❌ Casos NO Aprobados:
- Notificaciones de marketing
- Recordatorios generales
- Mensajes de chat
- Actualizaciones de apps
- Notificaciones de redes sociales

## 📋 Proceso de Implementación

### Paso 1: Solicitar Aprobación de Apple

Antes de implementar, **debes obtener aprobación de Apple**. Este es un proceso manual que puede tomar varios días.

#### Cómo Solicitar:

1. **Preparar documentación:**
   - Descripción detallada de tu app
   - Explicación de por qué necesitas Critical Alerts
   - Tipo específico de alertas que enviarás
   - Frecuencia estimada de las alertas
   - Justificación de por qué son críticas

2. **Enviar solicitud:**
   - Ir a [Apple Developer Contact](https://developer.apple.com/contact/request/)
   - Seleccionar "Request Entitlement"
   - Elegir "Critical Alerts"
   - Completar el formulario con la información preparada

3. **Esperar respuesta:**
   - Apple revisará tu solicitud (puede tomar 1-2 semanas)
   - Pueden solicitar información adicional
   - Te notificarán por email si es aprobada o rechazada

⚠️ **Importante:** No puedes usar Critical Alerts sin aprobación. Tu app será rechazada en el App Store Review.

### Paso 2: Configurar el Entitlement

Una vez aprobado por Apple:

#### 2.1 En el Portal de Desarrolladores

1. Ir a [developer.apple.com/account](https://developer.apple.com/account)
2. Navegar a **Certificates, Identifiers & Profiles**
3. Seleccionar **Identifiers**
4. Elegir tu **App ID**
5. En la lista de capabilities, activar **"Critical Alerts"**
6. Guardar cambios
7. **Regenerar** tus provisioning profiles

#### 2.2 En Xcode

Agregar el entitlement al archivo `.entitlements` de tu proyecto:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
    <key>com.apple.developer.usernotifications.critical-alerts</key>
    <true/>
</dict>
</plist>
```

**Para proyectos Expo/React Native:**

Agregar a `app.json`:

```json
{
  "expo": {
    "ios": {
      "entitlements": {
        "com.apple.developer.usernotifications.critical-alerts": true
      }
    }
  }
}
```

### Paso 3: Solicitar Permiso al Usuario

El usuario **debe otorgar permiso explícito** para Critical Alerts (adicional al permiso normal de notificaciones).

#### Con expo-notifications:

```typescript
import * as Notifications from 'expo-notifications';

async function requestCriticalAlertPermission() {
  const { status } = await Notifications.requestPermissionsAsync({
    ios: {
      allowAlert: true,
      allowSound: true,
      allowCriticalAlerts: true, // Permiso adicional
    },
  });

  if (status !== 'granted') {
    console.log('Permisos de notificación denegados');
    return false;
  }

  console.log('Permisos otorgados, incluyendo Critical Alerts');
  return true;
}
```

#### Con Notifee:

```typescript
import notifee from '@notifee/react-native';

async function requestCriticalAlertPermission() {
  const settings = await notifee.requestPermission({
    criticalAlert: true,
    alert: true,
    sound: true,
    badge: true,
  });

  if (settings.criticalAlert === 1) {
    console.log('Critical Alerts aprobadas');
    return true;
  } else {
    console.log('Critical Alerts denegadas');
    return false;
  }
}
```

**Diálogo que verá el usuario:**

El sistema mostrará DOS diálogos:
1. Permiso normal de notificaciones
2. Permiso específico para Critical Alerts (con advertencia de que ignorarán No Molestar)

### Paso 4: Enviar Notificaciones Críticas

#### Notificaciones Locales (expo-notifications)

```typescript
import * as Notifications from 'expo-notifications';

async function sendCriticalAlert(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
      sound: 'default', // Sonará incluso en modo silencio
      interruptionLevel: 'critical', // iOS 15+
      // Para iOS 14 y anteriores, usar:
      // criticalAlert: {
      //   name: 'default',
      //   volume: 1.0,
      // },
    },
    trigger: null, // Enviar inmediatamente
  });
}

// Uso:
await sendCriticalAlert(
  '🚨 Colisión Detectada',
  'Severidad: HIGH. Toca para ver detalles.'
);
```

#### Notificaciones Locales (Notifee)

```typescript
import notifee, { IOSNotificationSetting } from '@notifee/react-native';

async function sendCriticalAlert(title: string, body: string) {
  // Verificar que tenemos permiso
  const settings = await notifee.getNotificationSettings();
  
  if (settings.ios.criticalAlert !== IOSNotificationSetting.ENABLED) {
    console.log('Critical Alerts no están habilitadas');
    return;
  }

  await notifee.displayNotification({
    title: title,
    body: body,
    ios: {
      sound: 'default',
      critical: true, // Marca como crítica
      criticalVolume: 1.0, // Volumen máximo (0.0 - 1.0)
    },
  });
}
```

#### Notificaciones Remotas (Push desde servidor)

Si envías desde un servidor, el payload debe incluir:

```json
{
  "aps": {
    "alert": {
      "title": "🚨 Colisión Detectada",
      "body": "Severidad: HIGH. Toca para ver detalles."
    },
    "sound": {
      "critical": 1,
      "name": "default",
      "volume": 1.0
    },
    "interruption-level": "critical"
  }
}
```

**Campos importantes:**
- `critical: 1` - Marca la notificación como crítica
- `volume: 1.0` - Volumen de 0.0 a 1.0 (1.0 = máximo)
- `interruption-level: "critical"` - Para iOS 15+

## 🔧 Ejemplo Completo para App de Crashes

```typescript
// services/CriticalNotificationService.ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

class CriticalNotificationService {
  private hasPermission = false;

  async initialize() {
    if (Platform.OS !== 'ios') {
      console.log('Critical Alerts solo disponibles en iOS');
      return;
    }

    // Solicitar permisos
    const { status } = await Notifications.requestPermissionsAsync({
      ios: {
        allowAlert: true,
        allowSound: true,
        allowCriticalAlerts: true,
      },
    });

    this.hasPermission = status === 'granted';
    
    if (!this.hasPermission) {
      console.log('⚠️ Permisos de Critical Alerts no otorgados');
    } else {
      console.log('✅ Critical Alerts habilitadas');
    }
  }

  async sendCrashAlert(crashData: {
    severity: 'LOW' | 'MEDIUM' | 'HIGH';
    location: string;
    time: number;
  }) {
    if (!this.hasPermission) {
      console.log('No hay permiso para Critical Alerts');
      return;
    }

    await Notifications.scheduleNotificationAsync({
      content: {
        title: '🚨 Colisión Detectada',
        body: `Severidad: ${crashData.severity}\nUbicación: ${crashData.location}`,
        sound: 'default',
        interruptionLevel: 'critical',
        data: {
          screen: 'CrashDetail',
          crashData: crashData,
        },
      },
      trigger: null,
    });

    console.log('✅ Critical Alert enviada');
  }
}

export default new CriticalNotificationService();
```

**Uso en la app:**

```typescript
// App.tsx
import CriticalNotificationService from './services/CriticalNotificationService';

useEffect(() => {
  CriticalNotificationService.initialize();
}, []);

// Cuando detectas un crash:
await CriticalNotificationService.sendCrashAlert({
  severity: 'HIGH',
  location: 'Buenos Aires, Argentina',
  time: Date.now(),
});
```

## 🐛 Troubleshooting

### Problema: El permiso no aparece

**Causa:** El entitlement no está configurado correctamente.

**Solución:**
1. Verificar que Apple aprobó tu solicitud
2. Confirmar que el entitlement está en `app.json`
3. Hacer un clean build: `eas build --clear-cache`
4. Verificar que el provisioning profile incluye el entitlement

### Problema: La notificación no suena en modo silencio

**Causa:** No está marcada como crítica correctamente.

**Solución:**
```typescript
// Asegúrate de usar interruptionLevel
content: {
  interruptionLevel: 'critical', // iOS 15+
}

// O para iOS 14:
content: {
  criticalAlert: {
    name: 'default',
    volume: 1.0,
  },
}
```

### Problema: App rechazada en App Store Review

**Causa:** Uso inapropiado de Critical Alerts.

**Solución:**
- Revisar que tu caso de uso está en la lista de aprobados
- Agregar documentación clara en App Review Notes
- Explicar por qué cada alerta es "crítica"
- Considerar usar Time-Sensitive en su lugar

### Problema: El usuario no ve el diálogo de permiso

**Causa:** Ya respondió anteriormente o el entitlement falta.

**Solución:**
```typescript
// Verificar estado actual
const settings = await Notifications.getPermissionsAsync();
console.log('Critical Alerts:', settings.ios?.allowsCriticalAlerts);

// Si ya fue denegado, dirigir a Settings
if (!settings.ios?.allowsCriticalAlerts) {
  Alert.alert(
    'Permisos Requeridos',
    'Para recibir alertas críticas, habilita "Critical Alerts" en Ajustes',
    [
      { text: 'Cancelar' },
      { text: 'Abrir Ajustes', onPress: () => Linking.openSettings() },
    ]
  );
}
```

## ⚖️ Comparación con Alternativas

### Critical Alerts vs CallKit

| Aspecto | Critical Alerts | CallKit |
|---------|----------------|---------|
| **Pantalla completa** | ❌ No | ✅ Sí |
| **Ignora silencio** | ✅ Sí | ✅ Sí |
| **Caso de uso** | Emergencias/Salud | Solo VoIP |
| **Aprobación** | Requerida | Requerida |
| **Complejidad** | ⭐⭐⭐⭐ Media-Alta | ⭐⭐⭐⭐⭐ Muy Alta |
| **Rechazo App Store** | Posible | Muy probable si no es VoIP |

**Recomendación:** Para alertas de crashes vehiculares, **Critical Alerts es mejor opción** que CallKit, ya que CallKit está restringido a VoIP.

### Critical Alerts vs Time-Sensitive

| Aspecto | Critical Alerts | Time-Sensitive |
|---------|----------------|----------------|
| **Ignora silencio** | ✅ Sí | ❌ No |
| **Ignora No Molestar** | ✅ Sí | ⚠️ Parcial |
| **Aprobación Apple** | ⚠️ Requerida | ✅ No |
| **Implementación** | Compleja | Simple |

**Recomendación:** Si no puedes obtener aprobación de Apple, usa Time-Sensitive como alternativa.

## 📚 Recursos Adicionales

### Documentación Oficial
- [Apple: UNNotificationInterruptionLevel](https://developer.apple.com/documentation/usernotifications/unnotificationinterruptionlevel)
- [Apple: Generating Remote Notifications](https://developer.apple.com/documentation/usernotifications/generating-a-remote-notification)
- [Expo Notifications](https://docs.expo.dev/versions/latest/sdk/notifications/)
- [Notifee iOS Permissions](https://notifee.app/react-native/reference/iosnotificationpermissions/)

### Guías y Tutoriales
- [Using Critical Alerts on iOS](https://blog.kulman.sk/using-critical-alerts-on-ios/)
- [How to Implement Critical Alerts in iOS 12](http://tapcode.co/2018/10/17/how-to-implement-critical-alerts-in-ios-12/)
- [iOS Focus Modes and Interruption Levels](https://documentation.onesignal.com/docs/en/ios-focus-modes-and-interruption-levels)

### Comunidad
- [Stack Overflow: Critical Alerts Implementation](https://stackoverflow.com/questions/66057840/ios-how-do-you-implement-critical-alerts-for-your-app-when-you-dont-have-an-en)
- [GitHub: Flutter Critical Alert Permission](https://github.com/lucaspal/flutter_critical_alert_permission_ios)

## ✅ Checklist de Implementación

- [ ] Verificar que tu caso de uso califica para Critical Alerts
- [ ] Solicitar aprobación a Apple (esperar 1-2 semanas)
- [ ] Configurar entitlement en developer.apple.com
- [ ] Agregar entitlement a app.json o .entitlements
- [ ] Regenerar provisioning profiles
- [ ] Implementar solicitud de permisos en el código
- [ ] Implementar envío de notificaciones críticas
- [ ] Probar en dispositivo físico (no funciona en simulador)
- [ ] Verificar que suena en modo silencio
- [ ] Verificar que aparece con No Molestar activado
- [ ] Preparar documentación para App Review
- [ ] Enviar a App Store Review

## 🎯 Conclusión

Las Critical Alerts son una herramienta poderosa para apps que manejan información crítica de salud, seguridad o emergencias. Sin embargo:

- ⚠️ **Requieren aprobación de Apple** - proceso que puede tomar semanas
- ⚠️ **Uso restringido** - solo para casos específicos
- ⚠️ **No muestran pantalla completa** - para eso necesitas CallKit
- ✅ **Mejor alternativa a CallKit** para alertas no-VoIP

Para una app de detección de crashes vehiculares, Critical Alerts son **apropiadas y probablemente serán aprobadas** por Apple, ya que entran en la categoría de "seguridad vehicular".
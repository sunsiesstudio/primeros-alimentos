# Primeros alimentos en el App Store (iOS)

La web sigue siendo la misma (`index.html`). Para iOS va dentro de una app nativa hecha con **Capacitor 8**,
sin npm: el proyecto de Xcode está en `ios/` y Xcode descarga él solo sus dependencias (Capacitor, Firebase, Google Sign-In).

- Bundle ID: `com.sunsiesstudio.primerosalimentos` (no se puede cambiar).
- App en App Store Connect: **Primeros alimentos** (Apple ID 6825301376), idioma principal Español (España).
- Equipo de firma: Martina Solés Caldés. Firma automática; el certificado *Apple Distribution* ya está en el Mac.
- Login en iOS: Apple, Google y email (botones nativos). En la web, igual que antes.
- En el Mac, el proyecto está en `~/Documents/primeros-alimentos-app`.

## Qué hay en el repo

| Ruta | Qué es |
|---|---|
| `ios/App/App.xcodeproj` | El proyecto de Xcode (ábrelo con doble clic) |
| `ios/capacitor-firebase-authentication/` | Plugin de login (Apple + Google) de capawesome, licencia MIT, sin Facebook |
| `GoogleService-Info.plist` | Configuración de Firebase para iOS (no es secreta) |
| `assets/` | Icono 1024 y pantallas de carga (claro y oscuro) |
| `scripts/build.mjs` | Copia la web dentro de la app (`ios/App/App/public`) |
| `scripts/ios-setup.mjs` | Ajustes de Xcode: permisos, Sign in with Apple, solo iPhone en vertical, plist de Firebase |

## Cada vez que cambies la web y quieras una versión nueva de la app

1. Copia la web dentro del proyecto: `node scripts/build.mjs` (o pídeselo a Claude).
2. Abre `ios/App/App.xcodeproj`.
3. Target **App › General › Identity**: sube **Build** (1 → 2…). Si es una versión nueva para el público, sube también **Version** (1.0 → 1.1).
4. Destino arriba: **Any iOS Device (arm64)** o tu iPhone.
5. **Product › Archive** → en el Organizer, **Distribute App › App Store Connect › Distribute**.
6. A los 10–30 min aparece en App Store Connect › **TestFlight**.

## Probar con TestFlight

1. App Store Connect › Primeros alimentos › **TestFlight**. Si pide "Información de cumplimiento de exportación", ya está respondida en la app (no usa cifrado propio).
2. En **Pruebas internas**, crea un grupo y añádete con tu Apple ID.
3. Instala **TestFlight** en el iPhone desde el App Store y acepta la invitación.

Checklist de prueba:
- [ ] Entrar con Apple, con Google y con email
- [ ] Cerrar sesión y volver a entrar: los datos siguen ahí
- [ ] Foto de perfil desde la cámara y desde la galería
- [ ] Compartir la lista de la compra / el resumen
- [ ] Abrir Términos y Política de privacidad, y volver
- [ ] Borrar una cuenta de prueba (con Apple y con Google)
- [ ] Modo oscuro

## Ficha del App Store: qué falta (antes de "Enviar a revisión")

Ya hecho: categoría (Salud y forma física + Comida y bebida), subtítulo, clasificación por edad (13+), derechos de contenido,
URL de la política de privacidad y tipos de datos declarados (nombre, email, salud, fotos, otro contenido, ID de usuario).

Pendiente:
- **Privacidad de la app**: en cada tipo de dato, "Set Up": uso = *Funcionalidad de la app*, vinculado al usuario = *Sí*, seguimiento = *No*. Luego **Publish**.
- **Política de privacidad pública**: la versión nueva de `privacy.html` (con Apple, email y fotos) tiene que estar publicada en la web antes de enviar a revisión.
- **Versión 1.0**: capturas de iPhone 6,9" (1320 × 2868, hechas en el simulador iPhone 17 Pro Max), descripción, palabras clave, URL de soporte, copyright.
- **Información para la revisión**: cuenta de prueba con email y contraseña (con un bebé y algunos alimentos) y un teléfono de contacto.
- **Compilación**: elegir la que subiste (1.0 (1)).
- **Digital Services Act (UE)**: App Store Connect › Business › declarar si eres *trader*. Si lo eres, tu dirección, teléfono y email se mostrarán públicamente en la tienda de la UE. Es obligatorio para distribuir en España.
- **Precio y disponibilidad**: gratis, países.

## Motivos de rechazo y cómo están cubiertos

| Norma de Apple | Estado |
|---|---|
| 4.8 – Si hay login con Google, debe haber "Iniciar sesión con Apple" | Hecho |
| 5.1.1(v) – Borrar la cuenta desde la app | Ya existía; con Apple además se revoca el acceso |
| 5.1.1 – Textos claros al pedir cámara y fotos | Hecho |
| 2.1 – Que el revisor pueda entrar | Cuenta de prueba en la ficha (pendiente) |
| 1.4.1 – Apps de salud: no sustituir al médico | Ya se avisa en la entrada y en los términos |
| 5.1.1(v) – Obligar a registrarse sin necesidad | **Riesgo**: la guía no necesita cuenta. Si Apple lo pide, habrá que dejar consultarla sin entrar |

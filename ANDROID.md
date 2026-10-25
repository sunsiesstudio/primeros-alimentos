# Primeros alimentos en Google Play (Android)

La web es la misma (`index.html`). En Android va dentro de una app de **Capacitor 8**, igual que en iOS.
El proyecto de Android Studio está en `android/` y no necesita npm: Capacitor y el plugin de login
están copiados en `android/vendor/`.

- Package name: `com.sunsiesstudio.primerosalimentos` (igual que el Bundle ID de iOS).
- Login en Android: **Google y email** (sin Apple).

## Una sola vez

1. **Android Studio**: descárgalo de developer.android.com/studio e instálalo. Al abrirlo por primera vez, deja que instale el SDK.
2. **Firebase** › Configuración del proyecto › Tus apps › **Añadir app › Android**:
   - Nombre del paquete: `com.sunsiesstudio.primerosalimentos`
   - SHA-1: la de depuración (ver abajo). Más tarde añadirás también la de Play.
   - Descarga `google-services.json` y ponlo en `android/app/`.
3. **SHA-1 de depuración**: en Android Studio, abre la pestaña *Gradle* › `app` › Tasks › android › **signingReport**, o en Terminal desde `android/`: `./gradlew signingReport`. Copia la línea SHA1 de *debug* en Firebase.
4. En Firebase › Authentication › Sign-in method, Google y Email ya están activados (son los de la web).

## Cada vez que cambies la web

1. `node scripts/build.mjs` (copia la web a iOS y a Android).
2. Android Studio › abre la carpeta `android/` › espera a que termine *Gradle sync*.
3. Para probar: arriba elige un emulador (Device Manager › crea un Pixel) y pulsa ▶.
4. Para Play: sube `versionCode` en `android/app/build.gradle` (1 → 2…), luego **Build › Generate Signed App Bundle** › Android App Bundle › crea (la primera vez) o elige tu keystore › release.
   **Guarda bien el keystore y sus contraseñas**: sin ellos no podrás actualizar la app.
5. Play Console › tu app › **Pruebas › Prueba interna** (o cerrada) › Crear versión › sube el `.aab`.

## Después de la primera subida a Play

Play Console › Prueba y lanzamiento › Configuración › **Integridad de la app** › copia el **SHA-1 de la clave de firma de apps**
y añádelo también en Firebase (app Android). Sin esto, el login con Google falla en la versión descargada de Play.

## Cuenta personal: prueba cerrada obligatoria

Para publicar en producción con una cuenta personal, Google exige una **prueba cerrada con al menos 12 personas durante 14 días seguidos**.
Crea una lista de testers (sus emails de Google) en Prueba cerrada y mándales el enlace de suscripción.

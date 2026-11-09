# NutriCare móvil + Firebase

La aplicación móvil usa el proyecto Firebase `nutricare-d913a`.

## Configuración local

1. Copia `mobile/.env.example` como `mobile/.env`.
2. Completa las variables `EXPO_PUBLIC_FIREBASE_*` con la configuración de la aplicación web de Firebase.
3. Ejecuta desde `mobile/`:

```powershell
$env:EXPO_HOME = (Join-Path (Get-Location) '.expo-home')
$env:EXPO_NO_TELEMETRY = '1'
npx expo start
```

## Datos persistidos

- `users/{uid}`: perfil y rol de Firebase Authentication.
- `records/{id}`: expedientes, mediciones, consultas, planes y fotografías.
- El campo `payload` contiene el JSON del módulo y conserva el mismo contrato que la aplicación web.
- La app mantiene AsyncStorage como respaldo local cuando Firebase no está configurado.

## Prueba rápida

1. Registra una cuenta desde `src/app/(auth)/register.tsx`.
2. Verifica el correo electrónico.
3. Inicia sesión desde `src/app/(auth)/login.tsx`.
4. Como nutricionista, crea un expediente y una medición.
5. Como paciente, inicia sesión con el mismo correo del expediente y verifica que pueda consultar sus registros.

Las reglas de Firestore se administran desde la raíz del proyecto (`firestore.rules`) y deben mantenerse desplegadas con:

```powershell
firebase deploy --only firestore --project nutricare-d913a
```

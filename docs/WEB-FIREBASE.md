# NutriCare web: uso y verificación

La versión web está en la raíz de `nutricare`. La carpeta `mobile` es la aplicación Expo y no se utiliza para iniciar esta web.

## Iniciar el sitio

En PowerShell, desde la carpeta del proyecto:

```powershell
pnpm install --frozen-lockfile
pnpm dev
```

Abre **http://localhost:3000/login**. La terminal de `pnpm dev` debe permanecer abierta.

Para usar una compilación local estable en segundo plano:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/start-web.ps1 -Rebuild
```

El script compila y abre un proceso independiente. Sus registros quedan en `.local-tools/web-3000.log` y `.local-tools/web-3000.error.log`. No depende de Metro ni de los puertos 8081/8082. Después de reiniciar Windows, ejecuta `pnpm web:stable`. Si cambias el código, vuelve a ejecutar el script con `-Rebuild`.

Si el puerto está ocupado por una terminal de `pnpm dev`, detén esa terminal con Ctrl+C antes de usar el modo estable. El script no detiene procesos que no pueda identificar como su propio servidor.

## Configuración de Firebase

1. Mantén la configuración web real en `.env.local`. `.env.example` es solamente una plantilla.
2. Activa Correo/contraseña y Google en Firebase Authentication.
3. Incluye `localhost` en los dominios autorizados de Authentication. Si publicas en otro dominio, agrégalo también.
4. Crea la base Firestore `(default)` del proyecto configurado.
5. Publica las reglas e índices desde la raíz:

```powershell
firebase deploy --only firestore --project nutricare-d913a
```

No subas `.env.local` ni claves de servicio a GitHub. La configuración pública del SDK identifica el proyecto; la protección del acceso depende de Authentication y las reglas de Firestore.

## Recorrido de uso

1. Crea una cuenta de **Nutricionista** con correo y contraseña. El rol selecciona su espacio de trabajo; no concede acceso a expedientes ajenos.
2. En **Pacientes**, crea el expediente con el correo exacto del paciente. Ingresa nacimiento, estatura y objetivo. La estatura se reutiliza al registrar mediciones.
3. En **Mediciones**, selecciona el expediente y la modalidad, registra los datos y guarda. El sistema calcula el IMC usando la estatura del expediente.
4. En **Consultas**, programa fecha, hora y modalidad. El detalle permite actualizar notas y estado. La agenda permite seleccionar mes/día o mostrar todas las fechas.
5. En **Planes**, crea un plan mensual y revisa las comidas antes de guardarlo. Puedes editar menú, porciones, indicaciones y adjunto después. El calendario muestra las comidas guardadas para ese mes; no inventa menús diferentes por día.
6. El paciente crea su cuenta con ese mismo correo. Debe abrir el enlace de verificación y pulsar **Ya verifiqué mi correo**. Con Google se utiliza el correo verificado por el proveedor.
7. El paciente verá sus planes, mediciones y citas. En Inicio puede marcar las comidas y registrar agua. La meta semanal cuenta los días completos dentro de los últimos siete días; se conserva al recargar.
8. En **Comidas**, el paciente sube una foto y un comentario. La nutricionista la abre desde **Fotografías**, escribe su retroalimentación y puede aprobarla. El paciente ve la respuesta al volver a cargar el módulo.
9. En **Historial**, ambos consultan los registros a los que tienen acceso, incluyendo archivados. Archivar retira el registro de los módulos activos; conserva la información histórica. No es un registro inmutable de todas las versiones de cada edición: muestra el estado guardado y sus fechas de creación/actualización.

## Datos y permisos

- `users/{uid}`: perfil privado de la cuenta.
- `settings/{uid}`: preferencias y notificaciones leídas de esa cuenta.
- `records/{id}`: pacientes, mediciones, consultas, planes, fotografías y hábitos. La propiedad, autoría y correo de acceso se guardan en campos separados del contenido.
- El propietario puede consultar su espacio. Un correo verificado permite al paciente leer los registros compartidos con ese correo.
- El paciente puede escribir sus fotografías, pero no cambiar las mediciones profesionales ni aprobarse fotografías. La nutricionista puede responder sin alterar el comentario original del paciente.
- El correo del expediente se mantiene estable para evitar cambiar accidentalmente el destinatario de todos sus registros. Si fue incorrecto, archiva el expediente y crea uno con el correo correcto.
- Las fotografías se reducen a un máximo de 1,000 píxeles en su lado mayor y se guardan dentro de Firestore como JPEG. Así no dependen de direcciones temporales `blob:` de otro puerto o sesión.
- Los adjuntos PDF/DOC/DOCX tienen un límite de 500 KB para caber en el documento de Firestore. Los datos de demostración de la antigua API no se copian como si fueran expedientes reales. Las antiguas fotos locales de otro navegador tampoco se reasignan automáticamente a una cuenta: deben volver a subirse desde el expediente correcto.
- Las notificaciones son avisos dentro de la aplicación. No se envían notificaciones push ni correos programados de citas.

Las reglas son un prototipo para esta entrega y deben revisarse antes de usar la aplicación de forma amplia con datos clínicos reales. La verificación de correo comprueba la cuenta, no una acreditación profesional.

## Comprobaciones reproducibles

```powershell
pnpm typecheck
pnpm exec eslint src tests playwright.config.ts
pnpm build
```

Las pruebas de integración usan exclusivamente el proyecto local `demo-nutricare`, Auth en 9099, Firestore en 8180 y la web en 3001. No crean pacientes ni cuentas en el proyecto remoto.

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File scripts/test-web.ps1
```

Requisitos para estas pruebas: Firebase CLI, Java 21 y Chrome instalados. El script también reconoce un Java portátil en `.local-tools/java21`. Los fallos generan evidencia en `test-results`, excluido de Git.

La suite de reglas comprueba acceso anónimo, separación de usuarios, correo no verificado, manipulación de propietario/autor, campos inválidos, tamaños excesivos, perfiles privados, fotografías y archivo de registros. La suite de navegador recorre registro, expediente, medición, consulta, edición del plan, checklist, foto, respuesta profesional e historial.

Google requiere además una prueba con una cuenta real y los proveedores habilitados en la consola: el emulador no valida la configuración OAuth del proyecto remoto.

## Resultado de la verificación del 6 de noviembre de 2026

- Compilación de producción y revisión de TypeScript completadas.
- ESLint sin errores en el código web y las pruebas.
- 15 pruebas de reglas de Firestore aprobadas.
- 2 pruebas de navegador aprobadas: recorrido profesional/paciente y configuración/contraseña/sesión.
- Reglas e índices publicados en `nutricare-d913a`.
- Web compilada en `http://localhost:3000/login`: HTTP 200, modo Firestore y sin errores de ejecución de JavaScript en la comprobación de acceso.
- Proveedor Google del proyecto remoto: aceptó crear una URL de autenticación desde localhost. No se realizó un acceso con una cuenta personal de Google.

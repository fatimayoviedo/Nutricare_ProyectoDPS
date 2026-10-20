# NutriCare Mobile - Avance 1

Versión móvil de NutriCare desarrollada con React Native, Expo SDK 58, Expo Router y TypeScript.

## Funcionalidades implementadas

- Inicio de sesión funcional con cuentas de demostración.
- Registro de pacientes y nutricionistas con validación de campos.
- Recuperación de acceso con validación de correo.
- Sesión persistente mediante AsyncStorage.
- Navegación inferior por rol: Inicio, Pacientes, Planes y Perfil para nutricionista; Inicio, Planes, Progreso y Perfil para paciente.
- Dashboard diferenciado por rol.
- Consulta del menú diario y del plan mensual, con indicaciones clínicas de solo lectura.
- Filtros funcionales de progreso por seis meses, un año y todo el historial.
- Calendario para editar la fecha de nacimiento y confirmación al guardar el perfil.
- Registro de medidas en consultorio, medidas adicionales e IMC calculado. Los registros se conservan localmente en el dispositivo y aparecen en el progreso del paciente correspondiente.
- Selección y validación de fotografías de comidas.
- Captura de fotografías con cámara en dispositivos compatibles.
- Registro persistente de nuevos pacientes con validación de mayoría de edad.
- Revisión de pendientes y edición funcional del perfil.
- Componentes reutilizables y estilos coherentes con los mockups de Figma de la Etapa 1.

## Cuentas para la demostración

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Paciente | `paciente@nutricare.com` | `nutricare2026` |
| Nutricionista | `nutricionista@nutricare.com` | `nutricare2026` |

## Ejecutar el proyecto

Desde la carpeta raíz de NutriCare:

```powershell
pnpm install
pnpm --filter mobile start
```

Después:

- Escanea el código QR con Expo Go para abrirlo en un teléfono conectado a la misma red.
- Presiona `a` para Android si Android Studio y un emulador están configurados.
- Presiona `w` para abrir la versión web de apoyo.

También se puede iniciar directamente desde esta carpeta:

```powershell
pnpm start
```

Para abrir la versión de apoyo en `http://localhost:8081` desde la carpeta `mobile`:

```powershell
node .\node_modules\expo\bin\cli start --web --port 8081
```

## Estructura principal

```text
src/
  app/             Pantallas y navegación de Expo Router
  components/ui/   Componentes visuales reutilizables
  constants/       Colores, espaciado y radios del diseño
  context/         Sesión, pacientes y mediciones locales
  data/            Datos de demostración
  schemas/         Reglas de validación con Zod
  types/           Tipos compartidos de TypeScript
```

## Nota académica

La autenticación y las mediciones de este avance usan almacenamiento local para demostrar los flujos sin depender de servicios externos. Los registros móviles no se sincronizan automáticamente con el sitio web. En una versión de producción las credenciales se validarían en un backend seguro y nunca se guardarían como texto plano en el dispositivo.

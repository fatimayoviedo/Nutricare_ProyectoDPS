

## Cuentas para la demostración

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Paciente | `paciente@nutricare.com` | `nutricare2026` |
| Nutricionista | `nutricionista@nutricare.com` | `nutricare2026` |

## Ejecutar el proyecto

Desde la carpeta raíz de NutriCare:

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

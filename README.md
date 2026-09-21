# Entrega individual
Fátima Yesenia Oviedo Martínez.

# NutriCare - Etapa 2

Aplicación web responsive para la gestión y el seguimiento nutricional de pacientes de NutriCare.

## Funcionalidades

- Registro, inicio de sesión, recuperación de acceso y cierre de sesión.
- Rutas de navegación diferenciada para nutricionista y paciente.
- Pacientes: Consultar plan.
- Gestión dinámica de consultas y planes nutricionales.
- Registro de mediciones con cálculo automático del IMC.
- Historial y gráfica de evolución del peso obtenidos mediante API REST.
- Selección y vista previa de fotografías de progreso.
- Dashboard con indicadores actualizados desde la API.
- Validación de formularios y estados de carga, error y contenido vacío.

## Accesos de demostración

| Rol | Correo | Contraseña |
| --- | --- | --- |
| Nutricionista | `nutricionista@nutricare.com` | `nutricare2026` |
| Paciente | `paciente@nutricare.com` | `nutricare2026` |

También es posible registrar cuentas nuevas. 

## Tecnologías

- Next.js 16, React 19, App Router y TypeScript estricto.
- Tailwind CSS para la interfaz responsive.
- Context API y hooks personalizados para estado y lógica de presentación.
- Route Handlers de Next.js como API REST simulada.
- React Hook Form, Zod y resolvers para formularios.
- Recharts para visualización de progreso.
- Firebase Authentication, Firestore y Storage preparados como integración opcional.
- Lucide React para iconografía.

## Arquitectura

```text
src/
├── app/                 # Pantallas, layouts y endpoints REST
├── components/          # UI y componentes por módulo
├── context/             # Estado global de autenticación
├── data/                # Fuente simulada de datos de la Etapa 2
├── hooks/               # Lógica reutilizable de presentación
├── lib/                 # Firebase y respuestas HTTP
├── schemas/             # Validaciones de entrada
├── services/            # Cliente y servicios de acceso a la API
├── types/               # Contratos TypeScript
└── utils/               # Reglas y funciones de negocio
```

El flujo principal es: `interfaz -> hooks/contexto -> servicios -> API REST -> datos`.

## API REST

| Recurso | Operaciones |
| --- | --- |
| `/api/patients` | GET, POST |
| `/api/patients/:id` | GET, PUT, DELETE |
| `/api/consultations` | GET, POST |
| `/api/consultations/:id` | GET, PUT, DELETE |
| `/api/plans` | GET, POST |
| `/api/plans/:id` | GET, PUT, DELETE |
| `/api/measurements` | GET, POST |
| `/api/measurements/:id` | DELETE |
| `/api/status` | GET |

Las respuestas usan una estructura consistente con `data`, `message` y `meta`. Los errores de validación devuelven estado HTTP 400 y detalle por campo.

## Ejecución local

Requisitos: Node.js 20 o superior y pnpm.

```bash
pnpm install
pnpm dev
```

Abrir `http://localhost:3000`.

## Variables de entorno

Para utilizar Firebase, copiar `.env.example` como `.env.local` y completar las variables `NEXT_PUBLIC_FIREBASE_*`. 


## Despliegue en Vercel

1. Crear el repositorio del equipo en GitHub.
2. Agregar a cada integrante como colaborador y crear una rama personal.
3. Importar el repositorio desde Vercel.
4. Configurar las variables de Firebase si se utilizará ese servicio.
5. Ejecutar el despliegue y agregar el enlace público en esta sección.



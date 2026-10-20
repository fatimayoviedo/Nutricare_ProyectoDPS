import { z } from 'zod';

export const officeMeasurementSchema = z.object({
  patientId: z.string().min(1, 'Selecciona un paciente.'),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'La fecha no es válida.'),
  weightKg: z.number().positive('Ingresa un peso mayor que cero.').max(400, 'Revisa el peso ingresado.'),
  heightCm: z.number().positive('Ingresa una estatura mayor que cero.').max(250, 'Revisa la estatura ingresada.'),
  bodyFatPercentage: z.number().min(1, 'Ingresa el porcentaje de grasa corporal.').max(80, 'Revisa el porcentaje de grasa.'),
  muscleMassPercentage: z.number().min(1, 'Ingresa el porcentaje de masa muscular.').max(80, 'Revisa el porcentaje de masa muscular.'),
  metabolicAge: z.number().int('La edad metabólica debe ser entera.').min(18, 'Revisa la edad metabólica.').max(120, 'Revisa la edad metabólica.'),
  additionalMeasurements: z.array(z.object({
    name: z.string().trim().min(1, 'Escribe el nombre de cada medida adicional.'),
    value: z.number().positive('La medida adicional debe ser mayor que cero.'),
    unit: z.enum(['cm', 'kg', '%', 'mm']),
  })),
});

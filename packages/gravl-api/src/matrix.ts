/**
 * Matriz de integración: qué necesita cada pantalla del B2B y de dónde sale.
 * Fuente: gravl.ai/es/developers (relevado nov-2026). La consola la muestra tal cual.
 */

export type Availability = 'HOY' | 'PEDIR' | 'B2B';

export interface IntegrationItem {
  need: string;
  usedIn: string;
  source: string;
  scope?: string;
  availability: Availability;
  note: string;
}

export const integrationMatrix: IntegrationItem[] = [
  { need: 'Sesiones, última visita, volumen', usedIn: 'Socios · Command Center', source: 'GET /api/v1/workouts', scope: 'workouts:read', availability: 'HOY', note: 'Volumen viene en libras: convertir a kg.' },
  { need: 'Racha y entrenamientos de la semana', usedIn: 'Socios · riesgo de baja', source: 'GET /api/v1/stats', scope: 'stats:read', availability: 'HOY', note: 'streak.current, streak.workoutsThisWeek.' },
  { need: 'Series, RPE y tipo de serie', usedIn: 'Coach Studio · Equipamiento', source: 'GET /api/v1/workouts/{id}', scope: 'workouts:read', availability: 'HOY', note: 'RPE 1–10 y setType por serie.' },
  { need: 'Récords (1RM, volumen)', usedIn: 'Feed en vivo · ranking · coach', source: 'GET /api/v1/personal-records', scope: 'records:read', availability: 'HOY', note: 'Para el feed público hace falta además consentimiento de perfil público.' },
  { need: 'Plantillas y splits', usedIn: 'Coach Studio · mesociclos', source: 'GET /api/v1/workout-templates · /splits', scope: 'workouts:read · splits:read', availability: 'HOY', note: 'Lectura. Asignar rutinas requiere escritura.' },
  { need: 'Catálogo de ejercicios y equipamiento', usedIn: 'Equipamiento · inventario por sede', source: 'GET /api/v1/equipment · /exercises', scope: 'exercises:read', availability: 'HOY', note: 'Ids estables compartidos con la app: base del inventario.' },
  { need: 'Trofeos', usedIn: 'Comunidad · retos', source: 'GET /api/v1/trophies', scope: 'stats:read', availability: 'HOY', note: 'workout100, streak5…' },
  { need: 'Medidas corporales', usedIn: '— (nunca se comparte)', source: 'GET /api/v1/measurements', scope: 'measurements:read', availability: 'HOY', note: 'Existe, pero el B2B NO lo pide: peso y medidas son privados del socio.' },
  { need: 'En qué gimnasio entrenó', usedIn: 'Todo lo que es "por sede"', source: 'Campo gymId en workouts', availability: 'PEDIR', note: 'La app ya sabe el gimnasio (adapta rutinas). La API no lo expone.' },
  { need: '"Máquina ocupada → cambiar ejercicio"', usedIn: 'Equipamiento', source: 'Evento de sustitución con motivo', availability: 'PEDIR', note: 'La función existe en la app; falta exponer el evento.' },
  { need: 'Strength Score y readiness', usedIn: 'Socios · Corporate', source: 'Campos en /stats', availability: 'PEDIR', note: 'Están en la app (v1.54), no en la API.' },
  { need: 'Enviar push con la marca del partner', usedIn: 'Nudges · intención de baja', source: 'Scope de escritura nuevo', availability: 'PEDIR', note: 'La API hoy es solo lectura; la escritura llega como scopes explícitos.' },
  { need: 'Asignar rutina o reto', usedIn: 'Copiloto · Comunidad', source: 'Scope de escritura nuevo', availability: 'PEDIR', note: 'MCP ya edita plantillas del propio usuario: el motor existe.' },
  { need: 'Webhooks (entreno terminado, PR, sustitución)', usedIn: 'Feed en vivo · alertas', source: 'Webhooks firmados', availability: 'PEDIR', note: 'La doc pide no hacer polling: los webhooks lo resuelven.' },
  { need: 'Lectura de miles de socios de una cadena', usedIn: 'Cadenas (SportClub)', source: 'Canal interno B2B (no la API pública)', availability: 'B2B', note: '100 req / 15 min por usuario no escala a 3.600 socios: read models internos con filtro de consentimiento.' },
  { need: 'Socios, planes, pagos y bajas', usedIn: 'Planes · intención de baja', source: 'ERP del partner', availability: 'B2B', note: 'No es de GRAVL: conector por partner.' },
];

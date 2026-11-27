// GRAVL Partner & Enterprise OS — Dataset mock determinístico
// Partner de ejemplo: SportClub (AR). Piloto de 12 sedes AMBA, ~3.600 socios con GRAVL vinculado.
// ⚠️ Todos los números son SIMULADOS: no son datos de SportClub.
//
// Reglas del dataset:
//  • Todo es determinístico (PRNG con semilla) → SSR e hidratación coinciden.
//  • Todas las fechas son relativas a REFERENCE_NOW. Cambiá esa constante
//    para "rejuvenecer" la demo sin tocar nada más.
//  • Los estados de socios se derivan de su comportamiento (no al azar),
//    así un socio "On Fire" nunca aparece con 3 semanas sin entrenar.

import type {
  Organization,
  GymLocation,
  B2BMemberTelemetry,
  GymChallenge,
  NudgeRule,
  NudgeTemplate,
  RetentionCohort,
  LiveWorkoutEvent,
  MuscleScore,
  GymMachine,
  PeakHourRow,
  IntegrationCard,
  OpsAlert,
  Department,
  CoachClient,
  FormCheck,
  VerticalType,
} from '@gravl/domain';
import { REFERENCE_NOW } from '@gravl/domain';
import type { ConsentScope } from '@gravl/domain';

export { REFERENCE_NOW };

const DAY = 86_400_000;
const isoDaysAgo = (d: number, extraMin = 0) =>
  new Date(REFERENCE_NOW.getTime() - d * DAY - extraMin * 60_000).toISOString();
const isoMinAgo = (m: number) => new Date(REFERENCE_NOW.getTime() - m * 60_000).toISOString();
const isoDate = (offsetDays: number) =>
  new Date(REFERENCE_NOW.getTime() + offsetDays * DAY).toISOString().slice(0, 10);

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// ─── Organización / tenants por vertical ─────────────────────────
export const organization: Organization = {
  id: 'org_sportclub',
  name: 'SportClub',
  shortName: 'SC',
  slug: 'sportclub',
  vertical: 'GYM_CHAIN',
  planTier: 'ENTERPRISE',
  seatLimit: 6000,
  activeSeats: 3600,
  mrrUsd: 0,
  avgMonthlyFeeUsd: 40,
  pricePerSeatUsd: 0,
  /** Socios de las 12 sedes del piloto según el ERP (usen o no GRAVL). */
  totalGymMembers: 21400,
  branding: {
    logoUrl: '/logo-sportclub.svg',
    welcomeMessage: 'SportClub × GRAVL — tu plan de fuerza, en cualquier sede.',
  },
  integrations: {
    provider: 'NONE',
    webhookUrl: '',
    autoRevokeOnCancel: true,
    status: 'PENDING',
  },
};


// ─── Sedes del piloto ────────────────────────────────────────────
// SportClub tiene +1.100 sedes en categorías Flex, Plus, Total y Elite (sportclub.com.ar).
// La demo modela un piloto realista: 12 sedes de AMBA. Los datos son SIMULADOS.

/** Inventario base de una sede de musculación. Cada sede lo ajusta. */
const machineTemplate: { name: string; zone: GymMachine['zone']; qty: number; demand: number }[] = [
  { name: 'Squat Rack', zone: 'RACKS', qty: 3, demand: 94 },
  { name: 'Bench Press', zone: 'FREE_WEIGHTS', qty: 3, demand: 88 },
  { name: 'Cable Crossover', zone: 'CABLES', qty: 2, demand: 90 },
  { name: 'Lat Pulldown', zone: 'CABLES', qty: 2, demand: 84 },
  { name: 'Prensa de Piernas', zone: 'MACHINES', qty: 2, demand: 78 },
  { name: 'Hack Squat', zone: 'MACHINES', qty: 1, demand: 80 },
  { name: 'Banco Inclinado', zone: 'FREE_WEIGHTS', qty: 2, demand: 74 },
  { name: 'Smith Machine', zone: 'RACKS', qty: 2, demand: 68 },
  { name: 'Remo Sentado', zone: 'MACHINES', qty: 2, demand: 66 },
  { name: 'Extensión de Cuádriceps', zone: 'MACHINES', qty: 2, demand: 62 },
  { name: 'Curl Femoral', zone: 'MACHINES', qty: 2, demand: 58 },
  { name: 'Pec Deck', zone: 'MACHINES', qty: 1, demand: 54 },
  { name: 'Press de Hombros', zone: 'MACHINES', qty: 1, demand: 50 },
  { name: 'Cinta de Correr', zone: 'CARDIO', qty: 8, demand: 45 },
  { name: 'Remo Ergómetro', zone: 'CARDIO', qty: 3, demand: 40 },
];

const pilotSedes: { id: string; name: string; tier: 'Flex' | 'Plus' | 'Total' | 'Elite'; region: string; city: string; capacity: number; live: number }[] = [
  { id: 'loc_palermo', name: 'Palermo', tier: 'Total', region: 'CABA', city: 'CABA', capacity: 90, live: 38 },
  { id: 'loc_belgrano', name: 'Belgrano', tier: 'Total', region: 'CABA', city: 'CABA', capacity: 80, live: 31 },
  { id: 'loc_caballito', name: 'Caballito', tier: 'Plus', region: 'CABA', city: 'CABA', capacity: 70, live: 26 },
  { id: 'loc_recoleta', name: 'Recoleta', tier: 'Elite', region: 'CABA', city: 'CABA', capacity: 60, live: 22 },
  { id: 'loc_villacrespo', name: 'Villa Crespo', tier: 'Plus', region: 'CABA', city: 'CABA', capacity: 55, live: 19 },
  { id: 'loc_nunez', name: 'Núñez', tier: 'Plus', region: 'CABA', city: 'CABA', capacity: 55, live: 18 },
  { id: 'loc_flores', name: 'Flores', tier: 'Flex', region: 'CABA', city: 'CABA', capacity: 50, live: 15 },
  { id: 'loc_nordelta', name: 'Nordelta', tier: 'Total', region: 'GBA Norte', city: 'Tigre', capacity: 65, live: 21 },
  { id: 'loc_sanisidro', name: 'San Isidro', tier: 'Plus', region: 'GBA Norte', city: 'San Isidro', capacity: 60, live: 20 },
  { id: 'loc_pilar', name: 'Pilar', tier: 'Flex', region: 'GBA Norte', city: 'Pilar', capacity: 50, live: 14 },
  { id: 'loc_ramos', name: 'Ramos Mejía', tier: 'Flex', region: 'GBA Oeste', city: 'La Matanza', capacity: 45, live: 12 },
  { id: 'loc_quilmes', name: 'Quilmes', tier: 'Flex', region: 'GBA Sur', city: 'Quilmes', capacity: 45, live: 11 },
];

function buildMachines(sedeIdx: number, sedeId: string, capacity: number): GymMachine[] {
  const rng = seededRandom(1000 + sedeIdx * 97);
  const prefix = sedeId.replace('loc_', '').slice(0, 3);
  return machineTemplate
    .filter((t) => !(capacity < 50 && (t.name === 'Hack Squat' || t.name === 'Pec Deck')))
    .map((t, i) => {
      const qty = Math.max(1, Math.round(t.qty * (capacity / 70) + (rng() - 0.5)));
      const demand = Math.min(99, Math.max(25, Math.round(t.demand + (rng() - 0.5) * 16)));
      // Series registradas en GRAVL ∝ demanda × cantidad × tamaño de la sede.
      const loggedSets30d = Math.round(demand * qty * (capacity / 10) * (0.8 + rng() * 0.4));
      // "¿Máquina ocupada?": crece fuerte cuando la demanda supera la oferta.
      const pressure = demand / (qty * 25);
      const busySwaps30d = Math.round(loggedSets30d * Math.max(0.004, Math.min(0.2, (pressure - 0.9) * 0.12)));
      return {
        machineId: `${prefix}${String(i + 1).padStart(2, '0')}`,
        name: t.name,
        zone: t.zone,
        quantity: qty,
        status: sedeIdx === 0 && t.name === 'Extensión de Cuádriceps' ? 'MAINTENANCE' : 'OPERATIONAL',
        weeklyUsageRate: demand,
        loggedSets30d,
        busySwaps30d,
      };
    });
}

export const locations: GymLocation[] = pilotSedes.map((s, i) => ({
  id: s.id,
  organizationId: 'org_sportclub',
  name: `SportClub ${s.name}`,
  shortName: s.name,
  city: s.city,
  country: 'Argentina',
  region: s.region,
  tier: s.tier,
  qrDeepLink: `https://gravl.ai/join/sportclub/${s.id.replace('loc_', '')}`,
  liveActiveMembersCount: s.live,
  floorCapacity: s.capacity,
  equipmentProfile: {
    weightUnit: 'KG',
    availablePlates: s.tier === 'Flex' ? [2.5, 5, 10, 15, 20] : [1.25, 2.5, 5, 10, 15, 20, 25],
    dumbbellMax: s.tier === 'Flex' ? 36 : s.tier === 'Elite' ? 60 : 50,
    dumbbellStep: 2,
    machines: buildMachines(i, s.id, s.capacity),
  },
}));

/** Tamaño de la red completa (fuera del piloto). */
export const networkSize = { sedes: 1100, pilotSedes: pilotSedes.length, label: '+1.100 sedes' };

export const locationById = (id: string) => locations.find((l) => l.id === id);
export const locationName = (id: string) => locationById(id)?.shortName ?? '—';

// ─── Socios ──────────────────────────────────────────────────────
const firstNames = [
  'Sofía', 'Valentina', 'Martín', 'Tomás', 'Camila', 'Lucía', 'Mateo', 'Isabella',
  'Santiago', 'Emilia', 'Benjamín', 'Catalina', 'Joaquín', 'Florencia', 'Agustín',
  'Renata', 'Nicolás', 'Julieta', 'Felipe', 'Antonella', 'Thiago', 'Mía', 'Lautaro',
  'Emma', 'Franco', 'Delfina', 'Bautista', 'Alma', 'Gabriel', 'Victoria', 'Lucas',
  'Olivia', 'Daniel', 'Martina', 'Sebastián', 'Pilar', 'Maximiliano', 'Carolina',
  'Alejandro', 'Paula', 'Diego', 'Andrea', 'Miguel', 'Laura', 'Carlos', 'María',
  'Juan', 'Ana', 'Pedro', 'Elena',
];
const lastNames = [
  'García', 'Martínez', 'López', 'González', 'Rodríguez', 'Fernández', 'Pérez',
  'Sánchez', 'Ramírez', 'Torres', 'Flores', 'Díaz', 'Moreno', 'Álvarez', 'Romero',
  'Ruiz', 'Jiménez', 'Hernández', 'Medina', 'Castro', 'Vargas', 'Ramos', 'Reyes',
  'Molina', 'Ortiz', 'Silva', 'Aguilar', 'Mendoza', 'Herrera', 'Guerrero',
];

function generateMembers(): B2BMemberTelemetry[] {
  const rng = seededRandom(42);
  const between = (a: number, b: number) => Math.floor(a + rng() * (b - a + 1));
  // Reparto de socios proporcional a la capacidad de cada sede.
  const totalCap = pilotSedes.reduce((a, x) => a + x.capacity, 0);
  const cumulative = pilotSedes.map((x, i) => pilotSedes.slice(0, i + 1).reduce((a, y) => a + y.capacity, 0) / totalCap);
  const out: B2BMemberTelemetry[] = [];

  for (let i = 0; i < 3600; i++) {
    const r = rng();
    const sedeIdx = cumulative.findIndex((c) => r <= c);
    const sede = pilotSedes[sedeIdx === -1 ? pilotSedes.length - 1 : sedeIdx];
    const locationId = sede.id;
    // Plan: en sedes Flex predomina el Flex; en Total/Elite, el plan Total.
    const pr = rng();
    const planId = sede.tier === 'Flex' ? (pr < 0.7 ? 'flex' : 'plus') : sede.tier === 'Plus' ? (pr < 0.25 ? 'flex' : pr < 0.85 ? 'plus' : 'total') : pr < 0.15 ? 'plus' : 'total';
    const fullName = `${firstNames[Math.floor(rng() * firstNames.length)]} ${lastNames[Math.floor(rng() * lastNames.length)]}`;

    // Antigüedad: ~9% son altas de los últimos 30 días.
    const isNew = rng() < 0.09;
    const tenureDays = isNew ? between(3, 30) : between(31, 540);

    // Arquetipo de comportamiento → métricas coherentes entre sí.
    const a = rng();
    let status: B2BMemberTelemetry['status'];
    let workoutsThisWeek: number, streak: number, daysInactive: number, delta: number, readiness: number;
    if (a < 0.24) {
      status = 'ON_FIRE';
      workoutsThisWeek = between(3, 5); streak = between(4, 19); daysInactive = between(0, 2);
      delta = between(8, 28); readiness = between(68, 98);
    } else if (a < 0.63) {
      status = 'ACTIVE';
      workoutsThisWeek = between(1, 3); streak = between(1, 8); daysInactive = between(0, 4);
      delta = between(0, 15); readiness = between(55, 92);
    } else if (a < 0.86) {
      status = 'NEEDS_NUDGE';
      workoutsThisWeek = 0; streak = between(0, 2); daysInactive = between(5, 13);
      delta = between(-4, 6); readiness = between(45, 85);
    } else {
      status = 'AT_RISK';
      workoutsThisWeek = 0; streak = 0; daysInactive = between(14, 40);
      delta = between(-9, 2); readiness = between(40, 80);
    }
    if (isNew) daysInactive = Math.min(daysInactive, tenureDays - 1);

    const workoutsLast30Days =
      status === 'ON_FIRE' ? between(13, 22) : status === 'ACTIVE' ? between(6, 13) : status === 'NEEDS_NUDGE' ? between(2, 6) : between(0, 2);
    const workoutsFirst30Days = isNew ? Math.min(workoutsLast30Days, between(0, 9)) : between(3, 14);

    // Score lineal de señales → probabilidad con sigmoide (discrimina mejor en los extremos).
    const raw =
      daysInactive * 1.5 + (4 - Math.min(streak, 4)) * 5 - delta * 0.7 + (isNew && workoutsFirst30Days < 5 ? 15 : 0) + rng() * 14;
    const churnRisk = Math.max(2, Math.min(96, Math.round(100 / (1 + Math.exp(-(raw - 52) / 14)))));

    // Consentimientos: activity siempre (base del servicio); el resto es opt-in del socio.
    const consents: ConsentScope[] = ['ACTIVITY'];
    if (rng() < 0.92) consents.push('PERFORMANCE');
    if (rng() < 0.88) consents.push('PARTNER_MESSAGING');
    if (rng() < 0.55) consents.push('WELLNESS');
    if (rng() < 0.7) consents.push('PUBLIC_PROFILE');

    // Señales de pago / intención de baja (vienen del ERP y de la app).
    const p = rng();
    const paymentStatus: B2BMemberTelemetry['paymentStatus'] = p < 0.012 ? 'FAILED' : p < 0.02 ? 'FROZEN' : 'CURRENT';
    const ci = rng();
    const cancelIntent: B2BMemberTelemetry['cancelIntent'] =
      paymentStatus === 'FAILED' ? 'PAYMENT_FAILED'
        : paymentStatus === 'FROZEN' ? 'FREEZE_REQUEST'
        : status === 'AT_RISK' && ci < 0.06 ? 'CANCEL_PAGE_VISIT'
        : status === 'NEEDS_NUDGE' && ci < 0.02 ? 'DOWNGRADE_ASKED'
        : undefined;

    out.push({
      userId: `usr_${String(i + 1).padStart(4, '0')}`,
      gravlUserId: `gr_${(0x9f000 + i * 7919).toString(36)}`,
      externalMemberId: `EVO-${String(100000 + i * 37).slice(-6)}`,
      consents,
      paymentStatus,
      cancelIntent,
      planId,
      fullName,
      locationId,
      joinedAt: isoDaysAgo(tenureDays),
      workoutsFirst30Days,
      workoutsLast30Days,
      workoutsThisWeek,
      weeklyTarget: rng() < 0.7 ? 4 : 3,
      currentStreakWeeks: streak,
      strengthScore: between(110, 310),
      strengthScoreDelta30d: delta,
      readinessScore: readiness,
      macrosActive: rng() > 0.6,
      lastWorkoutAt: isoDaysAgo(daysInactive, between(30, 600)),
      status,
      churnRisk,
    });
  }
  return out;
}

export const members: B2BMemberTelemetry[] = generateMembers();

/** Métricas ejecutivas de red que vienen del data warehouse (no derivables del mock). */
export const networkBenchmarks = {
  avgWorkoutsPerWeek: 3.4,
  attendanceLift: 18.4,
  survivalRate90Day: 88.2,
  survivalRateIndustry: 52,
  totalVolumeMonthKg: 1_428_500,
  avgStrengthScoreGrowth: 14,
  avgStrengthScore: 245,
};

// ─── Retención por cohorte ───────────────────────────────────────
export const retentionCohorts: RetentionCohort[] = [
  { month: 0, withGravl: 100, withoutGravl: 100 },
  { month: 1, withGravl: 97, withoutGravl: 85 },
  { month: 2, withGravl: 95, withoutGravl: 76 },
  { month: 3, withGravl: 94, withoutGravl: 68 },
  { month: 4, withGravl: 93, withoutGravl: 62 },
  { month: 5, withGravl: 92, withoutGravl: 56 },
  { month: 6, withGravl: 91, withoutGravl: 52 },
  { month: 7, withGravl: 90, withoutGravl: 48 },
  { month: 8, withGravl: 90, withoutGravl: 46 },
  { month: 9, withGravl: 89, withoutGravl: 44 },
  { month: 10, withGravl: 89, withoutGravl: 42 },
  { month: 11, withGravl: 88, withoutGravl: 40 },
  { month: 12, withGravl: 88, withoutGravl: 38 },
];

// ─── Retos ───────────────────────────────────────────────────────
export const challenges: GymChallenge[] = [
  {
    id: 'ch_001',
    organizationId: organization.id,
    title: '16 entrenamientos en 30 días',
    metric: 'WORKOUT_COUNT',
    targetValue: 16,
    startDate: isoDate(-22),
    endDate: isoDate(8),
    participantsCount: 342,
    rewardDescription: 'Un mes gratis de GRAVL Pro + beneficio exclusivo SportClub',
    status: 'ACTIVE',
    currentValue: 12,
  },
  {
    id: 'ch_002',
    organizationId: organization.id,
    title: 'Strength Score Climber',
    metric: 'STRENGTH_SCORE_GAIN',
    targetValue: 25,
    startDate: isoDate(-22),
    endDate: isoDate(8),
    participantsCount: 189,
    rewardDescription: 'El mayor % de mejora gana un pack de proteína',
    status: 'ACTIVE',
    currentValue: 18,
  },
  {
    id: 'ch_003',
    organizationId: organization.id,
    title: 'Club 500K — Volumen colectivo',
    metric: 'TOTAL_VOLUME_KG',
    targetValue: 500_000,
    startDate: isoDate(8),
    endDate: isoDate(38),
    participantsCount: 0,
    rewardDescription: 'Fiesta en todas las sedes + botellas de marca',
    status: 'UPCOMING',
    currentValue: 0,
  },
];

// ─── Reglas de nudges automáticos ────────────────────────────────
export const nudgeRules: NudgeRule[] = [
  {
    id: 'nr_001',
    type: 'FIVE_WORKOUT_RULE',
    name: 'Regla de los 5 entrenamientos',
    description: 'Si un socio nuevo completa <3 entrenamientos en sus primeros 14 días → push + rutina "Confidence Builder" de 30 min.',
    enabled: true,
    triggerCount: 47,
    recoveryRate: 64,
    lastTriggered: isoMinAgo(60 * 28),
  },
  {
    id: 'nr_002',
    type: 'STREAK_SAVER',
    name: 'Salvavidas de racha',
    description: 'Si un socio pasa 7 días sin entrenar → push con la marca del gimnasio y la próxima sesión con −10% de volumen.',
    enabled: true,
    triggerCount: 128,
    recoveryRate: 41,
    lastTriggered: isoMinAgo(60 * 9),
  },
  {
    id: 'nr_003',
    type: 'PR_CELEBRATION',
    name: 'Celebración de PR',
    description: 'Cuando un socio rompe un récord de 1RM → aviso a recepción / coach de piso para felicitarlo en persona.',
    enabled: false,
    triggerCount: 23,
    recoveryRate: 0,
    lastTriggered: isoMinAgo(60 * 49),
  },
];

export const nudgeTemplates: NudgeTemplate[] = [
  {
    id: 'tpl_streak',
    label: 'Volvé suave',
    tone: 'cálido',
    body: 'Tu rack en {gym} te extraña, {name}. Bajamos 10% el volumen de hoy para que la vuelta sea fácil. ¿Te esperamos? 💪',
    sessionAdjustment: '−10% volumen · sesión de 35 min',
  },
  {
    id: 'tpl_progress',
    label: 'Mirá tu progreso',
    tone: 'motivador',
    body: '{name}, tu Strength Score subió {delta} pts desde que arrancaste. Una sesión más esta semana y desbloqueás tu próximo hito 🔥',
    sessionAdjustment: 'Rutina de fuerza con objetivo de PR',
  },
  {
    id: 'tpl_direct',
    label: 'Directo al grano',
    tone: 'directo',
    body: '{name}, tenés una sesión de 30 min lista en la app, adaptada a las máquinas de {gym}. Entrás, la hacés, te vas.',
    sessionAdjustment: 'Full body express · 30 min',
  },
];

// ─── Feed en vivo ────────────────────────────────────────────────
export const liveWorkoutFeed: LiveWorkoutEvent[] = [
  { id: 'lw01', memberName: 'Sofía M.', exercise: 'Sentadilla con barra', weight: 85, unit: 'kg', isPR: true, locationId: 'loc_palermo', timestamp: isoMinAgo(2) },
  { id: 'lw02', memberName: 'Martín G.', exercise: 'Press de banca', weight: 100, unit: 'kg', isPR: false, locationId: 'loc_belgrano', timestamp: isoMinAgo(4) },
  { id: 'lw03', memberName: 'Camila L.', exercise: 'Peso muerto rumano', weight: 70, unit: 'kg', isPR: false, locationId: 'loc_palermo', timestamp: isoMinAgo(5) },
  { id: 'lw04', memberName: 'Tomás R.', exercise: 'Press militar', weight: 55, unit: 'kg', isPR: true, locationId: 'loc_nordelta', timestamp: isoMinAgo(7) },
  { id: 'lw05', memberName: 'Valentina F.', exercise: 'Hip thrust', weight: 120, unit: 'kg', isPR: false, locationId: 'loc_palermo', timestamp: isoMinAgo(8) },
  { id: 'lw06', memberName: 'Lautaro S.', exercise: 'Dominadas lastradas', weight: 15, unit: 'kg', isPR: false, locationId: 'loc_belgrano', timestamp: isoMinAgo(10) },
  { id: 'lw07', memberName: 'Isabella D.', exercise: 'Prensa de piernas', weight: 180, unit: 'kg', isPR: true, locationId: 'loc_palermo', timestamp: isoMinAgo(12) },
  { id: 'lw08', memberName: 'Franco A.', exercise: 'Press inclinado con mancuernas', weight: 36, unit: 'kg', isPR: false, locationId: 'loc_nordelta', timestamp: isoMinAgo(15) },
  { id: 'lw09', memberName: 'Emilia T.', exercise: 'Remo en polea', weight: 45, unit: 'kg', isPR: false, locationId: 'loc_belgrano', timestamp: isoMinAgo(18) },
  { id: 'lw10', memberName: 'Joaquín M.', exercise: 'Curl con barra', weight: 40, unit: 'kg', isPR: false, locationId: 'loc_palermo', timestamp: isoMinAgo(20) },
];

/** Pool para simular eventos nuevos del WebSocket en la demo. */
export const liveExercisePool: { exercise: string; min: number; max: number; step: number }[] = [
  { exercise: 'Sentadilla con barra', min: 50, max: 160, step: 2.5 },
  { exercise: 'Press de banca', min: 40, max: 130, step: 2.5 },
  { exercise: 'Peso muerto', min: 60, max: 200, step: 5 },
  { exercise: 'Hip thrust', min: 60, max: 180, step: 5 },
  { exercise: 'Press militar', min: 25, max: 70, step: 2.5 },
  { exercise: 'Remo con barra', min: 40, max: 110, step: 2.5 },
  { exercise: 'Prensa de piernas', min: 100, max: 300, step: 10 },
  { exercise: 'Jalón al pecho', min: 35, max: 90, step: 5 },
];

// ─── Activación muscular (promedio de cohorte) ───────────────────
export const muscleScores: MuscleScore[] = [
  { muscle: 'Pecho', score: 78 },
  { muscle: 'Espalda', score: 82 },
  { muscle: 'Cuádriceps', score: 85 },
  { muscle: 'Isquios', score: 68 },
  { muscle: 'Glúteos', score: 72 },
  { muscle: 'Hombros', score: 74 },
  { muscle: 'Brazos', score: 80 },
  { muscle: 'Core', score: 65 },
];

// ─── Horarios pico (red completa) ────────────────────────────────
// Inicios de entrenamiento registrados en GRAVL por franja (red del piloto).
const peakBase: PeakHourRow[] = [
  { hour: '6', hour24: 6, mon: 12, tue: 15, wed: 14, thu: 16, fri: 11, sat: 8, sun: 4 },
  { hour: '7', hour24: 7, mon: 28, tue: 32, wed: 30, thu: 34, fri: 26, sat: 18, sun: 8 },
  { hour: '8', hour24: 8, mon: 35, tue: 38, wed: 36, thu: 40, fri: 30, sat: 22, sun: 12 },
  { hour: '9', hour24: 9, mon: 22, tue: 25, wed: 24, thu: 26, fri: 20, sat: 28, sun: 15 },
  { hour: '10', hour24: 10, mon: 15, tue: 18, wed: 16, thu: 20, fri: 14, sat: 32, sun: 20 },
  { hour: '11', hour24: 11, mon: 12, tue: 14, wed: 13, thu: 15, fri: 11, sat: 30, sun: 22 },
  { hour: '12', hour24: 12, mon: 18, tue: 20, wed: 19, thu: 22, fri: 16, sat: 25, sun: 18 },
  { hour: '13', hour24: 13, mon: 15, tue: 17, wed: 16, thu: 18, fri: 14, sat: 20, sun: 14 },
  { hour: '17', hour24: 17, mon: 38, tue: 42, wed: 40, thu: 44, fri: 35, sat: 15, sun: 8 },
  { hour: '18', hour24: 18, mon: 48, tue: 52, wed: 50, thu: 55, fri: 42, sat: 12, sun: 6 },
  { hour: '19', hour24: 19, mon: 45, tue: 48, wed: 46, thu: 50, fri: 38, sat: 10, sun: 5 },
  { hour: '20', hour24: 20, mon: 32, tue: 35, wed: 34, thu: 38, fri: 28, sat: 8, sun: 4 },
  { hour: '21', hour24: 21, mon: 20, tue: 22, wed: 21, thu: 24, fri: 18, sat: 5, sun: 2 },
];
const PILOT_SCALE = 4.5;
export const peakHoursData: PeakHourRow[] = peakBase.map((r) => ({
  ...r,
  mon: Math.round(r.mon * PILOT_SCALE), tue: Math.round(r.tue * PILOT_SCALE), wed: Math.round(r.wed * PILOT_SCALE),
  thu: Math.round(r.thu * PILOT_SCALE), fri: Math.round(r.fri * PILOT_SCALE), sat: Math.round(r.sat * PILOT_SCALE), sun: Math.round(r.sun * PILOT_SCALE),
}));

// ─── Ranking mensual ─────────────────────────────────────────────
export const leaderboard = [
  { rank: 1, name: 'Martín García', locationId: 'loc_belgrano', strengthScore: 308, delta: 28, workouts: 22, volume: 48500 },
  { rank: 2, name: 'Sofía Martínez', locationId: 'loc_palermo', strengthScore: 295, delta: 24, workouts: 20, volume: 42300 },
  { rank: 3, name: 'Lautaro Torres', locationId: 'loc_belgrano', strengthScore: 286, delta: 22, workouts: 19, volume: 39800 },
  { rank: 4, name: 'Camila Rodríguez', locationId: 'loc_palermo', strengthScore: 274, delta: 19, workouts: 18, volume: 36200 },
  { rank: 5, name: 'Tomás Fernández', locationId: 'loc_nordelta', strengthScore: 268, delta: 17, workouts: 18, volume: 35100 },
  { rank: 6, name: 'Valentina López', locationId: 'loc_palermo', strengthScore: 262, delta: 16, workouts: 17, volume: 33800 },
  { rank: 7, name: 'Franco Pérez', locationId: 'loc_nordelta', strengthScore: 255, delta: 14, workouts: 16, volume: 31200 },
  { rank: 8, name: 'Isabella Sánchez', locationId: 'loc_palermo', strengthScore: 248, delta: 12, workouts: 15, volume: 29600 },
  { rank: 9, name: 'Agustín Ramírez', locationId: 'loc_belgrano', strengthScore: 242, delta: 11, workouts: 15, volume: 28400 },
  { rank: 10, name: 'Emilia Flores', locationId: 'loc_palermo', strengthScore: 238, delta: 10, workouts: 14, volume: 27100 },
];

// ─── Integraciones ───────────────────────────────────────────────
export const integrationCards: IntegrationCard[] = [
  { id: 'int_evo', provider: 'EVO', name: 'EVO / W12', monogram: 'EV', category: 'ERP', status: 'connected', description: 'Sync completo del ciclo de vida del socio' },
  { id: 'int_mindbody', provider: 'MINDBODY', name: 'Mindbody', monogram: 'MB', category: 'ERP', status: 'available', description: 'ERP de gimnasio y reservas' },
  { id: 'int_glofox', provider: 'GLOFOX', name: 'ABC Glofox', monogram: 'GX', category: 'ERP', status: 'available', description: 'Gestión de socios y cobros' },
  { id: 'int_wellhub', provider: 'WELLHUB', name: 'Wellhub (Gympass)', monogram: 'WH', category: 'Agregador', status: 'available', description: 'Plataforma de beneficio corporativo' },
  { id: 'int_totalpass', provider: 'TOTALPASS', name: 'TotalPass', monogram: 'TP', category: 'Agregador', status: 'available', description: 'Red de acceso multi-gimnasio' },
  { id: 'int_slack', provider: 'SLACK', name: 'Slack', monogram: 'SL', category: 'Comunicación', status: 'available', description: 'Alertas de churn y PRs al equipo' },
  { id: 'int_teams', provider: 'TEAMS', name: 'Microsoft Teams', monogram: 'MT', category: 'Comunicación', status: 'available', description: 'Integración Corporate Wellness' },
];

export const qrFunnel = [
  { label: 'Escaneos QR', value: 2847 },
  { label: 'Instalaciones', value: 1892 },
  { label: 'Primer entrenamiento', value: 1428 },
  { label: '5º entrenamiento', value: 1104 },
];

// ─── Alertas operativas (centro de notificaciones) ───────────────
export const opsAlerts: OpsAlert[] = [
  { id: 'al1', severity: 'critical', title: 'Squat Rack al 94% en Palermo', detail: 'Esperas de 8+ min entre 18 y 20 h. Evaluar 5º rack.', timestamp: isoMinAgo(14), href: '/locations-equipment' },
  { id: 'al2', severity: 'warning', title: '23 socios cruzaron 14 días sin entrenar', detail: 'Pasaron de "Necesita nudge" a "En riesgo" esta semana.', timestamp: isoMinAgo(52), href: '/retention?segment=AT_RISK' },
  { id: 'al3', severity: 'success', title: 'Salvavidas de racha recuperó 11 socios', detail: 'Volvieron a entrenar dentro de las 72 h del push.', timestamp: isoMinAgo(60 * 3), href: '/retention' },
  { id: 'al4', severity: 'info', title: 'Extensión de Cuádriceps en mantenimiento', detail: 'Rutinas de Palermo recalculadas con Hack Squat y Prensa.', timestamp: isoMinAgo(60 * 6), href: '/locations-equipment' },
];

// ─── Corporate Wellness ──────────────────────────────────────────
export const departments: Department[] = [
  { name: 'Ingeniería', members: 85, avgReadiness: 78, avgStrength: 242, activeRate: 72, stepsAvg: 8400, burnoutRisk: 9 },
  { name: 'Ventas', members: 62, avgReadiness: 61, avgStrength: 218, activeRate: 58, stepsAvg: 10200, burnoutRisk: 21 },
  { name: 'Producto', members: 45, avgReadiness: 82, avgStrength: 235, activeRate: 76, stepsAvg: 7800, burnoutRisk: 6 },
  { name: 'Marketing', members: 38, avgReadiness: 71, avgStrength: 205, activeRate: 64, stepsAvg: 9100, burnoutRisk: 12 },
  { name: 'RR. HH. y Operaciones', members: 28, avgReadiness: 74, avgStrength: 198, activeRate: 68, stepsAvg: 8800, burnoutRisk: 11 },
  { name: 'Legal', members: 4, avgReadiness: 66, avgStrength: 190, activeRate: 50, stepsAvg: 6900, burnoutRisk: 25 },
];

/** Umbral de k-anonimato: grupos más chicos no se muestran individualmente. */
export const K_ANONYMITY_MIN = 5;

export const readinessTrend = [
  { week: 'S-7', readiness: 69, sleep: 6.8 },
  { week: 'S-6', readiness: 70, sleep: 6.9 },
  { week: 'S-5', readiness: 68, sleep: 6.7 },
  { week: 'S-4', readiness: 71, sleep: 7.0 },
  { week: 'S-3', readiness: 72, sleep: 7.1 },
  { week: 'S-2', readiness: 70, sleep: 6.9 },
  { week: 'S-1', readiness: 73, sleep: 7.2 },
  { week: 'Hoy', readiness: 74, sleep: 7.2 },
];

// ─── Coach Studio ────────────────────────────────────────────────
export const coachClients: CoachClient[] = [
  { id: 'c1', name: 'Sofía Martínez', plan: 'Hipertrofia A/B', squat1RM: 85, bench1RM: 52, deadlift1RM: 95, e1rmTrend: [210, 214, 219, 222, 226, 232], rpe: 'Ideal', nextSession: 'Upper A', streak: 12, lastFeedback: 'Me sentí fuerte en sentadilla', adherence: 94 },
  { id: 'c2', name: 'Martín García', plan: 'Fuerza 5x5', squat1RM: 140, bench1RM: 105, deadlift1RM: 165, e1rmTrend: [395, 401, 404, 404, 406, 410], rpe: 'Duro', nextSession: 'Lower B', streak: 8, lastFeedback: 'El agarre en peso muerto falló', adherence: 81 },
  { id: 'c3', name: 'Camila López', plan: 'Powerbuilding', squat1RM: 92, bench1RM: 55, deadlift1RM: 110, e1rmTrend: [228, 234, 240, 245, 251, 257], rpe: 'Fácil', nextSession: 'Push', streak: 15, lastFeedback: 'Sumé 2,5 kg sin problema', adherence: 98 },
  { id: 'c4', name: 'Tomás Rodríguez', plan: 'Recomposición', squat1RM: 110, bench1RM: 80, deadlift1RM: 130, e1rmTrend: [300, 305, 309, 312, 316, 320], rpe: 'Ideal', nextSession: 'Full Body', streak: 6, lastFeedback: 'Bien, macros al día', adherence: 86 },
  { id: 'c5', name: 'Valentina Fernández', plan: 'Foco glúteos', squat1RM: 75, bench1RM: 40, deadlift1RM: 85, e1rmTrend: [182, 186, 190, 192, 196, 200], rpe: 'Ideal', nextSession: 'Lower A', streak: 10, lastFeedback: '¡PR en hip thrust!', adherence: 91 },
  { id: 'c6', name: 'Bautista Ruiz', plan: 'Fuerza 5x5', squat1RM: 120, bench1RM: 90, deadlift1RM: 150, e1rmTrend: [372, 370, 366, 365, 362, 360], rpe: 'Duro', nextSession: 'Lower A', streak: 2, lastFeedback: 'Dormí mal toda la semana', adherence: 58 },
];

export const formCheckInbox: FormCheck[] = [
  { id: 'fc1', clientName: 'Martín García', exercise: 'Peso muerto', load: '150 kg × 3', submittedAt: isoMinAgo(40), note: '¿Se me redondea la espalda en la última?' },
  { id: 'fc2', clientName: 'Valentina Fernández', exercise: 'Hip thrust', load: '120 kg × 8', submittedAt: isoMinAgo(60 * 5), note: 'PR, ¿la profundidad está bien?' },
  { id: 'fc3', clientName: 'Bautista Ruiz', exercise: 'Sentadilla', load: '110 kg × 5', submittedAt: isoMinAgo(60 * 20), note: 'Siento la rodilla izquierda.' },
];

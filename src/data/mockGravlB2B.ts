// GRAVL Partner & Enterprise OS — Rich Realistic Mock Dataset
// Multi-location gym partner: "9 Fitness" with 3 branches, ~1,240 members

import type {
  Organization,
  GymLocation,
  B2BMemberTelemetry,
  GymChallenge,
  NudgeRule,
  RetentionCohort,
  LiveWorkoutEvent,
  MuscleScore,
  GymMachine,
} from '@/types/gravl-b2b';

// ─── Organization ────────────────────────────────────────────────
export const organization: Organization = {
  id: 'org_9fitness_01',
  name: '9 Fitness',
  slug: '9fitness',
  vertical: 'GYM_CHAIN',
  planTier: 'GROWTH',
  seatLimit: 1500,
  activeSeats: 1240,
  mrrUsd: 3100,
  branding: {
    logoUrl: '/logo-9fitness.svg',
    accentHex: '#C6FF00',
    welcomeMessage: 'Bienvenido a 9 Fitness — Tu fuerza, tu comunidad.',
  },
  integrations: {
    provider: 'EVO',
    webhookUrl: 'https://api.9fitness.com/webhooks/gravl',
    autoRevokeOnCancel: true,
    status: 'CONNECTED',
  },
};

// ─── Machines per Zone ───────────────────────────────────────────
const palemoMachines: GymMachine[] = [
  { machineId: 'm01', name: 'Bench Press Station', zone: 'FREE_WEIGHTS', quantity: 3, status: 'OPERATIONAL', weeklyUsageRate: 88 },
  { machineId: 'm02', name: 'Squat Rack', zone: 'RACKS', quantity: 4, status: 'OPERATIONAL', weeklyUsageRate: 94 },
  { machineId: 'm03', name: 'Deadlift Platform', zone: 'FREE_WEIGHTS', quantity: 2, status: 'OPERATIONAL', weeklyUsageRate: 72 },
  { machineId: 'm04', name: 'Cable Crossover', zone: 'CABLES', quantity: 2, status: 'OPERATIONAL', weeklyUsageRate: 91 },
  { machineId: 'm05', name: 'Lat Pulldown', zone: 'CABLES', quantity: 3, status: 'OPERATIONAL', weeklyUsageRate: 85 },
  { machineId: 'm06', name: 'Leg Press', zone: 'MACHINES', quantity: 2, status: 'OPERATIONAL', weeklyUsageRate: 78 },
  { machineId: 'm07', name: 'Leg Extension', zone: 'MACHINES', quantity: 2, status: 'MAINTENANCE', weeklyUsageRate: 65 },
  { machineId: 'm08', name: 'Leg Curl', zone: 'MACHINES', quantity: 2, status: 'OPERATIONAL', weeklyUsageRate: 60 },
  { machineId: 'm09', name: 'Hack Squat', zone: 'MACHINES', quantity: 1, status: 'OPERATIONAL', weeklyUsageRate: 82 },
  { machineId: 'm10', name: 'Smith Machine', zone: 'RACKS', quantity: 2, status: 'OPERATIONAL', weeklyUsageRate: 70 },
  { machineId: 'm11', name: 'Pec Deck / Fly Machine', zone: 'MACHINES', quantity: 1, status: 'OPERATIONAL', weeklyUsageRate: 55 },
  { machineId: 'm12', name: 'Seated Row Machine', zone: 'MACHINES', quantity: 2, status: 'OPERATIONAL', weeklyUsageRate: 68 },
  { machineId: 'm13', name: 'Shoulder Press Machine', zone: 'MACHINES', quantity: 1, status: 'OPERATIONAL', weeklyUsageRate: 52 },
  { machineId: 'm14', name: 'Incline Bench', zone: 'FREE_WEIGHTS', quantity: 2, status: 'OPERATIONAL', weeklyUsageRate: 76 },
  { machineId: 'm15', name: 'Treadmill', zone: 'CARDIO', quantity: 8, status: 'OPERATIONAL', weeklyUsageRate: 45 },
  { machineId: 'm16', name: 'Assault Bike', zone: 'CARDIO', quantity: 4, status: 'OPERATIONAL', weeklyUsageRate: 38 },
  { machineId: 'm17', name: 'Rowing Machine', zone: 'CARDIO', quantity: 3, status: 'OPERATIONAL', weeklyUsageRate: 42 },
  { machineId: 'm18', name: 'Preacher Curl Bench', zone: 'FREE_WEIGHTS', quantity: 1, status: 'OPERATIONAL', weeklyUsageRate: 48 },
];

// ─── Locations ───────────────────────────────────────────────────
export const locations: GymLocation[] = [
  {
    id: 'loc_palermo',
    organizationId: 'org_9fitness_01',
    name: 'Sede Palermo',
    city: 'Buenos Aires',
    country: 'Argentina',
    qrDeepLink: 'gravl.ai/join/9fitness/palermo',
    liveActiveMembersCount: 24,
    equipmentProfile: {
      weightUnit: 'KG',
      availablePlates: [1.25, 2.5, 5, 10, 15, 20, 25],
      dumbbellMax: 50,
      dumbbellStep: 2,
      machines: palemoMachines,
    },
  },
  {
    id: 'loc_belgrano',
    organizationId: 'org_9fitness_01',
    name: 'Sede Belgrano',
    city: 'Buenos Aires',
    country: 'Argentina',
    qrDeepLink: 'gravl.ai/join/9fitness/belgrano',
    liveActiveMembersCount: 18,
    equipmentProfile: {
      weightUnit: 'KG',
      availablePlates: [1.25, 2.5, 5, 10, 15, 20, 25],
      dumbbellMax: 46,
      dumbbellStep: 2,
      machines: [
        { machineId: 'b01', name: 'Bench Press Station', zone: 'FREE_WEIGHTS', quantity: 2, status: 'OPERATIONAL', weeklyUsageRate: 84 },
        { machineId: 'b02', name: 'Squat Rack', zone: 'RACKS', quantity: 3, status: 'OPERATIONAL', weeklyUsageRate: 90 },
        { machineId: 'b03', name: 'Deadlift Platform', zone: 'FREE_WEIGHTS', quantity: 2, status: 'OPERATIONAL', weeklyUsageRate: 68 },
        { machineId: 'b04', name: 'Cable Crossover', zone: 'CABLES', quantity: 2, status: 'OPERATIONAL', weeklyUsageRate: 87 },
        { machineId: 'b05', name: 'Lat Pulldown', zone: 'CABLES', quantity: 2, status: 'OPERATIONAL', weeklyUsageRate: 80 },
        { machineId: 'b06', name: 'Leg Press', zone: 'MACHINES', quantity: 2, status: 'OPERATIONAL', weeklyUsageRate: 75 },
        { machineId: 'b07', name: 'Leg Extension', zone: 'MACHINES', quantity: 1, status: 'OPERATIONAL', weeklyUsageRate: 62 },
        { machineId: 'b08', name: 'Hack Squat', zone: 'MACHINES', quantity: 1, status: 'OPERATIONAL', weeklyUsageRate: 78 },
        { machineId: 'b09', name: 'Smith Machine', zone: 'RACKS', quantity: 1, status: 'OPERATIONAL', weeklyUsageRate: 66 },
        { machineId: 'b10', name: 'Treadmill', zone: 'CARDIO', quantity: 6, status: 'OPERATIONAL', weeklyUsageRate: 50 },
        { machineId: 'b11', name: 'Assault Bike', zone: 'CARDIO', quantity: 3, status: 'OPERATIONAL', weeklyUsageRate: 35 },
        { machineId: 'b12', name: 'Seated Row Machine', zone: 'MACHINES', quantity: 1, status: 'OPERATIONAL', weeklyUsageRate: 71 },
      ],
    },
  },
  {
    id: 'loc_nordelta',
    organizationId: 'org_9fitness_01',
    name: 'Sede Nordelta',
    city: 'Tigre',
    country: 'Argentina',
    qrDeepLink: 'gravl.ai/join/9fitness/nordelta',
    liveActiveMembersCount: 12,
    equipmentProfile: {
      weightUnit: 'KG',
      availablePlates: [2.5, 5, 10, 15, 20, 25],
      dumbbellMax: 40,
      dumbbellStep: 2,
      machines: [
        { machineId: 'n01', name: 'Bench Press Station', zone: 'FREE_WEIGHTS', quantity: 2, status: 'OPERATIONAL', weeklyUsageRate: 80 },
        { machineId: 'n02', name: 'Squat Rack', zone: 'RACKS', quantity: 2, status: 'OPERATIONAL', weeklyUsageRate: 86 },
        { machineId: 'n03', name: 'Cable Crossover', zone: 'CABLES', quantity: 1, status: 'OPERATIONAL', weeklyUsageRate: 82 },
        { machineId: 'n04', name: 'Lat Pulldown', zone: 'CABLES', quantity: 2, status: 'OPERATIONAL', weeklyUsageRate: 74 },
        { machineId: 'n05', name: 'Leg Press', zone: 'MACHINES', quantity: 1, status: 'OPERATIONAL', weeklyUsageRate: 72 },
        { machineId: 'n06', name: 'Leg Extension', zone: 'MACHINES', quantity: 1, status: 'OPERATIONAL', weeklyUsageRate: 58 },
        { machineId: 'n07', name: 'Smith Machine', zone: 'RACKS', quantity: 1, status: 'OPERATIONAL', weeklyUsageRate: 64 },
        { machineId: 'n08', name: 'Treadmill', zone: 'CARDIO', quantity: 5, status: 'OPERATIONAL', weeklyUsageRate: 48 },
        { machineId: 'n09', name: 'Rowing Machine', zone: 'CARDIO', quantity: 2, status: 'OPERATIONAL', weeklyUsageRate: 40 },
      ],
    },
  },
];

// ─── Member Names (Spanish/English realistic mix) ────────────────
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

function seededRandom(seed: number): () => number {
  let s = seed;
  return () => {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

function generateMembers(): B2BMemberTelemetry[] {
  const rng = seededRandom(42);
  const locationIds = ['loc_palermo', 'loc_belgrano', 'loc_nordelta'];
  const locationWeights = [0.5, 0.33, 0.17]; // proportional distribution
  const members: B2BMemberTelemetry[] = [];

  for (let i = 0; i < 1240; i++) {
    const r = rng();
    const locIdx = r < locationWeights[0] ? 0 : r < locationWeights[0] + locationWeights[1] ? 1 : 2;
    const firstName = firstNames[Math.floor(rng() * firstNames.length)];
    const lastName = lastNames[Math.floor(rng() * lastNames.length)];
    const workoutsThisWeek = Math.floor(rng() * 6);
    const currentStreakWeeks = Math.floor(rng() * 20);
    const strengthScore = Math.floor(110 + rng() * 200);
    const delta30d = Math.floor(-8 + rng() * 30);
    const readiness = Math.floor(30 + rng() * 70);
    const daysInactive = Math.floor(rng() * 30);
    const workoutsFirst30 = Math.floor(rng() * 12);

    let status: B2BMemberTelemetry['status'];
    if (currentStreakWeeks >= 4 && workoutsThisWeek >= 3) status = 'ON_FIRE';
    else if (daysInactive <= 3) status = 'ACTIVE';
    else if (daysInactive <= 14) status = 'NEEDS_NUDGE';
    else status = 'AT_RISK';

    const joinDate = new Date(2024, Math.floor(rng() * 12), 1 + Math.floor(rng() * 28));
    const lastWorkout = new Date();
    lastWorkout.setDate(lastWorkout.getDate() - daysInactive);

    members.push({
      userId: `usr_${String(i + 1).padStart(4, '0')}`,
      fullName: `${firstName} ${lastName}`,
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${firstName}${lastName}&backgroundColor=161A22&textColor=F8FAFC`,
      locationId: locationIds[locIdx],
      joinedAt: joinDate.toISOString(),
      workoutsFirst30Days: workoutsFirst30,
      workoutsThisWeek,
      weeklyTarget: 4,
      currentStreakWeeks,
      strengthScore,
      strengthScoreDelta30d: delta30d,
      readinessScore: readiness,
      macrosActive: rng() > 0.6,
      lastWorkoutAt: lastWorkout.toISOString(),
      status,
    });
  }
  return members;
}

export const members: B2BMemberTelemetry[] = generateMembers();

// ─── Pre-computed Member Stats ───────────────────────────────────
export const memberStats = {
  total: members.length,
  onFire: members.filter((m) => m.status === 'ON_FIRE').length,
  active: members.filter((m) => m.status === 'ACTIVE').length,
  needsNudge: members.filter((m) => m.status === 'NEEDS_NUDGE').length,
  atRisk: members.filter((m) => m.status === 'AT_RISK').length,
  newJoinersUnder5: members.filter((m) => m.workoutsFirst30Days < 5).length,
  liveNow: locations.reduce((acc, l) => acc + l.liveActiveMembersCount, 0),
  avgWorkoutsPerWeek: 3.4,
  attendanceLift: 18.4,
  survivalRate90Day: 88.2,
  totalVolumeMonth: 1428500,
  avgStrengthScoreGrowth: 14,
};

// ─── Retention Cohorts ───────────────────────────────────────────
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

// ─── Gym Challenges ──────────────────────────────────────────────
export const challenges: GymChallenge[] = [
  {
    id: 'ch_001',
    organizationId: 'org_9fitness_01',
    title: '16 Workouts in 30 Days',
    metric: 'WORKOUT_COUNT',
    targetValue: 16,
    startDate: '2024-11-01',
    endDate: '2024-11-30',
    participantsCount: 342,
    rewardDescription: 'Free month of GRAVL Pro + exclusive gym merch',
    status: 'ACTIVE',
    currentValue: 12,
  },
  {
    id: 'ch_002',
    organizationId: 'org_9fitness_01',
    title: 'Strength Score Climber',
    metric: 'STRENGTH_SCORE_GAIN',
    targetValue: 25,
    startDate: '2024-11-01',
    endDate: '2024-11-30',
    participantsCount: 189,
    rewardDescription: 'Highest % gain wins a protein shake pack',
    status: 'ACTIVE',
    currentValue: 18,
  },
  {
    id: 'ch_003',
    organizationId: 'org_9fitness_01',
    title: 'Club 500K — Collective Volume',
    metric: 'TOTAL_VOLUME_KG',
    targetValue: 500000,
    startDate: '2024-12-01',
    endDate: '2024-12-31',
    participantsCount: 0,
    rewardDescription: 'Gym-wide celebration + branded water bottles',
    status: 'UPCOMING',
    currentValue: 0,
  },
];

// ─── Nudge Rules ─────────────────────────────────────────────────
export const nudgeRules: NudgeRule[] = [
  {
    id: 'nr_001',
    type: 'FIVE_WORKOUT_RULE',
    name: 'The 5-Workout Rule',
    description: 'If a new member completes <3 workouts in their first 14 days → Send push notification + assign "Quick Confidence Builder" workout.',
    enabled: true,
    triggerCount: 47,
    lastTriggered: '2024-11-22T14:30:00Z',
  },
  {
    id: 'nr_002',
    type: 'STREAK_SAVER',
    name: 'Streak Saver',
    description: 'If a member misses 7 days → Trigger personalized push from their gym brand with 10% volume reduction for easy return.',
    enabled: true,
    triggerCount: 128,
    lastTriggered: '2024-11-23T09:15:00Z',
  },
  {
    id: 'nr_003',
    type: 'PR_CELEBRATION',
    name: 'PR Celebration',
    description: 'When a member breaks a 1RM record → Notify front desk / floor coach to congratulate them in person.',
    enabled: false,
    triggerCount: 23,
    lastTriggered: '2024-11-21T18:45:00Z',
  },
];

// ─── Live Workout Feed ───────────────────────────────────────────
export const liveWorkoutFeed: LiveWorkoutEvent[] = [
  { id: 'lw01', memberName: 'Sofía M.', exercise: 'Barbell Squat', weight: 85, unit: 'kg', isPR: true, locationName: 'Sede Palermo', timestamp: '2m ago' },
  { id: 'lw02', memberName: 'Martín G.', exercise: 'Bench Press', weight: 100, unit: 'kg', isPR: false, locationName: 'Sede Belgrano', timestamp: '4m ago' },
  { id: 'lw03', memberName: 'Camila L.', exercise: 'Romanian Deadlift', weight: 70, unit: 'kg', isPR: false, locationName: 'Sede Palermo', timestamp: '5m ago' },
  { id: 'lw04', memberName: 'Tomás R.', exercise: 'Overhead Press', weight: 55, unit: 'kg', isPR: true, locationName: 'Sede Nordelta', timestamp: '7m ago' },
  { id: 'lw05', memberName: 'Valentina F.', exercise: 'Hip Thrust', weight: 120, unit: 'kg', isPR: false, locationName: 'Sede Palermo', timestamp: '8m ago' },
  { id: 'lw06', memberName: 'Lautaro S.', exercise: 'Pull-ups', weight: 15, unit: 'kg', isPR: false, locationName: 'Sede Belgrano', timestamp: '10m ago' },
  { id: 'lw07', memberName: 'Isabella D.', exercise: 'Leg Press', weight: 180, unit: 'kg', isPR: true, locationName: 'Sede Palermo', timestamp: '12m ago' },
  { id: 'lw08', memberName: 'Franco A.', exercise: 'Incline Dumbbell Press', weight: 36, unit: 'kg', isPR: false, locationName: 'Sede Nordelta', timestamp: '15m ago' },
  { id: 'lw09', memberName: 'Emilia T.', exercise: 'Cable Row', weight: 45, unit: 'kg', isPR: false, locationName: 'Sede Belgrano', timestamp: '18m ago' },
  { id: 'lw10', memberName: 'Joaquín M.', exercise: 'Barbell Curl', weight: 40, unit: 'kg', isPR: false, locationName: 'Sede Palermo', timestamp: '20m ago' },
];

// ─── Muscle Flower / Radar Data (Gym Cohort Avg) ─────────────────
export const muscleScores: MuscleScore[] = [
  { muscle: 'Chest', score: 78 },
  { muscle: 'Back', score: 82 },
  { muscle: 'Quads', score: 85 },
  { muscle: 'Hamstrings', score: 68 },
  { muscle: 'Glutes', score: 72 },
  { muscle: 'Shoulders', score: 74 },
  { muscle: 'Arms', score: 80 },
  { muscle: 'Core', score: 65 },
];

// ─── Peak Hours Heatmap Data ─────────────────────────────────────
export const peakHoursData = [
  { hour: '6AM', mon: 12, tue: 15, wed: 14, thu: 16, fri: 11, sat: 8, sun: 4 },
  { hour: '7AM', mon: 28, tue: 32, wed: 30, thu: 34, fri: 26, sat: 18, sun: 8 },
  { hour: '8AM', mon: 35, tue: 38, wed: 36, thu: 40, fri: 30, sat: 22, sun: 12 },
  { hour: '9AM', mon: 22, tue: 25, wed: 24, thu: 26, fri: 20, sat: 28, sun: 15 },
  { hour: '10AM', mon: 15, tue: 18, wed: 16, thu: 20, fri: 14, sat: 32, sun: 20 },
  { hour: '11AM', mon: 12, tue: 14, wed: 13, thu: 15, fri: 11, sat: 30, sun: 22 },
  { hour: '12PM', mon: 18, tue: 20, wed: 19, thu: 22, fri: 16, sat: 25, sun: 18 },
  { hour: '1PM', mon: 15, tue: 17, wed: 16, thu: 18, fri: 14, sat: 20, sun: 14 },
  { hour: '5PM', mon: 38, tue: 42, wed: 40, thu: 44, fri: 35, sat: 15, sun: 8 },
  { hour: '6PM', mon: 48, tue: 52, wed: 50, thu: 55, fri: 42, sat: 12, sun: 6 },
  { hour: '7PM', mon: 45, tue: 48, wed: 46, thu: 50, fri: 38, sat: 10, sun: 5 },
  { hour: '8PM', mon: 32, tue: 35, wed: 34, thu: 38, fri: 28, sat: 8, sun: 4 },
  { hour: '9PM', mon: 20, tue: 22, wed: 21, thu: 24, fri: 18, sat: 5, sun: 2 },
];

// ─── Monthly Leaderboard ─────────────────────────────────────────
export const leaderboard = [
  { rank: 1, name: 'Martín García', strengthScore: 308, delta: 28, workouts: 22, volume: 48500 },
  { rank: 2, name: 'Sofía Martínez', strengthScore: 295, delta: 24, workouts: 20, volume: 42300 },
  { rank: 3, name: 'Lautaro Torres', strengthScore: 286, delta: 22, workouts: 19, volume: 39800 },
  { rank: 4, name: 'Camila Rodríguez', strengthScore: 274, delta: 19, workouts: 18, volume: 36200 },
  { rank: 5, name: 'Tomás Fernández', strengthScore: 268, delta: 17, workouts: 18, volume: 35100 },
  { rank: 6, name: 'Valentina López', strengthScore: 262, delta: 16, workouts: 17, volume: 33800 },
  { rank: 7, name: 'Franco Pérez', strengthScore: 255, delta: 14, workouts: 16, volume: 31200 },
  { rank: 8, name: 'Isabella Sánchez', strengthScore: 248, delta: 12, workouts: 15, volume: 29600 },
  { rank: 9, name: 'Agustín Ramírez', strengthScore: 242, delta: 11, workouts: 15, volume: 28400 },
  { rank: 10, name: 'Emilia Flores', strengthScore: 238, delta: 10, workouts: 14, volume: 27100 },
];

// ─── Integration Cards ──────────────────────────────────────────
export const integrationCards = [
  { id: 'int_mindbody', name: 'Mindbody', logo: '🧠', status: 'available' as const, description: 'Gym ERP & booking system sync' },
  { id: 'int_glofox', name: 'ABC Glofox', logo: '🦊', status: 'available' as const, description: 'Member management & billing sync' },
  { id: 'int_evo', name: 'EVO / W12', logo: '⚡', status: 'connected' as const, description: 'Full member lifecycle sync' },
  { id: 'int_wellhub', name: 'Wellhub (Gympass)', logo: '🏋️', status: 'available' as const, description: 'Corporate benefit platform' },
  { id: 'int_totalpass', name: 'TotalPass', logo: '🎫', status: 'available' as const, description: 'Multi-gym access network' },
  { id: 'int_slack', name: 'Slack', logo: '💬', status: 'available' as const, description: 'Corporate Wellness notifications' },
  { id: 'int_teams', name: 'Microsoft Teams', logo: '👥', status: 'available' as const, description: 'Corporate Wellness integration' },
];

// GRAVL Partner & Enterprise OS — Contratos de dominio B2B
// Espejo del contrato de la API .NET Core (sección 5 del PRD). Mantener
// los nombres de campos alineados con el backend para que el swap de mocks
// a fetch real sea mecánico.

export type VerticalType = 'GYM_CHAIN' | 'CORPORATE_WELLNESS' | 'COACH_STUDIO';

export type PlanTier = 'STARTER' | 'GROWTH' | 'ENTERPRISE';

export type IntegrationProvider =
  | 'MINDBODY'
  | 'GLOFOX'
  | 'EVO'
  | 'WELLHUB'
  | 'TOTALPASS'
  | 'SLACK'
  | 'TEAMS'
  | 'NONE';

export type EquipmentZone = 'FREE_WEIGHTS' | 'MACHINES' | 'CABLES' | 'RACKS' | 'CARDIO';

export type MachineStatus = 'OPERATIONAL' | 'MAINTENANCE';

export type MemberStatus = 'ON_FIRE' | 'ACTIVE' | 'NEEDS_NUDGE' | 'AT_RISK';

export type ChallengeMetric = 'WORKOUT_COUNT' | 'STRENGTH_SCORE_GAIN' | 'TOTAL_VOLUME_KG';

export type ChallengeStatus = 'ACTIVE' | 'UPCOMING' | 'COMPLETED';

export type NudgeRuleType = 'FIVE_WORKOUT_RULE' | 'STREAK_SAVER' | 'PR_CELEBRATION';

export type LocationScope = string | 'all';

export interface Organization {
  id: string;
  name: string;
  shortName: string;
  slug: string;
  vertical: VerticalType;
  planTier: PlanTier;
  seatLimit: number;
  activeSeats: number;
  mrrUsd: number;
  /** Cuota mensual promedio que paga un socio/empleado al partner (USD). */
  avgMonthlyFeeUsd: number;
  /** Costo GRAVL por asiento activo por mes (USD). */
  pricePerSeatUsd: number;
  branding: {
    logoUrl: string;
    accentHex?: string;
    welcomeMessage: string;
  };
  integrations: {
    provider: IntegrationProvider;
    webhookUrl: string;
    autoRevokeOnCancel: boolean;
    status: 'CONNECTED' | 'PENDING' | 'DISCONNECTED';
  };
}

export interface GymMachine {
  machineId: string;
  name: string;
  zone: EquipmentZone;
  quantity: number;
  status: MachineStatus;
  weeklyUsageRate: number;
}

export interface GymLocation {
  id: string;
  organizationId: string;
  name: string;
  shortName: string;
  city: string;
  country: string;
  qrDeepLink: string;
  liveActiveMembersCount: number;
  /** Capacidad simultánea cómoda del salón (para % de saturación). */
  floorCapacity: number;
  equipmentProfile: {
    weightUnit: 'KG' | 'LB';
    availablePlates: number[];
    dumbbellMax: number;
    dumbbellStep: number;
    machines: GymMachine[];
  };
}

export interface B2BMemberTelemetry {
  userId: string;
  fullName: string;
  locationId: string;
  department?: string;
  joinedAt: string;
  workoutsFirst30Days: number;
  workoutsLast30Days: number;
  workoutsThisWeek: number;
  weeklyTarget: number;
  currentStreakWeeks: number;
  strengthScore: number;
  strengthScoreDelta30d: number;
  readinessScore?: number;
  macrosActive: boolean;
  lastWorkoutAt: string;
  status: MemberStatus;
  /** 0–100. Probabilidad estimada de baja en 30 días (modelo de churn). */
  churnRisk: number;
}

export interface GymChallenge {
  id: string;
  organizationId: string;
  title: string;
  metric: ChallengeMetric;
  targetValue: number;
  startDate: string;
  endDate: string;
  participantsCount: number;
  rewardDescription: string;
  status: ChallengeStatus;
  currentValue?: number;
  /** Sedes donde corre el reto. Vacío = toda la red. */
  locationIds?: string[];
}

export interface NudgeRule {
  id: string;
  type: NudgeRuleType;
  name: string;
  description: string;
  enabled: boolean;
  triggerCount: number;
  /** % de socios que volvieron a entrenar ≤72h tras el nudge. */
  recoveryRate: number;
  lastTriggered?: string;
}

export interface NudgeTemplate {
  id: string;
  label: string;
  tone: 'cálido' | 'motivador' | 'directo';
  body: string;
  /** Ajuste automático de la próxima sesión que acompaña al mensaje. */
  sessionAdjustment: string;
}

export interface RetentionCohort {
  month: number;
  withGravl: number;
  withoutGravl: number;
}

export interface LiveWorkoutEvent {
  id: string;
  memberName: string;
  exercise: string;
  weight: number;
  unit: 'kg' | 'lb';
  isPR: boolean;
  locationId: string;
  timestamp: string;
}

export interface MuscleScore {
  muscle: string;
  score: number;
}

export interface PeakHourRow {
  hour: string;
  hour24: number;
  mon: number;
  tue: number;
  wed: number;
  thu: number;
  fri: number;
  sat: number;
  sun: number;
}

export interface IntegrationCard {
  id: string;
  provider: IntegrationProvider;
  name: string;
  monogram: string;
  category: 'ERP' | 'Agregador' | 'Comunicación';
  status: 'available' | 'connected';
  description: string;
}

export type AlertSeverity = 'critical' | 'warning' | 'info' | 'success';

export interface OpsAlert {
  id: string;
  severity: AlertSeverity;
  title: string;
  detail: string;
  timestamp: string;
  href?: string;
}

export interface Department {
  name: string;
  members: number;
  avgReadiness: number;
  avgStrength: number;
  activeRate: number;
  stepsAvg: number;
  burnoutRisk: number;
}

export interface CoachClient {
  id: string;
  name: string;
  plan: string;
  squat1RM: number;
  bench1RM: number;
  deadlift1RM: number;
  e1rmTrend: number[];
  rpe: 'Fácil' | 'Ideal' | 'Duro';
  nextSession: string;
  streak: number;
  lastFeedback: string;
  adherence: number;
}

export interface FormCheck {
  id: string;
  clientName: string;
  exercise: string;
  load: string;
  submittedAt: string;
  note: string;
}

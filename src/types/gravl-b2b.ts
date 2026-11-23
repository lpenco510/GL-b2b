// GRAVL Partner & Enterprise OS — B2B TypeScript Interfaces
// Matches GRAVL .NET Core Backend API Contract (Section 5 of PRD)

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

export type EquipmentZone =
  | 'FREE_WEIGHTS'
  | 'MACHINES'
  | 'CABLES'
  | 'RACKS'
  | 'CARDIO';

export type MachineStatus = 'OPERATIONAL' | 'MAINTENANCE';

export type MemberStatus = 'ON_FIRE' | 'ACTIVE' | 'NEEDS_NUDGE' | 'AT_RISK';

export type ChallengeMetric =
  | 'WORKOUT_COUNT'
  | 'STRENGTH_SCORE_GAIN'
  | 'TOTAL_VOLUME_KG';

export type ChallengeStatus = 'ACTIVE' | 'UPCOMING' | 'COMPLETED';

export type NudgeRuleType =
  | 'FIVE_WORKOUT_RULE'
  | 'STREAK_SAVER'
  | 'PR_CELEBRATION';

export interface Organization {
  id: string;
  name: string;
  slug: string;
  vertical: VerticalType;
  planTier: PlanTier;
  seatLimit: number;
  activeSeats: number;
  mrrUsd: number;
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
  city: string;
  country: string;
  qrDeepLink: string;
  liveActiveMembersCount: number;
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
  avatarUrl: string;
  locationId: string;
  department?: string;
  joinedAt: string;
  workoutsFirst30Days: number;
  workoutsThisWeek: number;
  weeklyTarget: number;
  currentStreakWeeks: number;
  strengthScore: number;
  strengthScoreDelta30d: number;
  readinessScore?: number;
  macrosActive: boolean;
  lastWorkoutAt: string;
  status: MemberStatus;
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
}

export interface NudgeRule {
  id: string;
  type: NudgeRuleType;
  name: string;
  description: string;
  enabled: boolean;
  triggerCount: number;
  lastTriggered?: string;
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
  locationName: string;
  timestamp: string;
}

export interface MuscleScore {
  muscle: string;
  score: number;
}

export interface ROICalculation {
  totalMembers: number;
  avgMonthlyFee: number;
  gravlCostPerMember: number;
  projectedChurnReduction: number;
  retainedAnnualRevenue: number;
  netROIMultiple: number;
}

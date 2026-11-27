/**
 * Identidad y consentimiento.
 *
 * Regla de oro: la cuenta es del SOCIO (vive en GRAVL). El partner tiene un
 * vínculo (Membership) con alcances que el socio consintió. Si el socio deja
 * el gimnasio, se revoca el vínculo; la cuenta y su historial siguen siendo suyos.
 */
import type { VerticalType } from './types';

export type ConsentScope =
  /** Asistencia y sesiones (conteos, fechas). Base del servicio B2B. */
  | 'ACTIVITY'
  /** Rendimiento: Strength Score, 1RM, volumen. */
  | 'PERFORMANCE'
  /** Readiness, sueño, HRV. Dato de salud: consentimiento explícito. */
  | 'WELLNESS'
  /** Recibir push con la marca del partner. */
  | 'PARTNER_MESSAGING'
  /** Aparecer con nombre en rankings y feed del gimnasio. */
  | 'PUBLIC_PROFILE';

/** Nunca salen de la cuenta del socio hacia un partner, ni agregados con n chico. */
export const NEVER_SHARED = ['Peso corporal', 'Fotos de comidas', 'Notas médicas', 'Ubicación GPS'] as const;

export const consentLabel: Record<ConsentScope, string> = {
  ACTIVITY: 'Asistencia y sesiones',
  PERFORMANCE: 'Rendimiento (Strength Score, 1RM)',
  WELLNESS: 'Bienestar (readiness, sueño)',
  PARTNER_MESSAGING: 'Mensajes del gimnasio',
  PUBLIC_PROFILE: 'Perfil visible en rankings',
};

/** Qué nivel de detalle puede ver cada vertical. Corporate nunca ve individuos. */
export const visibilityByVertical: Record<VerticalType, 'INDIVIDUAL' | 'AGGREGATE_ONLY'> = {
  GYM_CHAIN: 'INDIVIDUAL',
  COACH_STUDIO: 'INDIVIDUAL',
  CORPORATE_WELLNESS: 'AGGREGATE_ONLY',
};

/** k-anonimato: ningún agregado se muestra con menos de K personas. */
export const K_ANONYMITY = 5;

export function canSee(scope: ConsentScope, consents: readonly ConsentScope[]) {
  return consents.includes(scope);
}

/** Cómo nace el vínculo socio↔partner. Determina qué datos de identidad trae. */
export type LinkSource = 'QR_SCAN' | 'ERP_SYNC' | 'CORPORATE_SSO' | 'COACH_INVITE';

export const linkSourceLabel: Record<LinkSource, string> = {
  QR_SCAN: 'Escaneó el QR de la sede',
  ERP_SYNC: 'Matcheado con el ERP del gimnasio',
  CORPORATE_SSO: 'Ingresó con el SSO de su empresa',
  COACH_INVITE: 'Invitación de su coach',
};

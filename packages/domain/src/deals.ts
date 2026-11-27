/**
 * Acuerdos comerciales. Cada partner tiene un Deal negociado cara a cara;
 * el Deal define QUÉ optimiza el panel, A QUIÉN se puede contactar y CÓMO cobramos.
 * La UI nunca decide estas cosas: las lee del Deal.
 */
import type { MarketCode } from './markets';

/** Cómo gana plata el partner. Es la pregunta #1 de toda negociación. */
export type MonetizationModel =
  /** Cobra por experiencia/asistencia. Si el socio no viene, se va. (boutique, premium, cadenas medianas) */
  | 'ATTENDANCE'
  /** Cobra por débito automático y dimensiona la sala para que no vengan todos. (low-cost, franquicias grandes) */
  | 'BREAKAGE'
  /** Paga un tercero por persona elegible (empresa, agregador). */
  | 'SPONSORED'
  /** Cobra por su tiempo y su programación. (coach independiente) */
  | 'SERVICE';

export type PartnerSegment = 'BOUTIQUE' | 'REGIONAL_CHAIN' | 'HIGH_VOLUME' | 'CORPORATE' | 'COACH';

export type NorthStar =
  | 'WEEKLY_ACTIVE_RATE'
  | 'RETENTION_180D'
  | 'CANCELLATIONS_PREVENTED'
  | 'PARTICIPATION_RATE'
  | 'CLIENTS_RETAINED';

export type PricingModel =
  /** Por socio que activó la app ese mes. Alinea nuestro ingreso con el uso real. */
  | 'PER_ACTIVE_USER'
  /** Por persona elegible, use o no (PEPM). Estándar en corporativo. */
  | 'PER_ELIGIBLE'
  /** Fijo por sede. Simple para cadenas que odian la variabilidad. */
  | 'PER_LOCATION'
  /** Fijo por coach + escalones de clientes. */
  | 'PER_COACH';

export interface ContactPolicy {
  /** ¿Se puede contactar a socios que pagan y no vienen? En BREAKAGE el default es NO. */
  contactDormantPayers: boolean;
  /** Días sin entrenar para considerarlo "durmiente". */
  dormantAfterDays: number;
  maxNudgesPer30d: number;
  /** No empujar visitas a franjas saturadas. */
  avoidPeakHours: boolean;
  /** Quién atiende la intención de baja: push automático o staff con oferta. */
  cancelIntentHandler: 'PUSH' | 'STAFF';
}

export interface Pricing {
  model: PricingModel;
  unitPriceUsd: number;
  minimumMonthlyUsd: number;
  /** % del ingreso por upsell de GRAVL Pro que se queda el partner (0 = no aplica). */
  partnerRevSharePct: number;
  setupFeeUsd: number;
  termMonths: number;
  discountPct: number;
}

export interface Deal {
  id: string;
  partnerId: string;
  segment: PartnerSegment;
  monetization: MonetizationModel;
  northStar: NorthStar;
  market: MarketCode;
  pricing: Pricing;
  contactPolicy: ContactPolicy;
  whiteLabel: boolean;
  signedAt: string;
  renewsAt: string;
  /** Lo que se acordó y no entra en un campo: se muestra tal cual al partner. */
  specialTerms: string[];
}

export interface Playbook {
  segment: PartnerSegment;
  label: string;
  whoIsIt: string;
  monetization: MonetizationModel;
  northStar: NorthStar;
  whatTheyBuy: string[];
  whatWeDontSell: string;
  defaultPricing: Omit<Pricing, 'discountPct' | 'termMonths'> & { termMonths: number };
  defaultContactPolicy: ContactPolicy;
  /** Métrica que sí le importa al decisor. Lo que va en la primera slide. */
  pitch: string;
}

const policyAttendance: ContactPolicy = {
  contactDormantPayers: true, dormantAfterDays: 14, maxNudgesPer30d: 3, avoidPeakHours: true, cancelIntentHandler: 'PUSH',
};
const policyBreakage: ContactPolicy = {
  contactDormantPayers: false, dormantAfterDays: 21, maxNudgesPer30d: 1, avoidPeakHours: true, cancelIntentHandler: 'STAFF',
};

export const playbooks: Record<PartnerSegment, Playbook> = {
  BOUTIQUE: {
    segment: 'BOUTIQUE', label: 'Boutique / premium', whoIsIt: '1–3 sedes, < 1.500 socios, cuota alta, experiencia como producto.',
    monetization: 'ATTENDANCE', northStar: 'WEEKLY_ACTIVE_RATE',
    whatTheyBuy: ['Retención por asistencia', 'Programación personalizada que justifica la cuota', 'Comunidad y retos'],
    whatWeDontSell: 'Reducción de staff: su diferencial son los coaches.',
    defaultPricing: { model: 'PER_ACTIVE_USER', unitPriceUsd: 3, minimumMonthlyUsd: 150, partnerRevSharePct: 0, setupFeeUsd: 0, termMonths: 12 },
    defaultContactPolicy: policyAttendance,
    pitch: 'Cada socio que no se va son 12 cuotas altas. Pagás solo por los que usan la app.',
  },
  REGIONAL_CHAIN: {
    segment: 'REGIONAL_CHAIN', label: 'Cadena regional', whoIsIt: '3–30 sedes, cuota media, mezcla de asistencia y débito.',
    monetization: 'ATTENDANCE', northStar: 'RETENTION_180D',
    whatTheyBuy: ['Retención a 6 meses', 'Uso de equipamiento y CapEx', 'Onboarding de altas nuevas'],
    whatWeDontSell: 'Una app para reemplazar su ERP: nos integramos al que ya tienen.',
    defaultPricing: { model: 'PER_ACTIVE_USER', unitPriceUsd: 2.5, minimumMonthlyUsd: 500, partnerRevSharePct: 0, setupFeeUsd: 500, termMonths: 12 },
    defaultContactPolicy: policyAttendance,
    pitch: 'Retención a 180 días medida contra tu propia línea base, por sede.',
  },
  HIGH_VOLUME: {
    segment: 'HIGH_VOLUME', label: 'Alto volumen / low-cost', whoIsIt: 'Franquicias grandes, cuota baja, débito automático, sala dimensionada para baja asistencia.',
    monetization: 'BREAKAGE', northStar: 'CANCELLATIONS_PREVENTED',
    whatTheyBuy: [
      'Menos bajas (no más asistencia): actuar sobre intención de baja, no sobre inactividad',
      'Valor percibido de la cuota: “coach con IA incluido” amortigua aumentos de precio',
      'Mover visitas a horarios valle',
      'Ingreso nuevo por upsell a GRAVL Pro con revenue share',
    ],
    whatWeDontSell: 'Reactivar masivamente a quien paga y no viene: les llena la sala y les dispara bajas.',
    defaultPricing: { model: 'PER_ACTIVE_USER', unitPriceUsd: 0.9, minimumMonthlyUsd: 1500, partnerRevSharePct: 20, setupFeeUsd: 2000, termMonths: 24 },
    defaultContactPolicy: policyBreakage,
    pitch: 'Bajás cancelaciones y ganás ingreso por upsell, sin tocar a los que pagan y no vienen.',
  },
  CORPORATE: {
    segment: 'CORPORATE', label: 'Corporate wellness', whoIsIt: 'Empresas que pagan el beneficio a empleados (RR. HH. decide).',
    monetization: 'SPONSORED', northStar: 'PARTICIPATION_RATE',
    whatTheyBuy: ['Participación medible del beneficio', 'Indicadores de burnout agregados', 'Retos por equipo'],
    whatWeDontSell: 'Datos individuales de salud de empleados. Nunca.',
    defaultPricing: { model: 'PER_ELIGIBLE', unitPriceUsd: 4, minimumMonthlyUsd: 800, partnerRevSharePct: 0, setupFeeUsd: 0, termMonths: 12 },
    defaultContactPolicy: { ...policyAttendance, maxNudgesPer30d: 2 },
    pitch: 'Un beneficio que la gente usa, con reporte trimestral listo para dirección.',
  },
  COACH: {
    segment: 'COACH', label: 'Coach independiente', whoIsIt: 'Entrenador con 10–60 clientes, cobra por su programación.',
    monetization: 'SERVICE', northStar: 'CLIENTS_RETAINED',
    whatTheyBuy: ['Tiempo: la app ajusta cargas y él revisa', 'Retención de clientes', 'Imagen profesional (marca propia)'],
    whatWeDontSell: 'Reemplazarlo: el producto lo hace mejor coach, no innecesario.',
    defaultPricing: { model: 'PER_COACH', unitPriceUsd: 29, minimumMonthlyUsd: 29, partnerRevSharePct: 0, setupFeeUsd: 0, termMonths: 1 },
    defaultContactPolicy: { ...policyAttendance, maxNudgesPer30d: 4 },
    pitch: 'Atendé el doble de clientes con el mismo tiempo.',
  },
};

export const monetizationLabel: Record<MonetizationModel, string> = {
  ATTENDANCE: 'Asistencia',
  BREAKAGE: 'Débito automático',
  SPONSORED: 'Pagado por empresa',
  SERVICE: 'Servicio de coaching',
};

export const northStarLabel: Record<NorthStar, string> = {
  WEEKLY_ACTIVE_RATE: '% de socios activos por semana',
  RETENTION_180D: 'Retención a 180 días',
  CANCELLATIONS_PREVENTED: 'Bajas evitadas por mes',
  PARTICIPATION_RATE: 'Participación del beneficio',
  CLIENTS_RETAINED: 'Clientes retenidos',
};

export const pricingModelLabel: Record<PricingModel, string> = {
  PER_ACTIVE_USER: 'por usuario activo / mes',
  PER_ELIGIBLE: 'por empleado elegible / mes',
  PER_LOCATION: 'por sede / mes',
  PER_COACH: 'por coach / mes',
};

/** Deal inicial a partir del playbook del segmento. El vendedor ajusta desde acá. */
export function dealFromPlaybook(segment: PartnerSegment, partnerId: string, market: MarketCode, signedAt: string): Deal {
  const pb = playbooks[segment];
  const renews = new Date(signedAt);
  renews.setMonth(renews.getMonth() + pb.defaultPricing.termMonths);
  return {
    id: `deal_${partnerId}`,
    partnerId,
    segment,
    monetization: pb.monetization,
    northStar: pb.northStar,
    market,
    pricing: { ...pb.defaultPricing, discountPct: 0 },
    contactPolicy: { ...pb.defaultContactPolicy },
    whiteLabel: false,
    signedAt,
    renewsAt: renews.toISOString(),
    specialTerms: [],
  };
}

/**
 * Tenants de demo y portafolio de partners.
 * - `demoTenants`: los workspaces que se pueden recorrer en el portal del partner.
 * - `portfolio`: la cartera completa que ve GRAVL en la consola interna.
 */
import { dealFromPlaybook, type Deal, type MarketCode, type PartnerSegment, type VerticalType } from '@gravl/domain';

export interface DemoTenant {
  id: string;
  name: string;
  shortName: string;
  vertical: VerticalType;
  subtitle: string;
  accent: string;
  deal: Deal;
}

function deal(segment: PartnerSegment, partnerId: string, market: MarketCode, signedAt: string, patch: Partial<Deal> = {}): Deal {
  return { ...dealFromPlaybook(segment, partnerId, market, signedAt), ...patch };
}

export const demoTenants: DemoTenant[] = [
  {
    id: 'p_9fitness', name: '9 Fitness', shortName: '9F', vertical: 'GYM_CHAIN', subtitle: 'Cadena regional · 3 sedes', accent: '#C6FF00',
    deal: deal('REGIONAL_CHAIN', 'p_9fitness', 'AR', '2026-03-01T00:00:00Z', {
      specialTerms: ['Precio congelado en USD por 12 meses', 'Revisión de resultados de retención en el mes 6'],
    }),
  },
  {
    id: 'p_pulso', name: 'Pulso Fit', shortName: 'PF', vertical: 'GYM_CHAIN', subtitle: 'Low-cost · débito automático', accent: '#F59E0B',
    deal: deal('HIGH_VOLUME', 'p_pulso', 'AR', '2026-06-01T00:00:00Z', {
      whiteLabel: true,
      specialTerms: [
        'Sin campañas de reactivación a socios durmientes',
        'Intención de baja derivada al staff de recepción con oferta de congelamiento',
        'Upsell a GRAVL Pro dentro de la app con 20% para el partner',
      ],
    }),
  },
  {
    id: 'p_nimbus', name: 'Nimbus Tech LATAM', shortName: 'NT', vertical: 'CORPORATE_WELLNESS', subtitle: 'Corporate · 262 empleados', accent: '#38BDF8',
    deal: deal('CORPORATE', 'p_nimbus', 'AR', '2026-02-01T00:00:00Z', { specialTerms: ['Reporte trimestral para dirección'] }),
  },
  {
    id: 'p_fuerza', name: 'Fuerza Studio', shortName: 'FS', vertical: 'COACH_STUDIO', subtitle: 'Coach · 24 clientes', accent: '#A78BFA',
    deal: deal('COACH', 'p_fuerza', 'AR', '2026-09-10T00:00:00Z'),
  },
];

export interface PortfolioPartner {
  id: string;
  name: string;
  segment: PartnerSegment;
  market: MarketCode;
  activeUsers: number;
  eligible: number;
  locations: number;
  mrrUsd: number;
  /** 0–100: uso, tendencia, tickets y pagos. */
  health: number;
  /** Net revenue retention últimos 12 meses (%). */
  nrr: number;
  renewsAt: string;
  stage: 'ACTIVE' | 'PILOT' | 'AT_RISK' | 'NEGOTIATION';
  owner: string;
}

export const portfolio: PortfolioPartner[] = [
  { id: 'p_9fitness', name: '9 Fitness', segment: 'REGIONAL_CHAIN', market: 'AR', activeUsers: 1240, eligible: 4120, locations: 3, mrrUsd: 3100, health: 82, nrr: 118, renewsAt: '2027-03-01', stage: 'ACTIVE', owner: 'Lucía' },
  { id: 'p_pulso', name: 'Pulso Fit', segment: 'HIGH_VOLUME', market: 'AR', activeUsers: 3900, eligible: 38000, locations: 22, mrrUsd: 3510, health: 71, nrr: 104, renewsAt: '2028-06-01', stage: 'ACTIVE', owner: 'Lucía' },
  { id: 'p_nimbus', name: 'Nimbus Tech LATAM', segment: 'CORPORATE', market: 'AR', activeUsers: 168, eligible: 262, locations: 0, mrrUsd: 1048, health: 77, nrr: 100, renewsAt: '2027-02-01', stage: 'ACTIVE', owner: 'Martín' },
  { id: 'p_fuerza', name: 'Fuerza Studio', segment: 'COACH', market: 'AR', activeUsers: 24, eligible: 24, locations: 0, mrrUsd: 43, health: 90, nrr: 130, renewsAt: '2026-12-10', stage: 'ACTIVE', owner: 'Self-serve' },
  { id: 'p_crossbox', name: 'Box Andino', segment: 'BOUTIQUE', market: 'CL', activeUsers: 310, eligible: 420, locations: 2, mrrUsd: 930, health: 88, nrr: 112, renewsAt: '2027-05-15', stage: 'PILOT', owner: 'Martín' },
  { id: 'p_academia', name: 'Academia Força', segment: 'REGIONAL_CHAIN', market: 'BR', activeUsers: 2100, eligible: 9800, locations: 11, mrrUsd: 5250, health: 64, nrr: 96, renewsAt: '2027-01-20', stage: 'AT_RISK', owner: 'Carla' },
  { id: 'p_megamx', name: 'MegaGym MX', segment: 'HIGH_VOLUME', market: 'MX', activeUsers: 0, eligible: 120000, locations: 85, mrrUsd: 0, health: 0, nrr: 0, renewsAt: '2027-01-01', stage: 'NEGOTIATION', owner: 'Carla' },
  { id: 'p_bancosur', name: 'Banco Sur', segment: 'CORPORATE', market: 'CL', activeUsers: 640, eligible: 1500, locations: 0, mrrUsd: 6000, health: 58, nrr: 92, renewsAt: '2026-12-31', stage: 'AT_RISK', owner: 'Martín' },
  { id: 'p_studiobcn', name: 'Studio Barcelona', segment: 'BOUTIQUE', market: 'ES', activeUsers: 0, eligible: 600, locations: 1, mrrUsd: 0, health: 0, nrr: 0, renewsAt: '2027-02-01', stage: 'NEGOTIATION', owner: 'Lucía' },
];

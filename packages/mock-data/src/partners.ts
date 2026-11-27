/**
 * Tenants de demo y portafolio de partners.
 * - `demoTenants`: los workspaces que se pueden recorrer en el portal del partner.
 * - `portfolio`: la cartera completa que ve GRAVL en la consola interna.
 */
import { dealFromPlaybook, POLICY_ATTENDANCE, POLICY_BREAKAGE, type Deal, type MarketCode, type PartnerSegment, type VerticalType } from '@gravl/domain';

export interface DemoTenant {
  id: string;
  name: string;
  shortName: string;
  vertical: VerticalType;
  subtitle: string;
  accent: string;
  /** Marca del partner (co-branding). Editable en Configuración. */
  branding: { logoUrl?: string; isoUrl?: string; brandColor: string; welcome: string };
  deal: Deal;
}

function deal(segment: PartnerSegment, partnerId: string, market: MarketCode, signedAt: string, patch: Partial<Deal> = {}): Deal {
  return { ...dealFromPlaybook(segment, partnerId, market, signedAt), ...patch };
}

export const demoTenants: DemoTenant[] = [
  {
    id: 'p_sportclub', name: 'SportClub', shortName: 'SC', vertical: 'GYM_CHAIN', subtitle: 'Piloto · 12 sedes AMBA', accent: '#d2fe0b',
    branding: { logoUrl: '/partners/sportclub-logo.png', isoUrl: '/partners/sportclub-iso.png', brandColor: '#e30613', welcome: 'SportClub × GRAVL: tu plan de fuerza, en cualquier sede.' },
    deal: deal('REGIONAL_CHAIN', 'p_sportclub', 'AR', '2026-12-01T00:00:00Z', {
      whiteLabel: false,
      specialTerms: [
        'Piloto de 90 días en 12 sedes AMBA con grupo de control',
        'Acceso con el carnet SportClub: el socio vincula su cuenta GRAVL una sola vez',
        'Revisión de resultados por plan (Flex / Plus / Total) al día 90',
      ],
      planPolicies: [
        {
          planId: 'flex', label: 'Flex', billing: 'BASE_PLUS_USAGE', monetization: 'ATTENDANCE', contactPolicy: POLICY_ATTENDANCE,
          rationale: 'Tarifa base + uso: cada visita es ingreso. Conviene reactivar al que dejó de venir.',
        },
        {
          planId: 'plus', label: 'Plus', billing: 'FIXED', monetization: 'BREAKAGE', contactPolicy: POLICY_BREAKAGE,
          rationale: 'Abono fijo: el que paga y no viene no se toca. Se actúa sobre la intención de baja.',
        },
        {
          planId: 'total', label: 'Total', billing: 'FIXED', monetization: 'BREAKAGE', contactPolicy: POLICY_BREAKAGE,
          rationale: 'Abono fijo premium: proteger la renovación; la intención de baja la atiende la sede.',
        },
      ],
    }),
  },
  {
    id: 'p_nimbus', name: 'Nimbus Tech LATAM', shortName: 'NT', vertical: 'CORPORATE_WELLNESS', subtitle: 'Empresa ficticia · 262 empleados', accent: '#38BDF8',
    branding: { brandColor: '#2563eb', welcome: 'Tu beneficio de entrenamiento en Nimbus.' },
    deal: deal('CORPORATE', 'p_nimbus', 'AR', '2026-02-01T00:00:00Z', { specialTerms: ['Reporte trimestral para dirección'] }),
  },
  {
    id: 'p_fuerza', name: 'Fuerza Studio', shortName: 'FS', vertical: 'COACH_STUDIO', subtitle: 'Coach ficticio · 24 clientes', accent: '#A78BFA',
    branding: { brandColor: '#7c3aed', welcome: 'Entrená con el plan de tu coach.' },
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
  { id: 'p_sportclub', name: 'SportClub (piloto)', segment: 'REGIONAL_CHAIN', market: 'AR', activeUsers: 3600, eligible: 21400, locations: 12, mrrUsd: 0, health: 0, nrr: 0, renewsAt: '2027-03-01', stage: 'PILOT', owner: '—' },
  { id: 'p_mrfit', name: 'MrFit MX', segment: 'REGIONAL_CHAIN', market: 'MX', activeUsers: 0, eligible: 0, locations: 0, mrrUsd: 0, health: 0, nrr: 0, renewsAt: '—', stage: 'ACTIVE', owner: 'Cliente citado en gravl.ai/empresas' },
  { id: 'p_nimbus', name: 'Nimbus Tech LATAM', segment: 'CORPORATE', market: 'AR', activeUsers: 168, eligible: 262, locations: 0, mrrUsd: 1048, health: 77, nrr: 100, renewsAt: '2027-02-01', stage: 'ACTIVE', owner: 'Martín' },
  { id: 'p_fuerza', name: 'Fuerza Studio', segment: 'COACH', market: 'AR', activeUsers: 24, eligible: 24, locations: 0, mrrUsd: 43, health: 90, nrr: 130, renewsAt: '2026-12-10', stage: 'ACTIVE', owner: 'Self-serve' },
  { id: 'p_crossbox', name: 'Box Andino', segment: 'BOUTIQUE', market: 'CL', activeUsers: 310, eligible: 420, locations: 2, mrrUsd: 930, health: 88, nrr: 112, renewsAt: '2027-05-15', stage: 'PILOT', owner: 'Martín' },
  { id: 'p_academia', name: 'Academia Força', segment: 'REGIONAL_CHAIN', market: 'BR', activeUsers: 2100, eligible: 9800, locations: 11, mrrUsd: 5250, health: 64, nrr: 96, renewsAt: '2027-01-20', stage: 'AT_RISK', owner: 'Carla' },
  { id: 'p_megamx', name: 'MegaGym MX', segment: 'HIGH_VOLUME', market: 'MX', activeUsers: 0, eligible: 120000, locations: 85, mrrUsd: 0, health: 0, nrr: 0, renewsAt: '2027-01-01', stage: 'NEGOTIATION', owner: 'Carla' },
  { id: 'p_bancosur', name: 'Banco Sur', segment: 'CORPORATE', market: 'CL', activeUsers: 640, eligible: 1500, locations: 0, mrrUsd: 6000, health: 58, nrr: 92, renewsAt: '2026-12-31', stage: 'AT_RISK', owner: 'Martín' },
  { id: 'p_studiobcn', name: 'Studio Barcelona', segment: 'BOUTIQUE', market: 'ES', activeUsers: 0, eligible: 600, locations: 1, mrrUsd: 0, health: 0, nrr: 0, renewsAt: '2027-02-01', stage: 'NEGOTIATION', owner: 'Lucía' },
];

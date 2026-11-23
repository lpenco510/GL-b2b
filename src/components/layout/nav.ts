import {
  Building2,
  Briefcase,
  Dumbbell,
  Flame,
  GraduationCap,
  LayoutDashboard,
  QrCode,
  Trophy,
  type LucideIcon,
} from 'lucide-react';
import type { VerticalType } from '@/types/gravl-b2b';

export interface NavItem {
  href: string;
  label: string;
  icon: LucideIcon;
  /** Clave para badges dinámicos que calcula el Sidebar. */
  badgeKey?: 'live' | 'atRisk' | 'maintenance' | 'formChecks';
  keywords?: string;
}

export interface NavGroup {
  label: string;
  items: NavItem[];
}

const shared = {
  community: { href: '/community', label: 'Comunidad & Retos', icon: Trophy, keywords: 'retos challenges ranking leaderboard grupo' },
  provisioning: { href: '/provisioning', label: 'QR, Asientos & ROI', icon: QrCode, keywords: 'qr billing facturación asientos integraciones roi' },
} satisfies Record<string, NavItem>;

export const navByVertical: Record<VerticalType, NavGroup[]> = {
  GYM_CHAIN: [
    {
      label: 'Operación',
      items: [
        { href: '/dashboard', label: 'Command Center', icon: LayoutDashboard, badgeKey: 'live', keywords: 'inicio dashboard kpi' },
        { href: '/retention', label: 'Retención & Nudges', icon: Flame, badgeKey: 'atRisk', keywords: 'churn socios riesgo push' },
        { href: '/locations-equipment', label: 'Equipamiento & Planta', icon: Dumbbell, badgeKey: 'maintenance', keywords: 'máquinas mantenimiento sedes 3d' },
      ],
    },
    { label: 'Crecimiento', items: [shared.community, shared.provisioning] },
  ],
  CORPORATE_WELLNESS: [
    {
      label: 'Bienestar',
      items: [{ href: '/corporate', label: 'Corporate Wellness', icon: Briefcase, keywords: 'empleados readiness burnout departamentos' }],
    },
    { label: 'Programa', items: [shared.community, shared.provisioning] },
  ],
  COACH_STUDIO: [
    {
      label: 'Estudio',
      items: [{ href: '/coach', label: 'Coach Studio', icon: GraduationCap, badgeKey: 'formChecks', keywords: 'clientes 1rm rpe form check' }],
    },
    { label: 'Negocio', items: [shared.community, shared.provisioning] },
  ],
};

export const verticalMeta: Record<VerticalType, { label: string; home: string; icon: LucideIcon; color: string }> = {
  GYM_CHAIN: { label: 'Gym Chain', home: '/dashboard', icon: Building2, color: '#C6FF00' },
  CORPORATE_WELLNESS: { label: 'Corporate Wellness', home: '/corporate', icon: Briefcase, color: '#38BDF8' },
  COACH_STUDIO: { label: 'Coach Studio', home: '/coach', icon: GraduationCap, color: '#A78BFA' },
};

/** Rutas que pertenecen sin ambigüedad a una vertical. */
export function verticalForPath(pathname: string | null): VerticalType | null {
  if (!pathname) return null;
  if (pathname.startsWith('/corporate')) return 'CORPORATE_WELLNESS';
  if (pathname.startsWith('/coach')) return 'COACH_STUDIO';
  if (['/dashboard', '/retention', '/locations-equipment'].some((p) => pathname.startsWith(p))) return 'GYM_CHAIN';
  return null;
}

export const allNavItems: (NavItem & { vertical: VerticalType })[] = (Object.keys(navByVertical) as VerticalType[]).flatMap(
  (v) => navByVertical[v].flatMap((g) => g.items.map((i) => ({ ...i, vertical: v }))),
).filter((item, idx, arr) => arr.findIndex((o) => o.href === item.href) === idx);

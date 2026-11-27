'use client';

import { useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { demoTenants, type DemoTenant } from '@gravl/mock-data';
import type { VerticalType } from '@gravl/domain';
import { verticalForPath, verticalMeta } from './nav';

/**
 * Tenant efectivo. Si la URL pertenece a otra vertical (deep link a /corporate),
 * la ruta manda y se usa el primer tenant de esa vertical.
 */
export function useTenant(): DemoTenant {
  const { tenantId } = useApp();
  const pathname = usePathname();
  const selected = demoTenants.find((t) => t.id === tenantId) ?? demoTenants[0];
  const routeVertical = verticalForPath(pathname);
  if (!routeVertical || routeVertical === selected.vertical) return selected;
  return demoTenants.find((t) => t.vertical === routeVertical) ?? selected;
}

export const useVertical = (): VerticalType => useTenant().vertical;
export const useDeal = () => useTenant().deal;

export function useSwitchTenant() {
  const { setTenantId, addToast } = useApp();
  const router = useRouter();
  return useCallback(
    (t: DemoTenant) => {
      setTenantId(t.id);
      router.push(verticalMeta[t.vertical].home);
      addToast(`Workspace: ${t.name}`, 'info');
    },
    [setTenantId, router, addToast],
  );
}

/** Elegir tenant por vertical (paleta de comandos, links entre workspaces). */
export function tenantForVertical(v: VerticalType) {
  return demoTenants.find((t) => t.vertical === v) ?? demoTenants[0];
}

/** Marca efectiva del partner: valores por defecto + lo editado en Configuración. */
export function useBranding() {
  const tenant = useTenant();
  const { brandOverrides } = useApp();
  const o = brandOverrides[tenant.id] ?? {};
  return {
    tenantId: tenant.id,
    name: o.name || tenant.name,
    shortName: tenant.shortName,
    logoUrl: o.logoUrl ?? tenant.branding.logoUrl,
    isoUrl: o.isoUrl ?? tenant.branding.isoUrl,
    brandColor: o.brandColor || tenant.branding.brandColor,
    welcome: o.welcome || tenant.branding.welcome,
    customized: Object.keys(o).length > 0,
  };
}

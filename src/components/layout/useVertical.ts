'use client';

import { useCallback } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import type { VerticalType } from '@/types/gravl-b2b';
import { verticalForPath, verticalMeta } from './nav';

/** Vertical efectiva: la ruta manda (deep links), si no, la elegida por el usuario. */
export function useVertical(): VerticalType {
  const { vertical } = useApp();
  const pathname = usePathname();
  return verticalForPath(pathname) ?? vertical;
}

export function useSwitchVertical() {
  const { setVertical, addToast } = useApp();
  const router = useRouter();
  return useCallback(
    (v: VerticalType) => {
      setVertical(v);
      router.push(verticalMeta[v].home);
      addToast(`Workspace: ${verticalMeta[v].label}`, 'info');
    },
    [setVertical, router, addToast],
  );
}

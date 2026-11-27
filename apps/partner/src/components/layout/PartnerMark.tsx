'use client';

import React from 'react';
import { cn } from '@gravl/ui';
import { useBranding } from './useTenant';

/** Isotipo del partner (o sus iniciales sobre su color de marca). */
export function PartnerIso({ size = 36, className }: { size?: number; className?: string }) {
  const b = useBranding();
  if (b.isoUrl) {
    return (
      <span className={cn('flex shrink-0 items-center justify-center overflow-hidden rounded-[10px] bg-white ring-1 ring-gravl-line', className)} style={{ width: size, height: size }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={b.isoUrl} alt="" className="h-[86%] w-[86%] object-contain" />
      </span>
    );
  }
  return (
    <span className={cn('flex shrink-0 items-center justify-center rounded-[10px] text-[12px] font-bold text-white', className)} style={{ width: size, height: size, background: b.brandColor }}>
      {b.shortName}
    </span>
  );
}

/** Logo horizontal del partner sobre una pastilla blanca (se lee bien en claro y oscuro). */
export function PartnerLogo({ height = 18, className }: { height?: number; className?: string }) {
  const b = useBranding();
  if (!b.logoUrl) return <span className={cn('text-[14px] font-semibold text-gravl-text', className)}>{b.name}</span>;
  return (
    <span className={cn('inline-flex items-center rounded-lg bg-white px-2 py-1 ring-1 ring-gravl-line', className)}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={b.logoUrl} alt={b.name} style={{ height }} className="w-auto object-contain" />
    </span>
  );
}

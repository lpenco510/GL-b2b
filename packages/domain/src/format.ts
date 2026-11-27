// Formateadores centralizados (es-AR). Todo número visible pasa por acá
// para que separadores de miles, monedas y tiempos relativos sean consistentes.

import { REFERENCE_NOW } from './clock';
import { markets, type MarketCode } from './markets';

const LOCALE = 'es-AR';
// Zona fija: evita que SSR (UTC) y browser (ART) formateen fechas distintas.
const TZ = 'America/Argentina/Buenos_Aires';

const intFmt = new Intl.NumberFormat(LOCALE, { maximumFractionDigits: 0 });
const decFmt = new Intl.NumberFormat(LOCALE, { minimumFractionDigits: 1, maximumFractionDigits: 1 });
const usdFmt = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
const compactFmt = new Intl.NumberFormat(LOCALE, { notation: 'compact', maximumFractionDigits: 1 });
const dateFmt = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', timeZone: TZ });
const dateLongFmt = new Intl.DateTimeFormat(LOCALE, { day: 'numeric', month: 'short', year: 'numeric', timeZone: TZ });

export const fmtInt = (n: number) => intFmt.format(n);
export const fmtDec = (n: number) => decFmt.format(n);
export const fmtPct = (n: number, digits = 0) =>
  `${new Intl.NumberFormat(LOCALE, { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(n)}%`;
const usdCentsFmt = new Intl.NumberFormat(LOCALE, { style: 'currency', currency: 'USD', minimumFractionDigits: 2, maximumFractionDigits: 2 });
/** Montos grandes sin centavos; precios unitarios (< 10) con centavos. */
export const fmtUsd = (n: number) => (Math.abs(n) < 10 && n % 1 !== 0 ? usdCentsFmt.format(n) : usdFmt.format(n));
export const fmtUsdCompact = (n: number) => {
  const abs = Math.abs(n);
  if (abs >= 1_000_000) return `US$ ${decFmt.format(n / 1_000_000)}M`;
  if (abs >= 1_000) return `US$ ${decFmt.format(n / 1_000)}K`;
  return usdFmt.format(n);
};
export const fmtCompact = (n: number) => compactFmt.format(n);
export const fmtDate = (iso: string | Date) => dateFmt.format(new Date(iso));
export const fmtDateLong = (iso: string | Date) => dateLongFmt.format(new Date(iso));

/** Días enteros entre una fecha y el "ahora" de referencia del dataset. */
export function daysSince(iso: string, now: Date = REFERENCE_NOW): number {
  return Math.max(0, Math.floor((now.getTime() - new Date(iso).getTime()) / 86_400_000));
}

/** "hace 3 min", "hace 2 días"… relativo al ahora de referencia. */
export function fmtRelative(iso: string | Date, now: Date = REFERENCE_NOW): string {
  const diffSec = Math.max(0, Math.round((now.getTime() - new Date(iso).getTime()) / 1000));
  if (diffSec < 45) return 'recién';
  const min = Math.round(diffSec / 60);
  if (min < 60) return `hace ${min} min`;
  const h = Math.round(min / 60);
  if (h < 24) return `hace ${h} h`;
  const d = Math.round(h / 24);
  if (d === 1) return 'ayer';
  if (d < 30) return `hace ${d} días`;
  return fmtDate(iso);
}

export function initials(fullName: string): string {
  return fullName
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0]?.toUpperCase())
    .join('');
}

/** Monto en la moneda local del mercado, con su formato. */
export function fmtMoney(amount: number, market: MarketCode, opts: { compact?: boolean } = {}) {
  const m = markets[market];
  return new Intl.NumberFormat(m.locale, {
    style: 'currency',
    currency: m.currency,
    maximumFractionDigits: amount >= 100 || opts.compact ? 0 : 2,
    notation: opts.compact ? 'compact' : 'standard',
  }).format(amount);
}

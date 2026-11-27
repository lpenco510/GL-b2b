/**
 * "Ahora" del sistema en la demo. En producción se reemplaza por `new Date()`
 * del servidor; mantenerlo centralizado evita desfasajes SSR/cliente.
 */
export const REFERENCE_NOW = new Date('2026-11-23T19:05:00-03:00');

export const DAY_MS = 86_400_000;

export function daysBetween(fromIso: string, to: Date = REFERENCE_NOW): number {
  return Math.max(0, Math.floor((to.getTime() - new Date(fromIso).getTime()) / DAY_MS));
}

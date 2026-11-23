import type { EquipmentZone } from '@/types/gravl-b2b';

export const zoneMeta: Record<EquipmentZone, { label: string; color: string; rect: [number, number, number, number] }> = {
  // rect = [gx, gy, ancho, profundidad] en celdas de la grilla isométrica (12 × 10)
  RACKS: { label: 'Racks & Smith', color: '#F59E0B', rect: [0, 0, 5, 4] },
  FREE_WEIGHTS: { label: 'Peso libre', color: '#C6FF00', rect: [0, 4, 5, 6] },
  CABLES: { label: 'Poleas', color: '#38BDF8', rect: [5, 0, 3, 4] },
  CARDIO: { label: 'Cardio', color: '#22C55E', rect: [8, 0, 4, 4] },
  MACHINES: { label: 'Máquinas guiadas', color: '#A78BFA', rect: [5, 4, 7, 6] },
};

export const ZONES = Object.keys(zoneMeta) as EquipmentZone[];

export const usageColor = (rate: number) => (rate >= 85 ? '#EF4444' : rate >= 65 ? '#F59E0B' : '#22C55E');

export function capexHint(rate: number): { label: string; tone: 'crimson' | 'neutral' | 'emerald' } {
  if (rate >= 90) return { label: 'Sumar 1 unidad', tone: 'crimson' };
  if (rate < 40) return { label: 'Baja demanda · reubicar', tone: 'neutral' };
  return { label: 'Uso equilibrado', tone: 'emerald' };
}

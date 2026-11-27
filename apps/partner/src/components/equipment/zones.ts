import type { EquipmentZone } from '@gravl/domain';

export const zoneMeta: Record<EquipmentZone, { label: string }> = {
  RACKS: { label: 'Racks & Smith' },
  FREE_WEIGHTS: { label: 'Peso libre' },
  CABLES: { label: 'Poleas' },
  CARDIO: { label: 'Cardio' },
  MACHINES: { label: 'Máquinas guiadas' },
};

export const ZONES = Object.keys(zoneMeta) as EquipmentZone[];

/** % de las veces que un socio buscó la máquina y la encontró ocupada (swaps / series). */
export const busyRate = (swaps = 0, sets = 0) => (sets ? (swaps / sets) * 100 : 0);

/** Recomendación a partir de señales registradas, no de sensores. */
export function equipmentHint(rate: number, sets: number): { label: string; tone: 'crimson' | 'amber' | 'neutral' | 'emerald' } {
  if (rate >= 8) return { label: 'Sumar una unidad', tone: 'crimson' };
  if (rate >= 4) return { label: 'Revisar en hora pico', tone: 'amber' };
  if (sets < 200) return { label: 'Poca demanda', tone: 'neutral' };
  return { label: 'Sin fricción', tone: 'emerald' };
}

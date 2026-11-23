'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { locations } from '@/data/mockGravlB2B';
import IsometricGymFloor from '@/components/equipment/IsometricGymFloor';
import {
  MapPin, Wrench, CheckCircle, AlertTriangle, Settings, ChevronDown,
  Dumbbell, BarChart3, ShieldCheck, Zap,
} from 'lucide-react';
import type { GymMachine, EquipmentZone } from '@/types/gravl-b2b';

const zoneLabels: Record<EquipmentZone, { label: string; color: string }> = {
  FREE_WEIGHTS: { label: 'Pesos Libres', color: '#C6FF00' },
  RACKS: { label: 'Racks & Benches', color: '#F59E0B' },
  CABLES: { label: 'Poleas & Cruces', color: '#38BDF8' },
  MACHINES: { label: 'Máquinas Guiadas', color: '#A78BFA' },
  CARDIO: { label: 'Cardio & Conditioning', color: '#22C55E' },
};

function UsageBar({ rate }: { rate: number }) {
  const color = rate >= 85 ? '#EF4444' : rate >= 65 ? '#F59E0B' : '#22C55E';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${rate}%`, background: color }} />
      </div>
      <span className="tabular-nums text-xs font-bold" style={{ color }}>{rate}%</span>
    </div>
  );
}

export default function LocationsEquipmentPage() {
  const { selectedLocationId, setSelectedLocationId, addToast } = useApp();
  const location = locations.find((l) => l.id === selectedLocationId) || locations[0];
  const [machineStates, setMachineStates] = useState<Record<string, GymMachine['status']>>({
    m07: 'MAINTENANCE',
  });
  const [filterZone, setFilterZone] = useState<EquipmentZone | 'ALL'>('ALL');

  const getMachineStatus = (machine: GymMachine) =>
    machineStates[machine.machineId] ?? machine.status;

  const toggleMachineStatus = (machine: GymMachine) => {
    const current = getMachineStatus(machine);
    const next = current === 'OPERATIONAL' ? 'MAINTENANCE' : 'OPERATIONAL';
    setMachineStates((prev) => ({ ...prev, [machine.machineId]: next }));

    if (next === 'MAINTENANCE') {
      addToast(
        `⚡ GRAVL Sync: ${machine.name} en mantenimiento para ${location.name}. Rutinas recalculadas automáticamente en la app móvil.`,
        'warning'
      );
    } else {
      addToast(
        `✓ ${machine.name} restaurada a operativa en ${location.name}. Entrenamientos sincronizados.`,
        'success'
      );
    }
  };

  const filteredMachines = location.equipmentProfile.machines.filter(
    (m) => filterZone === 'ALL' || m.zone === filterZone
  );

  const zones = Object.keys(zoneLabels) as EquipmentZone[];

  return (
    <div className="space-y-6 max-w-[1750px] mx-auto">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-black text-white tracking-tight flex items-center gap-3">
            Equipment-Aware Gym Configurator
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30">
              Hardware Moat
            </span>
          </h2>
          <p className="text-xs text-[#94A3B8] mt-1 font-medium">
            GRAVL adapta cada entrenamiento al inventario exacto de barras, discos y máquinas de cada sede física.
          </p>
        </div>

        {/* Location selector pills */}
        <div className="flex items-center gap-2">
          {locations.map((loc) => (
            <button
              key={loc.id}
              onClick={() => setSelectedLocationId(loc.id)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 ${
                selectedLocationId === loc.id
                  ? 'bg-[#C6FF00] text-[#080A0E] shadow-[0_0_15px_rgba(198,255,0,0.3)]'
                  : 'bg-white/[0.04] text-[#94A3B8] hover:text-white border border-white/[0.08]'
              }`}
            >
              <MapPin size={13} />
              {loc.name}
            </button>
          ))}
        </div>
      </div>

      {/* ISOMETRIC 3D BLUEPRINT COMPONENT */}
      <IsometricGymFloor />

      {/* Equipment Profile Quick Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="gravl-card p-4">
          <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider mb-1">Unidad de Medida</p>
          <p className="text-xl font-black text-white tracking-tight">{location.equipmentProfile.weightUnit}</p>
        </div>
        <div className="gravl-card p-4">
          <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider mb-1">Discos Disponibles (Para redondeo)</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {location.equipmentProfile.availablePlates.map((p) => (
              <span key={p} className="tabular-nums text-xs px-2 py-0.5 rounded-md bg-[#C6FF00]/10 text-[#C6FF00] font-bold border border-[#C6FF00]/20">
                {p}kg
              </span>
            ))}
          </div>
        </div>
        <div className="gravl-card p-4">
          <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider mb-1">Mancuernero Oficial</p>
          <p className="text-xl font-black text-white tabular-nums tracking-tight">
            2 a {location.equipmentProfile.dumbbellMax} kg
            <span className="text-xs text-[#64748B] font-normal ml-1.5">(saltos de {location.equipmentProfile.dumbbellStep}kg)</span>
          </p>
        </div>
        <div className="gravl-card p-4">
          <p className="text-[10px] text-[#64748B] font-bold uppercase tracking-wider mb-1">Total de Estaciones</p>
          <p className="text-xl font-black text-white tabular-nums tracking-tight">
            {location.equipmentProfile.machines.length}
            <span className="text-xs text-[#EF4444] font-bold ml-2">
              {location.equipmentProfile.machines.filter((m) => getMachineStatus(m) === 'MAINTENANCE').length} en mantenimiento
            </span>
          </p>
        </div>
      </div>

      {/* Zone Filters */}
      <div className="flex flex-wrap gap-2 pt-2">
        <button
          onClick={() => setFilterZone('ALL')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
            filterZone === 'ALL'
              ? 'bg-[#C6FF00] text-[#080A0E] shadow-[0_0_12px_rgba(198,255,0,0.3)]'
              : 'bg-white/[0.04] text-[#94A3B8] hover:text-white border border-white/[0.08]'
          }`}
        >
          Todas las Zonas ({location.equipmentProfile.machines.length})
        </button>
        {zones.map((zone) => {
          const z = zoneLabels[zone];
          const count = location.equipmentProfile.machines.filter((m) => m.zone === zone).length;
          return (
            <button
              key={zone}
              onClick={() => setFilterZone(zone)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                filterZone === zone
                  ? 'text-[#080A0E] shadow-md'
                  : 'bg-white/[0.04] text-[#94A3B8] hover:text-white border border-white/[0.08]'
              }`}
              style={filterZone === zone ? { background: z.color } : undefined}
            >
              {z.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Detailed Equipment Table */}
      <div className="gravl-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.07] bg-white/[0.02]">
                {['Estación / Máquina', 'Zona del Gimnasio', 'Cantidad', 'Saturación Semanal', 'Sugerencia CapEx', 'Estado en App', 'Acción Rápida'].map((h) => (
                  <th key={h} className="text-left px-5 py-3.5 text-[10px] font-bold text-[#64748B] uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredMachines.map((machine) => {
                const status = getMachineStatus(machine);
                const zone = zoneLabels[machine.zone];
                return (
                  <tr key={machine.machineId} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/[0.08] flex items-center justify-center">
                          <Dumbbell size={15} className="text-white" />
                        </div>
                        <span className="text-xs font-bold text-white">{machine.name}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4">
                      <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md" style={{ background: `${zone.color}15`, color: zone.color }}>
                        {zone.label}
                      </span>
                    </td>
                    <td className="px-5 py-4 tabular-nums text-xs font-bold text-white">{machine.quantity}</td>
                    <td className="px-5 py-4"><UsageBar rate={machine.weeklyUsageRate} /></td>
                    <td className="px-5 py-4 text-xs">
                      {machine.weeklyUsageRate >= 90 ? (
                        <span className="text-[#EF4444] font-bold flex items-center gap-1">
                          <AlertTriangle size={12} /> Sugerir compra 2ª unidad
                        </span>
                      ) : machine.weeklyUsageRate < 40 ? (
                        <span className="text-[#64748B]">Baja afluencia • Reubicar</span>
                      ) : (
                        <span className="text-[#22C55E] font-medium">Uso equilibrado</span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      {status === 'OPERATIONAL' ? (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#22C55E]/10 text-[#22C55E] border border-[#22C55E]/20">
                          <CheckCircle size={11} /> Operativo
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold bg-[#EF4444]/15 text-[#EF4444] border border-[#EF4444]/30">
                          <Wrench size={11} /> Mantenimiento
                        </span>
                      )}
                    </td>
                    <td className="px-5 py-4">
                      <button
                        onClick={() => toggleMachineStatus(machine)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                          status === 'OPERATIONAL'
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/25 hover:bg-rose-500/20'
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/25 hover:bg-emerald-500/20'
                        }`}
                      >
                        <Wrench size={12} />
                        {status === 'OPERATIONAL' ? 'Dar de baja' : 'Restaurar'}
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

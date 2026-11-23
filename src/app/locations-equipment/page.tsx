'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { locations } from '@/data/mockGravlB2B';
import {
  MapPin, Wrench, CheckCircle, AlertTriangle, Settings, ChevronDown,
  Dumbbell, BarChart3,
} from 'lucide-react';
import type { GymMachine, EquipmentZone } from '@/types/gravl-b2b';

const zoneLabels: Record<EquipmentZone, { label: string; color: string }> = {
  FREE_WEIGHTS: { label: 'Free Weights', color: '#C6FF00' },
  MACHINES: { label: 'Machines', color: '#38BDF8' },
  CABLES: { label: 'Cables', color: '#A78BFA' },
  RACKS: { label: 'Racks & Benches', color: '#F59E0B' },
  CARDIO: { label: 'Cardio & Conditioning', color: '#22C55E' },
};

function UsageBar({ rate }: { rate: number }) {
  const color = rate >= 85 ? '#EF4444' : rate >= 65 ? '#F59E0B' : '#22C55E';
  return (
    <div className="flex items-center gap-2">
      <div className="w-20 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${rate}%`, background: color }} />
      </div>
      <span className="tabular-nums text-xs text-gravl-text-secondary" style={{ color }}>{rate}%</span>
    </div>
  );
}

export default function LocationsEquipmentPage() {
  const { selectedLocationId, setSelectedLocationId, addToast } = useApp();
  const location = locations.find((l) => l.id === selectedLocationId) || locations[0];
  const [machineStates, setMachineStates] = useState<Record<string, GymMachine['status']>>({});
  const [filterZone, setFilterZone] = useState<EquipmentZone | 'ALL'>('ALL');

  const getMachineStatus = (machine: GymMachine) =>
    machineStates[machine.machineId] ?? machine.status;

  const toggleMachineStatus = (machine: GymMachine) => {
    const current = getMachineStatus(machine);
    const next = current === 'OPERATIONAL' ? 'MAINTENANCE' : 'OPERATIONAL';
    setMachineStates((prev) => ({ ...prev, [machine.machineId]: next }));

    if (next === 'MAINTENANCE') {
      addToast(
        `Synced to GRAVL Mobile App: ${machine.name} disabled for ${location.name} — Workouts auto-recalculated`,
        'warning'
      );
    } else {
      addToast(
        `${machine.name} restored at ${location.name} — Members can now use this equipment`,
        'success'
      );
    }
  };

  const filteredMachines = location.equipmentProfile.machines.filter(
    (m) => filterZone === 'ALL' || m.zone === filterZone
  );

  const zones = Object.keys(zoneLabels) as EquipmentZone[];

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gravl-text">Equipment-Aware Gym Configurator</h2>
          <p className="text-sm text-gravl-text-muted mt-1">
            Configure exact equipment profiles — GRAVL adapts every workout to this gym&apos;s inventory
          </p>
        </div>
      </div>

      {/* Location Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {locations.map((loc) => (
          <button
            key={loc.id}
            onClick={() => setSelectedLocationId(loc.id)}
            className={`gravl-card p-4 text-left transition-all ${
              selectedLocationId === loc.id ? 'border-gravl-volt/30 ring-1 ring-gravl-volt/10' : ''
            }`}
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                selectedLocationId === loc.id ? 'bg-gravl-volt/20' : 'bg-white/[0.04]'
              }`}>
                <MapPin size={16} className={selectedLocationId === loc.id ? 'text-gravl-volt' : 'text-gravl-text-muted'} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gravl-text">{loc.name}</p>
                <p className="text-xs text-gravl-text-muted">{loc.city}, {loc.country}</p>
              </div>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1">
                <span className="relative flex h-2 w-2">
                  <span className="animate-gravl-ping absolute inline-flex h-full w-full rounded-full bg-gravl-emerald opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gravl-emerald" />
                </span>
                <span className="tabular-nums text-gravl-emerald font-semibold">{loc.liveActiveMembersCount}</span>
                <span className="text-gravl-text-muted">training now</span>
              </span>
              <span className="text-gravl-text-muted tabular-nums">{loc.equipmentProfile.machines.length} machines</span>
            </div>
          </button>
        ))}
      </div>

      {/* Equipment Profile Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="gravl-card p-4">
          <p className="text-xs text-gravl-text-muted uppercase tracking-wider mb-1">Weight Unit</p>
          <p className="text-lg font-bold text-gravl-text">{location.equipmentProfile.weightUnit}</p>
        </div>
        <div className="gravl-card p-4">
          <p className="text-xs text-gravl-text-muted uppercase tracking-wider mb-1">Available Plates</p>
          <div className="flex flex-wrap gap-1 mt-1">
            {location.equipmentProfile.availablePlates.map((p) => (
              <span key={p} className="tabular-nums text-xs px-2 py-0.5 rounded-md bg-gravl-volt/10 text-gravl-volt font-semibold">
                {p}kg
              </span>
            ))}
          </div>
        </div>
        <div className="gravl-card p-4">
          <p className="text-xs text-gravl-text-muted uppercase tracking-wider mb-1">Dumbbell Range</p>
          <p className="text-lg font-bold text-gravl-text tabular-nums">
            2–{location.equipmentProfile.dumbbellMax}kg
            <span className="text-xs text-gravl-text-muted ml-1">({location.equipmentProfile.dumbbellStep}kg step)</span>
          </p>
        </div>
        <div className="gravl-card p-4">
          <p className="text-xs text-gravl-text-muted uppercase tracking-wider mb-1">Total Machines</p>
          <p className="text-lg font-bold text-gravl-text tabular-nums">
            {location.equipmentProfile.machines.length}
            <span className="text-xs text-gravl-crimson ml-2">
              {location.equipmentProfile.machines.filter((m) => getMachineStatus(m) === 'MAINTENANCE').length} in maintenance
            </span>
          </p>
        </div>
      </div>

      {/* Zone Filter */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => setFilterZone('ALL')}
          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
            filterZone === 'ALL' ? 'bg-gravl-volt text-gravl-canvas' : 'liquid-glass text-gravl-text-secondary'
          }`}
        >
          All Zones
        </button>
        {zones.map((zone) => {
          const z = zoneLabels[zone];
          return (
            <button
              key={zone}
              onClick={() => setFilterZone(zone)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                filterZone === zone ? 'text-gravl-canvas' : 'liquid-glass text-gravl-text-secondary'
              }`}
              style={filterZone === zone ? { background: z.color } : undefined}
            >
              {z.label}
            </button>
          );
        })}
      </div>

      {/* Equipment Table */}
      <div className="gravl-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Equipment', 'Zone', 'Qty', 'Weekly Usage', 'CapEx Insight', 'Status', 'Maintenance Toggle'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-gravl-text-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredMachines.map((machine) => {
                const status = getMachineStatus(machine);
                const zone = zoneLabels[machine.zone];
                return (
                  <tr key={machine.machineId} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Dumbbell size={14} className="text-gravl-text-muted" />
                        <span className="text-sm font-medium text-gravl-text">{machine.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs font-medium px-2 py-0.5 rounded-md" style={{ background: `${zone.color}15`, color: zone.color }}>
                        {zone.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 tabular-nums text-sm text-gravl-text">{machine.quantity}</td>
                    <td className="px-4 py-3"><UsageBar rate={machine.weeklyUsageRate} /></td>
                    <td className="px-4 py-3 text-xs text-gravl-text-secondary">
                      {machine.weeklyUsageRate >= 90 ? (
                        <span className="text-gravl-crimson font-medium">⚠️ Consider adding a 2nd unit</span>
                      ) : machine.weeklyUsageRate < 30 ? (
                        <span className="text-gravl-text-muted">Underutilized — review placement</span>
                      ) : (
                        <span className="text-gravl-text-muted">Healthy utilization</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      {status === 'OPERATIONAL' ? (
                        <span className="flex items-center gap-1 text-xs text-gravl-emerald">
                          <CheckCircle size={12} /> Operational
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-xs text-gravl-crimson">
                          <Wrench size={12} /> Maintenance
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => toggleMachineStatus(machine)}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                          status === 'OPERATIONAL'
                            ? 'bg-gravl-crimson/10 text-gravl-crimson hover:bg-gravl-crimson/20'
                            : 'bg-gravl-emerald/10 text-gravl-emerald hover:bg-gravl-emerald/20'
                        }`}
                      >
                        {status === 'OPERATIONAL' ? (
                          <><Wrench size={12} /> Flag Maintenance</>
                        ) : (
                          <><CheckCircle size={12} /> Restore</>
                        )}
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

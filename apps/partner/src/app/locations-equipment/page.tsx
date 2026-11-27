'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { locations } from '@gravl/mock-data';
import IsometricGymFloor from '@/components/equipment/IsometricGymFloor';
import { ZONES, capexHint, usageColor, zoneMeta } from '@/components/equipment/zones';
import { Badge, Button, Card, PageHeader, ProgressBar, Segmented } from '@gravl/ui';
import type { EquipmentZone, GymMachine } from '@gravl/domain';
import { CheckCircle2, MapPin, Wrench } from 'lucide-react';

export default function LocationsEquipmentPage() {
  const { selectedLocationId, setSelectedLocationId, getMachineStatus, setMachineStatus, addToast } = useApp();
  const location = locations.find((l) => l.id === selectedLocationId) ?? locations[0];
  const [zone, setZone] = useState<EquipmentZone | 'ALL'>('ALL');
  const machines = location.equipmentProfile.machines;
  const filtered = machines.filter((m) => zone === 'ALL' || m.zone === zone);
  const downCount = machines.filter((m) => getMachineStatus(m) === 'MAINTENANCE').length;
  const hot = machines.filter((m) => m.weeklyUsageRate >= 85).length;
  const p = location.equipmentProfile;

  const toggle = (m: GymMachine) => {
    const prev = getMachineStatus(m);
    const next = prev === 'OPERATIONAL' ? 'MAINTENANCE' : 'OPERATIONAL';
    setMachineStatus(m.machineId, next);
    addToast(
      next === 'MAINTENANCE'
        ? `${m.name} fuera de servicio en ${location.shortName}. Rutinas recalculadas en la app.`
        : `${m.name} restaurada en ${location.shortName}.`,
      next === 'MAINTENANCE' ? 'warning' : 'success',
      { label: 'Deshacer', onClick: () => setMachineStatus(m.machineId, prev) },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        title="Equipamiento & Planta"
        badge={<Badge tone="cyan">Equipment-aware AI</Badge>}
        description="GRAVL adapta cada rutina al inventario exacto de barras, discos y máquinas de cada sede. Si sacás una máquina de servicio, la app la reemplaza sola."
        actions={
          <div role="group" aria-label="Sede" className="flex flex-wrap gap-2">
            {locations.map((loc) => {
              const active = loc.id === location.id;
              return (
                <Button key={loc.id} size="sm" variant={active ? 'primary' : 'secondary'} icon={MapPin} aria-pressed={active} onClick={() => setSelectedLocationId(loc.id)}>
                  {loc.shortName}
                </Button>
              );
            })}
          </div>
        }
      />

      {selectedLocationId === 'all' && (
        <p className="rounded-xl border border-white/[0.08] bg-white/[0.02] px-4 py-2.5 text-xs text-gravl-text-secondary">
          Estás viendo toda la red en el resto del panel. El plano muestra una sede a la vez: elegí cuál arriba.
        </p>
      )}

      <IsometricGymFloor location={location} />

      <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gravl-text-muted">Estaciones</p>
          <p className="tabular-nums mt-1 text-2xl font-black text-white">{machines.length}</p>
          <p className="mt-1 text-xs">
            {downCount ? <span className="font-semibold text-rose-400">{downCount} en mantenimiento</span> : <span className="text-gravl-emerald">Todas operativas</span>}
          </p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gravl-text-muted">Cuellos de botella</p>
          <p className="tabular-nums mt-1 text-2xl font-black text-white">{hot}</p>
          <p className="mt-1 text-xs text-gravl-text-muted">con saturación ≥ 85%</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gravl-text-muted">Discos para redondeo</p>
          <div className="mt-2 flex flex-wrap gap-1">
            {p.availablePlates.map((plate) => (
              <span key={plate} className="tabular-nums rounded-md border border-gravl-volt/20 bg-gravl-volt/10 px-1.5 py-0.5 text-[11px] font-bold text-gravl-volt">
                {String(plate).replace('.', ',')}
              </span>
            ))}
          </div>
          <p className="mt-1.5 text-[11px] text-gravl-text-muted">{p.weightUnit.toLowerCase()} · la app redondea cargas a estos discos</p>
        </Card>
        <Card className="p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gravl-text-muted">Mancuernero</p>
          <p className="tabular-nums mt-1 text-2xl font-black text-white">
            2–{p.dumbbellMax} <span className="text-sm font-semibold text-gravl-text-muted">kg</span>
          </p>
          <p className="mt-1 text-xs text-gravl-text-muted">saltos de {p.dumbbellStep} kg</p>
        </Card>
      </div>

      <Card>
        <div className="border-b border-white/[0.06] p-4">
          <Segmented<EquipmentZone | 'ALL'>
            label="Filtrar por zona"
            value={zone}
            onChange={setZone}
            options={[
              { value: 'ALL', label: 'Todas', count: machines.length },
              ...ZONES.map((z) => ({ value: z, label: zoneMeta[z].label, count: machines.filter((m) => m.zone === z).length })),
            ]}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px]">
            <caption className="sr-only">Inventario de {location.name}</caption>
            <thead>
              <tr className="border-b border-white/[0.06] text-left text-[10px] font-bold uppercase tracking-wider text-gravl-text-muted">
                <th scope="col" className="px-5 py-3">Estación</th>
                <th scope="col" className="px-3 py-3">Zona</th>
                <th scope="col" className="px-3 py-3">Cant.</th>
                <th scope="col" className="px-3 py-3">Saturación semanal</th>
                <th scope="col" className="px-3 py-3">Sugerencia CapEx</th>
                <th scope="col" className="px-3 py-3">Estado en app</th>
                <th scope="col" className="px-5 py-3 text-right"><span className="sr-only">Acción</span></th>
              </tr>
            </thead>
            <tbody>
              {[...filtered]
                .sort((a, b) => b.weeklyUsageRate - a.weeklyUsageRate)
                .map((m) => {
                  const status = getMachineStatus(m);
                  const z = zoneMeta[m.zone];
                  const hint = capexHint(m.weeklyUsageRate);
                  return (
                    <tr key={m.machineId} className="border-b border-white/[0.03] transition-colors hover:bg-white/[0.02]">
                      <td className="px-5 py-3 text-sm font-semibold text-white">{m.name}</td>
                      <td className="px-3 py-3">
                        <span className="rounded-md px-2 py-0.5 text-[11px] font-semibold" style={{ background: `${z.color}15`, color: z.color }}>
                          {z.label}
                        </span>
                      </td>
                      <td className="tabular-nums px-3 py-3 text-sm text-white">{m.quantity}</td>
                      <td className="px-3 py-3">
                        <div className="flex w-36 items-center gap-2">
                          <ProgressBar value={m.weeklyUsageRate} color={usageColor(m.weeklyUsageRate)} label={`Saturación ${m.weeklyUsageRate}%`} />
                          <span className="tabular-nums w-9 text-right text-xs font-bold" style={{ color: usageColor(m.weeklyUsageRate) }}>
                            {m.weeklyUsageRate}%
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3"><Badge tone={hint.tone}>{hint.label}</Badge></td>
                      <td className="px-3 py-3">
                        {status === 'OPERATIONAL' ? (
                          <Badge tone="emerald" icon={CheckCircle2}>Operativa</Badge>
                        ) : (
                          <Badge tone="crimson" icon={Wrench}>Mantenimiento</Badge>
                        )}
                      </td>
                      <td className="px-5 py-3 text-right">
                        <Button size="sm" variant={status === 'OPERATIONAL' ? 'danger' : 'success'} icon={Wrench} onClick={() => toggle(m)}>
                          {status === 'OPERATIONAL' ? 'Sacar de servicio' : 'Restaurar'}
                        </Button>
                      </td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { locations } from '@gravl/mock-data';
import { fmtInt } from '@gravl/domain';
import { busyRate, equipmentHint, ZONES, zoneMeta } from '@/components/equipment/zones';
import { Badge, Button, Card, CardHeader, KpiTile, PageHeader, ProgressBar, Segmented, cn } from '@gravl/ui';
import type { EquipmentZone, GymMachine } from '@gravl/domain';
import { ChevronDown, ClipboardList, Dumbbell, Hand, MapPin, Repeat2, Wrench } from 'lucide-react';

const SOURCES = [
  {
    icon: ClipboardList,
    title: 'Inventario de la sede',
    text: 'Lo carga la sede una vez. GRAVL lo usa para armar cada rutina solo con lo que existe ahí.',
  },
  {
    icon: Repeat2,
    title: 'Series registradas',
    text: 'Cada serie que un socio marca en la app queda asociada a una máquina. Es uso real, no un estimado.',
  },
  {
    icon: Hand,
    title: '"¿Máquina ocupada?"',
    text: 'Cuando un socio la encuentra ocupada, toca "cambiar ejercicio". Ese toque es demanda insatisfecha medida.',
  },
];

export default function EquipmentPage() {
  const { selectedLocationId, setSelectedLocationId, getMachineStatus, setMachineStatus, addToast } = useApp();
  const location = locations.find((l) => l.id === selectedLocationId) ?? locations[0];
  const [zone, setZone] = useState<EquipmentZone | 'ALL'>('ALL');
  const machines = location.equipmentProfile.machines;
  const rows = machines
    .filter((m) => zone === 'ALL' || m.zone === zone)
    .sort((a, b) => busyRate(b.busySwaps30d, b.loggedSets30d) - busyRate(a.busySwaps30d, a.loggedSets30d));
  const totalSets = machines.reduce((a, m) => a + (m.loggedSets30d ?? 0), 0);
  const totalSwaps = machines.reduce((a, m) => a + (m.busySwaps30d ?? 0), 0);
  const down = machines.filter((m) => getMachineStatus(m) === 'MAINTENANCE').length;
  const maxSets = Math.max(...machines.map((m) => m.loggedSets30d ?? 0));
  const p = location.equipmentProfile;

  const toggle = (m: GymMachine) => {
    const prev = getMachineStatus(m);
    const next = prev === 'OPERATIONAL' ? 'MAINTENANCE' : 'OPERATIONAL';
    setMachineStatus(m.machineId, next);
    addToast(
      next === 'MAINTENANCE'
        ? `${m.name} fuera de servicio en ${location.shortName}. La app deja de incluirla en las rutinas.`
        : `${m.name} vuelve a las rutinas de ${location.shortName}.`,
      next === 'MAINTENANCE' ? 'warning' : 'success',
      { label: 'Deshacer', onClick: () => setMachineStatus(m.machineId, prev) },
    );
  };

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow={`Sede ${location.tier} · ${location.region}`}
        title={
          <>
            Equipamiento<span className="text-gravl-text-muted">.</span>
          </>
        }
        description="GRAVL arma cada rutina con lo que hay en cada sede. Acá mantenés ese inventario y ves qué máquinas faltan, según lo que tus socios registran."
        actions={
          <label className="relative flex items-center gap-2 rounded-xl border border-gravl-line bg-gravl-card py-2 pl-3 pr-2 transition-colors hover:border-gravl-text/25">
            <MapPin size={14} className="text-gravl-text-muted" aria-hidden />
            <span className="sr-only">Sede</span>
            <select value={location.id} onChange={(e) => setSelectedLocationId(e.target.value)} className="appearance-none bg-transparent pr-6 text-sm font-semibold text-gravl-text focus:outline-none">
              {locations.map((l) => (
                <option key={l.id} value={l.id}>{l.name}</option>
              ))}
            </select>
            <ChevronDown size={14} className="pointer-events-none absolute right-2 text-gravl-text-muted" aria-hidden />
          </label>
        }
      />

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        {SOURCES.map((s, i) => (
          <div key={s.title} className="flex gap-3 rounded-[var(--radius-gravl)] border border-dashed border-gravl-line p-4">
            <span className="gravl-num mt-0.5 text-[28px] text-gravl-text-muted">{i + 1}</span>
            <div>
              <p className="flex items-center gap-1.5 text-[14px] font-semibold text-gravl-text">
                <s.icon size={15} className="text-gravl-text-muted" aria-hidden /> {s.title}
              </p>
              <p className="mt-1 text-[13px] leading-relaxed text-gravl-text-muted">{s.text}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiTile label="Series registradas · 30 días" value={fmtInt(totalSets)} delta={`en ${machines.length} estaciones`} deltaDirection="none" source="app GRAVL" emphasis />
        <KpiTile
          label="Veces 'máquina ocupada'"
          value={fmtInt(totalSwaps)}
          delta={`${busyRate(totalSwaps, totalSets).toFixed(1).replace('.', ',')}% de las búsquedas`}
          deltaDirection="none"
          icon={Hand}
          source="botón 'cambiar ejercicio' de la app"
        />
        <KpiTile label="Fuera de servicio" value={down} delta={down ? 'la app ya las reemplaza' : 'todo operativo'} deltaDirection="none" icon={Wrench} />
        <Card className="p-5">
          <p className="gravl-label">Lo que la app sabe de esta sede</p>
          <dl className="mt-3 space-y-2 text-[13px]">
            <div className="flex justify-between"><dt className="text-gravl-text-muted">Mancuernas</dt><dd className="font-semibold text-gravl-text">2–{p.dumbbellMax} kg · de a {p.dumbbellStep}</dd></div>
            <div className="flex justify-between gap-3"><dt className="text-gravl-text-muted">Discos</dt><dd className="text-right font-semibold text-gravl-text">{p.availablePlates.map((x) => String(x).replace('.', ',')).join(' · ')} kg</dd></div>
            <div className="flex justify-between"><dt className="text-gravl-text-muted">Unidad</dt><dd className="font-semibold text-gravl-text">{p.weightUnit.toLowerCase()}</dd></div>
          </dl>
          <p className="mt-3 text-xs text-gravl-text-muted">Con esto la app redondea cada carga a lo que el socio puede armar.</p>
        </Card>
      </div>

      <Card>
        <div className="flex flex-col gap-3 border-b border-gravl-line p-4 md:flex-row md:items-center md:justify-between">
          <CardHeader icon={Dumbbell} title="Máquinas" subtitle="Ordenadas por fricción: % de veces que un socio la buscó y estaba ocupada." />
          <Segmented<EquipmentZone | 'ALL'>
            label="Filtrar por zona"
            size="sm"
            value={zone}
            onChange={setZone}
            options={[{ value: 'ALL', label: 'Todas' }, ...ZONES.map((z) => ({ value: z, label: zoneMeta[z].label }))]}
          />
        </div>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[820px] text-[14px]">
            <caption className="sr-only">Inventario y demanda de {location.name}</caption>
            <thead>
              <tr className="text-left">
                <th scope="col" className="gravl-label px-5 py-3">Máquina</th>
                <th scope="col" className="gravl-label px-3 py-3 text-right">Cant.</th>
                <th scope="col" className="gravl-label px-3 py-3">Series · 30 días</th>
                <th scope="col" className="gravl-label px-3 py-3">Ocupada</th>
                <th scope="col" className="gravl-label px-3 py-3">Lectura</th>
                <th scope="col" className="gravl-label px-5 py-3 text-right">En la app</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((m) => {
                const status = getMachineStatus(m);
                const rate = busyRate(m.busySwaps30d, m.loggedSets30d);
                const hint = equipmentHint(rate, m.loggedSets30d ?? 0);
                return (
                  <tr key={m.machineId} className={cn('gravl-row border-t border-gravl-line', status === 'MAINTENANCE' && 'opacity-60')}>
                    <td className="px-5 py-3">
                      <p className="font-semibold text-gravl-text">{m.name}</p>
                      <p className="text-xs text-gravl-text-muted">{zoneMeta[m.zone].label}</p>
                    </td>
                    <td className="tabular-nums px-3 py-3 text-right text-gravl-text-secondary">{m.quantity}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <ProgressBar value={m.loggedSets30d ?? 0} max={maxSets} className="w-28" label="Series registradas" />
                        <span className="tabular-nums text-gravl-text-secondary">{fmtInt(m.loggedSets30d ?? 0)}</span>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="gravl-num text-[22px] text-gravl-text">{rate.toFixed(1).replace('.', ',')}%</span>
                      <span className="ml-1.5 text-xs text-gravl-text-muted">{fmtInt(m.busySwaps30d ?? 0)} veces</span>
                    </td>
                    <td className="px-3 py-3"><Badge tone={hint.tone}>{hint.label}</Badge></td>
                    <td className="px-5 py-3 text-right">
                      <Button size="sm" variant={status === 'OPERATIONAL' ? 'ghost' : 'success'} icon={Wrench} onClick={() => toggle(m)}>
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
      <p className="text-xs text-gravl-text-muted">
        Muestra: socios con GRAVL de esta sede. Sirve para comparar máquinas entre sí; no mide la ocupación total de la sala.
      </p>
    </div>
  );
}

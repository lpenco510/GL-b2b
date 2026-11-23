'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { locations } from '@/data/mockGravlB2B';
import {
  Wrench,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Info,
  Maximize2,
} from 'lucide-react';
import type { GymMachine } from '@/types/gravl-b2b';

interface Pin {
  id: string;
  machineId: string;
  name: string;
  zone: string;
  x: number; // percentage in isometric canvas
  y: number;
  status: 'OPERATIONAL' | 'MAINTENANCE';
  usageRate: number;
}

export default function IsometricGymFloor() {
  const { selectedLocationId, addToast } = useApp();
  const location = locations.find((l) => l.id === selectedLocationId) || locations[0];
  const [selectedPin, setSelectedPin] = useState<Pin | null>(null);
  const [maintenanceOverrides, setMaintenanceOverrides] = useState<Record<string, 'OPERATIONAL' | 'MAINTENANCE'>>({
    m07: 'MAINTENANCE', // Leg Extension
  });

  // Pin coordinates placed on an architectural isometric gym grid
  const initialPins: Pin[] = [
    // Free Weights Zone (Left isometric quadrant)
    { id: 'p1', machineId: 'm01', name: 'Bench Press Station (x3)', zone: 'Free Weights', x: 26, y: 38, status: 'OPERATIONAL', usageRate: 88 },
    { id: 'p2', machineId: 'm03', name: 'Deadlift Platform (x2)', zone: 'Free Weights', x: 20, y: 52, status: 'OPERATIONAL', usageRate: 72 },
    { id: 'p3', machineId: 'm14', name: 'Incline Dumbbell Bench', zone: 'Free Weights', x: 34, y: 48, status: 'OPERATIONAL', usageRate: 76 },

    // Squat Racks Zone (Back isometric quadrant)
    { id: 'p4', machineId: 'm02', name: 'Power Squat Racks (x4)', zone: 'Racks & Benches', x: 48, y: 22, status: 'OPERATIONAL', usageRate: 94 },
    { id: 'p5', machineId: 'm10', name: 'Smith Machine', zone: 'Racks & Benches', x: 58, y: 30, status: 'OPERATIONAL', usageRate: 70 },

    // Cable Jungle (Center)
    { id: 'p6', machineId: 'm04', name: 'Cable Crossover 8-Stack', zone: 'Cables', x: 48, y: 46, status: 'OPERATIONAL', usageRate: 91 },
    { id: 'p7', machineId: 'm05', name: 'Dual Lat Pulldown', zone: 'Cables', x: 42, y: 58, status: 'OPERATIONAL', usageRate: 85 },

    // Machines & Isolation Zone (Right isometric quadrant)
    { id: 'p8', machineId: 'm06', name: 'Plate-Loaded Leg Press', zone: 'Machines', x: 70, y: 44, status: 'OPERATIONAL', usageRate: 78 },
    { id: 'p9', machineId: 'm07', name: 'Leg Extension Machine', zone: 'Machines', x: 76, y: 56, status: 'MAINTENANCE', usageRate: 65 },
    { id: 'p10', machineId: 'm09', name: 'Pendulum / Hack Squat', zone: 'Machines', x: 64, y: 64, status: 'OPERATIONAL', usageRate: 82 },

    // Cardio Loft (Top right isometric zone)
    { id: 'p11', machineId: 'm15', name: 'Treadmill Bank (x8)', zone: 'Cardio Loft', x: 78, y: 26, status: 'OPERATIONAL', usageRate: 45 },
  ];

  const getPinStatus = (pin: Pin) => maintenanceOverrides[pin.machineId] || pin.status;

  const togglePinMaintenance = (pin: Pin) => {
    const current = getPinStatus(pin);
    const next = current === 'OPERATIONAL' ? 'MAINTENANCE' : 'OPERATIONAL';
    setMaintenanceOverrides((prev) => ({ ...prev, [pin.machineId]: next }));

    if (next === 'MAINTENANCE') {
      addToast(
        `⚡ GRAVL Sync: ${pin.name} marcada en Mantenimiento en ${location.name}. Rutinas recalculadas en la app móvil.`,
        'warning'
      );
    } else {
      addToast(
        `✓ ${pin.name} restaurada a Operativa en ${location.name}. Entrenamientos desbloqueados en la app.`,
        'success'
      );
    }

    setSelectedPin((prev) => (prev ? { ...prev, status: next } : null));
  };

  return (
    <div className="gravl-card p-6 gravl-card-glow">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-[#C6FF00] shadow-[0_0_10px_#C6FF00]" />
            <h3 className="text-base font-bold text-white tracking-wide">
              Isometric Gym Floor Blueprint
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#C6FF00]/10 text-[#C6FF00] border border-[#C6FF00]/25">
              Live IoT Map
            </span>
          </div>
          <p className="text-xs text-[#94A3B8] mt-1">
            Plano arquitectónico interactivo de {location.name} — haz clic en cualquier estación para ver telemetría o alternar mantenimiento.
          </p>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-4 text-xs font-medium">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#22C55E] shadow-[0_0_8px_#22C55E]" />
            <span className="text-[#94A3B8]">Operativo</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shadow-[0_0_8px_#EF4444]" />
            <span className="text-[#EF4444]">En Mantenimiento (Auto-Swap en App)</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B]" />
            <span className="text-[#94A3B8]">Saturación &gt;85%</span>
          </div>
        </div>
      </div>

      {/* Blueprint Container */}
      <div className="relative w-full h-[420px] rounded-2xl bg-gradient-to-b from-[#0B0E14] to-[#07090D] border border-white/[0.08] overflow-hidden flex items-center justify-center shadow-inner">
        {/* Isometric Grid Wireframe SVG */}
        <svg
          className="absolute inset-0 w-full h-full opacity-35 pointer-events-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <pattern id="iso-grid" width="60" height="34.64" patternUnits="userSpaceOnUse">
              <path
                d="M 30 0 L 60 17.32 L 30 34.64 L 0 17.32 Z"
                fill="none"
                stroke="rgba(255, 255, 255, 0.08)"
                strokeWidth="0.8"
              />
              <path
                d="M 30 0 L 30 34.64 M 0 17.32 L 60 17.32"
                fill="none"
                stroke="rgba(56, 189, 248, 0.04)"
                strokeWidth="0.5"
              />
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#iso-grid)" />

          {/* Isometric Zone Outlines */}
          {/* Zone 1: Free Weights (Left) */}
          <polygon
            points="180,260 360,160 480,230 300,330"
            fill="rgba(198, 255, 0, 0.02)"
            stroke="rgba(198, 255, 0, 0.25)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          {/* Zone 2: Squat Racks (Back) */}
          <polygon
            points="370,150 540,60 670,130 500,220"
            fill="rgba(245, 158, 11, 0.02)"
            stroke="rgba(245, 158, 11, 0.25)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
          {/* Zone 3: Cables & Isolation (Center-Right) */}
          <polygon
            points="490,230 680,130 840,220 650,320"
            fill="rgba(56, 189, 248, 0.02)"
            stroke="rgba(56, 189, 248, 0.25)"
            strokeWidth="1.5"
            strokeDasharray="4 4"
          />
        </svg>

        {/* Zone Floating Labels */}
        <div className="absolute left-[20%] top-[45%] pointer-events-none">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#C6FF00]/40 px-2 py-1 rounded bg-[#C6FF00]/5 border border-[#C6FF00]/10">
            Zona Pesos Libres
          </span>
        </div>
        <div className="absolute left-[44%] top-[14%] pointer-events-none">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#F59E0B]/40 px-2 py-1 rounded bg-[#F59E0B]/5 border border-[#F59E0B]/10">
            Zona Racks & Sentadillas
          </span>
        </div>
        <div className="absolute right-[22%] top-[42%] pointer-events-none">
          <span className="text-[10px] font-black uppercase tracking-widest text-[#38BDF8]/40 px-2 py-1 rounded bg-[#38BDF8]/5 border border-[#38BDF8]/10">
            Poleas & Máquinas
          </span>
        </div>

        {/* Interactive Equipment Pins */}
        {initialPins.map((pin) => {
          const status = getPinStatus(pin);
          const isSelected = selectedPin?.id === pin.id;
          const isHighUsage = pin.usageRate >= 85;

          return (
            <div
              key={pin.id}
              onClick={() => setSelectedPin({ ...pin, status })}
              style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 cursor-pointer group z-20"
            >
              {/* Pulsing Beacon Ring */}
              <div
                className={`relative flex items-center justify-center w-8 h-8 rounded-full transition-all duration-300 ${
                  isSelected ? 'scale-125 ring-2 ring-white' : 'hover:scale-115'
                }`}
              >
                <span
                  className={`absolute inline-flex w-full h-full rounded-full opacity-60 animate-ping ${
                    status === 'MAINTENANCE'
                      ? 'bg-[#EF4444]'
                      : isHighUsage
                      ? 'bg-[#F59E0B]'
                      : 'bg-[#22C55E]'
                  }`}
                />
                <span
                  className={`relative flex items-center justify-center w-5 h-5 rounded-full border border-black/40 shadow-lg font-bold text-[9px] ${
                    status === 'MAINTENANCE'
                      ? 'bg-[#EF4444] text-white shadow-[0_0_15px_#EF4444]'
                      : isHighUsage
                      ? 'bg-[#F59E0B] text-black shadow-[0_0_12px_#F59E0B]'
                      : 'bg-[#22C55E] text-black shadow-[0_0_12px_#22C55E]'
                  }`}
                >
                  {status === 'MAINTENANCE' ? '!' : `${pin.usageRate}%`}
                </span>
              </div>

              {/* Hover Mini Tooltip */}
              <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:flex flex-col items-center pointer-events-none z-30">
                <div className="px-2.5 py-1.5 rounded-lg bg-[#080A0E]/95 border border-white/[0.15] text-[11px] text-white whitespace-nowrap shadow-2xl backdrop-blur-md">
                  <p className="font-bold">{pin.name}</p>
                  <p className="text-[10px] text-[#94A3B8]">
                    {pin.zone} • {status === 'MAINTENANCE' ? 'Mantenimiento' : `${pin.usageRate}% Uso`}
                  </p>
                </div>
              </div>
            </div>
          );
        })}

        {/* Selected Pin Popover Details */}
        {selectedPin && (
          <div className="absolute right-6 bottom-6 z-30 w-80 p-4 rounded-xl bg-[#121722]/95 border border-white/[0.15] backdrop-blur-xl shadow-2xl animate-in fade-in slide-in-from-bottom-2">
            <div className="flex items-start justify-between gap-2 mb-2">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#38BDF8]">
                  {selectedPin.zone}
                </span>
                <h4 className="text-sm font-bold text-white mt-0.5">{selectedPin.name}</h4>
              </div>
              <button
                onClick={() => setSelectedPin(null)}
                className="text-xs text-[#64748B] hover:text-white px-1.5 py-0.5 rounded hover:bg-white/[0.08]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-2.5 my-3 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Saturación Semanal:</span>
                <span className="tabular-nums font-bold text-white">{selectedPin.usageRate}%</span>
              </div>
              <div className="w-full h-1.5 bg-white/[0.08] rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${selectedPin.usageRate}%`,
                    background: selectedPin.usageRate >= 85 ? '#EF4444' : '#22C55E',
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[#94A3B8]">Estado en App Móvil:</span>
                <span
                  className={`font-bold flex items-center gap-1 ${
                    getPinStatus(selectedPin) === 'OPERATIONAL' ? 'text-[#22C55E]' : 'text-[#EF4444]'
                  }`}
                >
                  {getPinStatus(selectedPin) === 'OPERATIONAL' ? (
                    <><CheckCircle2 size={12} /> Operativo</>
                  ) : (
                    <><AlertTriangle size={12} /> Mantenimiento (Auto-Swap)</>
                  )}
                </span>
              </div>
            </div>

            {/* Maintenance Toggle Button */}
            <button
              onClick={() => togglePinMaintenance(selectedPin)}
              className={`w-full py-2 px-3 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-2 ${
                getPinStatus(selectedPin) === 'OPERATIONAL'
                  ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30 hover:bg-rose-500/25'
                  : 'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/25'
              }`}
            >
              <Wrench size={13} />
              {getPinStatus(selectedPin) === 'OPERATIONAL'
                ? 'Marcar en Mantenimiento'
                : 'Restaurar a Operativo'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

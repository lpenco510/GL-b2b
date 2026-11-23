'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import type { VerticalType } from '@/types/gravl-b2b';
import { memberStats, locations } from '@/data/mockGravlB2B';
import { Building2, Briefcase, GraduationCap, MapPin } from 'lucide-react';

const verticalOptions: { value: VerticalType; label: string; icon: React.ElementType }[] = [
  { value: 'GYM_CHAIN', label: 'Gym Chain View', icon: Building2 },
  { value: 'CORPORATE_WELLNESS', label: 'Corporate Wellness', icon: Briefcase },
  { value: 'COACH_STUDIO', label: 'Coach Studio', icon: GraduationCap },
];

export default function TopBar() {
  const { vertical, setVertical, selectedLocationId, setSelectedLocationId } = useApp();

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-6 py-3 border-b"
      style={{
        background: 'rgba(10, 12, 16, 0.85)',
        backdropFilter: 'blur(16px)',
        WebkitBackdropFilter: 'blur(16px)',
        borderColor: 'rgba(255, 255, 255, 0.09)',
      }}
    >
      {/* Left: Live Counter */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-gravl-ping absolute inline-flex h-full w-full rounded-full bg-gravl-emerald opacity-75" />
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-gravl-emerald" />
          </span>
          <span className="text-sm font-semibold text-gravl-text">
            <span className="tabular-nums text-gravl-emerald">{memberStats.liveNow}</span>
            <span className="text-gravl-text-secondary ml-1.5">members training right now</span>
          </span>
        </div>

        {/* Location Selector */}
        <div className="flex items-center gap-2 ml-4">
          <MapPin size={14} className="text-gravl-text-muted" />
          <select
            value={selectedLocationId}
            onChange={(e) => setSelectedLocationId(e.target.value)}
            className="bg-transparent text-sm text-gravl-text-secondary border border-white/[0.09] rounded-lg px-3 py-1.5 focus:outline-none focus:border-gravl-volt/30 cursor-pointer"
          >
            <option value="all" className="bg-gravl-surface">All Locations</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id} className="bg-gravl-surface">
                {loc.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Right: Mode Switcher */}
      <div className="flex items-center gap-1 p-1 rounded-xl" style={{ background: 'rgba(24, 29, 38, 0.65)', border: '1px solid rgba(255, 255, 255, 0.09)' }}>
        {verticalOptions.map((opt) => {
          const Icon = opt.icon;
          const isActive = vertical === opt.value;
          return (
            <button
              key={opt.value}
              onClick={() => setVertical(opt.value)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-200 ${
                isActive
                  ? 'bg-gravl-volt text-gravl-canvas'
                  : 'text-gravl-text-secondary hover:text-gravl-text hover:bg-white/[0.04]'
              }`}
            >
              <Icon size={14} />
              {opt.label}
            </button>
          );
        })}
      </div>
    </header>
  );
}

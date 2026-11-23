'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import type { VerticalType } from '@/types/gravl-b2b';
import { memberStats, locations, organization } from '@/data/mockGravlB2B';
import {
  Building2,
  Briefcase,
  GraduationCap,
  MapPin,
  Search,
  Bell,
  Sparkles,
} from 'lucide-react';

const verticalOptions: { value: VerticalType; label: string; icon: React.ElementType }[] = [
  { value: 'GYM_CHAIN', label: 'Gym Chain View', icon: Building2 },
  { value: 'CORPORATE_WELLNESS', label: 'Corporate Wellness', icon: Briefcase },
  { value: 'COACH_STUDIO', label: 'Coach Studio', icon: GraduationCap },
];

export default function TopBar() {
  const { vertical, setVertical, selectedLocationId, setSelectedLocationId, addToast } = useApp();

  return (
    <header
      className="sticky top-0 z-30 flex items-center justify-between px-6 xl:px-10 h-[72px] border-b"
      style={{
        background: 'rgba(8, 10, 14, 0.85)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderColor: 'rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Left: Organization + Location Selector + Telemetry Beacon */}
      <div className="flex items-center gap-6">
        {/* Partner Gym Badge */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-[#C6FF00]/10 border border-[#C6FF00]/25 flex items-center justify-center">
            <span className="text-xs font-black text-[#C6FF00]">9F</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-sm font-bold text-white tracking-wide">{organization.name}</span>
              <span className="text-[10px] font-semibold px-1.5 py-0.2 rounded bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                PRO ACTIVE
              </span>
            </div>
            <p className="text-[10px] text-[#64748B]">Enterprise Chain Partner</p>
          </div>
        </div>

        <div className="h-6 w-px bg-white/[0.08]" />

        {/* Location Dropdown */}
        <div className="flex items-center gap-2 bg-[#121721] border border-white/[0.08] rounded-xl px-3 py-1.5 hover:border-white/[0.18] transition-colors">
          <MapPin size={14} className="text-[#C6FF00]" />
          <select
            value={selectedLocationId}
            onChange={(e) => setSelectedLocationId(e.target.value)}
            className="bg-transparent text-xs font-semibold text-white focus:outline-none cursor-pointer pr-2"
          >
            <option value="all" className="bg-[#121721] text-white">Todas las Sedes (3)</option>
            {locations.map((loc) => (
              <option key={loc.id} value={loc.id} className="bg-[#121721] text-white">
                {loc.name} ({loc.city})
              </option>
            ))}
          </select>
        </div>

        {/* Live Active Members Beacon */}
        <div className="hidden md:flex items-center gap-2.5 px-3.5 py-1.5 rounded-full bg-[#22C55E]/10 border border-[#22C55E]/20">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#22C55E] opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#22C55E]" />
          </span>
          <span className="text-xs font-semibold text-white">
            <span className="tabular-nums text-[#22C55E] font-bold">{memberStats.liveNow}</span>
            <span className="text-[#94A3B8] ml-1.5">socios entrenando en vivo</span>
          </span>
        </div>
      </div>

      {/* Right: Mode Switcher & Quick Actions */}
      <div className="flex items-center gap-4">
        {/* Mode Switcher */}
        <div className="flex items-center gap-1 p-1 rounded-xl bg-[#121721] border border-white/[0.08]">
          {verticalOptions.map((opt) => {
            const Icon = opt.icon;
            const isActive = vertical === opt.value;
            return (
              <button
                key={opt.value}
                onClick={() => {
                  setVertical(opt.value);
                  addToast(`Vista cambiada a: ${opt.label}`, 'info');
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-200 ${
                  isActive
                    ? 'bg-[#C6FF00] text-[#080A0E] shadow-[0_0_15px_rgba(198,255,0,0.3)]'
                    : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.04]'
                }`}
              >
                <Icon size={14} />
                <span className="hidden sm:inline">{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Notification Bell */}
        <button
          onClick={() => addToast('3 alertas de churn atendidas automáticamente hoy por el Nudge Engine', 'info')}
          className="relative w-9 h-9 rounded-xl bg-[#121721] border border-white/[0.08] flex items-center justify-center text-[#94A3B8] hover:text-white hover:border-white/[0.18] transition-colors"
        >
          <Bell size={16} />
          <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#C6FF00] shadow-[0_0_8px_#C6FF00]" />
        </button>

        {/* Admin Avatar */}
        <div className="flex items-center gap-2.5 pl-2 border-l border-white/[0.08]">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#38BDF8]/20 to-[#C6FF00]/20 border border-white/[0.12] flex items-center justify-center font-bold text-xs text-white">
            LP
          </div>
        </div>
      </div>
    </header>
  );
}

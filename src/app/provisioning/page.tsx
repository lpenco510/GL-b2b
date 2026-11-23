'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  organization, memberStats, locations, integrationCards,
} from '@/data/mockGravlB2B';
import {
  QrCode, Download, Link2, Scan, Smartphone, ArrowRight,
  CreditCard, Calculator, DollarSign, BarChart3, Plug, ExternalLink,
} from 'lucide-react';

// ─── QR Code Component (SVG-based) ──────────────────────────────
function QRCodeDisplay({ value, size = 160 }: { value: string; size?: number }) {
  // Simple visual QR placeholder (real app would use qrcode.react)
  const cells = 21;
  const cellSize = size / cells;

  // Deterministic pattern from string hash
  const hash = (s: string, i: number) => {
    let h = 0;
    for (let c = 0; c < s.length; c++) {
      h = ((h << 5) - h + s.charCodeAt(c) + i * 31) | 0;
    }
    return h;
  };

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-lg">
      <rect width={size} height={size} fill="#0A0C10" rx="8" />
      {/* Finder patterns */}
      {[[0,0],[0,14],[14,0]].map(([r,c], idx) => (
        <g key={idx}>
          <rect x={c*cellSize} y={r*cellSize} width={7*cellSize} height={7*cellSize} fill="#C6FF00" rx="2" />
          <rect x={(c+1)*cellSize} y={(r+1)*cellSize} width={5*cellSize} height={5*cellSize} fill="#0A0C10" rx="1" />
          <rect x={(c+2)*cellSize} y={(r+2)*cellSize} width={3*cellSize} height={3*cellSize} fill="#C6FF00" rx="1" />
        </g>
      ))}
      {/* Data pattern */}
      {Array.from({ length: cells }, (_, r) =>
        Array.from({ length: cells }, (_, c) => {
          // Skip finder patterns
          if ((r < 8 && c < 8) || (r < 8 && c > 12) || (r > 12 && c < 8)) return null;
          if (Math.abs(hash(value, r * cells + c)) % 3 === 0) {
            return (
              <rect
                key={`${r}-${c}`}
                x={c * cellSize + 0.5}
                y={r * cellSize + 0.5}
                width={cellSize - 1}
                height={cellSize - 1}
                fill="#C6FF00"
                opacity={0.8}
                rx="0.5"
              />
            );
          }
          return null;
        })
      )}
    </svg>
  );
}

// ─── ROI Calculator ──────────────────────────────────────────────
function ROICalculator() {
  const [totalMembers, setTotalMembers] = useState(1000);
  const [avgFee, setAvgFee] = useState(50);
  const [gravlCost, setGravlCost] = useState(2.5);

  const churnReduction = 6;
  const retainedMembers = Math.floor(totalMembers * (churnReduction / 100));
  const retainedAnnualRevenue = retainedMembers * avgFee * 12;
  const gravlAnnualCost = totalMembers * gravlCost * 12;
  const netROI = retainedAnnualRevenue / gravlAnnualCost;

  return (
    <div className="gravl-card p-6">
      <div className="flex items-center gap-2 mb-4">
        <Calculator size={18} className="text-gravl-volt" />
        <h3 className="text-lg font-bold text-gravl-text">ROI Simulator</h3>
      </div>
      <p className="text-xs text-gravl-text-muted mb-6">Interactive ROI calculator — usable as a live sales tool</p>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Inputs */}
        <div className="space-y-5">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gravl-text-secondary">Total Gym Members</label>
              <span className="tabular-nums text-sm font-bold text-gravl-text">{totalMembers.toLocaleString()}</span>
            </div>
            <input
              type="range"
              min={100}
              max={5000}
              step={50}
              value={totalMembers}
              onChange={(e) => setTotalMembers(Number(e.target.value))}
              className="w-full accent-gravl-volt"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gravl-text-secondary">Avg Monthly Membership Fee</label>
              <span className="tabular-nums text-sm font-bold text-gravl-text">${avgFee}</span>
            </div>
            <input
              type="range"
              min={20}
              max={200}
              step={5}
              value={avgFee}
              onChange={(e) => setAvgFee(Number(e.target.value))}
              className="w-full accent-gravl-volt"
            />
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs text-gravl-text-secondary">GRAVL Cost per Member/Month</label>
              <span className="tabular-nums text-sm font-bold text-gravl-text">${gravlCost.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min={1.5}
              max={6}
              step={0.5}
              value={gravlCost}
              onChange={(e) => setGravlCost(Number(e.target.value))}
              className="w-full accent-gravl-volt"
            />
          </div>
        </div>

        {/* Outputs */}
        <div className="space-y-3">
          <div className="gravl-card p-4 border-gravl-emerald/20">
            <p className="text-xs text-gravl-text-muted uppercase tracking-wider mb-1">Projected Churn Reduction</p>
            <p className="tabular-nums text-2xl font-bold text-gravl-emerald">+{churnReduction}%</p>
          </div>
          <div className="gravl-card p-4 border-gravl-volt/20">
            <p className="text-xs text-gravl-text-muted uppercase tracking-wider mb-1">Retained Annual Revenue</p>
            <p className="tabular-nums text-2xl font-bold text-gravl-volt">+${retainedAnnualRevenue.toLocaleString()}/yr</p>
          </div>
          <div className="gravl-card p-4">
            <p className="text-xs text-gravl-text-muted uppercase tracking-wider mb-1">GRAVL Annual Cost</p>
            <p className="tabular-nums text-2xl font-bold text-gravl-text">${gravlAnnualCost.toLocaleString()}/yr</p>
          </div>
          <div className="gravl-card p-4 border-gravl-cyan/20">
            <p className="text-xs text-gravl-text-muted uppercase tracking-wider mb-1">Net ROI Multiple</p>
            <p className="tabular-nums text-3xl font-bold text-gravl-cyan">{netROI.toFixed(1)}x</p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ProvisioningPage() {
  const { addToast } = useApp();
  const selectedLocation = locations[0];

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gravl-text">QR Onboarding, Seats & B2B Billing</h2>
        <p className="text-sm text-gravl-text-muted mt-1">
          Generate QR kits, manage seat allocations, and configure integrations
        </p>
      </div>

      {/* QR Kit Generator */}
      <div className="gravl-card p-6">
        <div className="flex items-center gap-2 mb-4">
          <QrCode size={18} className="text-gravl-volt" />
          <h3 className="text-lg font-bold text-gravl-text">Instant QR Kit Generator</h3>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {locations.map((loc) => (
            <div key={loc.id} className="text-center">
              <div className="inline-block p-4 rounded-2xl bg-gravl-canvas border border-white/[0.09] mb-3">
                <QRCodeDisplay value={loc.qrDeepLink} size={160} />
              </div>
              <p className="text-sm font-semibold text-gravl-text">{loc.name}</p>
              <p className="text-xs text-gravl-text-muted mt-0.5 font-mono">{loc.qrDeepLink}</p>
              <button
                onClick={() => addToast(`QR poster for ${loc.name} generated — ready for download`, 'success')}
                className="mt-3 flex items-center gap-1.5 mx-auto px-4 py-2 rounded-lg bg-gravl-volt/10 text-gravl-volt text-xs font-semibold hover:bg-gravl-volt/20 transition-colors"
              >
                <Download size={12} />
                Download Print Kit
              </button>
            </div>
          ))}
        </div>

        {/* Scan Funnel */}
        <div className="mt-6 gravl-card p-4">
          <h4 className="text-sm font-semibold text-gravl-text mb-3">Scan Conversion Funnel</h4>
          <div className="flex items-center justify-between gap-4">
            {[
              { label: 'QR Scans', value: '2,847', icon: Scan },
              { label: 'App Installs', value: '1,892', icon: Smartphone },
              { label: 'First Workout', value: '1,428', icon: ArrowRight },
            ].map((step, i) => {
              const Icon = step.icon;
              return (
                <React.Fragment key={step.label}>
                  <div className="flex-1 text-center">
                    <Icon size={20} className="text-gravl-volt mx-auto mb-2" />
                    <p className="tabular-nums text-xl font-bold text-gravl-text">{step.value}</p>
                    <p className="text-xs text-gravl-text-muted">{step.label}</p>
                  </div>
                  {i < 2 && (
                    <div className="text-gravl-text-muted">
                      <ArrowRight size={16} />
                    </div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      </div>

      {/* Seat Allocation */}
      <div className="gravl-card p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-bold text-gravl-text">Seat Allocation</h3>
            <p className="text-xs text-gravl-text-muted mt-0.5">
              {organization.planTier} Plan — {organization.activeSeats} / {organization.seatLimit} active seats
            </p>
          </div>
          <span className="tabular-nums text-sm font-semibold text-gravl-volt">
            ${organization.mrrUsd.toLocaleString()}/mo MRR
          </span>
        </div>

        {/* Seat Meter */}
        <div className="mb-6">
          <div className="flex items-center justify-between text-xs mb-2">
            <span className="text-gravl-text-secondary">Active Seats</span>
            <span className="tabular-nums text-gravl-text font-semibold">
              {organization.activeSeats} / {organization.seatLimit}
            </span>
          </div>
          <div className="w-full h-3 bg-white/[0.06] rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-gravl-volt to-gravl-cyan rounded-full transition-all"
              style={{ width: `${(organization.activeSeats / organization.seatLimit) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gravl-text-muted mt-1 tabular-nums">
            {organization.seatLimit - organization.activeSeats} seats available
          </p>
        </div>

        {/* Integration Cards */}
        <h4 className="text-sm font-semibold text-gravl-text mb-3 flex items-center gap-2">
          <Plug size={14} className="text-gravl-cyan" />
          ERP & Platform Integrations
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          {integrationCards.map((int) => (
            <div
              key={int.id}
              className={`gravl-card p-4 ${int.status === 'connected' ? 'border-gravl-emerald/20' : ''}`}
            >
              <div className="flex items-center gap-3 mb-2">
                <span className="text-2xl">{int.logo}</span>
                <div>
                  <p className="text-sm font-semibold text-gravl-text">{int.name}</p>
                  <p className="text-[10px] text-gravl-text-muted">{int.description}</p>
                </div>
              </div>
              <button
                className={`w-full mt-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1.5 ${
                  int.status === 'connected'
                    ? 'bg-gravl-emerald/10 text-gravl-emerald'
                    : 'bg-white/[0.04] text-gravl-text-secondary hover:bg-white/[0.08]'
                }`}
              >
                {int.status === 'connected' ? (
                  <>✓ Connected</>
                ) : (
                  <>
                    <Link2 size={12} /> Connect
                  </>
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ROI Calculator */}
      <ROICalculator />
    </div>
  );
}

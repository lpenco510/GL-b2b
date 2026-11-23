'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { members, leaderboard, memberStats } from '@/data/mockGravlB2B';
import {
  Building2, Briefcase, GraduationCap, Shield, Heart, Moon,
  Battery, Users, TrendingUp, Dumbbell, MessageSquare, Video,
  Calendar, ChevronRight, Flame, Brain,
} from 'lucide-react';

// ─── Corporate Wellness View ─────────────────────────────────────
function CorporateWellnessView() {
  const departments = [
    { name: 'Engineering', members: 85, avgReadiness: 78, avgStrength: 242, activeRate: 72, stepsAvg: 8400 },
    { name: 'Sales', members: 62, avgReadiness: 65, avgStrength: 218, activeRate: 58, stepsAvg: 10200 },
    { name: 'Product', members: 45, avgReadiness: 82, avgStrength: 235, activeRate: 76, stepsAvg: 7800 },
    { name: 'Marketing', members: 38, avgReadiness: 71, avgStrength: 205, activeRate: 64, stepsAvg: 9100 },
    { name: 'HR & Operations', members: 28, avgReadiness: 74, avgStrength: 198, activeRate: 68, stepsAvg: 8800 },
  ];

  const readinessColor = (score: number) => {
    if (score >= 80) return 'text-gravl-emerald';
    if (score >= 60) return 'text-gravl-amber';
    return 'text-gravl-crimson';
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="gravl-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Heart size={16} className="text-gravl-crimson" />
            <span className="text-xs text-gravl-text-muted uppercase tracking-wider">Avg Team Readiness</span>
          </div>
          <p className="tabular-nums text-2xl font-bold text-gravl-emerald">74%</p>
          <p className="text-xs text-gravl-text-muted mt-1">HRV + Sleep aggregated, anonymized</p>
        </div>
        <div className="gravl-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Moon size={16} className="text-gravl-cyan" />
            <span className="text-xs text-gravl-text-muted uppercase tracking-wider">Avg Sleep Quality</span>
          </div>
          <p className="tabular-nums text-2xl font-bold text-gravl-cyan">7.2h</p>
          <p className="text-xs text-gravl-text-muted mt-1">From Apple Health / Garmin sync</p>
        </div>
        <div className="gravl-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Battery size={16} className="text-gravl-amber" />
            <span className="text-xs text-gravl-text-muted uppercase tracking-wider">Burnout Risk</span>
          </div>
          <p className="tabular-nums text-2xl font-bold text-gravl-amber">12%</p>
          <p className="text-xs text-gravl-text-muted mt-1">Members with readiness &lt;50% for 2+ weeks</p>
        </div>
        <div className="gravl-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Brain size={16} className="text-gravl-volt" />
            <span className="text-xs text-gravl-text-muted uppercase tracking-wider">Macros Adoption</span>
          </div>
          <p className="tabular-nums text-2xl font-bold text-gravl-volt">42%</p>
          <p className="text-xs text-gravl-text-muted mt-1">Employees using Gravl: Macros</p>
        </div>
      </div>

      {/* Department Comparison */}
      <div className="gravl-card p-5">
        <h3 className="text-sm font-semibold text-gravl-text mb-4 flex items-center gap-2">
          <Building2 size={16} className="text-gravl-cyan" />
          Department vs. Department
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Department', 'Members', 'Avg Readiness', 'Avg Strength Score', 'Active Rate', 'Avg Steps/Day'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-gravl-text-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {departments.map((dept) => (
                <tr key={dept.name} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3 text-sm font-medium text-gravl-text">{dept.name}</td>
                  <td className="px-4 py-3 tabular-nums text-sm text-gravl-text">{dept.members}</td>
                  <td className="px-4 py-3">
                    <span className={`tabular-nums text-sm font-semibold ${readinessColor(dept.avgReadiness)}`}>{dept.avgReadiness}%</span>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-sm font-bold text-gravl-cyan">{dept.avgStrength}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-white/[0.06] rounded-full overflow-hidden">
                        <div className="h-full bg-gravl-volt rounded-full" style={{ width: `${dept.activeRate}%` }} />
                      </div>
                      <span className="tabular-nums text-xs text-gravl-text-secondary">{dept.activeRate}%</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 tabular-nums text-sm text-gravl-text-secondary">{dept.stepsAvg.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Privacy Notice */}
      <div className="gravl-card p-4 border-gravl-cyan/20">
        <div className="flex items-center gap-2">
          <Shield size={16} className="text-gravl-cyan" />
          <p className="text-xs text-gravl-text-secondary">
            <span className="font-semibold text-gravl-text">Privacy-First:</span> All health metrics are anonymized at department level.
            Individual body weight, medical notes, and personal food photos remain strictly private to the user.
          </p>
        </div>
      </div>
    </div>
  );
}

// ─── Coach Studio View ───────────────────────────────────────────
function CoachStudioView() {
  const clients = [
    { name: 'Sofía Martínez', plan: 'Hypertrophy A/B', squat1RM: 85, bench1RM: 52, deadlift1RM: 95, rpe: 'Ideal', nextSession: 'Upper A', streak: 12, lastFeedback: 'Felt strong on squats' },
    { name: 'Martín García', plan: 'Strength 5x5', squat1RM: 140, bench1RM: 105, deadlift1RM: 165, rpe: 'Hard', nextSession: 'Lower B', streak: 8, lastFeedback: 'Deadlift grip was off' },
    { name: 'Camila López', plan: 'Powerbuilding', squat1RM: 92, bench1RM: 55, deadlift1RM: 110, rpe: 'Easy', nextSession: 'Push Day', streak: 15, lastFeedback: 'Added 2.5kg easily' },
    { name: 'Tomás Rodríguez', plan: 'Body Recomp', squat1RM: 110, bench1RM: 80, deadlift1RM: 130, rpe: 'Ideal', nextSession: 'Full Body', streak: 6, lastFeedback: 'Feeling good, macros on point' },
    { name: 'Valentina Fernández', plan: 'Glute Focus', squat1RM: 75, bench1RM: 40, deadlift1RM: 85, rpe: 'Ideal', nextSession: 'Lower A', streak: 10, lastFeedback: 'Hip thrust PR!' },
  ];

  const rpeColor = (rpe: string) => {
    if (rpe === 'Easy') return 'text-gravl-emerald bg-gravl-emerald/10';
    if (rpe === 'Ideal') return 'text-gravl-cyan bg-gravl-cyan/10';
    return 'text-gravl-crimson bg-gravl-crimson/10';
  };

  return (
    <div className="space-y-6">
      {/* KPIs */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="gravl-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Users size={16} className="text-gravl-volt" />
            <span className="text-xs text-gravl-text-muted uppercase tracking-wider">Active Clients</span>
          </div>
          <p className="tabular-nums text-2xl font-bold text-gravl-text">24</p>
        </div>
        <div className="gravl-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Calendar size={16} className="text-gravl-cyan" />
            <span className="text-xs text-gravl-text-muted uppercase tracking-wider">Sessions This Week</span>
          </div>
          <p className="tabular-nums text-2xl font-bold text-gravl-cyan">18</p>
        </div>
        <div className="gravl-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp size={16} className="text-gravl-emerald" />
            <span className="text-xs text-gravl-text-muted uppercase tracking-wider">Avg Client Progress</span>
          </div>
          <p className="tabular-nums text-2xl font-bold text-gravl-emerald">+16 SS</p>
        </div>
        <div className="gravl-card p-5">
          <div className="flex items-center gap-2 mb-2">
            <Video size={16} className="text-gravl-amber" />
            <span className="text-xs text-gravl-text-muted uppercase tracking-wider">Form Check Inbox</span>
          </div>
          <p className="tabular-nums text-2xl font-bold text-gravl-amber">3</p>
          <p className="text-xs text-gravl-text-muted mt-1">Pending video reviews</p>
        </div>
      </div>

      {/* Client Roster */}
      <div className="gravl-card p-5">
        <h3 className="text-sm font-semibold text-gravl-text mb-4 flex items-center gap-2">
          <GraduationCap size={16} className="text-gravl-volt" />
          Client Roster
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Client', 'Plan', 'Squat 1RM', 'Bench 1RM', 'Deadlift 1RM', 'RPE Feedback', 'Streak', 'Next Session'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-gravl-text-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clients.map((client) => (
                <tr key={client.name} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <p className="text-sm font-medium text-gravl-text">{client.name}</p>
                    <p className="text-[10px] text-gravl-text-muted truncate max-w-[150px]">&quot;{client.lastFeedback}&quot;</p>
                  </td>
                  <td className="px-4 py-3 text-xs text-gravl-text-secondary">{client.plan}</td>
                  <td className="px-4 py-3 tabular-nums text-sm font-bold text-gravl-cyan">{client.squat1RM}kg</td>
                  <td className="px-4 py-3 tabular-nums text-sm font-bold text-gravl-cyan">{client.bench1RM}kg</td>
                  <td className="px-4 py-3 tabular-nums text-sm font-bold text-gravl-cyan">{client.deadlift1RM}kg</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${rpeColor(client.rpe)}`}>
                      {client.rpe}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Flame size={12} className="text-gravl-volt" />
                      <span className="tabular-nums text-xs font-semibold text-gravl-text">{client.streak}w</span>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gravl-text-secondary">{client.nextSession}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Mesocycle Template Builder (Placeholder) */}
      <div className="gravl-card p-5 border-dashed border-gravl-text-muted/30">
        <div className="text-center py-8">
          <Dumbbell size={32} className="text-gravl-text-muted mx-auto mb-3" />
          <h3 className="text-sm font-semibold text-gravl-text mb-1">Mesocycle Template Builder</h3>
          <p className="text-xs text-gravl-text-muted max-w-md mx-auto">
            Create structured training blocks and assign them to clients. GRAVL&apos;s deterministic 1RM & fatigue engine auto-adjusts daily weights.
          </p>
          <button className="mt-4 px-4 py-2 rounded-xl bg-gravl-volt text-gravl-canvas text-xs font-semibold hover:bg-gravl-volt-hover transition-colors">
            Create Template
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ───────────────────────────────────────────────────
export default function CorporateCoachPage() {
  const { vertical } = useApp();

  if (vertical === 'CORPORATE_WELLNESS') {
    return (
      <div className="max-w-[1400px]">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gravl-text flex items-center gap-2">
            <Briefcase size={22} className="text-gravl-cyan" />
            Corporate Wellness
          </h2>
          <p className="text-sm text-gravl-text-muted mt-1">
            Team readiness, burnout prevention, and department wellness metrics
          </p>
        </div>
        <CorporateWellnessView />
      </div>
    );
  }

  if (vertical === 'COACH_STUDIO') {
    return (
      <div className="max-w-[1400px]">
        <div className="mb-6">
          <h2 className="text-xl font-bold text-gravl-text flex items-center gap-2">
            <GraduationCap size={22} className="text-gravl-volt" />
            Coach Studio
          </h2>
          <p className="text-sm text-gravl-text-muted mt-1">
            Client roster, 1RM progression, RPE feedback, and mesocycle management
          </p>
        </div>
        <CoachStudioView />
      </div>
    );
  }

  // Default: Gym Chain view shows both as tabs
  return (
    <div className="max-w-[1400px]">
      <div className="mb-6">
        <h2 className="text-xl font-bold text-gravl-text">Corporate & Coach Extensions</h2>
        <p className="text-sm text-gravl-text-muted mt-1">
          Switch to <span className="text-gravl-cyan font-semibold">Corporate Wellness</span> or{' '}
          <span className="text-gravl-volt font-semibold">Coach Studio</span> view using the mode switcher in the top bar
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="gravl-card p-6 text-center">
          <Briefcase size={40} className="text-gravl-cyan mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gravl-text mb-2">Corporate Wellness</h3>
          <p className="text-xs text-gravl-text-muted max-w-xs mx-auto mb-4">
            Team readiness & burnout prevention, department challenges, Gravl: Macros adoption metrics
          </p>
          <p className="text-xs text-gravl-cyan">Switch to &quot;Corporate Wellness&quot; view ↑</p>
        </div>
        <div className="gravl-card p-6 text-center">
          <GraduationCap size={40} className="text-gravl-volt mx-auto mb-3" />
          <h3 className="text-lg font-bold text-gravl-text mb-2">Coach Studio</h3>
          <p className="text-xs text-gravl-text-muted max-w-xs mx-auto mb-4">
            Client roster, 1RM tracking, RPE feedback, mesocycle builder, form-check video inbox
          </p>
          <p className="text-xs text-gravl-volt">Switch to &quot;Coach Studio&quot; view ↑</p>
        </div>
      </div>
    </div>
  );
}

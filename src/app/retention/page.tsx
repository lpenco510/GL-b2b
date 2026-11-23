'use client';

import React, { useState } from 'react';
import { useApp } from '@/context/AppContext';
import {
  members, memberStats, nudgeRules,
} from '@/data/mockGravlB2B';
import {
  Flame, TrendingUp, AlertTriangle, UserPlus, Users, Bell, Send, Search,
  ChevronDown, ToggleLeft, ToggleRight, Zap, Clock,
} from 'lucide-react';
import type { B2BMemberTelemetry, MemberStatus } from '@/types/gravl-b2b';

type TabFilter = 'ALL' | 'ON_FIRE' | 'ACTIVE' | 'NEEDS_NUDGE' | 'AT_RISK' | 'NEW_JOINERS';

const tabs: { key: TabFilter; label: string; icon: React.ElementType; count: number; color: string }[] = [
  { key: 'ALL', label: 'All Members', icon: Users, count: memberStats.total, color: '#94A3B8' },
  { key: 'ON_FIRE', label: 'On Fire', icon: Flame, count: memberStats.onFire, color: '#C6FF00' },
  { key: 'NEEDS_NUDGE', label: 'Needs a Nudge', icon: Bell, count: memberStats.needsNudge, color: '#F59E0B' },
  { key: 'AT_RISK', label: 'At Churn Risk', icon: AlertTriangle, count: memberStats.atRisk, color: '#EF4444' },
  { key: 'NEW_JOINERS', label: 'New Joiners <5', icon: UserPlus, count: memberStats.newJoinersUnder5, color: '#38BDF8' },
];

function statusBadge(status: MemberStatus) {
  const map = {
    ON_FIRE: { bg: 'bg-gravl-volt/10', text: 'text-gravl-volt', label: 'On Fire 🔥' },
    ACTIVE: { bg: 'bg-gravl-emerald/10', text: 'text-gravl-emerald', label: 'Active' },
    NEEDS_NUDGE: { bg: 'bg-gravl-amber/10', text: 'text-gravl-amber', label: 'Needs Nudge' },
    AT_RISK: { bg: 'bg-gravl-crimson/10', text: 'text-gravl-crimson', label: 'At Risk' },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

function readinessColor(score?: number) {
  if (!score) return 'text-gravl-text-muted';
  if (score >= 80) return 'text-gravl-emerald';
  if (score >= 50) return 'text-gravl-amber';
  return 'text-gravl-crimson';
}

function streakRings(weeks: number) {
  const filled = Math.min(weeks, 8);
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: 8 }, (_, i) => (
        <div
          key={i}
          className={`w-2 h-2 rounded-full ${
            i < filled ? 'bg-gravl-volt' : 'bg-white/[0.08]'
          }`}
        />
      ))}
    </div>
  );
}

export default function RetentionPage() {
  const { addToast } = useApp();
  const [activeTab, setActiveTab] = useState<TabFilter>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [nudgeModalMember, setNudgeModalMember] = useState<B2BMemberTelemetry | null>(null);
  const [localNudgeRules, setLocalNudgeRules] = useState(nudgeRules);

  const filteredMembers = members
    .filter((m) => {
      if (activeTab === 'NEW_JOINERS') return m.workoutsFirst30Days < 5;
      if (activeTab === 'ALL') return true;
      return m.status === activeTab;
    })
    .filter((m) => !searchQuery || m.fullName.toLowerCase().includes(searchQuery.toLowerCase()))
    .slice(0, 50); // paginate for performance

  const toggleNudgeRule = (id: string) => {
    setLocalNudgeRules((prev) =>
      prev.map((r) => r.id === id ? { ...r, enabled: !r.enabled } : r)
    );
    const rule = localNudgeRules.find((r) => r.id === id);
    if (rule) {
      addToast(
        `${rule.name} ${rule.enabled ? 'disabled' : 'enabled'} — Changes synced to GRAVL Push Engine`,
        rule.enabled ? 'warning' : 'success'
      );
    }
  };

  const sendNudge = (member: B2BMemberTelemetry) => {
    setNudgeModalMember(null);
    addToast(
      `Nudge sent to ${member.fullName} — Push notification dispatched via GRAVL Mobile App`,
      'success'
    );
  };

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-gravl-text">Retention & Smart Nudge Engine</h2>
        <p className="text-sm text-gravl-text-muted mt-1">
          See who is training right now, who was active this week and who could use a nudge.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-2">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                isActive
                  ? 'text-gravl-canvas'
                  : 'liquid-glass text-gravl-text-secondary hover:text-gravl-text'
              }`}
              style={isActive ? { background: tab.color } : undefined}
            >
              <Icon size={14} />
              {tab.label}
              <span className="tabular-nums text-xs opacity-80">({tab.count})</span>
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gravl-text-muted" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search members..."
          className="w-full bg-gravl-surface border border-white/[0.09] rounded-xl pl-10 pr-4 py-2.5 text-sm text-gravl-text placeholder:text-gravl-text-muted focus:outline-none focus:border-gravl-volt/30 transition-colors"
        />
      </div>

      {/* Member Table */}
      <div className="gravl-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Member', 'Location', 'Streak', 'Last Workout', 'Workouts/Mo', 'Strength Score', 'Readiness', 'Status', 'Action'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-gravl-text-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m) => (
                <tr key={m.userId} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={m.avatarUrl}
                        alt={m.fullName}
                        className="w-8 h-8 rounded-full border border-white/[0.09]"
                      />
                      <div>
                        <p className="text-sm font-medium text-gravl-text">{m.fullName}</p>
                        {m.macrosActive && <span className="text-[9px] text-gravl-cyan">Macros Active</span>}
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gravl-text-secondary">
                    {m.locationId === 'loc_palermo' ? 'Palermo' : m.locationId === 'loc_belgrano' ? 'Belgrano' : 'Nordelta'}
                  </td>
                  <td className="px-4 py-3">{streakRings(m.currentStreakWeeks)}</td>
                  <td className="px-4 py-3 text-xs text-gravl-text-secondary tabular-nums">
                    {new Date(m.lastWorkoutAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </td>
                  <td className="px-4 py-3">
                    <span className="tabular-nums text-sm font-semibold text-gravl-text">{m.workoutsThisWeek}</span>
                    <span className="text-xs text-gravl-text-muted">/{m.weeklyTarget}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className="tabular-nums text-sm font-bold text-gravl-cyan">{m.strengthScore}</span>
                    <span className={`text-xs ml-1 ${m.strengthScoreDelta30d >= 0 ? 'text-gravl-emerald' : 'text-gravl-crimson'}`}>
                      {m.strengthScoreDelta30d >= 0 ? '+' : ''}{m.strengthScoreDelta30d}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`tabular-nums text-sm font-semibold ${readinessColor(m.readinessScore)}`}>
                      {m.readinessScore ?? '—'}%
                    </span>
                  </td>
                  <td className="px-4 py-3">{statusBadge(m.status)}</td>
                  <td className="px-4 py-3">
                    {(m.status === 'NEEDS_NUDGE' || m.status === 'AT_RISK') && (
                      <button
                        onClick={() => setNudgeModalMember(m)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gravl-volt/10 text-gravl-volt text-xs font-semibold hover:bg-gravl-volt/20 transition-colors"
                      >
                        <Send size={12} />
                        Send Nudge
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Automated Nudge Rules */}
      <div>
        <h3 className="text-lg font-bold text-gravl-text mb-1">Automated Nudge Rules</h3>
        <p className="text-sm text-gravl-text-muted mb-4">No-code triggers that automatically dispatch push notifications via GRAVL</p>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {localNudgeRules.map((rule) => (
            <div key={rule.id} className={`gravl-card p-5 ${rule.enabled ? 'border-gravl-volt/20' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Zap size={16} className={rule.enabled ? 'text-gravl-volt' : 'text-gravl-text-muted'} />
                  <h4 className="text-sm font-semibold text-gravl-text">{rule.name}</h4>
                </div>
                <button onClick={() => toggleNudgeRule(rule.id)}>
                  {rule.enabled ? (
                    <ToggleRight size={24} className="text-gravl-volt" />
                  ) : (
                    <ToggleLeft size={24} className="text-gravl-text-muted" />
                  )}
                </button>
              </div>
              <p className="text-xs text-gravl-text-secondary leading-relaxed mb-3">{rule.description}</p>
              <div className="flex items-center gap-4 text-xs text-gravl-text-muted">
                <span className="flex items-center gap-1">
                  <Bell size={10} />
                  <span className="tabular-nums">{rule.triggerCount}</span> triggered
                </span>
                {rule.lastTriggered && (
                  <span className="flex items-center gap-1">
                    <Clock size={10} />
                    Last: {new Date(rule.lastTriggered).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Nudge Modal */}
      {nudgeModalMember && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60" onClick={() => setNudgeModalMember(null)}>
          <div className="liquid-glass-static p-6 max-w-md w-full mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gravl-text mb-2">Send Nudge</h3>
            <p className="text-sm text-gravl-text-secondary mb-4">
              Dispatch a personalized push notification to <span className="text-gravl-text font-semibold">{nudgeModalMember.fullName}</span> via the GRAVL Mobile App.
            </p>
            <div className="gravl-card p-4 mb-4">
              <p className="text-xs text-gravl-text-secondary italic">
                &quot;Your rack at 9 Fitness misses you — we dialed back today&apos;s volume by 10% for an easy return session. Let&apos;s get back at it! 💪&quot;
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setNudgeModalMember(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.09] text-sm text-gravl-text-secondary hover:text-gravl-text hover:bg-white/[0.04] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => sendNudge(nudgeModalMember)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gravl-volt text-gravl-canvas text-sm font-semibold hover:bg-gravl-volt-hover transition-colors flex items-center justify-center gap-2"
              >
                <Send size={14} />
                Send Nudge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

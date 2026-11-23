'use client';

import React, { useState } from 'react';
import {
  challenges, leaderboard, organization, memberStats,
} from '@/data/mockGravlB2B';
import {
  Trophy, Users, Target, Calendar, Gift, ChevronRight,
  Medal, Flame, Dumbbell, Plus, TrendingUp,
} from 'lucide-react';
import type { ChallengeStatus } from '@/types/gravl-b2b';

function statusBadge(status: ChallengeStatus) {
  const map = {
    ACTIVE: { bg: 'bg-gravl-emerald/10', text: 'text-gravl-emerald', label: '● Active' },
    UPCOMING: { bg: 'bg-gravl-cyan/10', text: 'text-gravl-cyan', label: '◷ Upcoming' },
    COMPLETED: { bg: 'bg-gravl-text-muted/10', text: 'text-gravl-text-muted', label: '✓ Completed' },
  };
  const s = map[status];
  return (
    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${s.bg} ${s.text}`}>
      {s.label}
    </span>
  );
}

function metricIcon(metric: string) {
  switch (metric) {
    case 'WORKOUT_COUNT': return <Target size={14} className="text-gravl-volt" />;
    case 'STRENGTH_SCORE_GAIN': return <TrendingUp size={14} className="text-gravl-cyan" />;
    case 'TOTAL_VOLUME_KG': return <Dumbbell size={14} className="text-gravl-amber" />;
    default: return <Trophy size={14} />;
  }
}

export default function CommunityPage() {
  const [showWizard, setShowWizard] = useState(false);

  return (
    <div className="space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gravl-text">Community, Groups & Challenges</h2>
          <p className="text-sm text-gravl-text-muted mt-1">
            Launch branded challenges and manage your gym&apos;s in-app community
          </p>
        </div>
        <button
          onClick={() => setShowWizard(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gravl-volt text-gravl-canvas text-sm font-semibold hover:bg-gravl-volt-hover transition-colors"
        >
          <Plus size={16} />
          Create Challenge
        </button>
      </div>

      {/* Gym Group Preview Card */}
      <div className="gravl-card p-6">
        <h3 className="text-sm font-semibold text-gravl-text mb-4 flex items-center gap-2">
          <Users size={16} className="text-gravl-cyan" />
          Official Gym Group — In-App Preview
        </h3>
        <div className="flex gap-6 items-start">
          {/* Mobile Preview */}
          <div className="w-[220px] flex-shrink-0 rounded-2xl border border-white/[0.09] overflow-hidden" style={{ background: '#0A0C10' }}>
            {/* Cover Banner */}
            <div className="h-20 bg-gradient-to-br from-gravl-volt/20 to-gravl-cyan/10 flex items-end justify-center pb-2">
              <div className="w-12 h-12 rounded-xl bg-gravl-volt flex items-center justify-center -mb-6 border-2 border-gravl-canvas">
                <span className="text-lg font-bold text-gravl-canvas">9F</span>
              </div>
            </div>
            <div className="pt-8 px-4 pb-4 text-center">
              <p className="text-sm font-bold text-gravl-text">{organization.name}</p>
              <p className="text-[10px] text-gravl-text-muted mt-0.5">Official Group</p>
              <div className="flex items-center justify-center gap-3 mt-3 text-[10px] text-gravl-text-secondary">
                <span className="tabular-nums"><span className="font-semibold text-gravl-text">{memberStats.total}</span> members</span>
                <span>•</span>
                <span className="tabular-nums"><span className="font-semibold text-gravl-emerald">{memberStats.liveNow}</span> active</span>
              </div>
              <div className="mt-3 flex gap-1">
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="w-6 h-6 rounded-full bg-gravl-surface border border-white/[0.09] -ml-1 first:ml-0" />
                ))}
                <span className="text-[9px] text-gravl-text-muted ml-1 self-center">+{memberStats.total - 5}</span>
              </div>
            </div>
          </div>

          {/* Group Details */}
          <div className="flex-1 space-y-4">
            <div>
              <p className="text-sm text-gravl-text-secondary">
                This is how <span className="text-gravl-text font-semibold">{organization.name}</span> appears inside the GRAVL iOS/Android app.
                Members who scan the gym&apos;s QR code are automatically enrolled into this group and the monthly leaderboard.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="gravl-card p-3 text-center">
                <p className="tabular-nums text-lg font-bold text-gravl-text">{memberStats.total}</p>
                <p className="text-[10px] text-gravl-text-muted">Total Members</p>
              </div>
              <div className="gravl-card p-3 text-center">
                <p className="tabular-nums text-lg font-bold text-gravl-volt">{memberStats.avgWorkoutsPerWeek}</p>
                <p className="text-[10px] text-gravl-text-muted">Avg Workouts/Week</p>
              </div>
              <div className="gravl-card p-3 text-center">
                <p className="tabular-nums text-lg font-bold text-gravl-cyan">+{memberStats.avgStrengthScoreGrowth}</p>
                <p className="text-[10px] text-gravl-text-muted">Avg SS Growth</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Challenges */}
      <div>
        <h3 className="text-lg font-bold text-gravl-text mb-4">Challenges</h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {challenges.map((ch) => (
            <div key={ch.id} className={`gravl-card p-5 ${ch.status === 'ACTIVE' ? 'border-gravl-volt/20' : ''}`}>
              <div className="flex items-center justify-between mb-3">
                {metricIcon(ch.metric)}
                {statusBadge(ch.status)}
              </div>
              <h4 className="text-sm font-bold text-gravl-text mb-2">{ch.title}</h4>

              {ch.status === 'ACTIVE' && ch.currentValue !== undefined && (
                <div className="mb-3">
                  <div className="flex items-center justify-between text-xs mb-1">
                    <span className="text-gravl-text-secondary">Progress</span>
                    <span className="tabular-nums text-gravl-volt font-semibold">
                      {ch.currentValue} / {ch.targetValue}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/[0.06] rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gravl-volt rounded-full transition-all"
                      style={{ width: `${(ch.currentValue / ch.targetValue) * 100}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-2 text-xs text-gravl-text-secondary">
                <div className="flex items-center gap-2">
                  <Calendar size={12} />
                  <span>{ch.startDate} — {ch.endDate}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Users size={12} />
                  <span className="tabular-nums">{ch.participantsCount} participants</span>
                </div>
                <div className="flex items-center gap-2">
                  <Gift size={12} />
                  <span>{ch.rewardDescription}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Monthly Leaderboard */}
      <div className="gravl-card p-5">
        <div className="flex items-center gap-2 mb-4">
          <Medal size={18} className="text-gravl-volt" />
          <h3 className="text-lg font-bold text-gravl-text">Monthly Leaderboard</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/[0.06]">
                {['Rank', 'Member', 'Strength Score', 'Δ30d', 'Workouts', 'Volume (kg)'].map((h) => (
                  <th key={h} className="text-left px-4 py-3 text-[10px] font-semibold text-gravl-text-muted uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {leaderboard.map((entry) => (
                <tr key={entry.rank} className="border-b border-white/[0.03] hover:bg-white/[0.02] transition-colors">
                  <td className="px-4 py-3">
                    <span className={`tabular-nums text-sm font-bold ${
                      entry.rank <= 3 ? 'text-gravl-volt' : 'text-gravl-text-secondary'
                    }`}>
                      {entry.rank <= 3 ? ['🥇', '🥈', '🥉'][entry.rank - 1] : `#${entry.rank}`}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium text-gravl-text">{entry.name}</td>
                  <td className="px-4 py-3 tabular-nums text-sm font-bold text-gravl-cyan">{entry.strengthScore}</td>
                  <td className="px-4 py-3 tabular-nums text-sm text-gravl-emerald font-semibold">+{entry.delta}</td>
                  <td className="px-4 py-3 tabular-nums text-sm text-gravl-text">{entry.workouts}</td>
                  <td className="px-4 py-3 tabular-nums text-sm text-gravl-text-secondary">{entry.volume.toLocaleString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Challenge Creator Wizard Modal */}
      {showWizard && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/60" onClick={() => setShowWizard(false)}>
          <div className="liquid-glass-static p-6 max-w-lg w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold text-gravl-text mb-4">Create New Challenge</h3>

            <div className="space-y-4">
              <div>
                <label className="block text-xs text-gravl-text-secondary mb-1.5">Challenge Type</label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Consistency', desc: 'Workout count', icon: Target },
                    { label: 'Strength', desc: 'Score % gain', icon: TrendingUp },
                    { label: 'Volume', desc: 'Collective kg', icon: Dumbbell },
                  ].map((type) => {
                    const Icon = type.icon;
                    return (
                      <button key={type.label} className="gravl-card p-3 text-center hover:border-gravl-volt/20 transition-colors">
                        <Icon size={20} className="text-gravl-volt mx-auto mb-1" />
                        <p className="text-xs font-semibold text-gravl-text">{type.label}</p>
                        <p className="text-[9px] text-gravl-text-muted">{type.desc}</p>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs text-gravl-text-secondary mb-1.5">Challenge Name</label>
                <input
                  type="text"
                  placeholder="e.g., 16 Workouts in 30 Days"
                  className="w-full bg-gravl-surface border border-white/[0.09] rounded-xl px-4 py-2.5 text-sm text-gravl-text placeholder:text-gravl-text-muted focus:outline-none focus:border-gravl-volt/30"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gravl-text-secondary mb-1.5">Start Date</label>
                  <input
                    type="date"
                    className="w-full bg-gravl-surface border border-white/[0.09] rounded-xl px-4 py-2.5 text-sm text-gravl-text focus:outline-none focus:border-gravl-volt/30"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gravl-text-secondary mb-1.5">End Date</label>
                  <input
                    type="date"
                    className="w-full bg-gravl-surface border border-white/[0.09] rounded-xl px-4 py-2.5 text-sm text-gravl-text focus:outline-none focus:border-gravl-volt/30"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-gravl-text-secondary mb-1.5">Reward Description</label>
                <input
                  type="text"
                  placeholder="e.g., Free month, protein shake pack, merch..."
                  className="w-full bg-gravl-surface border border-white/[0.09] rounded-xl px-4 py-2.5 text-sm text-gravl-text placeholder:text-gravl-text-muted focus:outline-none focus:border-gravl-volt/30"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowWizard(false)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-white/[0.09] text-sm text-gravl-text-secondary hover:text-gravl-text hover:bg-white/[0.04] transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => setShowWizard(false)}
                className="flex-1 px-4 py-2.5 rounded-xl bg-gravl-volt text-gravl-canvas text-sm font-semibold hover:bg-gravl-volt-hover transition-colors flex items-center justify-center gap-2"
              >
                <Trophy size={14} />
                Launch Challenge
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

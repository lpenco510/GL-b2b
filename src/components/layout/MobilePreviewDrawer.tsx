'use client';

import React from 'react';
import { useApp } from '@/context/AppContext';
import { X, Smartphone, Dumbbell, Trophy, Bell as BellIcon, Flame } from 'lucide-react';
import { liveWorkoutFeed, organization, challenges } from '@/data/mockGravlB2B';

export default function MobilePreviewDrawer() {
  const { mobilePreviewOpen, setMobilePreviewOpen } = useApp();

  if (!mobilePreviewOpen) return null;

  return (
    <div className="fixed right-0 top-0 h-full z-50 w-[380px] flex flex-col border-l"
      style={{
        background: 'rgba(10, 12, 16, 0.95)',
        backdropFilter: 'blur(20px)',
        borderColor: 'rgba(255, 255, 255, 0.09)',
      }}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/[0.09]">
        <div className="flex items-center gap-2">
          <Smartphone size={16} className="text-gravl-cyan" />
          <span className="text-sm font-semibold text-gravl-text">Member App Live Preview</span>
        </div>
        <button
          onClick={() => setMobilePreviewOpen(false)}
          className="text-gravl-text-muted hover:text-gravl-text transition-colors"
        >
          <X size={18} />
        </button>
      </div>

      {/* Phone Frame */}
      <div className="flex-1 p-4 overflow-y-auto">
        <div
          className="rounded-[2.5rem] border-[3px] border-white/[0.12] overflow-hidden"
          style={{
            background: '#000',
            boxShadow: '0 0 40px rgba(0,0,0,0.5), inset 0 0 1px rgba(255,255,255,0.1)',
          }}
        >
          {/* Dynamic Island */}
          <div className="flex justify-center pt-3 pb-2">
            <div className="w-[120px] h-[34px] bg-black rounded-full border border-white/[0.05]" />
          </div>

          {/* App Content */}
          <div className="px-4 pb-6 space-y-4" style={{ background: '#0A0C10' }}>
            {/* App Header */}
            <div className="flex items-center justify-between pt-2">
              <div>
                <h3 className="text-base font-bold text-gravl-text">Hey, Sofía 👋</h3>
                <p className="text-xs text-gravl-text-muted">Ready to crush it today</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-gravl-volt/20 flex items-center justify-center">
                <span className="text-xs font-bold text-gravl-volt">SM</span>
              </div>
            </div>

            {/* Gym Badge */}
            <div className="gravl-card p-3">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded bg-gravl-volt flex items-center justify-center">
                  <span className="text-[8px] font-bold text-gravl-canvas">9F</span>
                </div>
                <div>
                  <p className="text-xs font-semibold text-gravl-text">{organization.name}</p>
                  <p className="text-[10px] text-gravl-text-muted">Sede Palermo • GRAVL Pro Active</p>
                </div>
              </div>
            </div>

            {/* Strength Score Ring */}
            <div className="gravl-card p-4 text-center">
              <div className="relative mx-auto w-24 h-24">
                <svg viewBox="0 0 100 100" className="w-full h-full -rotate-90">
                  <circle cx="50" cy="50" r="42" stroke="rgba(255,255,255,0.06)" strokeWidth="8" fill="none" />
                  <circle cx="50" cy="50" r="42" stroke="#38BDF8" strokeWidth="8" fill="none"
                    strokeDasharray={`${0.78 * 264} 264`}
                    strokeLinecap="round"
                  />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="tabular-nums text-xl font-bold text-gravl-cyan">245</span>
                  <span className="text-[9px] text-gravl-text-muted">Strength Score</span>
                </div>
              </div>
              <p className="text-xs text-gravl-emerald mt-2 font-medium">+14 pts this month ↑</p>
            </div>

            {/* Weekly Streak */}
            <div className="gravl-card p-3">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-1.5">
                  <Flame size={14} className="text-gravl-amber" />
                  <span className="text-xs font-semibold text-gravl-text">Week Streak</span>
                </div>
                <span className="text-xs tabular-nums text-gravl-volt font-bold">8 weeks 🔥</span>
              </div>
              <div className="flex gap-1">
                {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                  <div key={day} className="flex-1 text-center">
                    <div className={`w-full h-1.5 rounded-full mb-1 ${
                      i < 3 ? 'bg-gravl-volt' : i === 3 ? 'bg-gravl-volt/40' : 'bg-white/[0.06]'
                    }`} />
                    <span className="text-[8px] text-gravl-text-muted">{day}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-gravl-text-secondary mt-1.5">3 of 4 workouts completed</p>
            </div>

            {/* Active Challenge */}
            {challenges.filter(c => c.status === 'ACTIVE').slice(0, 1).map((ch) => (
              <div key={ch.id} className="gravl-card p-3 border-gravl-volt/20">
                <div className="flex items-center gap-1.5 mb-2">
                  <Trophy size={12} className="text-gravl-volt" />
                  <span className="text-[10px] font-semibold text-gravl-volt uppercase tracking-wider">Active Challenge</span>
                </div>
                <p className="text-xs font-semibold text-gravl-text">{ch.title}</p>
                <div className="mt-2 w-full bg-white/[0.06] rounded-full h-1.5">
                  <div
                    className="bg-gravl-volt h-1.5 rounded-full transition-all"
                    style={{ width: `${((ch.currentValue || 0) / ch.targetValue) * 100}%` }}
                  />
                </div>
                <p className="text-[10px] text-gravl-text-muted mt-1 tabular-nums">
                  {ch.currentValue} / {ch.targetValue} • {ch.participantsCount} participants
                </p>
              </div>
            ))}

            {/* Live Feed Preview */}
            <div className="gravl-card p-3">
              <div className="flex items-center gap-1.5 mb-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-gravl-ping absolute inline-flex h-full w-full rounded-full bg-gravl-emerald opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-gravl-emerald" />
                </span>
                <span className="text-[10px] font-semibold text-gravl-text-secondary uppercase tracking-wider">Live Feed</span>
              </div>
              <div className="space-y-2">
                {liveWorkoutFeed.slice(0, 3).map((evt) => (
                  <div key={evt.id} className="flex items-center gap-2 text-[10px]">
                    <Dumbbell size={10} className="text-gravl-text-muted flex-shrink-0" />
                    <span className="text-gravl-text-secondary">
                      <span className="text-gravl-text font-medium">{evt.memberName}</span>
                      {' '}{evt.exercise}{' '}
                      <span className="tabular-nums font-semibold text-gravl-text">{evt.weight}{evt.unit}</span>
                      {evt.isPR && <span className="text-gravl-volt ml-1">🏆 PR!</span>}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Nudge Notification Preview */}
            <div className="gravl-card p-3 border-gravl-cyan/20">
              <div className="flex items-center gap-1.5 mb-1">
                <BellIcon size={12} className="text-gravl-cyan" />
                <span className="text-[10px] font-semibold text-gravl-cyan">Push Notification</span>
              </div>
              <p className="text-[10px] text-gravl-text">
                &quot;Your rack at {organization.name} misses you — we dialed back today&apos;s volume by 10% for an easy return session&quot;
              </p>
            </div>

            {/* Bottom nav mock */}
            <div className="flex items-center justify-around pt-3 pb-1 border-t border-white/[0.06]">
              {['Train', 'Progress', 'Social', 'Profile'].map((tab) => (
                <div key={tab} className="text-center">
                  <div className={`w-5 h-5 rounded mx-auto mb-0.5 ${tab === 'Train' ? 'bg-gravl-volt/20' : 'bg-white/[0.04]'}`} />
                  <span className={`text-[8px] ${tab === 'Train' ? 'text-gravl-volt font-semibold' : 'text-gravl-text-muted'}`}>{tab}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

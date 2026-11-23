'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard,
  Flame,
  Dumbbell,
  Users,
  QrCode,
  Building2,
  ChevronLeft,
  ChevronRight,
  Smartphone,
  Sparkles,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Command Center', icon: LayoutDashboard, badge: 'Live' },
  { href: '/retention', label: 'Retention & Nudges', icon: Flame, badge: '148' },
  { href: '/locations-equipment', label: 'Equipment & 3D Floor', icon: Dumbbell },
  { href: '/community', label: 'Community & Retos', icon: Users },
  { href: '/provisioning', label: 'QR Kit & ROI Billing', icon: QrCode },
  { href: '/corporate-coach', label: 'Corporate / Coach', icon: Building2 },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, mobilePreviewOpen, setMobilePreviewOpen } = useApp();
  const pathname = usePathname();

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300 select-none ${
        sidebarCollapsed ? 'w-[74px]' : 'w-[260px]'
      }`}
      style={{
        background: 'linear-gradient(180deg, rgba(14, 18, 25, 0.95) 0%, rgba(9, 12, 17, 0.98) 100%)',
        backdropFilter: 'blur(24px)',
        WebkitBackdropFilter: 'blur(24px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
      }}
    >
      {/* Brand Header */}
      <div className="flex items-center gap-3.5 px-5 h-[72px] border-b border-white/[0.07]">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#C6FF00] to-[#AEEA00] flex items-center justify-center shadow-[0_0_20px_rgba(198,255,0,0.35)] flex-shrink-0">
          <span className="text-[#080A0E] font-black text-xl tracking-tighter">G</span>
        </div>
        {!sidebarCollapsed && (
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-black text-white tracking-widest uppercase">GRAVL</h1>
              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-[#C6FF00]/15 text-[#C6FF00] border border-[#C6FF00]/30 tracking-wider">
                B2B OS
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] font-medium truncate mt-0.5">Enterprise Partner</p>
          </div>
        )}
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 py-5 px-3 space-y-1.5 overflow-y-auto">
        {!sidebarCollapsed && (
          <p className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-[#64748B]">
            Platform Modules
          </p>
        )}
        {navItems.map((item) => {
          const isActive = pathname === item.href || (pathname?.startsWith(item.href + '/') && item.href !== '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3.5 px-3.5 py-3 rounded-xl transition-all duration-200 group relative ${
                isActive
                  ? 'bg-gradient-to-r from-[#C6FF00]/15 to-[#C6FF00]/5 text-white font-semibold border border-[#C6FF00]/30 shadow-[0_0_25px_rgba(198,255,0,0.1)]'
                  : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.04] border border-transparent font-medium'
              }`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              {isActive && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-5 bg-[#C6FF00] rounded-r-full shadow-[0_0_10px_#C6FF00]" />
              )}
              <Icon
                size={19}
                className={`flex-shrink-0 transition-colors ${
                  isActive ? 'text-[#C6FF00]' : 'text-[#64748B] group-hover:text-white'
                }`}
              />
              {!sidebarCollapsed && (
                <div className="flex items-center justify-between flex-1 min-w-0">
                  <span className="text-xs truncate tracking-wide">{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full tabular-nums ${
                        item.badge === 'Live'
                          ? 'bg-[#22C55E]/15 text-[#22C55E] border border-[#22C55E]/30 animate-pulse'
                          : 'bg-white/[0.08] text-[#94A3B8]'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="p-3 border-t border-white/[0.07] space-y-2">
        <button
          onClick={() => setMobilePreviewOpen(!mobilePreviewOpen)}
          className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl transition-all duration-200 ${
            mobilePreviewOpen
              ? 'bg-[#38BDF8]/15 text-[#38BDF8] border border-[#38BDF8]/30 shadow-[0_0_20px_rgba(56,189,248,0.2)]'
              : 'text-[#94A3B8] hover:text-white hover:bg-white/[0.04] border border-white/[0.05]'
          }`}
          title={sidebarCollapsed ? 'Member App Live Preview' : undefined}
        >
          <Smartphone size={18} className={mobilePreviewOpen ? 'text-[#38BDF8]' : 'text-[#64748B]'} />
          {!sidebarCollapsed && (
            <div className="flex items-center justify-between flex-1 text-left">
              <span className="text-xs font-semibold">Live App Preview</span>
              <Sparkles size={12} className="text-[#38BDF8]" />
            </div>
          )}
        </button>

        <button
          onClick={toggleSidebar}
          className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-xl text-[#64748B] hover:text-white hover:bg-white/[0.04] transition-all duration-200 text-xs font-medium"
        >
          {sidebarCollapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
          {!sidebarCollapsed && <span>Colapsar Menú</span>}
        </button>
      </div>
    </aside>
  );
}

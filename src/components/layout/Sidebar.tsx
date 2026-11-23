'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import {
  LayoutDashboard,
  Bell,
  Dumbbell,
  Users,
  QrCode,
  Building2,
  ChevronLeft,
  ChevronRight,
  Smartphone,
} from 'lucide-react';

const navItems = [
  { href: '/dashboard', label: 'Command Center', icon: LayoutDashboard },
  { href: '/retention', label: 'Retention & Nudges', icon: Bell },
  { href: '/locations-equipment', label: 'Equipment & Locations', icon: Dumbbell },
  { href: '/community', label: 'Community & Challenges', icon: Users },
  { href: '/provisioning', label: 'Provisioning & Billing', icon: QrCode },
  { href: '/corporate-coach', label: 'Corporate / Coach', icon: Building2 },
];

export default function Sidebar() {
  const { sidebarCollapsed, toggleSidebar, mobilePreviewOpen, setMobilePreviewOpen } = useApp();
  const pathname = usePathname();

  return (
    <aside
      className={`fixed left-0 top-0 h-full z-40 flex flex-col transition-all duration-300 ${
        sidebarCollapsed ? 'w-[72px]' : 'w-[260px]'
      }`}
      style={{
        background: 'rgba(17, 20, 26, 0.92)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderRight: '1px solid rgba(255, 255, 255, 0.09)',
      }}
    >
      {/* Logo */}
      <div className="flex items-center gap-3 px-5 py-5 border-b border-white/[0.09]">
        <div className="w-9 h-9 rounded-lg bg-gravl-volt flex items-center justify-center flex-shrink-0">
          <span className="text-gravl-canvas font-extrabold text-lg">G</span>
        </div>
        {!sidebarCollapsed && (
          <div className="overflow-hidden">
            <h1 className="text-sm font-bold text-gravl-text tracking-wide">GRAVL</h1>
            <p className="text-[10px] text-gravl-text-muted uppercase tracking-widest">Partner OS</p>
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 py-4 px-3 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname?.startsWith(item.href + '/');
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group ${
                isActive
                  ? 'bg-gravl-volt/10 text-gravl-volt border border-gravl-volt/20'
                  : 'text-gravl-text-secondary hover:text-gravl-text hover:bg-white/[0.04] border border-transparent'
              }`}
              title={sidebarCollapsed ? item.label : undefined}
            >
              <Icon size={20} className={isActive ? 'text-gravl-volt' : 'text-gravl-text-muted group-hover:text-gravl-text-secondary'} />
              {!sidebarCollapsed && (
                <span className="text-sm font-medium truncate">{item.label}</span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Bottom Actions */}
      <div className="px-3 py-4 border-t border-white/[0.09] space-y-2">
        <button
          onClick={() => setMobilePreviewOpen(!mobilePreviewOpen)}
          className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg transition-all duration-200 ${
            mobilePreviewOpen
              ? 'bg-gravl-cyan/10 text-gravl-cyan border border-gravl-cyan/20'
              : 'text-gravl-text-secondary hover:text-gravl-text hover:bg-white/[0.04] border border-transparent'
          }`}
          title={sidebarCollapsed ? 'Mobile Preview' : undefined}
        >
          <Smartphone size={20} />
          {!sidebarCollapsed && <span className="text-sm font-medium">App Preview</span>}
        </button>

        <button
          onClick={toggleSidebar}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-gravl-text-muted hover:text-gravl-text-secondary hover:bg-white/[0.04] transition-all duration-200"
        >
          {sidebarCollapsed ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
          {!sidebarCollapsed && <span className="text-sm font-medium">Collapse</span>}
        </button>
      </div>
    </aside>
  );
}

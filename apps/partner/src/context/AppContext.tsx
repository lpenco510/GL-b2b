'use client';

import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import type {
  GymChallenge,
  GymMachine,
  LocationScope,
  NudgeRule,
} from '@gravl/domain';
import {
  challenges as seedChallenges,
  integrationCards,
  locations,
  nudgeRules as seedNudgeRules,
  REFERENCE_NOW,
  demoTenants,
} from '@gravl/mock-data';

export type ToastType = 'success' | 'info' | 'warning';

export interface Toast {
  id: string;
  message: string;
  type: ToastType;
  action?: { label: string; onClick: () => void };
}

interface AppContextType {
  // ─── UI ────────────────────────────────────────────
  /** Workspace (partner) activo. Su Deal define cómo se comporta el panel. */
  tenantId: string;
  setTenantId: (id: string) => void;
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  mobileNavOpen: boolean;
  setMobileNavOpen: (open: boolean) => void;
  mobilePreviewOpen: boolean;
  setMobilePreviewOpen: (open: boolean) => void;
  commandOpen: boolean;
  setCommandOpen: (open: boolean) => void;
  selectedLocationId: LocationScope;
  setSelectedLocationId: (id: LocationScope) => void;

  // ─── Toasts ────────────────────────────────────────
  toasts: Toast[];
  addToast: (message: string, type?: ToastType, action?: Toast['action']) => void;
  removeToast: (id: string) => void;

  // ─── Dominio (fuente única de verdad) ──────────────
  getMachineStatus: (machine: GymMachine) => GymMachine['status'];
  setMachineStatus: (machineId: string, status: GymMachine['status']) => void;
  nudgeRules: NudgeRule[];
  toggleNudgeRule: (id: string) => void;
  nudgedAt: Record<string, string>;
  markNudged: (userIds: string[]) => void;
  challenges: GymChallenge[];
  addChallenge: (c: GymChallenge) => void;
  connectedIntegrations: Set<string>;
  connectIntegration: (id: string) => void;

  // ─── Marca del partner (Configuración) ─────────────
  brandOverrides: Record<string, BrandOverride>;
  setBrandOverride: (tenantId: string, patch: BrandOverride) => void;
  resetBrand: (tenantId: string) => void;
}

export interface BrandOverride {
  name?: string;
  logoUrl?: string;
  isoUrl?: string;
  brandColor?: string;
  welcome?: string;
}

const BRAND_KEY = 'gravl-brand-overrides';

const AppContext = createContext<AppContextType | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used within AppProvider');
  return ctx;
}

const initialMachineStatus: Record<string, GymMachine['status']> = Object.fromEntries(
  locations.flatMap((l) => l.equipmentProfile.machines.map((m) => [m.machineId, m.status])),
);

export function AppProvider({ children }: { children: ReactNode }) {
  const [tenantId, setTenantId] = useState<string>(demoTenants[0].id);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [mobilePreviewOpen, setMobilePreviewOpen] = useState(false);
  const [commandOpen, setCommandOpen] = useState(false);
  const [selectedLocationId, setSelectedLocationId] = useState<LocationScope>('all');
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [machineStatus, setMachineStatusMap] = useState(initialMachineStatus);
  const [nudgeRules, setNudgeRules] = useState<NudgeRule[]>(seedNudgeRules);
  const [nudgedAt, setNudgedAt] = useState<Record<string, string>>({});
  const [challenges, setChallenges] = useState<GymChallenge[]>(seedChallenges);
  const [connectedIntegrations, setConnected] = useState<Set<string>>(
    () => new Set(integrationCards.filter((i) => i.status === 'connected').map((i) => i.id)),
  );
  const toastSeq = useRef(0);
  const [brandOverrides, setBrandOverrides] = useState<Record<string, BrandOverride>>({});

  // La marca personalizada se guarda en este navegador (en producción vive en el backend del partner).
  useEffect(() => {
    try {
      const raw = localStorage.getItem(BRAND_KEY);
      // eslint-disable-next-line react-hooks/set-state-in-effect
      if (raw) setBrandOverrides(JSON.parse(raw) as Record<string, BrandOverride>);
    } catch {
      /* almacenamiento no disponible: se usan los valores por defecto */
    }
  }, []);

  const persistBrand = useCallback((next: Record<string, BrandOverride>) => {
    try {
      localStorage.setItem(BRAND_KEY, JSON.stringify(next));
    } catch {
      /* cuota llena o modo privado: queda solo en esta sesión */
    }
  }, []);

  const setBrandOverride = useCallback(
    (tenantId: string, patch: BrandOverride) =>
      setBrandOverrides((prev) => {
        const next = { ...prev, [tenantId]: { ...prev[tenantId], ...patch } };
        persistBrand(next);
        return next;
      }),
    [persistBrand],
  );

  const resetBrand = useCallback(
    (tenantId: string) =>
      setBrandOverrides((prev) => {
        const next = { ...prev };
        delete next[tenantId];
        persistBrand(next);
        return next;
      }),
    [persistBrand],
  );

  const toggleSidebar = useCallback(() => setSidebarCollapsed((p) => !p), []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    (message: string, type: ToastType = 'success', action?: Toast['action']) => {
      const id = `toast_${++toastSeq.current}`;
      // Máximo 3 toasts visibles: los más viejos se descartan.
      setToasts((prev) => [...prev.slice(-2), { id, message, type, action }]);
      setTimeout(() => removeToast(id), action ? 7000 : 4500);
    },
    [removeToast],
  );

  const getMachineStatus = useCallback(
    (machine: GymMachine) => machineStatus[machine.machineId] ?? machine.status,
    [machineStatus],
  );

  const setMachineStatus = useCallback((machineId: string, status: GymMachine['status']) => {
    setMachineStatusMap((prev) => ({ ...prev, [machineId]: status }));
  }, []);

  const toggleNudgeRule = useCallback((id: string) => {
    setNudgeRules((prev) => prev.map((r) => (r.id === id ? { ...r, enabled: !r.enabled } : r)));
  }, []);

  const markNudged = useCallback((userIds: string[]) => {
    const ts = REFERENCE_NOW.toISOString();
    setNudgedAt((prev) => {
      const next = { ...prev };
      for (const id of userIds) next[id] = ts;
      return next;
    });
  }, []);

  const addChallenge = useCallback((c: GymChallenge) => setChallenges((prev) => [c, ...prev]), []);

  const connectIntegration = useCallback((id: string) => {
    setConnected((prev) => new Set(prev).add(id));
  }, []);

  const value = useMemo<AppContextType>(
    () => ({
      tenantId, setTenantId,
      sidebarCollapsed, toggleSidebar,
      mobileNavOpen, setMobileNavOpen,
      mobilePreviewOpen, setMobilePreviewOpen,
      commandOpen, setCommandOpen,
      selectedLocationId, setSelectedLocationId,
      toasts, addToast, removeToast,
      getMachineStatus, setMachineStatus,
      nudgeRules, toggleNudgeRule,
      nudgedAt, markNudged,
      challenges, addChallenge,
      connectedIntegrations, connectIntegration,
      brandOverrides, setBrandOverride, resetBrand,
    }),
    [
      tenantId, sidebarCollapsed, toggleSidebar, mobileNavOpen, mobilePreviewOpen, commandOpen,
      selectedLocationId, toasts, addToast, removeToast, getMachineStatus, setMachineStatus,
      nudgeRules, toggleNudgeRule, nudgedAt, markNudged, challenges, addChallenge,
      connectedIntegrations, connectIntegration, brandOverrides, setBrandOverride, resetBrand,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

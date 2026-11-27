'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useApp } from '@/context/AppContext';
import { locationName, members, nudgeTemplates } from '@gravl/mock-data';
import { inSegment, membersInScope, segmentCount, type MemberSegment } from '@gravl/mock-data';
import { cancelIntentLabel, nudgeDecisionFor, policyFor, type Deal } from '@gravl/domain';
import { useDeal } from '@/components/layout/useTenant';
import { daysSince, fmtInt, fmtPct, fmtRelative } from '@gravl/domain';
import { cn, tint } from '@gravl/ui';
import { Avatar, Badge, Button, Card, CardHeader, EmptyState, PageHeader, ProgressBar, Toggle } from '@gravl/ui';
import { Modal } from '@gravl/ui';
import MemberDrawer from '@/components/retention/MemberDrawer';
import NudgeComposer from '@/components/retention/NudgeComposer';
import { StatusBadge, StreakDots, riskColor } from '@/components/retention/memberUi';
import type { B2BMemberTelemetry } from '@gravl/domain';
import {
  AlertTriangle, ArrowDownUp, Bell, Check, Lock, Moon, PhoneCall, ChevronLeft, ChevronRight, Clock, Download, Flame, Search, Send,
  UserPlus, Users, Zap, type LucideIcon,
} from 'lucide-react';

const PAGE_SIZE = 25;

type SegmentDef = { key: MemberSegment; label: string; icon: LucideIcon; color: string; hint: string };
const SEG: Record<MemberSegment, SegmentDef> = {
  ALL: { key: 'ALL', label: 'Todos', icon: Users, color: 'var(--color-gravl-text-secondary)', hint: 'Socios con la app vinculada' },
  ON_FIRE: { key: 'ON_FIRE', label: 'On Fire', icon: Flame, color: 'var(--color-gravl-volt)', hint: '3+ sesiones y racha ≥4 sem.' },
  ACTIVE: { key: 'ACTIVE', label: 'Activos', icon: Zap, color: 'var(--color-gravl-emerald)', hint: 'Entrenaron en los últimos días' },
  NEEDS_NUDGE: { key: 'NEEDS_NUDGE', label: 'Necesitan nudge', icon: Bell, color: 'var(--color-gravl-amber)', hint: '5–13 días sin entrenar' },
  AT_RISK: { key: 'AT_RISK', label: 'En riesgo', icon: AlertTriangle, color: 'var(--color-gravl-crimson)', hint: '14+ días sin entrenar' },
  CANCEL_INTENT: { key: 'CANCEL_INTENT', label: 'Intención de baja', icon: PhoneCall, color: 'var(--color-gravl-crimson)', hint: 'Baja, débito rechazado o congelamiento' },
  DORMANT: { key: 'DORMANT', label: 'Protegidos', icon: Moon, color: 'var(--color-gravl-cyan)', hint: 'Abono fijo, no vienen · no se contactan' },
  NEW_JOINERS: { key: 'NEW_JOINERS', label: 'Altas < 5 sesiones', icon: UserPlus, color: 'var(--color-gravl-cyan)', hint: 'Primer mes bajo el hito' },
};
/** Qué segmentos importan depende de cómo gana plata el partner. */
const segmentsFor = (deal: Deal): SegmentDef[] =>
  (deal.planPolicies?.length
    ? (['ALL', 'ON_FIRE', 'NEEDS_NUDGE', 'AT_RISK', 'CANCEL_INTENT', 'DORMANT', 'NEW_JOINERS'] as const)
    : deal.monetization === 'BREAKAGE'
    ? (['ALL', 'ON_FIRE', 'ACTIVE', 'DORMANT', 'CANCEL_INTENT'] as const)
    : (['ALL', 'ON_FIRE', 'ACTIVE', 'NEEDS_NUDGE', 'AT_RISK', 'CANCEL_INTENT', 'NEW_JOINERS'] as const)
  ).map((k) => SEG[k]);

type SortKey = 'risk' | 'lastWorkout' | 'strength' | 'name';
const sortOptions: { value: SortKey; label: string }[] = [
  { value: 'risk', label: 'Riesgo de baja' },
  { value: 'lastWorkout', label: 'Última sesión' },
  { value: 'strength', label: 'Strength Score' },
  { value: 'name', label: 'Nombre' },
];


/** Lee intents de la URL (?segment=, ?member=) dentro de un Suspense para no bloquear el prerender. */
function UrlIntents({ onSegment, onMember }: { onSegment: (s: MemberSegment) => void; onMember: (m: B2BMemberTelemetry) => void }) {
  const params = useSearchParams();
  const segment = params.get('segment');
  const memberId = params.get('member');
  useEffect(() => {
    if (segment && segment in SEG) onSegment(segment as MemberSegment);
  }, [segment, onSegment]);
  useEffect(() => {
    const m = memberId ? members.find((x) => x.userId === memberId) : undefined;
    if (m) onMember(m);
  }, [memberId, onMember]);
  return null;
}

function exportCsv(rows: B2BMemberTelemetry[]) {
  const header = ['ID', 'Nombre', 'Sede', 'Estado', 'Riesgo %', 'Última sesión', 'Sesiones 30d', 'Racha (sem)', 'Strength Score', 'Δ30d'];
  const lines = rows.map((m) =>
    [m.userId, m.fullName, locationName(m.locationId), m.status, m.churnRisk, m.lastWorkoutAt.slice(0, 10), m.workoutsLast30Days, m.currentStreakWeeks, m.strengthScore, m.strengthScoreDelta30d]
      .map((v) => `"${String(v).replace(/"/g, '""')}"`)
      .join(','),
  );
  const url = URL.createObjectURL(new Blob([`﻿${[header.join(','), ...lines].join('\n')}`], { type: 'text/csv;charset=utf-8' }));
  const a = document.createElement('a');
  a.href = url;
  a.download = `gravl-socios-${new Date().toISOString().slice(0, 10)}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export default function RetentionPage() {
  const { selectedLocationId, addToast, nudgedAt, markNudged, nudgeRules, toggleNudgeRule } = useApp();
  const deal = useDeal();
  const segments = segmentsFor(deal);
  const decide = (m: B2BMemberTelemetry) => nudgeDecisionFor(m, deal, { lastNudgedAt: nudgedAt[m.userId] });
  const isNudgeable = (m: B2BMemberTelemetry) => decide(m).allowed;
  const [segment, setSegment] = useState<MemberSegment>('ALL');
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState<SortKey>('risk');
  const [page, setPage] = useState(0);
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [drawerMember, setDrawerMember] = useState<B2BMemberTelemetry | null>(null);
  const [bulkOpen, setBulkOpen] = useState(false);
  const [bulkTemplate, setBulkTemplate] = useState(nudgeTemplates[0].id);

  const scoped = useMemo(() => membersInScope(selectedLocationId), [selectedLocationId]);
  const total = scoped.length;

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const list = scoped.filter((m) => inSegment(m, segment, deal) && (!q || m.fullName.toLowerCase().includes(q)));
    const sorters: Record<SortKey, (a: B2BMemberTelemetry, b: B2BMemberTelemetry) => number> = {
      risk: (a, b) => b.churnRisk - a.churnRisk,
      lastWorkout: (a, b) => a.lastWorkoutAt.localeCompare(b.lastWorkoutAt),
      strength: (a, b) => b.strengthScore - a.strengthScore,
      name: (a, b) => a.fullName.localeCompare(b.fullName, 'es'),
    };
    return [...list].sort(sorters[sort]);
  }, [scoped, segment, query, sort, deal]);

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, pageCount - 1);
  const rows = filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE);
  const selectedMembers = filtered.filter((m) => selected.has(m.userId));
  const pageNudgeable = rows.filter((m) => isNudgeable(m) && !nudgedAt[m.userId]);
  const allPageSelected = pageNudgeable.length > 0 && pageNudgeable.every((m) => selected.has(m.userId));
  const nudgeableInSegment = filtered.filter((m) => isNudgeable(m) && !nudgedAt[m.userId]);

  const changeSegment = React.useCallback((s: MemberSegment) => {
    setSegment(s);
    setPage(0);
    setSelected(new Set());
  }, []);
  const openMember = React.useCallback((m: B2BMemberTelemetry) => setDrawerMember(m), []);

  const toggleRow = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const sendBulk = () => {
    const ids = selectedMembers.map((m) => m.userId);
    markNudged(ids);
    setSelected(new Set());
    setBulkOpen(false);
    addToast(`${fmtInt(ids.length)} nudges programados en el horario habitual de cada socio.`, 'success');
  };

  return (
    <div className="gravl-stagger space-y-6">
      <Suspense fallback={null}>
        <UrlIntents onSegment={changeSegment} onMember={openMember} />
      </Suspense>

      <PageHeader
        eyebrow="Retención"
        title={<>Socios<span className="text-gravl-text-muted">.</span></>}
        description="Quién entrena, quién se está enfriando y a quién conviene contactar hoy, según el plan de cada uno."
        actions={
          <Button icon={Download} onClick={() => exportCsv(filtered)} disabled={!filtered.length}>
            Exportar {fmtInt(filtered.length)}
          </Button>
        }
      />

      {/* Segmentos */}
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-[repeat(var(--n),minmax(0,1fr))]" style={{ '--n': segments.length } as React.CSSProperties} role="tablist" aria-label="Segmentos de socios">
        {segments.map((s) => {
          const count = segmentCount(selectedLocationId, s.key, deal);
          const active = segment === s.key;
          const Icon = s.icon;
          return (
            <button
              key={s.key}
              role="tab"
              aria-selected={active}
              onClick={() => changeSegment(s.key)}
              className={cn(
                'gravl-card gravl-card-interactive p-4 text-left',
                active && 'ring-1',
              )}
              style={active ? { borderColor: `${tint(s.color, 40)}`, boxShadow: `0 0 0 1px ${tint(s.color, 25)}, 0 12px 32px -12px ${tint(s.color, 25)}` } : undefined}
            >
              <span className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wide" style={{ color: s.color }}>
                  <Icon size={13} aria-hidden /> {s.label}
                </span>
                {s.key !== 'ALL' && (
                  <span className="tabular-nums text-[10px] text-gravl-text-muted">{fmtPct((count / Math.max(1, total)) * 100)}</span>
                )}
              </span>
              <span className="mt-2 block gravl-num text-[34px] text-gravl-text">{fmtInt(count)}</span>
              <span className="mt-0.5 block truncate text-[11px] text-gravl-text-muted">{s.hint}</span>
            </button>
          );
        })}
      </div>

      {/* Tabla */}
      <Card>
        <div className="flex flex-col gap-3 border-b border-gravl-text/[0.06] p-4 lg:flex-row lg:items-center">
          <label className="relative flex-1">
            <span className="sr-only">Buscar socios</span>
            <Search size={15} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gravl-text-muted" aria-hidden />
            <input
              type="search"
              value={query}
              onChange={(e) => {
                setQuery(e.target.value);
                setPage(0);
              }}
              placeholder="Buscar por nombre…"
              className="gravl-input pl-9"
            />
          </label>
          <label className="flex items-center gap-2 text-xs text-gravl-text-secondary">
            <ArrowDownUp size={14} aria-hidden />
            <span className="sr-only lg:not-sr-only">Ordenar por</span>
            <select value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="gravl-input w-auto py-2 text-xs font-semibold">
              {sortOptions.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>
          {nudgeableInSegment.length > 0 && selected.size === 0 && (
            <Button
              size="sm"
              variant="soft"
              icon={Send}
              onClick={() => {
                setSelected(new Set(nudgeableInSegment.map((m) => m.userId)));
                setBulkOpen(true);
              }}
            >
              Nudge a los {fmtInt(nudgeableInSegment.length)} pendientes
            </Button>
          )}
        </div>

        {selected.size > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gravl-volt/20 bg-gravl-volt/[0.06] px-4 py-2.5">
            <p className="text-xs font-semibold text-gravl-text">
              <span className="tabular-nums">{fmtInt(selected.size)}</span> socios seleccionados
            </p>
            <div className="flex gap-2">
              <Button size="sm" variant="ghost" onClick={() => setSelected(new Set())}>
                Limpiar
              </Button>
              <Button size="sm" variant="primary" icon={Send} onClick={() => setBulkOpen(true)}>
                Enviar nudge
              </Button>
            </div>
          </div>
        )}

        {rows.length === 0 ? (
          <EmptyState
            icon={Search}
            title="No hay socios en este filtro"
            description={query ? `Nada coincide con “${query}”. Probá con otro nombre o segmento.` : 'Cambiá de segmento o de sede para ver más socios.'}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px]">
              <caption className="sr-only">Socios del segmento seleccionado</caption>
              <thead>
                <tr className="border-b border-gravl-text/[0.06] text-left text-[10px] font-bold uppercase tracking-wider text-gravl-text-muted">
                  <th scope="col" className="w-10 px-4 py-3">
                    <input
                      type="checkbox"
                      aria-label="Seleccionar socios contactables de esta página"
                      checked={allPageSelected}
                      disabled={!pageNudgeable.length}
                      onChange={() =>
                        setSelected((prev) => {
                          const next = new Set(prev);
                          pageNudgeable.forEach((m) => (allPageSelected ? next.delete(m.userId) : next.add(m.userId)));
                          return next;
                        })
                      }
                      className="h-4 w-4 accent-[var(--color-gravl-volt)]"
                    />
                  </th>
                  <th scope="col" className="px-3 py-3">Socio</th>
                  {selectedLocationId === 'all' && <th scope="col" className="px-3 py-3">Sede</th>}
                  {deal.planPolicies && <th scope="col" className="px-3 py-3">Plan</th>}
                  <th scope="col" className="px-3 py-3">Racha</th>
                  <th scope="col" className="px-3 py-3">Última sesión</th>
                  <th scope="col" className="px-3 py-3">Sesiones 30 d</th>
                  <th scope="col" className="px-3 py-3">Strength Score</th>
                  <th scope="col" className="px-3 py-3">Riesgo</th>
                  <th scope="col" className="px-3 py-3">Estado</th>
                  <th scope="col" className="px-4 py-3 text-right"><span className="sr-only">Acción</span></th>
                </tr>
              </thead>
              <tbody>
                {rows.map((m) => {
                  const days = daysSince(m.lastWorkoutAt);
                  const nudged = nudgedAt[m.userId];
                  const decision = decide(m);
                  const canNudge = decision.allowed && !nudged;
                  return (
                    <tr
                      key={m.userId}
                      onClick={() => setDrawerMember(m)}
                      className={cn(
                        'gravl-row cursor-pointer border-b border-gravl-line',
                        selected.has(m.userId) && 'bg-gravl-volt/[0.04]',
                      )}
                    >
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          aria-label={`Seleccionar a ${m.fullName}`}
                          checked={selected.has(m.userId)}
                          disabled={!canNudge}
                          onChange={() => toggleRow(m.userId)}
                          className="h-4 w-4 accent-[var(--color-gravl-volt)] disabled:opacity-30"
                        />
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={m.fullName} size={32} />
                          <div className="min-w-0">
                            <button
                              className="truncate text-left text-sm font-semibold text-gravl-text hover:underline"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDrawerMember(m);
                              }}
                            >
                              {m.fullName}
                            </button>
                            <p className="text-[10px] text-gravl-text-muted">
                              {nudged ? (
                                <span className="text-gravl-emerald">Nudge enviado {fmtRelative(nudged)}</span>
                              ) : m.cancelIntent ? (
                                <span className="text-pink-400">{cancelIntentLabel[m.cancelIntent]}</span>
                              ) : m.macrosActive ? (
                                <span className="text-gravl-cyan">Gravl Macros</span>
                              ) : (
                                m.userId
                              )}
                            </p>
                          </div>
                        </div>
                      </td>
                      {selectedLocationId === 'all' && <td className="px-3 py-3 text-xs text-gravl-text-secondary">{locationName(m.locationId)}</td>}
                      {deal.planPolicies && (
                        <td className="px-3 py-3">
                          <Badge tone={policyFor(deal, m.planId).monetization === 'ATTENDANCE' ? 'volt' : 'neutral'}>{policyFor(deal, m.planId).plan?.label ?? '—'}</Badge>
                        </td>
                      )}
                      <td className="px-3 py-3"><StreakDots weeks={m.currentStreakWeeks} /></td>
                      <td className={cn('tabular-nums px-3 py-3 text-xs', days >= 14 ? 'font-semibold text-rose-400' : days >= 5 ? 'text-gravl-amber' : 'text-gravl-text-secondary')}>
                        {days === 0 ? 'Hoy' : days === 1 ? 'Ayer' : `Hace ${days} d`}
                      </td>
                      <td className="px-3 py-3">
                        <span className="tabular-nums text-sm font-semibold text-gravl-text">{m.workoutsLast30Days}</span>
                        <span className="ml-1.5 text-[10px] text-gravl-text-muted">{m.workoutsThisWeek}/{m.weeklyTarget} sem.</span>
                      </td>
                      <td className="px-3 py-3">
                        <span className="tabular-nums text-sm font-bold text-gravl-cyan">{m.strengthScore}</span>
                        <span className={cn('tabular-nums ml-1.5 text-xs', m.strengthScoreDelta30d >= 0 ? 'text-gravl-emerald' : 'text-rose-400')}>
                          {m.strengthScoreDelta30d >= 0 ? '+' : ''}
                          {m.strengthScoreDelta30d}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="flex w-24 items-center gap-2">
                          <ProgressBar value={m.churnRisk} color={riskColor(m.churnRisk)} label={`Riesgo ${m.churnRisk}%`} />
                          <span className="tabular-nums w-8 text-right text-[11px] font-bold" style={{ color: riskColor(m.churnRisk) }}>
                            {m.churnRisk}%
                          </span>
                        </div>
                      </td>
                      <td className="px-3 py-3"><StatusBadge status={m.status} /></td>
                      <td className="px-4 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                        {nudged ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-gravl-emerald">
                            <Check size={13} aria-hidden /> Enviado
                          </span>
                        ) : canNudge ? (
                          <Button size="sm" variant="soft" icon={decision.channel === 'STAFF' ? PhoneCall : Send} onClick={() => setDrawerMember(m)}>
                            {decision.channel === 'STAFF' ? 'Derivar' : 'Nudge'}
                          </Button>
                        ) : m.status !== 'ON_FIRE' && m.status !== 'ACTIVE' ? (
                          <span title={decision.reason} className="inline-flex items-center gap-1 text-[11px] text-gravl-text-muted">
                            <Lock size={12} aria-hidden /> <span className="max-w-[110px] truncate">{decision.reason}</span>
                          </span>
                        ) : null}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="flex flex-col items-center justify-between gap-3 px-4 py-3 text-xs text-gravl-text-muted sm:flex-row">
          <p className="tabular-nums">
            {filtered.length ? `${fmtInt(currentPage * PAGE_SIZE + 1)}–${fmtInt(Math.min(filtered.length, (currentPage + 1) * PAGE_SIZE))} de ${fmtInt(filtered.length)} socios` : '0 socios'}
          </p>
          <div className="flex items-center gap-1">
            <Button size="icon" variant="ghost" aria-label="Página anterior" disabled={currentPage === 0} onClick={() => setPage(currentPage - 1)}>
              <ChevronLeft size={16} />
            </Button>
            <span className="tabular-nums px-2">
              {currentPage + 1} / {pageCount}
            </span>
            <Button size="icon" variant="ghost" aria-label="Página siguiente" disabled={currentPage >= pageCount - 1} onClick={() => setPage(currentPage + 1)}>
              <ChevronRight size={16} />
            </Button>
          </div>
        </div>
      </Card>

      {/* Reglas automáticas */}
      <section>
        <CardHeader
          icon={Zap}
          title="Reglas automáticas de nudges"
          subtitle="Triggers sin código que despachan pushes con tu marca desde la app de GRAVL. Medimos cuántos socios vuelven en 72 h."
        />
        <div className="mt-4 grid grid-cols-1 gap-4 lg:grid-cols-3">
          {nudgeRules.map((rule) => (
            <Card key={rule.id} className={cn('flex flex-col p-5', rule.enabled && 'border-gravl-volt/20')}>
              <div className="flex items-start justify-between gap-3">
                <h4 className="flex items-center gap-2 text-sm font-bold text-gravl-text">
                  <Zap size={15} className={rule.enabled ? 'text-gravl-volt' : 'text-gravl-text-muted'} aria-hidden />
                  {rule.name}
                </h4>
                <Toggle
                  checked={rule.enabled}
                  label={`${rule.enabled ? 'Desactivar' : 'Activar'} ${rule.name}`}
                  onChange={() => {
                    toggleNudgeRule(rule.id);
                    addToast(`${rule.name} ${rule.enabled ? 'pausada' : 'activada'}. Cambios sincronizados con el Push Engine.`, rule.enabled ? 'warning' : 'success');
                  }}
                />
              </div>
              <p className="mt-2 flex-1 text-xs leading-relaxed text-gravl-text-secondary">{rule.description}</p>
              {rule.recoveryRate > 0 && (
                <div className="mt-4">
                  <div className="mb-1.5 flex items-center justify-between text-[11px]">
                    <span className="text-gravl-text-muted">Socios que volvieron en 72 h</span>
                    <span className="tabular-nums font-bold text-gravl-emerald">{rule.recoveryRate}%</span>
                  </div>
                  <ProgressBar value={rule.recoveryRate} color="var(--color-gravl-emerald)" label="Tasa de recuperación" />
                </div>
              )}
              <div className="mt-4 flex items-center gap-4 border-t border-gravl-text/[0.05] pt-3 text-[11px] text-gravl-text-muted">
                <span className="flex items-center gap-1">
                  <Bell size={11} aria-hidden /> <span className="tabular-nums">{rule.triggerCount}</span> disparos
                </span>
                {rule.lastTriggered && (
                  <span className="flex items-center gap-1">
                    <Clock size={11} aria-hidden /> Último {fmtRelative(rule.lastTriggered)}
                  </span>
                )}
                {!rule.enabled && <Badge tone="neutral">Pausada</Badge>}
              </div>
            </Card>
          ))}
        </div>
      </section>

      <MemberDrawer member={drawerMember} onClose={() => setDrawerMember(null)} />

      <Modal
        open={bulkOpen}
        onClose={() => setBulkOpen(false)}
        title={`Enviar nudge a ${fmtInt(selectedMembers.length)} socios`}
        description="Cada socio recibe el mensaje personalizado con su nombre, en su horario habitual de entrenamiento."
        footer={
          <>
            <Button variant="ghost" onClick={() => setBulkOpen(false)}>
              Cancelar
            </Button>
            <Button variant="primary" icon={Send} onClick={sendBulk} disabled={!selectedMembers.length}>
              Programar {fmtInt(selectedMembers.length)} nudges
            </Button>
          </>
        }
      >
        <NudgeComposer templateId={bulkTemplate} onTemplate={setBulkTemplate} member={selectedMembers[0]} />
        <p className="mt-4 text-[11px] text-gravl-text-muted">
          Vista previa con {selectedMembers[0]?.fullName ?? 'el primer socio'}. Frecuencia máxima: 1 nudge cada 7 días por socio.
        </p>
      </Modal>
    </div>
  );
}

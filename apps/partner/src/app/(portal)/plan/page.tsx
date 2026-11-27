'use client';

import React, { useMemo, useState } from 'react';
import { useApp } from '@/context/AppContext';
import { integrationCards, locations, membersInScope, organization, qrFunnel, retentionCohorts } from '@gravl/mock-data';
import { fmtInt, fmtPct, fmtUsd } from '@gravl/domain';
import { cn } from '@gravl/ui';
import { Badge, Button, Card, CardHeader, Field, PageHeader, ProgressBar } from '@gravl/ui';
import { Modal } from '@gravl/ui';
import QrCode, { buildPosterSvg } from '@/components/plan/QrCode';
import DealCard from '@/components/plan/DealCard';
import type { IntegrationCard } from '@gravl/domain';
import { Calculator, Check, Copy, CreditCard, Download, Link2, Loader2, Plug, QrCode as QrIcon, ShieldCheck } from 'lucide-react';

function download(filename: string, content: string, type: string) {
  const url = URL.createObjectURL(new Blob([content], { type }));
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Simulador de ROI ────────────────────────────────────────────
const scenarios = [
  { key: 'conservador', label: 'Conservador', pts: 4 },
  { key: 'base', label: 'Base', pts: 7 },
  { key: 'optimista', label: 'Optimista', pts: 12 },
] as const;

function Slider({ id, label, value, display, min, max, step, onChange }: {
  id: string; label: string; value: number; display: string; min: number; max: number; step: number; onChange: (v: number) => void;
}) {
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <label htmlFor={id} className="text-xs font-semibold text-gravl-text-secondary">{label}</label>
        <span className="tabular-nums text-sm font-bold text-gravl-text">{display}</span>
      </div>
      <input id={id} type="range" min={min} max={max} step={step} value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full" />
    </div>
  );
}

function RoiSimulator() {
  const { addToast } = useApp();
  const [membersN, setMembersN] = useState(organization.activeSeats);
  const [fee, setFee] = useState(organization.avgMonthlyFeeUsd);
  const [cost, setCost] = useState(organization.pricePerSeatUsd);
  const [pts, setPts] = useState(7);

  const r = useMemo(() => {
    const retained = Math.round(membersN * (pts / 100));
    const revenue = retained * fee * 12;
    const annualCost = membersN * cost * 12;
    return {
      retained,
      revenue,
      annualCost,
      net: revenue - annualCost,
      multiple: annualCost ? revenue / annualCost : 0,
      paybackMonths: revenue ? (annualCost / revenue) * 12 : Infinity,
    };
  }, [membersN, fee, cost, pts]);

  const max = Math.max(r.revenue, r.annualCost) || 1;
  const summary = `Propuesta GRAVL para ${fmtInt(membersN)} socios (cuota ${fmtUsd(fee)}/mes): reteniendo ${pts} pts más de socios al año se conservan ${fmtInt(r.retained)} membresías = ${fmtUsd(r.revenue)}/año. Inversión GRAVL: ${fmtUsd(r.annualCost)}/año (${fmtUsd(cost)} por socio/mes). ROI ${r.multiple.toFixed(1).replace('.', ',')}x, repago en ${r.paybackMonths.toFixed(1).replace('.', ',')} meses.`;

  return (
    <Card glow="cyan" className="p-5 sm:p-6">
      <CardHeader
        icon={Calculator}
        iconColor="var(--color-gravl-cyan)"
        title="Simulador de ROI"
        subtitle="Herramienta de venta en vivo. Los benchmarks salen de las cohortes reales de la red, no de supuestos de marketing."
        action={
          <Button
            size="sm"
            icon={Copy}
            onClick={() => {
              navigator.clipboard?.writeText(summary).then(
                () => addToast('Resumen copiado. Pegalo en tu propuesta o mail.', 'success'),
                () => addToast('No pudimos acceder al portapapeles.', 'warning'),
              );
            }}
          >
            Copiar resumen
          </Button>
        }
      />

      <div className="mt-6 grid grid-cols-1 gap-8 lg:grid-cols-2">
        <div className="space-y-5">
          <Slider id="roi-members" label="Socios activos" value={membersN} display={fmtInt(membersN)} min={100} max={10000} step={50} onChange={setMembersN} />
          <Slider id="roi-fee" label="Cuota mensual promedio" value={fee} display={fmtUsd(fee)} min={15} max={200} step={5} onChange={setFee} />
          <Slider id="roi-cost" label="Costo GRAVL por socio / mes" value={cost} display={`US$ ${cost.toFixed(2).replace('.', ',')}`} min={1} max={6} step={0.25} onChange={setCost} />
          <div>
            <p className="mb-2 text-xs font-semibold text-gravl-text-secondary">Mejora de retención anual (pts)</p>
            <div className="grid grid-cols-3 gap-2" role="radiogroup" aria-label="Escenario">
              {scenarios.map((s) => (
                <button
                  key={s.key}
                  role="radio"
                  aria-checked={pts === s.pts}
                  onClick={() => setPts(s.pts)}
                  className={cn(
                    'rounded-xl border p-2.5 text-left transition-colors',
                    pts === s.pts ? 'border-gravl-cyan/50 bg-gravl-cyan/[0.08]' : 'border-gravl-text/[0.08] hover:border-gravl-text/[0.16]',
                  )}
                >
                  <span className="block text-xs font-bold text-gravl-text">{s.label}</span>
                  <span className="tabular-nums block text-[11px] text-gravl-text-muted">+{s.pts} pts</span>
                </button>
              ))}
            </div>
            <p className="mt-2 text-[11px] leading-relaxed text-gravl-text-muted">
              Referencia de la red: retención a 12 meses {retentionCohorts[12].withGravl}% con GRAVL vs {retentionCohorts[12].withoutGravl}% de la industria. Incluso el escenario optimista usa una fracción de esa brecha.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-gravl-volt/20 bg-gravl-volt/[0.05] p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gravl-text-muted">ROI</p>
              <p className="mt-1 gravl-num text-[40px] text-gravl-volt">{r.multiple.toFixed(1).replace('.', ',')}x</p>
            </div>
            <div className="rounded-xl border border-gravl-text/[0.08] bg-gravl-text/[0.02] p-4">
              <p className="text-[10px] font-bold uppercase tracking-wider text-gravl-text-muted">Repago</p>
              <p className="mt-1 gravl-num text-[40px] text-gravl-text">
                {Number.isFinite(r.paybackMonths) ? r.paybackMonths.toFixed(1).replace('.', ',') : '—'}
                <span className="ml-1 text-sm font-semibold text-gravl-text-muted">meses</span>
              </p>
            </div>
          </div>

          <div className="space-y-3 rounded-xl border border-gravl-text/[0.08] bg-gravl-text/[0.02] p-4">
            <div>
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="text-gravl-text-secondary">Ingreso retenido ({fmtInt(r.retained)} socios)</span>
                <span className="tabular-nums font-bold text-gravl-emerald">{fmtUsd(r.revenue)}</span>
              </div>
              <ProgressBar value={r.revenue} max={max} color="var(--color-gravl-emerald)" label="Ingreso retenido" className="h-2.5" />
            </div>
            <div>
              <div className="mb-1.5 flex justify-between text-xs">
                <span className="text-gravl-text-secondary">Inversión GRAVL</span>
                <span className="tabular-nums font-bold text-gravl-text">{fmtUsd(r.annualCost)}</span>
              </div>
              <ProgressBar value={r.annualCost} max={max} color="var(--color-gravl-text-muted)" label="Inversión GRAVL" className="h-2.5" />
            </div>
            <div className="flex items-center justify-between border-t border-gravl-text/[0.06] pt-3">
              <span className="text-xs font-semibold text-gravl-text-secondary">Beneficio neto anual</span>
              <span className={cn('tabular-nums text-lg font-black', r.net >= 0 ? 'text-gravl-volt' : 'text-rose-400')}>
                {r.net >= 0 ? '+' : ''}
                {fmtUsd(r.net)}
              </span>
            </div>
          </div>
          <p className="text-[11px] text-gravl-text-muted">No incluye upsell de Gravl Macros ni ahorro en staff de piso.</p>
        </div>
      </div>
    </Card>
  );
}

// ─── Integraciones ───────────────────────────────────────────────
function IntegrationModal({ integration, onClose }: { integration: IntegrationCard | null; onClose: () => void }) {
  const { connectIntegration, addToast } = useApp();
  const [key, setKey] = useState('');
  const [state, setState] = useState<'idle' | 'loading'>('idle');

  const connect = () => {
    if (!integration || key.trim().length < 8) return;
    setState('loading');
    setTimeout(() => {
      connectIntegration(integration.id);
      setState('idle');
      setKey('');
      onClose();
      addToast(`${integration.name} conectado. Primer sync de socios en curso.`, 'success');
    }, 1200);
  };

  return (
    <Modal
      open={!!integration}
      onClose={() => {
        setState('idle');
        onClose();
      }}
      title={`Conectar ${integration?.name ?? ''}`}
      description="Sincroniza altas, bajas y check-ins. Con auto-revocación, el acceso a GRAVL se corta cuando el socio da de baja su membresía."
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>Cancelar</Button>
          <Button variant="primary" icon={state === 'loading' ? Loader2 : Link2} onClick={connect} disabled={key.trim().length < 8 || state === 'loading'} className={state === 'loading' ? '[&>svg]:animate-spin' : undefined}>
            {state === 'loading' ? 'Conectando…' : 'Conectar'}
          </Button>
        </>
      }
    >
      <Field label="API key" htmlFor="int-key" hint="La encontrás en la configuración de desarrolladores de tu ERP. Se guarda cifrada.">
        <input id="int-key" type="password" autoComplete="off" value={key} onChange={(e) => setKey(e.target.value)} placeholder="sk_live_…" className="gravl-input font-mono" />
      </Field>
      <p className="mt-4 flex items-center gap-2 text-[11px] text-gravl-text-muted">
        <ShieldCheck size={13} className="text-gravl-cyan" aria-hidden /> Solo lectura de socios y estado de membresía. Nunca datos de pago.
      </p>
    </Modal>
  );
}

export default function PlanPage() {
  const { addToast, connectedIntegrations } = useApp();
  const [connecting, setConnecting] = useState<IntegrationCard | null>(null);
  // Activación por sede: vinculados ÷ socios del ERP (estimado por capacidad en la demo).
  const totalCap = locations.reduce((acc, l) => acc + l.floorCapacity, 0);
  const activation = locations
    .map((l) => ({
      id: l.id,
      name: l.shortName,
      pct: (membersInScope(l.id).length / ((organization.totalGymMembers * l.floorCapacity) / totalCap)) * 100,
    }))
    .sort((x, y) => x.pct - y.pct);

  return (
    <div className="gravl-stagger space-y-6">
      <PageHeader
        title="Acuerdo, Activación & ROI"
        description="Lo que acordamos, cómo activar socios y el retorno que te está dando GRAVL."
      />

      <DealCard />

      {/* QR kits */}
      <Card className="p-5 sm:p-6">
        <CardHeader
          icon={QrIcon}
          title="Kits QR por sede"
          subtitle="Imprimilos en recepción, espejos y racks. Cada escaneo asigna al socio a su sede y carga el inventario correcto."
        />
        <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-3">
          {locations.map((loc) => (
            <div key={loc.id} className="flex flex-col items-center rounded-2xl border border-gravl-text/[0.06] bg-gravl-text/[0.02] p-5 text-center">
              <div className="rounded-2xl bg-[var(--color-gravl-text)] p-2 shadow-[0_0_30px_rgba(198,255,0,0.12)]">
                <QrCode value={loc.qrDeepLink} size={148} />
              </div>
              <p className="mt-4 text-sm font-bold text-gravl-text">{loc.name}</p>
              <p className="mt-0.5 break-all font-mono text-[11px] text-gravl-text-muted">{loc.qrDeepLink.replace('https://', '')}</p>
              <div className="mt-4 flex gap-2">
                <Button
                  size="sm"
                  variant="soft"
                  icon={Download}
                  onClick={() => {
                    download(
                      `qr-${organization.slug}-${loc.shortName.toLowerCase()}.svg`,
                      buildPosterSvg({ gym: organization.name, location: loc.name, url: loc.qrDeepLink }),
                      'image/svg+xml',
                    );
                    addToast(`Póster A5 de ${loc.name} descargado (vectorial, listo para imprenta).`, 'success');
                  }}
                >
                  Póster
                </Button>
                <Button
                  size="sm"
                  icon={Copy}
                  aria-label={`Copiar link de ${loc.name}`}
                  onClick={() =>
                    navigator.clipboard?.writeText(loc.qrDeepLink).then(
                      () => addToast('Link copiado.', 'success'),
                      () => addToast('No pudimos acceder al portapapeles.', 'warning'),
                    )
                  }
                >
                  Link
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-6 rounded-2xl border border-gravl-text/[0.06] bg-gravl-text/[0.02] p-5">
          <p className="text-sm font-bold text-gravl-text">Embudo de activación · últimos 90 días</p>
          <ol className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-4">
            {qrFunnel.map((step, i) => {
              const conv = i === 0 ? 100 : (step.value / qrFunnel[i - 1].value) * 100;
              return (
                <li key={step.label} className="rounded-xl bg-gravl-text/[0.03] p-3">
                  <p className="text-[11px] font-semibold text-gravl-text-muted">{step.label}</p>
                  <p className="mt-1 gravl-num text-[30px] text-gravl-text">{fmtInt(step.value)}</p>
                  <div className="mt-2">
                    <ProgressBar value={step.value} max={qrFunnel[0].value} label={step.label} />
                  </div>
                  <p className="tabular-nums mt-1.5 text-[11px] text-gravl-text-secondary">
                    {i === 0 ? 'Punto de partida' : `${fmtPct(conv)} del paso anterior`}
                  </p>
                </li>
              );
            })}
          </ol>
        </div>
      </Card>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        {/* Activación por sede */}
        <Card className="flex flex-col p-5 sm:p-6 xl:col-span-5">
          <CardHeader
            icon={CreditCard}
            title="Activación por sede"
            subtitle="Socios que vincularon su cuenta GRAVL sobre el total de la sede según el ERP. Se paga solo por los activos."
          />
          <div className="mt-5 flex items-end justify-between">
            <p className="gravl-num text-[48px] text-gravl-text">
              {fmtPct((organization.activeSeats / organization.totalGymMembers) * 100)}
            </p>
            <p className="text-right text-xs text-gravl-text-muted">
              {fmtInt(organization.activeSeats)} de {fmtInt(organization.totalGymMembers)} socios
              <br />Meta del piloto: 25% al día 90
            </p>
          </div>
          <ul className="mt-5 space-y-2.5">
            {activation.map((a) => (
              <li key={a.id} className="group grid grid-cols-[96px_1fr_44px] items-center gap-3 text-[13px]">
                <span className="truncate font-medium text-gravl-text">{a.name}</span>
                <ProgressBar value={a.pct} max={40} color={a.pct >= 25 ? 'var(--color-gravl-text)' : 'var(--color-gravl-amber)'} label={`Activación ${a.name}`} />
                <span className="tabular-nums text-right text-gravl-text-secondary">{Math.round(a.pct)}%</span>
              </li>
            ))}
          </ul>
          <p className="mt-auto pt-5 text-xs text-gravl-text-muted">Las sedes debajo de la meta reciben kit QR para recepción y espejos.</p>
        </Card>

        {/* Integraciones */}
        <Card className="p-5 sm:p-6 xl:col-span-7">
          <CardHeader icon={Plug} iconColor="var(--color-gravl-cyan)" title="Integraciones" subtitle="Conectá tu ERP para altas y bajas automáticas, o tus canales para alertas del equipo." />
          <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
            {integrationCards.map((int) => {
              const connected = connectedIntegrations.has(int.id);
              return (
                <div key={int.id} className={cn('flex items-center gap-3 rounded-xl border p-3.5', connected ? 'border-gravl-emerald/25 bg-gravl-emerald/[0.04]' : 'border-gravl-text/[0.07] bg-gravl-text/[0.02]')}>
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-gravl-text/[0.1] bg-gravl-text/[0.04] text-xs font-black text-gravl-text">
                    {int.monogram}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-2 text-sm font-semibold text-gravl-text">
                      <span className="truncate">{int.name}</span>
                      <span className="text-[10px] font-medium text-gravl-text-muted">{int.category}</span>
                    </p>
                    <p className="truncate text-[11px] text-gravl-text-muted">{int.description}</p>
                  </div>
                  {connected ? (
                    <Badge tone="emerald" icon={Check}>Conectado</Badge>
                  ) : (
                    <Button size="sm" icon={Link2} onClick={() => setConnecting(int)}>
                      Conectar
                    </Button>
                  )}
                </div>
              );
            })}
          </div>
        </Card>
      </div>

      <RoiSimulator />
      <IntegrationModal integration={connecting} onClose={() => setConnecting(null)} />
    </div>
  );
}

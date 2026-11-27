'use client';

import React, { Suspense, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  approvalFor, effectiveUnitPrice, fmtInt, fmtMoney, fmtPct, fmtUsd, gravlGrossMargin, marketList, markets, monetizationLabel,
  monthlyInvoiceUsd, northStarLabel, partnerRoi, playbooks, pricingModelLabel, type MarketCode, type PartnerSegment, type Pricing, type Usage,
} from '@gravl/domain';
import { Badge, Button, Card, CardHeader, Field, PageHeader, ProgressBar, Toggle, cn } from '@gravl/ui';
import { Ban, Check, Copy, FileText, Scale, ShieldCheck, Target } from 'lucide-react';

const SEGMENTS = Object.keys(playbooks) as PartnerSegment[];
/** Mejora esperada por defecto: pts de retención anual (asistencia) o % de bajas evitadas (débito automático). */
const DEFAULT_LIFT: Record<PartnerSegment, number> = { BOUTIQUE: 7, REGIONAL_CHAIN: 6, HIGH_VOLUME: 1.5, CORPORATE: 0, COACH: 10 };

function Intents({ onLoad }: { onLoad: (p: { segment?: PartnerSegment; market?: MarketCode; eligible?: number; name?: string }) => void }) {
  const sp = useSearchParams();
  const key = sp.toString();
  useEffect(() => {
    if (!key) return;
    onLoad({
      segment: (sp.get('segment') as PartnerSegment) ?? undefined,
      market: (sp.get('market') as MarketCode) ?? undefined,
      eligible: sp.get('eligible') ? Number(sp.get('eligible')) : undefined,
      name: sp.get('name') ?? undefined,
    });
    // sp cambia de identidad con cada render; key es su contenido.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, onLoad]);
  return null;
}

export default function DealDeskPage() {
  const [name, setName] = useState('Nuevo partner');
  const [segment, setSegment] = useState<PartnerSegment>('REGIONAL_CHAIN');
  const [market, setMarket] = useState<MarketCode>('AR');
  const [eligible, setEligible] = useState(5000);
  const [activationPct, setActivationPct] = useState(30);
  const [fee, setFee] = useState(45);
  const [pricing, setPricing] = useState<Pricing>({ ...playbooks.REGIONAL_CHAIN.defaultPricing, discountPct: 0 });
  const [lift, setLift] = useState(DEFAULT_LIFT.REGIONAL_CHAIN);
  const [contactDormant, setContactDormant] = useState(true);
  const [copied, setCopied] = useState(false);

  const applySegment = (s: PartnerSegment) => {
    const pb = playbooks[s];
    setSegment(s);
    setPricing({ ...pb.defaultPricing, discountPct: 0 });
    setLift(DEFAULT_LIFT[s]);
    setContactDormant(pb.defaultContactPolicy.contactDormantPayers);
    setActivationPct(s === 'HIGH_VOLUME' ? 10 : s === 'CORPORATE' ? 60 : s === 'COACH' ? 100 : 30);
    setFee(s === 'HIGH_VOLUME' ? 22 : s === 'BOUTIQUE' ? 90 : 45);
  };

  const onLoad = React.useCallback((p: { segment?: PartnerSegment; market?: MarketCode; eligible?: number; name?: string }) => {
    if (p.segment && p.segment in playbooks) applySegment(p.segment);
    if (p.market && p.market in markets) setMarket(p.market);
    if (p.eligible) setEligible(p.eligible);
    if (p.name) setName(p.name);
  }, []);

  const pb = playbooks[segment];
  const m = markets[market];
  const breakage = pb.monetization === 'BREAKAGE';
  const activeUsers = Math.round((eligible * activationPct) / 100);

  const calc = useMemo(() => {
    const proUpsell = breakage ? activeUsers * 0.08 * 7.99 : 0;
    const usage: Usage = { activeUsers, eligible, locations: Math.max(1, Math.round(eligible / 1800)), coachClients: eligible, proUpsellRevenueUsd: proUpsell };
    const invoice = monthlyInvoiceUsd(pricing, usage);
    const margin = gravlGrossMargin(pricing, usage);
    const approval = approvalFor(pricing, margin);
    const roi = partnerRoi({ monetization: pb.monetization, pricing }, { members: eligible, avgMonthlyFeeUsd: fee, liftPts: lift }, usage);
    return { usage, invoice, margin, approval, roi };
  }, [pricing, activeUsers, eligible, fee, lift, breakage, pb.monetization]);

  const proposal = [
    `Propuesta GRAVL para ${name} (${m.flag} ${m.name})`,
    `Segmento: ${pb.label} · modelo ${monetizationLabel[pb.monetization].toLowerCase()} · métrica norte: ${northStarLabel[pb.northStar]}.`,
    `Precio: ${fmtUsd(effectiveUnitPrice(pricing))} ${pricingModelLabel[pricing.model]} (mínimo ${fmtUsd(pricing.minimumMonthlyUsd)}/mes), ${pricing.termMonths} meses.`,
    `Estimado mensual: ${fmtUsd(calc.invoice)} (${fmtMoney(calc.invoice * m.usdRate, market)} + ${m.vatPct ? `IVA ${m.vatPct}%` : 'impuestos locales'}).`,
    pricing.partnerRevSharePct ? `Revenue share del ${pricing.partnerRevSharePct}% sobre upsell a GRAVL Pro.` : '',
    `Política de contacto: ${contactDormant ? 'se reactiva a socios inactivos' : 'no se contacta a socios que pagan y no vienen'}.`,
    `Retorno estimado: ${calc.roi.multiple.toFixed(1)}x, repago en ${Number.isFinite(calc.roi.paybackMonths) ? calc.roi.paybackMonths.toFixed(1) : '—'} meses.`,
  ].filter(Boolean).join('\n');

  const setP = <K extends keyof Pricing>(k: K, v: Pricing[K]) => setPricing((p) => ({ ...p, [k]: v }));
  const approvalTone = calc.approval.level === 'AUTO' ? 'emerald' : calc.approval.level === 'HEAD_OF_SALES' ? 'amber' : 'crimson';

  return (
    <div className="gravl-stagger space-y-6">
      <Suspense fallback={null}><Intents onLoad={onLoad} /></Suspense>
      <PageHeader
        title="Deal Desk"
        description="Armá la oferta según cómo gana plata el partner. El precio sale del playbook; los descuentos fuera de política piden aprobación."
        actions={
          <Button
            variant="primary"
            icon={copied ? Check : Copy}
            onClick={() => navigator.clipboard?.writeText(proposal).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1800); })}
          >
            {copied ? 'Copiada' : 'Copiar propuesta'}
          </Button>
        }
      />

      <div role="radiogroup" aria-label="Segmento" className="grid grid-cols-2 gap-3 md:grid-cols-3 xl:grid-cols-5">
        {SEGMENTS.map((s) => {
          const p = playbooks[s];
          const active = s === segment;
          return (
            <button key={s} role="radio" aria-checked={active} onClick={() => applySegment(s)}
              className={cn('gravl-card gravl-card-interactive p-4 text-left', active && 'border-gravl-cyan/50')}>
              <p className={cn('text-sm font-bold', active ? 'text-gravl-cyan' : 'text-gravl-text')}>{p.label}</p>
              <p className="mt-1 text-[11px] text-gravl-text-muted">{monetizationLabel[p.monetization]}</p>
            </button>
          );
        })}
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Card className="space-y-5 p-5 sm:p-6 xl:col-span-5">
          <CardHeader icon={FileText} iconColor="var(--color-gravl-cyan)" title="Datos de la negociación" subtitle={pb.whoIsIt} />
          <div className="grid grid-cols-2 gap-4">
            <Field label="Partner" htmlFor="dd-name"><input id="dd-name" className="gravl-input" value={name} onChange={(e) => setName(e.target.value)} /></Field>
            <Field label="Mercado" htmlFor="dd-market">
              <select id="dd-market" className="gravl-input" value={market} onChange={(e) => setMarket(e.target.value as MarketCode)}>
                {marketList.map((x) => <option key={x.code} value={x.code}>{x.flag} {x.name}{x.status !== 'live' ? ` (${x.status})` : ''}</option>)}
              </select>
            </Field>
            <Field label={segment === 'CORPORATE' ? 'Empleados elegibles' : segment === 'COACH' ? 'Clientes' : 'Socios totales'} htmlFor="dd-el">
              <input id="dd-el" type="number" min={1} className="gravl-input tabular-nums" value={eligible} onChange={(e) => setEligible(Number(e.target.value))} />
            </Field>
            <Field label="Activación esperada (%)" htmlFor="dd-act" hint={`${fmtInt(activeUsers)} usuarios activos`}>
              <input id="dd-act" type="number" min={1} max={100} className="gravl-input tabular-nums" value={activationPct} onChange={(e) => setActivationPct(Number(e.target.value))} />
            </Field>
            <Field label="Cuota mensual del socio (USD)" htmlFor="dd-fee">
              <input id="dd-fee" type="number" min={1} className="gravl-input tabular-nums" value={fee} onChange={(e) => setFee(Number(e.target.value))} />
            </Field>
            <Field label={breakage ? 'Bajas evitadas (% anual)' : 'Mejora de retención (pts)'} htmlFor="dd-lift" hint="Conservador: menos de lo que mostró la red">
              <input id="dd-lift" type="number" step={0.5} min={0} className="gravl-input tabular-nums" value={lift} onChange={(e) => setLift(Number(e.target.value))} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-4 border-t border-gravl-text/[0.06] pt-5">
            <Field label={`Precio lista (${pricingModelLabel[pricing.model]})`} htmlFor="dd-price">
              <input id="dd-price" type="number" step={0.1} min={0} className="gravl-input tabular-nums" value={pricing.unitPriceUsd} onChange={(e) => setP('unitPriceUsd', Number(e.target.value))} />
            </Field>
            <Field label="Descuento (%)" htmlFor="dd-disc">
              <input id="dd-disc" type="number" min={0} max={60} className="gravl-input tabular-nums" value={pricing.discountPct} onChange={(e) => setP('discountPct', Number(e.target.value))} />
            </Field>
            <Field label="Plazo (meses)" htmlFor="dd-term">
              <select id="dd-term" className="gravl-input" value={pricing.termMonths} onChange={(e) => setP('termMonths', Number(e.target.value))}>
                {[1, 6, 12, 24, 36].map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
            </Field>
            <Field label="Mínimo mensual (USD)" htmlFor="dd-min">
              <input id="dd-min" type="number" min={0} className="gravl-input tabular-nums" value={pricing.minimumMonthlyUsd} onChange={(e) => setP('minimumMonthlyUsd', Number(e.target.value))} />
            </Field>
          </div>

          <div className="flex items-center justify-between gap-4 rounded-xl border border-gravl-text/[0.07] bg-gravl-text/[0.02] p-3">
            <div>
              <p className="text-xs font-semibold text-gravl-text">Reactivar socios que pagan y no vienen</p>
              <p className="text-[11px] text-gravl-text-muted">{breakage ? 'En low-cost el default es NO: les llena la sala y dispara bajas.' : 'En modelo asistencia es la palanca principal.'}</p>
            </div>
            <Toggle checked={contactDormant} onChange={setContactDormant} label="Reactivar durmientes" />
          </div>
        </Card>

        <div className="space-y-5 xl:col-span-7">
          <Card glow="cyan" className="p-5 sm:p-6">
            <CardHeader icon={Scale} iconColor="var(--color-gravl-cyan)" title="Números de GRAVL" action={<Badge tone={approvalTone}>{calc.approval.level === 'AUTO' ? 'Aprobación automática' : calc.approval.level === 'HEAD_OF_SALES' ? 'Aprueba Head of Sales' : 'Aprueba CEO'}</Badge>} />
            <div className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
              {[
                { l: 'Factura mensual', v: fmtUsd(calc.invoice), s: fmtMoney(calc.invoice * m.usdRate, market, { compact: true }) },
                { l: 'ARR del deal', v: fmtUsd(calc.invoice * 12), s: `${pricing.termMonths} meses` },
                { l: 'Margen bruto', v: fmtPct(calc.margin * 100), s: 'piso 60%', c: calc.margin >= 0.6 ? 'var(--color-gravl-emerald)' : 'var(--color-gravl-crimson)' },
                { l: 'Precio efectivo', v: fmtUsd(effectiveUnitPrice(pricing)), s: pricingModelLabel[pricing.model] },
              ].map((k) => (
                <div key={k.l} className="rounded-xl border border-gravl-text/[0.07] bg-gravl-text/[0.02] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gravl-text-muted">{k.l}</p>
                  <p className="mt-1 gravl-num text-[28px]" style={{ color: k.c ?? 'var(--color-gravl-text)' }}>{k.v}</p>
                  <p className="text-[11px] text-gravl-text-muted">{k.s}</p>
                </div>
              ))}
            </div>
            <p className="mt-3 text-[11px] text-gravl-text-muted">{calc.approval.reason}. {m.notes}</p>
          </Card>

          <Card className="p-5 sm:p-6">
            <CardHeader icon={Target} title="Números del partner" subtitle={`Lo que va en la primera slide: “${pb.pitch}”`} />
            <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-3">
                <div>
                  <div className="mb-1.5 flex justify-between text-xs"><span className="text-gravl-text-secondary">{breakage ? 'Bajas evitadas + revenue share' : `Ingreso retenido (${fmtInt(calc.roi.retainedMembers)} socios)`}</span><span className="tabular-nums font-bold text-gravl-emerald">{fmtUsd(calc.roi.retainedRevenue + calc.roi.revShare)}</span></div>
                  <ProgressBar value={calc.roi.retainedRevenue + calc.roi.revShare} max={Math.max(calc.roi.retainedRevenue + calc.roi.revShare, calc.roi.annualCost) || 1} color="var(--color-gravl-emerald)" className="h-2.5" />
                </div>
                <div>
                  <div className="mb-1.5 flex justify-between text-xs"><span className="text-gravl-text-secondary">Inversión anual en GRAVL</span><span className="tabular-nums font-bold text-gravl-text">{fmtUsd(calc.roi.annualCost)}</span></div>
                  <ProgressBar value={calc.roi.annualCost} max={Math.max(calc.roi.retainedRevenue + calc.roi.revShare, calc.roi.annualCost) || 1} color="var(--color-gravl-text-muted)" className="h-2.5" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="rounded-xl border border-gravl-volt/20 bg-gravl-volt/[0.05] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gravl-text-muted">ROI</p>
                  <p className="gravl-num text-[34px] text-gravl-volt">{calc.roi.multiple.toFixed(1)}x</p>
                </div>
                <div className="rounded-xl border border-gravl-text/[0.07] bg-gravl-text/[0.02] p-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gravl-text-muted">Repago</p>
                  <p className="gravl-num text-[34px] text-gravl-text">{Number.isFinite(calc.roi.paybackMonths) ? calc.roi.paybackMonths.toFixed(1) : '—'}<span className="ml-1 text-xs text-gravl-text-muted">m</span></p>
                </div>
              </div>
            </div>
            {segment === 'CORPORATE' && (
              <p className="mt-4 text-[11px] text-gravl-text-muted">Corporate no se vende por retención: el argumento es participación del beneficio y costo por empleado activo.</p>
            )}
          </Card>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Card className="p-5">
              <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-gravl-emerald"><ShieldCheck size={14} aria-hidden /> Qué vendemos</p>
              <ul className="space-y-1.5">{pb.whatTheyBuy.map((w) => <li key={w} className="flex gap-2 text-xs text-gravl-text-secondary"><Check size={13} className="mt-px shrink-0 text-gravl-emerald" aria-hidden />{w}</li>)}</ul>
            </Card>
            <Card className="p-5">
              <p className="mb-3 flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-rose-400"><Ban size={14} aria-hidden /> Qué NO vendemos</p>
              <p className="text-xs text-gravl-text-secondary">{pb.whatWeDontSell}</p>
              <p className="mt-3 text-xs text-gravl-text-secondary">Nunca: trabas a la baja del socio, venta de datos, ni uso de datos de salud para segmentar ofertas.</p>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
}

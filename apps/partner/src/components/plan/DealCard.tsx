'use client';

import React from 'react';
import { useTenant } from '@/components/layout/useTenant';
import { organization } from '@gravl/mock-data';
import {
  fmtDateLong, fmtInt, fmtPct, markets, monetizationLabel, northStarLabel, playbooks,
} from '@gravl/domain';
import { Badge, Card, CardHeader } from '@gravl/ui';
import { Check, FileSignature, Lock, MessageSquareOff } from 'lucide-react';

/** El acuerdo negociado, tal como lo ve el partner. Solo lectura: lo edita GRAVL en la consola. */
export default function DealCard() {
  const tenant = useTenant();
  const { deal } = tenant;
  const pb = playbooks[deal.segment];
  const market = markets[deal.market];
  const p = deal.contactPolicy;
  const activation = (organization.activeSeats / organization.totalGymMembers) * 100;

  return (
    <Card glow="volt" className="p-5 sm:p-6" id="acuerdo">
      <CardHeader
        icon={FileSignature}
        title="Tu acuerdo con GRAVL"
        subtitle={`Firmado el ${fmtDateLong(deal.signedAt)} · renueva el ${fmtDateLong(deal.renewsAt)}. Para cambiarlo, hablá con tu account manager.`}
        action={
          <>
            <Badge tone="volt">{pb.label}</Badge>
            <Badge>{market.flag} {market.name}</Badge>
          </>
        }
      />

      <div className={`mt-5 grid grid-cols-1 gap-4 ${deal.planPolicies ? "lg:grid-cols-2" : "lg:grid-cols-3"}`}>
        <div className="rounded-xl border border-gravl-text/[0.07] bg-gravl-text/[0.02] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gravl-text-muted">Qué optimizamos</p>
          <p className="mt-1.5 text-base font-bold text-gravl-text">{northStarLabel[deal.northStar]}</p>
          <p className="mt-1 text-xs text-gravl-text-secondary">Modelo de negocio: {monetizationLabel[deal.monetization].toLowerCase()}.</p>
          <ul className="mt-3 space-y-1.5">
            {pb.whatTheyBuy.map((w) => (
              <li key={w} className="flex items-start gap-2 text-xs text-gravl-text-secondary">
                <Check size={13} className="mt-px shrink-0 text-gravl-volt" aria-hidden /> {w}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-gravl-line p-4">
          <p className="gravl-label">Cómo se cobra</p>
          <p className="mt-1.5 text-base font-semibold text-gravl-text">Por socio que usa la app, cada mes</p>
          <p className="mt-1 text-[13px] text-gravl-text-secondary">El socio que no activa GRAVL no se paga. Monto, mínimo y plazo: a definir en la negociación.</p>
          <dl className="mt-3 space-y-1.5 text-[13px]">
            <div className="flex justify-between gap-3"><dt className="text-gravl-text-muted">Facturación</dt><dd className="text-right text-gravl-text">{market.quoteCurrency === 'USD' ? `Cotiza en USD, factura en ${market.currency}` : market.currency} · {market.fiscalInvoice}</dd></div>
            {deal.pricing.partnerRevSharePct > 0 && (
              <div className="flex justify-between"><dt className="text-gravl-text-muted">Revenue share de Pro</dt><dd className="text-gravl-text">Sí</dd></div>
            )}
          </dl>
          {tenant.vertical === 'GYM_CHAIN' && (
            <p className="mt-3 border-t border-gravl-line pt-3 text-xs text-gravl-text-muted">
              Hoy: {fmtInt(organization.activeSeats)} de {fmtInt(organization.totalGymMembers)} socios usan GRAVL ({fmtPct(activation)} de activación).
            </p>
          )}
        </div>
{!deal.planPolicies && (
        <div className="rounded-xl border border-gravl-text/[0.07] bg-gravl-text/[0.02] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gravl-text-muted">Política de contacto</p>
          <ul className="mt-2 space-y-2 text-xs text-gravl-text-secondary">
            <li className="flex items-start gap-2">
              {p.contactDormantPayers ? <Check size={13} className="mt-px shrink-0 text-gravl-emerald" aria-hidden /> : <MessageSquareOff size={13} className="mt-px shrink-0 text-gravl-cyan" aria-hidden />}
              {p.contactDormantPayers
                ? `Se reactiva a socios con ${p.dormantAfterDays}+ días sin entrenar.`
                : `No se contacta a quien paga y no viene (${p.dormantAfterDays}+ días).`}
            </li>
            <li className="flex items-start gap-2"><Check size={13} className="mt-px shrink-0 text-gravl-emerald" aria-hidden /> Máximo {p.maxNudgesPer30d} {p.maxNudgesPer30d === 1 ? 'mensaje' : 'mensajes'} cada 30 días por socio.</li>
            <li className="flex items-start gap-2"><Check size={13} className="mt-px shrink-0 text-gravl-emerald" aria-hidden /> Intención de baja: {p.cancelIntentHandler === 'STAFF' ? 'la atiende tu staff con una oferta' : 'push automático de retención'}.</li>
            {p.avoidPeakHours && <li className="flex items-start gap-2"><Check size={13} className="mt-px shrink-0 text-gravl-emerald" aria-hidden /> Nunca empujamos visitas a horarios saturados.</li>}
            <li className="flex items-start gap-2"><Lock size={13} className="mt-px shrink-0 text-gravl-text-muted" aria-hidden /> Solo socios que aceptaron mensajes de tu marca.</li>
          </ul>
        </div>
)}
      </div>

      {deal.planPolicies && (
        <div className="mt-5 overflow-hidden rounded-[var(--radius-gravl)] border border-gravl-line">
          <p className="gravl-label border-b border-gravl-line bg-gravl-text/[0.03] px-4 py-2.5">Política por plan de membresía</p>
          <div className="grid grid-cols-1 divide-y divide-gravl-line md:grid-cols-3 md:divide-x md:divide-y-0">
            {deal.planPolicies.map((pp) => (
              <div key={pp.planId} className="p-4">
                <div className="flex items-baseline justify-between gap-2">
                  <p className="gravl-num text-[28px] uppercase text-gravl-text">{pp.label}</p>
                  <Badge tone={pp.monetization === 'ATTENDANCE' ? 'volt' : 'neutral'}>
                    {pp.billing === 'BASE_PLUS_USAGE' ? 'Base + uso' : 'Abono fijo'}
                  </Badge>
                </div>
                <p className="mt-2 text-[13px] leading-relaxed text-gravl-text-secondary">{pp.rationale}</p>
                <p className="mt-3 text-xs font-semibold text-gravl-text">
                  {pp.contactPolicy.contactDormantPayers ? '✓ Se reactiva a quien deja de venir' : '✕ No se contacta a quien paga y no viene'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {deal.specialTerms.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {deal.specialTerms.map((t) => <Badge key={t} tone="neutral">{t}</Badge>)}
        </div>
      )}
    </Card>
  );
}

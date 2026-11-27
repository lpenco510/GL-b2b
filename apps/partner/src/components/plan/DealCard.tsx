'use client';

import React from 'react';
import { useTenant } from '@/components/layout/useTenant';
import { organization } from '@gravl/mock-data';
import {
  effectiveUnitPrice, fmtDateLong, fmtInt, fmtMoney, fmtPct, fmtUsd, markets, monetizationLabel, northStarLabel, playbooks, pricingModelLabel,
} from '@gravl/domain';
import { Badge, Card, CardHeader } from '@gravl/ui';
import { Check, FileSignature, Lock, MessageSquareOff } from 'lucide-react';

/** El acuerdo negociado, tal como lo ve el partner. Solo lectura: lo edita GRAVL en la consola. */
export default function DealCard() {
  const tenant = useTenant();
  const { deal } = tenant;
  const pb = playbooks[deal.segment];
  const market = markets[deal.market];
  const unit = effectiveUnitPrice(deal.pricing);
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

      <div className="mt-5 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gravl-text-muted">Qué optimizamos</p>
          <p className="mt-1.5 text-base font-bold text-white">{northStarLabel[deal.northStar]}</p>
          <p className="mt-1 text-xs text-gravl-text-secondary">Modelo de negocio: {monetizationLabel[deal.monetization].toLowerCase()}.</p>
          <ul className="mt-3 space-y-1.5">
            {pb.whatTheyBuy.map((w) => (
              <li key={w} className="flex items-start gap-2 text-xs text-gravl-text-secondary">
                <Check size={13} className="mt-px shrink-0 text-gravl-volt" aria-hidden /> {w}
              </li>
            ))}
          </ul>
        </div>

        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
          <p className="text-[10px] font-bold uppercase tracking-wider text-gravl-text-muted">Precio</p>
          <p className="tabular-nums mt-1.5 text-base font-bold text-white">
            {fmtUsd(unit)} <span className="text-xs font-medium text-gravl-text-secondary">{pricingModelLabel[deal.pricing.model]}</span>
          </p>
          <dl className="mt-3 space-y-1.5 text-xs">
            <div className="flex justify-between"><dt className="text-gravl-text-muted">Mínimo mensual</dt><dd className="tabular-nums text-white">{fmtUsd(deal.pricing.minimumMonthlyUsd)}</dd></div>
            {deal.pricing.partnerRevSharePct > 0 && (
              <div className="flex justify-between"><dt className="text-gravl-text-muted">Revenue share de Pro para vos</dt><dd className="tabular-nums text-gravl-volt">{deal.pricing.partnerRevSharePct}%</dd></div>
            )}
            <div className="flex justify-between"><dt className="text-gravl-text-muted">Plazo</dt><dd className="text-white">{deal.pricing.termMonths} meses</dd></div>
            <div className="flex justify-between"><dt className="text-gravl-text-muted">Facturación</dt><dd className="text-right text-white">{market.quoteCurrency === 'USD' ? `USD → ${market.currency}` : market.currency} · {market.fiscalInvoice}</dd></div>
            <div className="flex justify-between"><dt className="text-gravl-text-muted">Equivale hoy a</dt><dd className="tabular-nums text-white">{fmtMoney(unit * market.usdRate, deal.market)} / unidad</dd></div>
          </dl>
          {tenant.vertical === 'GYM_CHAIN' && (
            <p className="mt-3 border-t border-white/[0.06] pt-3 text-[11px] text-gravl-text-muted">
              Pagás por quien usa la app: {fmtInt(organization.activeSeats)} de {fmtInt(organization.totalGymMembers)} socios ({fmtPct(activation)} de activación).
            </p>
          )}
        </div>

        <div className="rounded-xl border border-white/[0.07] bg-white/[0.02] p-4">
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
      </div>

      {deal.specialTerms.length > 0 && (
        <div className="mt-4 flex flex-wrap gap-2">
          {deal.specialTerms.map((t) => <Badge key={t} tone="neutral">{t}</Badge>)}
        </div>
      )}
    </Card>
  );
}

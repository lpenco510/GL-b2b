'use client';

import React, { useState } from 'react';
import { portfolio, type PortfolioPartner } from '@gravl/mock-data';
import { REFERENCE_NOW, fmtInt, fmtPct, fmtUsd, fmtUsdCompact, markets, monetizationLabel, playbooks, type MarketCode } from '@gravl/domain';
import { Badge, Button, Card, KpiTile, PageHeader, ProgressBar, Segmented, type Tone } from '@gravl/ui';
import { Activity, CircleDollarSign, ExternalLink, Handshake, Users } from 'lucide-react';

const PARTNER_URL = process.env.NEXT_PUBLIC_PARTNER_URL ?? 'http://localhost:3000';

const stageMeta: Record<PortfolioPartner['stage'], { label: string; tone: Tone }> = {
  ACTIVE: { label: 'Activo', tone: 'emerald' },
  PILOT: { label: 'Piloto', tone: 'cyan' },
  AT_RISK: { label: 'En riesgo', tone: 'crimson' },
  NEGOTIATION: { label: 'Negociación', tone: 'amber' },
};

const healthColor = (h: number) => (h >= 75 ? '#22C55E' : h >= 60 ? '#F59E0B' : '#EF4444');

export default function PortfolioPage() {
  const [market, setMarket] = useState<MarketCode | 'ALL'>('ALL');
  const rows = portfolio.filter((p) => market === 'ALL' || p.market === market);
  const live = rows.filter((p) => p.mrrUsd > 0);
  const arr = live.reduce((a, p) => a + p.mrrUsd * 12, 0);
  const users = live.reduce((a, p) => a + p.activeUsers, 0);
  const nrr = live.length ? live.reduce((a, p) => a + p.nrr * p.mrrUsd, 0) / live.reduce((a, p) => a + p.mrrUsd, 0) : 0;
  const pipeline = rows.filter((p) => p.stage === 'NEGOTIATION');
  const renewalsSoon = live.filter((p) => {
    const diff = new Date(p.renewsAt).getTime() - REFERENCE_NOW.getTime();
    return diff > 0 && diff < 60 * 86_400_000;
  });
  const usedMarkets = [...new Set(portfolio.map((p) => p.market))];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Portafolio de partners"
        description="Toda la cartera B2B en un lugar: ingresos, salud de cada cuenta y renovaciones. Esta vista nunca se expone a un partner."
        actions={
          <Segmented<MarketCode | 'ALL'>
            label="Mercado"
            size="sm"
            value={market}
            onChange={setMarket}
            options={[{ value: 'ALL', label: 'Todos' }, ...usedMarkets.map((m) => ({ value: m, label: `${markets[m].flag} ${m}` }))]}
          />
        }
      />

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <KpiTile label="ARR" value={fmtUsdCompact(arr)} delta={`${live.length} cuentas con facturación`} deltaDirection="none" icon={CircleDollarSign} color="#38BDF8" glow="cyan" />
        <KpiTile label="Usuarios activos B2B" value={fmtInt(users)} delta="facturables este mes" deltaDirection="none" icon={Users} color="#C6FF00" />
        <KpiTile label="NRR ponderado" value={fmtPct(nrr)} delta={nrr >= 100 ? 'la base crece sola' : 'la base se achica'} deltaDirection={nrr >= 100 ? 'up' : 'down'} deltaGood={nrr >= 100} icon={Activity} color="#22C55E" />
        <KpiTile label="Pipeline" value={String(pipeline.length)} delta={`${fmtInt(pipeline.reduce((a, p) => a + p.eligible, 0))} socios elegibles`} deltaDirection="none" icon={Handshake} color="#F59E0B" />
      </div>

      {renewalsSoon.length > 0 && (
        <p className="rounded-xl border border-gravl-amber/25 bg-gravl-amber/[0.06] px-4 py-3 text-xs text-gravl-text-secondary">
          <span className="font-bold text-gravl-amber">Renovaciones en menos de 60 días:</span>{' '}
          {renewalsSoon.map((p) => `${p.name} (salud ${p.health})`).join(' · ')}. Revisar QBR antes de la fecha.
        </p>
      )}

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px]">
            <caption className="sr-only">Cartera de partners</caption>
            <thead>
              <tr className="border-b border-white/[0.06] text-left text-[10px] font-bold uppercase tracking-wider text-gravl-text-muted">
                <th scope="col" className="px-4 py-3">Partner</th>
                <th scope="col" className="px-3 py-3">Segmento · modelo</th>
                <th scope="col" className="px-3 py-3">Activación</th>
                <th scope="col" className="px-3 py-3 text-right">MRR</th>
                <th scope="col" className="px-3 py-3">Salud</th>
                <th scope="col" className="px-3 py-3 text-right">NRR</th>
                <th scope="col" className="px-3 py-3">Renueva</th>
                <th scope="col" className="px-3 py-3">Estado</th>
                <th scope="col" className="px-4 py-3 text-right"><span className="sr-only">Acciones</span></th>
              </tr>
            </thead>
            <tbody>
              {rows.map((p) => {
                const pb = playbooks[p.segment];
                const act = p.eligible ? (p.activeUsers / p.eligible) * 100 : 0;
                const viewable = ['p_9fitness', 'p_pulso', 'p_nimbus', 'p_fuerza'].includes(p.id);
                return (
                  <tr key={p.id} className="border-b border-white/[0.03] hover:bg-white/[0.02]">
                    <td className="px-4 py-3">
                      <p className="text-sm font-semibold text-white">{markets[p.market].flag} {p.name}</p>
                      <p className="text-[11px] text-gravl-text-muted">Owner: {p.owner}</p>
                    </td>
                    <td className="px-3 py-3 text-xs">
                      <p className="text-white">{pb.label}</p>
                      <p className="text-gravl-text-muted">{monetizationLabel[pb.monetization]}</p>
                    </td>
                    <td className="px-3 py-3">
                      <div className="w-32">
                        <ProgressBar value={act} label={`Activación ${Math.round(act)}%`} color="var(--color-gravl-cyan)" />
                        <p className="tabular-nums mt-1 text-[11px] text-gravl-text-muted">{fmtInt(p.activeUsers)} / {fmtInt(p.eligible)}</p>
                      </div>
                    </td>
                    <td className="tabular-nums px-3 py-3 text-right text-sm font-bold text-white">{p.mrrUsd ? fmtUsd(p.mrrUsd) : '—'}</td>
                    <td className="px-3 py-3">
                      {p.health ? (
                        <div className="flex w-24 items-center gap-2">
                          <ProgressBar value={p.health} color={healthColor(p.health)} label={`Salud ${p.health}`} />
                          <span className="tabular-nums text-xs font-bold" style={{ color: healthColor(p.health) }}>{p.health}</span>
                        </div>
                      ) : <span className="text-xs text-gravl-text-muted">—</span>}
                    </td>
                    <td className="tabular-nums px-3 py-3 text-right text-xs" style={{ color: p.nrr >= 100 ? '#22C55E' : p.nrr ? '#EF4444' : undefined }}>
                      {p.nrr ? `${p.nrr}%` : '—'}
                    </td>
                    <td className="tabular-nums px-3 py-3 text-xs text-gravl-text-secondary">{p.renewsAt}</td>
                    <td className="px-3 py-3"><Badge tone={stageMeta[p.stage].tone}>{stageMeta[p.stage].label}</Badge></td>
                    <td className="px-4 py-3 text-right">
                      {viewable ? (
                        <a href={PARTNER_URL} target="_blank" rel="noreferrer" title="Abre el portal en modo lectura (queda auditado)">
                          <Button size="sm" variant="ghost" icon={ExternalLink} tabIndex={-1}>Ver como partner</Button>
                        </a>
                      ) : p.stage === 'NEGOTIATION' ? (
                        <a href={`/deal-desk?segment=${p.segment}&market=${p.market}&eligible=${p.eligible}&name=${encodeURIComponent(p.name)}`}>
                          <Button size="sm" variant="soft" tabIndex={-1}>Cotizar</Button>
                        </a>
                      ) : null}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
      <p className="text-[11px] text-gravl-text-muted">
        Salud = uso semanal, tendencia de activación, tickets y pagos al día. NRR = ingreso de hoy de las cuentas de hace 12 meses / ingreso de entonces.
      </p>
    </div>
  );
}

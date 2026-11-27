'use client';

import React, { useRef, useState } from 'react';
import { useApp, type BrandOverride } from '@/context/AppContext';
import { useBranding, useTenant } from '@/components/layout/useTenant';
import { PartnerIso, PartnerLogo } from '@/components/layout/PartnerMark';
import { Badge, Button, Card, CardHeader, Field, PageHeader, cn } from '@gravl/ui';
import { Bell, ImageUp, KeyRound, Palette, RotateCcw, ShieldCheck, Trash2, Users } from 'lucide-react';

const MAX_BYTES = 300 * 1024;
const ALLOWED = ['image/png', 'image/jpeg', 'image/webp', 'image/svg+xml'];

/** Carga una imagen como data URL validando tipo y peso. Se muestra solo en <img>: un SVG no puede ejecutar scripts ahí. */
function readImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    if (!ALLOWED.includes(file.type)) return reject(new Error('Formato no soportado. Usá PNG, JPG, WebP o SVG.'));
    if (file.size > MAX_BYTES) return reject(new Error('La imagen pesa más de 300 KB.'));
    const r = new FileReader();
    r.onload = () => resolve(String(r.result));
    r.onerror = () => reject(new Error('No se pudo leer el archivo.'));
    r.readAsDataURL(file);
  });
}

function ImageField({ label, hint, value, onChange, wide }: { label: string; hint: string; value?: string; onChange: (v: string | undefined) => void; wide?: boolean }) {
  const ref = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string>();
  return (
    <div>
      <p className="mb-1.5 text-[13px] font-medium text-gravl-text-secondary">{label}</p>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => ref.current?.click()}
          className={cn(
            'group flex items-center justify-center overflow-hidden rounded-xl border-2 border-dashed border-gravl-line bg-white transition-[border-color,transform] duration-200 hover:-translate-y-0.5 hover:border-gravl-text/30',
            wide ? 'h-16 w-48' : 'h-16 w-16',
          )}
          aria-label={`Subir ${label.toLowerCase()}`}
        >
          {value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={value} alt="" className="max-h-[80%] max-w-[85%] object-contain" />
          ) : (
            <ImageUp size={18} className="text-gravl-ink/40 transition-transform duration-200 group-hover:scale-110" aria-hidden />
          )}
        </button>
        <div className="flex flex-col gap-1">
          <Button size="sm" variant="secondary" onClick={() => ref.current?.click()}>Subir</Button>
          {value && (
            <Button size="sm" variant="ghost" icon={Trash2} onClick={() => onChange(undefined)}>Quitar</Button>
          )}
        </div>
      </div>
      <input
        ref={ref}
        type="file"
        accept={ALLOWED.join(',')}
        className="sr-only"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          e.target.value = '';
          if (!f) return;
          try {
            setError(undefined);
            onChange(await readImage(f));
          } catch (err) {
            setError((err as Error).message);
          }
        }}
      />
      {error ? <p className="mt-1 text-xs font-medium text-gravl-crimson">{error}</p> : <p className="mt-1 text-xs text-gravl-text-muted">{hint}</p>}
    </div>
  );
}

const roles = [
  { name: 'Dirección', scope: 'Todas las sedes, acuerdo y reportes', users: 2 },
  { name: 'Gerente de sede', scope: 'Solo su sede: socios, equipamiento y retos', users: 12 },
  { name: 'Recepción', scope: 'Bandeja de bajas del día', users: 24 },
];

export default function SettingsPage() {
  const tenant = useTenant();
  const brand = useBranding();
  const { setBrandOverride, resetBrand, addToast } = useApp();
  const set = (patch: BrandOverride) => setBrandOverride(tenant.id, patch);

  return (
    <div className="gravl-stagger space-y-6">
      <PageHeader
        eyebrow="Cuenta"
        title={<>Configuración<span className="text-gravl-text-muted">.</span></>}
        description="Así se ve tu marca en el panel y en la app de tus socios. Los cambios se aplican al instante."
        actions={
          brand.customized ? (
            <Button
              icon={RotateCcw}
              onClick={() => {
                resetBrand(tenant.id);
                addToast('Marca restaurada a los valores originales.', 'info');
              }}
            >
              Restaurar original
            </Button>
          ) : undefined
        }
      />

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Card className="space-y-5 p-5 sm:p-6 xl:col-span-7">
          <CardHeader icon={Palette} title="Marca" subtitle="Co-branding: tu marca junto a la de GRAVL, nunca en su lugar." />
          <Field label="Nombre visible" htmlFor="brand-name">
            <input id="brand-name" className="gravl-input" maxLength={40} value={brand.name} onChange={(e) => set({ name: e.target.value })} />
          </Field>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <ImageField label="Logo horizontal" hint="PNG/SVG con fondo transparente · máx. 300 KB" value={brand.logoUrl} onChange={(v) => set({ logoUrl: v })} wide />
            <ImageField label="Isotipo (ícono)" hint="Cuadrado · se usa en el menú" value={brand.isoUrl} onChange={(v) => set({ isoUrl: v })} />
          </div>
          <Field label="Color de marca" htmlFor="brand-color" hint="Se usa en los detalles de co-branding; la interfaz sigue siendo GRAVL.">
            <div className="flex items-center gap-3">
              <input
                id="brand-color"
                type="color"
                value={brand.brandColor}
                onChange={(e) => set({ brandColor: e.target.value })}
                className="h-10 w-14 cursor-pointer rounded-lg border border-gravl-line bg-transparent p-1"
              />
              <input
                aria-label="Color en hexadecimal"
                className="gravl-input w-32 font-mono"
                value={brand.brandColor}
                maxLength={7}
                onChange={(e) => /^#[0-9a-fA-F]{0,6}$/.test(e.target.value) && set({ brandColor: e.target.value })}
              />
            </div>
          </Field>
          <Field label="Mensaje de bienvenida en la app" htmlFor="brand-welcome">
            <input id="brand-welcome" className="gravl-input" maxLength={90} value={brand.welcome} onChange={(e) => set({ welcome: e.target.value })} />
          </Field>
        </Card>

        <Card className="p-5 sm:p-6 xl:col-span-5">
          <CardHeader icon={Bell} title="Vista previa" subtitle="Así lo ven tu equipo y tus socios." />
          <div className="mt-5 space-y-4">
            <div className="rounded-xl border border-gravl-line p-4">
              <p className="gravl-label mb-3">Panel</p>
              <div className="flex items-center gap-3">
                <PartnerIso size={40} />
                <div>
                  <p className="text-[14px] font-semibold text-gravl-text">{brand.name}</p>
                  <p className="text-xs text-gravl-text-muted">{tenant.subtitle}</p>
                </div>
              </div>
              <div className="mt-3"><PartnerLogo height={22} /></div>
            </div>
            <div className="rounded-2xl bg-[#0b0b0d] p-4 text-white">
              <p className="mb-2 text-[10px] font-bold uppercase tracking-[0.06em] text-white/40">App del socio</p>
              <div className="rounded-xl bg-white p-3 text-[#080e18]">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.06em]" style={{ color: brand.brandColor }}>
                  <Bell size={11} aria-hidden /> {brand.name} · ahora
                </p>
                <p className="mt-1 text-[12px] leading-snug">{brand.welcome}</p>
              </div>
            </div>
          </div>
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 xl:grid-cols-12">
        <Card className="p-5 sm:p-6 xl:col-span-7">
          <CardHeader icon={Users} title="Usuarios y roles" subtitle="Cada persona entra con su cuenta y ve solo lo que su rol permite." action={<Badge tone="amber">Próxima versión</Badge>} />
          <ul className="mt-4 divide-y divide-gravl-line">
            {roles.map((r) => (
              <li key={r.name} className="gravl-row flex items-center justify-between gap-4 px-2 py-3">
                <div>
                  <p className="text-[14px] font-semibold text-gravl-text">{r.name}</p>
                  <p className="text-xs text-gravl-text-muted">{r.scope}</p>
                </div>
                <span className="tabular-nums text-[13px] text-gravl-text-secondary">{r.users} usuarios</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card className="p-5 sm:p-6 xl:col-span-5">
          <CardHeader icon={ShieldCheck} title="Seguridad" />
          <ul className="mt-4 space-y-2.5 text-[13px] text-gravl-text-secondary">
            <li className="flex gap-2"><KeyRound size={15} className="mt-0.5 shrink-0 text-gravl-text-muted" aria-hidden /> Sesión firmada (HMAC-SHA256) en cookie HttpOnly, vence a los 7 días.</li>
            <li className="flex gap-2"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-gravl-text-muted" aria-hidden /> Límite de 5 intentos de ingreso cada 10 minutos.</li>
            <li className="flex gap-2"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-gravl-text-muted" aria-hidden /> Headers de seguridad: CSP, HSTS, anti-iframe, sin indexación.</li>
            <li className="flex gap-2"><ShieldCheck size={15} className="mt-0.5 shrink-0 text-gravl-text-muted" aria-hidden /> Próximo: cuenta por usuario, MFA y registro de auditoría.</li>
          </ul>
          <form action="/api/auth/logout" method="post" className="mt-5">
            <Button type="submit" variant="secondary">Cerrar sesión</Button>
          </form>
        </Card>
      </div>
    </div>
  );
}

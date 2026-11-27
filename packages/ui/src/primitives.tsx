'use client';

import React, { useEffect, useId, useRef, useState } from 'react';
import { cn, tint } from './cn';
import { initials as toInitials } from '@gravl/domain';
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';

/*
 * Primitivas del design system GRAVL B2B.
 * Lenguaje: superficies planas, borde fino, cifras en Barlow Condensed,
 * etiquetas en mayúsculas. Movimiento solo en lo que se puede tocar.
 */

// ─── Card ────────────────────────────────────────────────────────
export function Card({
  className,
  interactive,
  children,
  // `glow` se mantiene por compatibilidad; ya no dibuja nada (la marca no usa brillos).
  glow: _glow,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { glow?: string; interactive?: boolean }) {
  void _glow;
  return (
    <div className={cn('gravl-card', interactive && 'gravl-card-interactive', className)} {...rest}>
      {children}
    </div>
  );
}

export function CardHeader({
  icon: Icon,
  iconColor,
  title,
  subtitle,
  action,
  className,
}: {
  icon?: LucideIcon;
  iconColor?: string;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('flex items-start justify-between gap-4', className)}>
      <div className="min-w-0 flex-1">
        <h3 className="flex items-center gap-2 text-[15px] font-semibold tracking-[-0.01em] text-gravl-text">
          {Icon && <Icon size={16} style={{ color: iconColor ?? 'var(--color-gravl-text-muted)' }} aria-hidden />}
          {title}
        </h3>
        {subtitle && <p className="mt-1 text-[13px] leading-snug text-gravl-text-muted">{subtitle}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}

// ─── Page header ─────────────────────────────────────────────────
/** Título de página: eyebrow en mayúsculas + titular Inter Tight bold muy ajustado, como gravl.ai. */
export function PageHeader({
  eyebrow,
  title,
  description,
  badge,
  actions,
}: {
  eyebrow?: React.ReactNode;
  title: React.ReactNode;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div className="min-w-0">
        {eyebrow && <p className="gravl-label mb-2">{eyebrow}</p>}
        <h1 className="flex flex-wrap items-center gap-3 text-[34px] font-bold leading-[1.02] tracking-[-0.035em] text-gravl-text sm:text-[42px]">
          <span>{title}</span>
          {badge}
        </h1>
        {description && <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-gravl-text-secondary">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

// ─── Badge ───────────────────────────────────────────────────────
const badgeTones = {
  volt: 'bg-gravl-lime/40 text-gravl-ink dark:bg-gravl-lime/15 dark:text-gravl-lime',
  cyan: 'bg-gravl-cyan/10 text-gravl-cyan',
  emerald: 'bg-gravl-emerald/10 text-gravl-emerald',
  amber: 'bg-gravl-amber/10 text-gravl-amber',
  crimson: 'bg-gravl-crimson/10 text-gravl-crimson',
  violet: 'bg-gravl-violet/10 text-gravl-violet',
  neutral: 'bg-gravl-text/[0.06] text-gravl-text-secondary',
  ink: 'bg-gravl-ink text-gravl-lime dark:bg-gravl-lime dark:text-gravl-ink',
} as const;
export type Tone = keyof typeof badgeTones;

export function Badge({ tone = 'neutral', icon: Icon, className, children }: { tone?: Tone; icon?: LucideIcon; className?: string; children: React.ReactNode }) {
  return (
    <span className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-md px-1.5 py-0.5 text-[11px] font-semibold tracking-[0.02em]', badgeTones[tone], className)}>
      {Icon && <Icon size={11} aria-hidden />}
      {children}
    </span>
  );
}

// ─── Button ──────────────────────────────────────────────────────
const btnVariants = {
  /** Lima con texto en tinta: la acción principal de la pantalla. Una por vista. */
  primary: 'bg-gravl-lime text-gravl-ink hover:bg-[#c3ee00] hover:-translate-y-px hover:shadow-[0_6px_16px_-6px_rgba(150,190,0,0.6)] shadow-[inset_0_-2px_0_rgba(8,14,24,0.12)]',
  /** Tinta sólida: acciones fuertes secundarias. */
  ink: 'bg-gravl-ink text-white hover:bg-[#1a2230] hover:-translate-y-px hover:shadow-[0_6px_16px_-8px_rgba(8,14,24,0.5)] dark:bg-gravl-text dark:text-gravl-ink dark:hover:bg-white',
  secondary: 'bg-gravl-card text-gravl-text border border-gravl-line hover:border-gravl-text/25',
  ghost: 'text-gravl-text-secondary hover:text-gravl-text hover:bg-gravl-text/[0.05]',
  soft: 'bg-gravl-text/[0.06] text-gravl-text hover:bg-gravl-text/[0.1]',
  danger: 'bg-gravl-crimson/10 text-gravl-crimson hover:bg-gravl-crimson/15',
  success: 'bg-gravl-emerald/10 text-gravl-emerald hover:bg-gravl-emerald/15',
} as const;
const btnSizes = {
  sm: 'h-8 px-3 text-[13px] gap-1.5 rounded-[10px]',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  icon: 'h-9 w-9 rounded-xl justify-center',
} as const;

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: keyof typeof btnVariants; size?: keyof typeof btnSizes; icon?: LucideIcon }
>(function Button({ variant = 'secondary', size = 'md', icon: Icon, className, children, type = 'button', ...rest }, ref) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'group inline-flex shrink-0 items-center font-semibold transition-[background-color,border-color,color,transform,box-shadow] duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] active:translate-y-0 active:scale-[0.97] disabled:pointer-events-none disabled:opacity-40',
        btnVariants[variant],
        btnSizes[size],
        className,
      )}
      {...rest}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : 16} aria-hidden />}
      {children}
    </button>
  );
});

// ─── Live dot ────────────────────────────────────────────────────
export function LiveDot({ color = 'var(--color-gravl-emerald)', size = 8 }: { color?: string; size?: number }) {
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }} aria-hidden>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-60" style={{ background: color }} />
      <span className="relative inline-flex h-full w-full rounded-full" style={{ background: color }} />
    </span>
  );
}

// ─── Avatar (iniciales, sin servicios externos) ──────────────────
export function Avatar({ name, size = 32, className }: { name: string; size?: number; className?: string }) {
  return (
    <span
      aria-hidden
      className={cn('inline-flex shrink-0 items-center justify-center rounded-full bg-gravl-text/[0.07] font-semibold text-gravl-text', className)}
      style={{ width: size, height: size, fontSize: Math.max(10, size * 0.36) }}
    >
      {toInitials(name)}
    </span>
  );
}

// ─── Toggle (role=switch) ────────────────────────────────────────
export function Toggle({ checked, onChange, label }: { checked: boolean; onChange: (next: boolean) => void; label: string }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors duration-200',
        checked ? 'bg-gravl-lime' : 'bg-gravl-text/[0.15]',
      )}
    >
      <span
        className={cn(
          'inline-block h-[18px] w-[18px] rounded-full bg-white shadow-sm transition-transform duration-300 ease-[cubic-bezier(0.2,0.8,0.2,1)]',
          checked ? 'translate-x-[23px] !bg-gravl-ink' : 'translate-x-[3px]',
        )}
      />
    </button>
  );
}

// ─── Segmented ───────────────────────────────────────────────────
export function Segmented<T extends string>({
  value,
  onChange,
  options,
  label,
  size = 'md',
}: {
  value: T;
  onChange: (v: T) => void;
  options: { value: T; label: React.ReactNode; icon?: LucideIcon; count?: number }[];
  label: string;
  size?: 'sm' | 'md';
}) {
  return (
    <div role="tablist" aria-label={label} className="inline-flex max-w-full items-center gap-0.5 overflow-x-auto rounded-xl bg-gravl-text/[0.06] p-1">
      {options.map((o) => {
        const active = o.value === value;
        const Icon = o.icon;
        return (
          <button
            key={o.value}
            role="tab"
            aria-selected={active}
            onClick={() => onChange(o.value)}
            className={cn(
              'flex shrink-0 items-center gap-1.5 rounded-[9px] font-semibold transition-all duration-200',
              size === 'sm' ? 'px-2.5 py-1 text-xs' : 'px-3 py-1.5 text-[13px]',
              active ? 'bg-gravl-card text-gravl-text shadow-[0_1px_3px_rgba(8,14,24,0.12)]' : 'text-gravl-text-muted hover:text-gravl-text',
            )}
          >
            {Icon && <Icon size={13} aria-hidden />}
            {o.label}
            {o.count !== undefined && <span className="tabular-nums text-[11px] text-gravl-text-muted">{o.count}</span>}
          </button>
        );
      })}
    </div>
  );
}

// ─── Progress ────────────────────────────────────────────────────
export function ProgressBar({ value, max = 100, color, className, label }: { value: number; max?: number; color?: string; className?: string; label?: string }) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div role="progressbar" aria-valuenow={Math.round(value)} aria-valuemin={0} aria-valuemax={max} aria-label={label} className={cn('h-1.5 w-full overflow-hidden rounded-full bg-gravl-text/[0.08]', className)}>
      <div
        className="gravl-grow h-full rounded-full transition-[width] duration-700 ease-[cubic-bezier(0.2,0.8,0.2,1)]"
        style={{ width: `${pct}%`, background: color ?? 'var(--color-gravl-text)' }}
      />
    </div>
  );
}

// ─── Sparkline ───────────────────────────────────────────────────
export function Sparkline({ points, color = 'var(--color-gravl-text)', width = 120, height = 36 }: { points: number[]; color?: string; width?: number; height?: number }) {
  const gradId = useId();
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const coords = points.map((v, i) => [(i / (points.length - 1)) * width, height - ((v - min) / range) * (height - 8) - 4]);
  const line = coords.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const [lx, ly] = coords[coords.length - 1];
  return (
    <svg width={width} height={height} className="overflow-visible" aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" style={{ stopColor: color, stopOpacity: 0.18 }} />
          <stop offset="100%" style={{ stopColor: color, stopOpacity: 0 }} />
        </linearGradient>
      </defs>
      <path d={`${line} L${width} ${height} L0 ${height} Z`} fill={`url(#${gradId})`} />
      <path d={line} pathLength={1} className="gravl-draw" fill="none" style={{ stroke: color }} strokeWidth={1.75} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r={2.75} style={{ fill: color }} />
    </svg>
  );
}

// ─── Número animado ──────────────────────────────────────────────
const intFmt = new Intl.NumberFormat('es-AR', { maximumFractionDigits: 0 });

/**
 * Cuenta hasta el valor nuevo cuando cambia (ej. al elegir otra sede).
 * El primer render muestra el valor final: sin saltos ni errores de hidratación.
 */
export function AnimatedNumber({ value, format = (n: number) => intFmt.format(n), duration = 650 }: { value: number; format?: (n: number) => string; duration?: number }) {
  const [shown, setShown] = useState(value);
  const from = useRef(value);
  useEffect(() => {
    const start = from.current;
    if (start === value) return;
    const reduce = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduce) {
      from.current = value;
      setShown(value);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const tick = (t: number) => {
      const p = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      const v = start + (value - start) * eased;
      setShown(v);
      if (p < 1) raf = requestAnimationFrame(tick);
      else from.current = value;
    };
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      from.current = value;
    };
  }, [value, duration]);
  return <>{format(Math.round(shown))}</>;
}

// ─── KPI tile ────────────────────────────────────────────────────
/**
 * Cifra protagonista en Barlow Condensed, como "241 Strength Score · +4 esta semana"
 * en la app. `source` dice de dónde sale el dato: transparencia ante el dueño del gimnasio.
 */
export function KpiTile({
  label,
  value,
  unit,
  delta,
  deltaDirection = 'up',
  deltaGood = true,
  hint,
  source,
  icon: Icon,
  color,
  spark,
  emphasis,
}: {
  label: string;
  value: React.ReactNode;
  unit?: string;
  delta?: string;
  deltaDirection?: 'up' | 'down' | 'none';
  deltaGood?: boolean;
  hint?: string;
  source?: string;
  icon?: LucideIcon;
  color?: string;
  spark?: number[];
  /** Variante en tinta con cifra lima: para LA métrica que importa. */
  emphasis?: boolean;
  glow?: string;
}) {
  const deltaColor = deltaDirection === 'none' ? undefined : deltaGood ? 'var(--color-gravl-emerald)' : 'var(--color-gravl-crimson)';
  return (
    <div
      className={cn(
        'gravl-card group flex flex-col justify-between p-5 hover:border-gravl-text/20',
        emphasis && '!border-transparent !bg-gravl-ink text-white dark:!border-white/10',
      )}
    >
      <div className="flex items-start justify-between gap-3">
        <p className={cn('gravl-label', emphasis && '!text-white/55')}>{label}</p>
        {Icon && <Icon size={16} className={emphasis ? 'text-white/40' : 'text-gravl-text-muted'} style={!emphasis && color ? { color } : undefined} aria-hidden />}
      </div>
      <div className="mt-4 flex items-end justify-between gap-3">
        <div className="min-w-0">
          <p className={cn('gravl-num text-[52px]', emphasis ? 'text-gravl-lime' : 'text-gravl-text')}>
            {typeof value === 'number' ? <AnimatedNumber value={value} /> : value}
            {unit && <span className={cn('ml-1 text-[22px]', emphasis ? 'text-white/50' : 'text-gravl-text-muted')}>{unit}</span>}
          </p>
          {delta && (
            <p
              className={cn('mt-2 inline-flex items-center gap-0.5 text-[13px] font-semibold', deltaDirection === 'none' && (emphasis ? 'text-white/70' : 'text-gravl-text-secondary'))}
              style={deltaColor ? { color: emphasis ? (deltaGood ? '#d2fe0b' : '#ff6b85') : deltaColor } : undefined}
            >
              {deltaDirection === 'up' && <ArrowUpRight size={14} aria-hidden />}
              {deltaDirection === 'down' && <ArrowDownRight size={14} aria-hidden />}
              {delta}
            </p>
          )}
        </div>
        {spark && <Sparkline points={spark} color={emphasis ? '#d2fe0b' : color ?? 'var(--color-gravl-text)'} width={88} height={34} />}
      </div>
      {(hint || source) && (
        <div className={cn('mt-4 border-t pt-3 text-xs', emphasis ? 'border-white/10 text-white/55' : 'border-gravl-line text-gravl-text-muted')}>
          {hint && <p>{hint}</p>}
          {source && <p className="mt-0.5 opacity-80">Fuente: {source}</p>}
        </div>
      )}
    </div>
  );
}

/** Número grande inline (para tarjetas y celdas destacadas). */
export function BigNumber({ children, className }: { children: React.ReactNode; className?: string }) {
  return <span className={cn('gravl-num', className)}>{children}</span>;
}

// ─── Empty state ─────────────────────────────────────────────────
export function EmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description?: string; action?: React.ReactNode }) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gravl-text/[0.06]">
        <Icon size={20} className="text-gravl-text-muted" aria-hidden />
      </div>
      <p className="text-sm font-semibold text-gravl-text">{title}</p>
      {description && <p className="mt-1 max-w-sm text-[13px] text-gravl-text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ─── Field ───────────────────────────────────────────────────────
export function Field({ label, hint, error, children, htmlFor }: { label: string; hint?: string; error?: string; htmlFor?: string; children: React.ReactNode }) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-[13px] font-medium text-gravl-text-secondary">
        {label}
      </label>
      {children}
      {error ? <p className="mt-1 text-xs font-medium text-gravl-crimson">{error}</p> : hint ? <p className="mt-1 text-xs text-gravl-text-muted">{hint}</p> : null}
    </div>
  );
}


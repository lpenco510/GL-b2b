'use client';

import React, { useId } from 'react';
import { cn } from './cn';
import { initials as toInitials } from '@gravl/domain';
import { ArrowDownRight, ArrowUpRight, type LucideIcon } from 'lucide-react';

// ─── Card ────────────────────────────────────────────────────────
export function Card({
  className,
  glow,
  interactive,
  children,
  ...rest
}: React.HTMLAttributes<HTMLDivElement> & { glow?: 'volt' | 'cyan' | 'crimson'; interactive?: boolean }) {
  return (
    <div
      className={cn(
        'gravl-card',
        glow === 'volt' && 'gravl-glow',
        glow === 'cyan' && 'gravl-glow-cyan',
        glow === 'crimson' && 'gravl-glow-crimson',
        interactive && 'gravl-card-interactive',
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
}

export function CardHeader({
  icon: Icon,
  iconColor = 'var(--color-gravl-volt)',
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
        <h3 className="flex items-center gap-2 text-sm font-bold tracking-wide text-white">
          {Icon && <Icon size={16} style={{ color: iconColor }} aria-hidden />}
          {title}
        </h3>
        {subtitle && <p className="mt-1 text-xs text-gravl-text-muted">{subtitle}</p>}
      </div>
      {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
    </div>
  );
}

// ─── Page header ─────────────────────────────────────────────────
export function PageHeader({
  title,
  description,
  badge,
  actions,
}: {
  title: React.ReactNode;
  description?: React.ReactNode;
  badge?: React.ReactNode;
  actions?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
      <div className="min-w-0">
        <h1 className="flex flex-wrap items-center gap-3 text-2xl font-black tracking-tight text-white">
          {title}
          {badge}
        </h1>
        {description && <p className="mt-1 max-w-3xl text-sm font-medium text-gravl-text-secondary">{description}</p>}
      </div>
      {actions && <div className="flex flex-wrap items-center gap-2">{actions}</div>}
    </div>
  );
}

// ─── Badge ───────────────────────────────────────────────────────
const badgeTones = {
  volt: 'bg-gravl-volt/12 text-gravl-volt border-gravl-volt/30',
  cyan: 'bg-gravl-cyan/12 text-gravl-cyan border-gravl-cyan/30',
  emerald: 'bg-gravl-emerald/12 text-gravl-emerald border-gravl-emerald/30',
  amber: 'bg-gravl-amber/12 text-gravl-amber border-gravl-amber/30',
  crimson: 'bg-gravl-crimson/12 text-gravl-crimson border-gravl-crimson/30',
  violet: 'bg-gravl-violet/12 text-gravl-violet border-gravl-violet/30',
  neutral: 'bg-white/[0.06] text-gravl-text-secondary border-white/[0.08]',
} as const;
export type Tone = keyof typeof badgeTones;

export function Badge({
  tone = 'neutral',
  icon: Icon,
  className,
  children,
}: {
  tone?: Tone;
  icon?: LucideIcon;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-bold tracking-wide',
        badgeTones[tone],
        className,
      )}
    >
      {Icon && <Icon size={10} aria-hidden />}
      {children}
    </span>
  );
}

// ─── Button ──────────────────────────────────────────────────────
const btnVariants = {
  primary: 'bg-gravl-volt text-gravl-canvas hover:bg-gravl-volt-hover shadow-[0_0_18px_rgba(198,255,0,0.25)]',
  secondary: 'bg-white/[0.05] text-white border border-white/[0.1] hover:bg-white/[0.09] hover:border-white/[0.18]',
  ghost: 'text-gravl-text-secondary hover:text-white hover:bg-white/[0.05]',
  soft: 'bg-gravl-volt/10 text-gravl-volt border border-gravl-volt/25 hover:bg-gravl-volt/20',
  danger: 'bg-gravl-crimson/12 text-rose-300 border border-gravl-crimson/30 hover:bg-gravl-crimson/20',
  success: 'bg-gravl-emerald/12 text-emerald-300 border border-gravl-emerald/30 hover:bg-gravl-emerald/20',
} as const;
const btnSizes = {
  sm: 'h-8 px-3 text-xs gap-1.5 rounded-lg',
  md: 'h-10 px-4 text-sm gap-2 rounded-xl',
  icon: 'h-9 w-9 rounded-xl justify-center',
} as const;

export const Button = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & {
    variant?: keyof typeof btnVariants;
    size?: keyof typeof btnSizes;
    icon?: LucideIcon;
  }
>(function Button({ variant = 'secondary', size = 'md', icon: Icon, className, children, type = 'button', ...rest }, ref) {
  return (
    <button
      ref={ref}
      type={type}
      className={cn(
        'inline-flex shrink-0 items-center font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-40',
        btnVariants[variant],
        btnSizes[size],
        className,
      )}
      {...rest}
    >
      {Icon && <Icon size={size === 'sm' ? 13 : 16} aria-hidden />}
      {children}
    </button>
  );
});

// ─── Live dot ────────────────────────────────────────────────────
export function LiveDot({ color = 'var(--color-gravl-emerald)', size = 8 }: { color?: string; size?: number }) {
  return (
    <span className="relative inline-flex shrink-0" style={{ width: size, height: size }} aria-hidden>
      <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-70" style={{ background: color }} />
      <span className="relative inline-flex h-full w-full rounded-full" style={{ background: color }} />
    </span>
  );
}

// ─── Avatar con iniciales (sin servicios externos) ───────────────
const avatarHues = ['#C6FF00', '#38BDF8', '#A78BFA', '#F59E0B', '#22C55E', '#F472B6'];
export function Avatar({ name, size = 32, className }: { name: string; size?: number; className?: string }) {
  const hue = avatarHues[[...name].reduce((a, c) => a + c.charCodeAt(0), 0) % avatarHues.length];
  return (
    <span
      aria-hidden
      className={cn('inline-flex shrink-0 items-center justify-center rounded-xl border font-bold', className)}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, size * 0.34),
        background: `${hue}14`,
        borderColor: `${hue}35`,
        color: hue,
      }}
    >
      {toInitials(name)}
    </span>
  );
}

// ─── Toggle accesible (role=switch) ──────────────────────────────
export function Toggle({
  checked,
  onChange,
  label,
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label: string;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full border transition-colors',
        checked ? 'border-gravl-volt/60 bg-gravl-volt' : 'border-white/[0.12] bg-white/[0.08]',
      )}
    >
      <span
        className={cn(
          'inline-block h-4 w-4 rounded-full shadow transition-transform',
          checked ? 'translate-x-6 bg-gravl-canvas' : 'translate-x-1 bg-gravl-text-secondary',
        )}
      />
    </button>
  );
}

// ─── Segmented control ───────────────────────────────────────────
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
    <div role="tablist" aria-label={label} className="inline-flex max-w-full items-center gap-1 overflow-x-auto rounded-xl border border-white/[0.08] bg-gravl-raised p-1">
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
              'flex shrink-0 items-center gap-1.5 rounded-lg font-semibold transition-colors',
              size === 'sm' ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5 text-xs',
              active ? 'bg-gravl-volt text-gravl-canvas' : 'text-gravl-text-secondary hover:bg-white/[0.05] hover:text-white',
            )}
          >
            {Icon && <Icon size={13} aria-hidden />}
            {o.label}
            {o.count !== undefined && (
              <span className={cn('tabular-nums text-[10px]', active ? 'opacity-70' : 'text-gravl-text-muted')}>{o.count}</span>
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Progress bar ────────────────────────────────────────────────
export function ProgressBar({
  value,
  max = 100,
  color = 'var(--color-gravl-volt)',
  className,
  label,
}: {
  value: number;
  max?: number;
  color?: string;
  className?: string;
  label?: string;
}) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div
      role="progressbar"
      aria-valuenow={Math.round(value)}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-label={label}
      className={cn('h-1.5 w-full overflow-hidden rounded-full bg-white/[0.07]', className)}
    >
      <div className="h-full rounded-full transition-[width] duration-500" style={{ width: `${pct}%`, background: color }} />
    </div>
  );
}

// ─── Sparkline ───────────────────────────────────────────────────
export function Sparkline({
  points,
  color,
  width = 120,
  height = 36,
}: {
  points: number[];
  color: string;
  width?: number;
  height?: number;
}) {
  const gradId = useId();
  if (points.length < 2) return null;
  const min = Math.min(...points);
  const max = Math.max(...points);
  const range = max - min || 1;
  const coords = points.map((v, i) => [
    (i / (points.length - 1)) * width,
    height - ((v - min) / range) * (height - 8) - 4,
  ]);
  const line = coords.map(([x, y], i) => `${i ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)}`).join(' ');
  const [lx, ly] = coords[coords.length - 1];
  return (
    <svg width={width} height={height} className="overflow-visible" aria-hidden>
      <defs>
        <linearGradient id={gradId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={color} stopOpacity={0.35} />
          <stop offset="100%" stopColor={color} stopOpacity={0} />
        </linearGradient>
      </defs>
      <path d={`${line} L${width} ${height} L0 ${height} Z`} fill={`url(#${gradId})`} />
      <path d={line} fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" />
      <circle cx={lx} cy={ly} r={3} fill={color} />
    </svg>
  );
}

// ─── KPI tile ────────────────────────────────────────────────────
export function KpiTile({
  label,
  value,
  delta,
  deltaDirection = 'up',
  deltaGood = true,
  hint,
  icon: Icon,
  color,
  spark,
  glow,
}: {
  label: string;
  value: React.ReactNode;
  delta?: string;
  deltaDirection?: 'up' | 'down' | 'none';
  /** Si el movimiento del delta es positivo para el negocio (define el color). */
  deltaGood?: boolean;
  hint?: string;
  icon: LucideIcon;
  color: string;
  spark?: number[];
  glow?: 'volt' | 'cyan' | 'crimson';
}) {
  const deltaColor = deltaGood ? 'var(--color-gravl-emerald)' : 'var(--color-gravl-crimson)';
  return (
    <Card glow={glow} interactive className="group flex flex-col justify-between p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-bold uppercase tracking-wider text-gravl-text-secondary">{label}</p>
          <p className="tabular-nums mt-1.5 font-mono text-[28px] font-black leading-none tracking-tight text-white">{value}</p>
          {delta && (
            <p className="mt-2 inline-flex items-center gap-0.5 text-xs font-bold" style={{ color: deltaDirection === 'none' ? color : deltaColor }}>
              {deltaDirection === 'up' && <ArrowUpRight size={13} aria-hidden />}
              {deltaDirection === 'down' && <ArrowDownRight size={13} aria-hidden />}
              {delta}
            </p>
          )}
        </div>
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
          style={{ background: `color-mix(in srgb, ${color} 12%, transparent)`, border: `1px solid color-mix(in srgb, ${color} 30%, transparent)` }}
        >
          <Icon size={18} style={{ color }} aria-hidden />
        </div>
      </div>
      <div className="mt-4 flex items-end justify-between gap-3 border-t border-white/[0.05] pt-3">
        <p className="min-w-0 text-xs font-medium text-gravl-text-muted">{hint}</p>
        {spark && <Sparkline points={spark} color={color} width={96} height={32} />}
      </div>
    </Card>
  );
}

// ─── Empty state ─────────────────────────────────────────────────
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.03]">
        <Icon size={22} className="text-gravl-text-muted" aria-hidden />
      </div>
      <p className="text-sm font-semibold text-white">{title}</p>
      {description && <p className="mt-1 max-w-sm text-xs text-gravl-text-muted">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

// ─── Field ───────────────────────────────────────────────────────
export function Field({
  label,
  hint,
  error,
  children,
  htmlFor,
}: {
  label: string;
  hint?: string;
  error?: string;
  htmlFor?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label htmlFor={htmlFor} className="mb-1.5 block text-xs font-semibold text-gravl-text-secondary">
        {label}
      </label>
      {children}
      {error ? (
        <p className="mt-1 text-[11px] font-medium text-rose-400">{error}</p>
      ) : hint ? (
        <p className="mt-1 text-[11px] text-gravl-text-muted">{hint}</p>
      ) : null}
    </div>
  );
}

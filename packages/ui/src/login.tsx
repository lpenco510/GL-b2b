'use client';

import React, { useActionState, useEffect, useRef, useState } from 'react';
import { ArrowRight, Eye, EyeOff, Loader2, Lock, ShieldCheck } from 'lucide-react';
import { GravlWordmark } from './brand';
import { cn } from './cn';

export interface LoginState {
  error?: string;
  /** Cambia en cada intento fallido para re-disparar la animación de error. */
  attempt?: number;
}

/**
 * Pantalla de acceso con la estética de GRAVL: fondo lima, tinta, grilla de puntos.
 * La lógica vive en la server action de cada app; este componente solo es UI.
 */
export function LoginScreen({
  action,
  product,
  title,
  next,
  devHint,
}: {
  action: (prev: LoginState, form: FormData) => Promise<LoginState>;
  product: string;
  title: React.ReactNode;
  next?: string;
  devHint?: string;
}) {
  const [state, formAction, pending] = useActionState(action, {});
  const [show, setShow] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (state.error) inputRef.current?.select();
  }, [state]);

  return (
    <main className="gravl-login relative flex min-h-screen flex-col overflow-hidden bg-gravl-lime text-gravl-ink">
      {/* Grilla de puntos, como la imagen de marca de gravl.ai */}
      <div aria-hidden className="gravl-login-dots pointer-events-none absolute inset-0" />

      <header className="relative z-10 flex items-center justify-between px-6 py-6 sm:px-10">
        <span className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-gravl-ink">
            {/* La G del ícono, en lima sobre tinta */}
            <svg viewBox="0 0 118 94" className="h-[15px] w-auto" fill="#d2fe0b" aria-hidden>
              <path d="M115.984 35.3639H51.526C50.4957 35.3639 49.6603 36.1993 49.6603 37.2296V54.7866C49.6603 55.8169 50.4957 56.6522 51.526 56.6522H89.0377V66.0574C80.3681 66.4886 70.3925 66.7156 60.0539 66.7156C49.7383 66.7156 40.5223 66.5006 31.9474 66.0597V23.3627C42.3645 23.7382 51.1699 24.0902 59.7088 24.5461C77.6195 25.4479 94.8898 27.02 111.043 28.5532C111.577 28.6042 112.107 28.4224 112.497 28.0549C112.888 27.688 113.235 27.8578 113.083 26.6342C112.932 25.4105 112.33 3.81045 112.33 3.81045C112.299 2.86328 111.563 2.08983 110.618 2.013C94 0.65818 74.958 0 52.4043 0C13.2236 0 0 11.7364 0 46.5098C0 80.414 15.9705 93.0195 58.925 93.0195C80.4426 93.0195 94.786 90.1092 104.063 83.8598C113.469 77.5243 117.85 67.7677 117.85 53.156V37.2296C117.85 36.1993 117.015 35.3639 115.984 35.3639Z" />
            </svg>
          </span>
          <GravlWordmark height={15} />
        </span>
        <span className="rounded-full border border-gravl-ink/15 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.08em]">{product}</span>
      </header>

      <section className="relative z-10 flex flex-1 items-center justify-center px-6 pb-16">
        <div className="w-full max-w-[420px]">
          <h1 className="gravl-login-in text-[44px] font-bold leading-[0.98] tracking-[-0.04em] sm:text-[56px]">{title}</h1>

          <form
            action={formAction}
            key={state.attempt ?? 0}
            className={cn(
              'gravl-login-in mt-8 rounded-[22px] bg-white p-5 shadow-[0_30px_60px_-30px_rgba(8,14,24,0.45),0_2px_0_rgba(8,14,24,0.06)] [animation-delay:80ms]',
              state.error && 'gravl-login-shake',
            )}
          >
            {next && <input type="hidden" name="next" value={next} />}
            <label htmlFor="password" className="text-[13px] font-semibold text-gravl-ink/70">
              Contraseña
            </label>
            <div className="group mt-2 flex items-center gap-2 rounded-2xl border-2 border-gravl-ink/10 bg-white px-3.5 transition-[border-color,box-shadow] duration-200 focus-within:border-gravl-ink focus-within:shadow-[0_0_0_4px_rgba(210,254,11,0.6)]">
              <Lock size={17} className="shrink-0 text-gravl-ink/40 transition-colors group-focus-within:text-gravl-ink" aria-hidden />
              <input
                ref={inputRef}
                id="password"
                name="password"
                type={show ? 'text' : 'password'}
                autoComplete="current-password"
                autoFocus
                required
                maxLength={200}
                aria-invalid={!!state.error}
                aria-describedby={state.error ? 'login-error' : undefined}
                className="h-12 min-w-0 flex-1 bg-transparent text-[16px] text-gravl-ink outline-none placeholder:text-gravl-ink/30"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShow((s) => !s)}
                aria-label={show ? 'Ocultar contraseña' : 'Mostrar contraseña'}
                className="rounded-lg p-1.5 text-gravl-ink/40 transition-colors hover:bg-gravl-ink/5 hover:text-gravl-ink"
              >
                {show ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>

            <p id="login-error" role="alert" aria-live="assertive" className={cn('overflow-hidden text-[13px] font-medium text-[#c0153d] transition-all duration-300', state.error ? 'mt-2.5 max-h-12 opacity-100' : 'max-h-0 opacity-0')}>
              {state.error}
            </p>

            <button
              type="submit"
              disabled={pending}
              className="group/btn mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gravl-ink text-[15px] font-semibold text-white transition-[transform,box-shadow,background-color] duration-200 ease-[cubic-bezier(0.2,0.8,0.2,1)] hover:-translate-y-0.5 hover:bg-[#141c2a] hover:shadow-[0_12px_24px_-12px_rgba(8,14,24,0.7)] active:translate-y-0 active:scale-[0.98] disabled:translate-y-0 disabled:opacity-80"
            >
              {pending ? (
                <>
                  <Loader2 size={17} className="animate-spin" aria-hidden /> Entrando…
                </>
              ) : (
                <>
                  Entrar <ArrowRight size={17} className="transition-transform duration-200 group-hover/btn:translate-x-1" aria-hidden />
                </>
              )}
            </button>
          </form>

          <p className="gravl-login-in mt-5 flex items-center justify-center gap-1.5 text-[12px] font-medium text-gravl-ink/60 [animation-delay:160ms]">
            <ShieldCheck size={14} aria-hidden /> Sesión cifrada · 5 intentos cada 10 minutos
          </p>
          {devHint && <p className="mt-2 text-center text-[12px] text-gravl-ink/50">{devHint}</p>}
        </div>
      </section>
    </main>
  );
}

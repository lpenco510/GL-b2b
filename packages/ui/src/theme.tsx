'use client';

import React, { useEffect, useState } from 'react';
import { Moon, Sun } from 'lucide-react';
import { cn } from './cn';

export type Theme = 'light' | 'dark';
const KEY = 'gravl-theme';

/**
 * Script inline para el <head>: aplica el tema guardado ANTES del primer paint
 * (sin flash). Patrón recomendado en la guía de Next "Preventing flash before hydration".
 */
export const themeInitScript = `(function(){try{var t=localStorage.getItem('${KEY}');if(t!=='light'&&t!=='dark'){t=window.matchMedia('(prefers-color-scheme: dark)').matches?'dark':'light'}document.documentElement.setAttribute('data-theme',t)}catch(e){}})()`;

export function ThemeToggle({ className }: { className?: string }) {
  // El tema real ya está en <html data-theme> (lo puso el script). Lo leemos al montar.
  const [theme, setTheme] = useState<Theme | null>(null);
  useEffect(() => {
    // Sincroniza con el atributo que puso el script inline antes de hidratar.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setTheme((document.documentElement.getAttribute('data-theme') as Theme) ?? 'light');
  }, []);

  const toggle = () => {
    const next: Theme = theme === 'dark' ? 'light' : 'dark';
    document.documentElement.setAttribute('data-theme', next);
    try {
      localStorage.setItem(KEY, next);
    } catch {
      /* modo privado: el tema vale solo para esta sesión */
    }
    setTheme(next);
  };

  const dark = theme === 'dark';
  return (
    <button
      onClick={toggle}
      aria-label={dark ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
      title={dark ? 'Modo claro' : 'Modo oscuro'}
      className={cn(
        'relative flex h-9 w-9 items-center justify-center overflow-hidden rounded-xl text-gravl-text-secondary transition-colors hover:bg-gravl-text/[0.06] hover:text-gravl-text',
        className,
      )}
    >
      <Sun size={17} className={cn('absolute transition-all duration-500', dark ? 'rotate-90 scale-0 opacity-0' : 'rotate-0 scale-100 opacity-100')} aria-hidden />
      <Moon size={16} className={cn('absolute transition-all duration-500', dark ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-0 opacity-0')} aria-hidden />
    </button>
  );
}

/**
 * Script inline según la guía de Next: se ejecuta en el HTML del servidor y React
 * no lo re-ejecuta (ni avisa) en el cliente.
 */
export function InlineScript({ html }: { html: string }) {
  return (
    <script
      type={typeof window === 'undefined' ? 'text/javascript' : 'text/plain'}
      suppressHydrationWarning
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

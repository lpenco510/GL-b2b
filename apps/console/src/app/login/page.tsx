import type { Metadata } from 'next';
import { Suspense } from 'react';
import { authConfig } from '@gravl/auth';
import LoginClient from './LoginClient';

export const metadata: Metadata = { title: 'Ingresar' };

export default function LoginPage() {
  const cfg = authConfig('console');
  const devHint = cfg.usingDevDefault ? 'Modo local: la contraseña es "gravl". En producción se define con CONSOLE_PASSWORD.' : undefined;
  return (
    <Suspense fallback={<main className="min-h-screen bg-gravl-lime" />}>
      <LoginClient devHint={devHint} />
    </Suspense>
  );
}

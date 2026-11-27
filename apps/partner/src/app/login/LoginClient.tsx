'use client';

import { useSearchParams } from 'next/navigation';
import { LoginScreen } from '@gravl/ui';
import { login } from './actions';

export default function LoginClient({ devHint }: { devHint?: string }) {
  const next = useSearchParams().get('next') ?? undefined;
  return (
    <LoginScreen
      action={login}
      product="Partners · demo privada"
      title={<>Tu panel de<br />partner<span className="text-gravl-ink/40">.</span></>}
      next={next}
      devHint={devHint}
    />
  );
}

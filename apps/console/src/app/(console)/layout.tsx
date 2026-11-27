import ConsoleShell from '@/components/ConsoleShell';

/** Todo lo que está en (console) requiere sesión de consola (ver src/proxy.ts). */
export default function ConsoleLayout({ children }: { children: React.ReactNode }) {
  return <ConsoleShell>{children}</ConsoleShell>;
}

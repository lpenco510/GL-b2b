import type { Metadata, Viewport } from 'next';
import { Barlow_Condensed, Inter_Tight } from 'next/font/google';
import { InlineScript, themeInitScript } from '@gravl/ui';

import './globals.css';

// Tipografías de gravl.ai: Inter Tight (UI) + Barlow Condensed (cifras y titulares).
const interTight = Inter_Tight({ variable: '--font-inter-tight', subsets: ['latin'], weight: ['400', '500', '600', '700'] });
const barlow = Barlow_Condensed({ variable: '--font-barlow', subsets: ['latin'], weight: ['600', '700'] });

export const metadata: Metadata = {
  title: { default: 'GRAVL Console', template: '%s · GRAVL Console' },
  description: 'Consola interna de GRAVL: cartera de partners, cotizaciones y mercados.',
  robots: { index: false, follow: false },
};

export const viewport: Viewport = { themeColor: '#ffffff' };

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es" data-theme="light" suppressHydrationWarning className={`${interTight.variable} ${barlow.variable} h-full antialiased`}>
      <head>
        <InlineScript html={themeInitScript} />
      </head>
      <body className="min-h-full">
        {children}
      </body>
    </html>
  );
}

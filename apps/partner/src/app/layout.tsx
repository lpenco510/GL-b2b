import type { Metadata, Viewport } from 'next';
import { Barlow_Condensed, Inter_Tight } from 'next/font/google';
import { InlineScript, themeInitScript } from '@gravl/ui';

import './globals.css';

// Tipografías de gravl.ai: Inter Tight (UI) + Barlow Condensed (cifras y titulares).
const interTight = Inter_Tight({ variable: '--font-inter-tight', subsets: ['latin'], weight: ['400', '500', '600', '700'] });
const barlow = Barlow_Condensed({ variable: '--font-barlow', subsets: ['latin'], weight: ['600', '700'] });

export const metadata: Metadata = {
  title: {
    default: 'GRAVL Partner OS',
    template: '%s · GRAVL Partner OS',
  },
  description: 'Plataforma B2B de GRAVL para cadenas de gimnasios, Corporate Wellness y coaches: retención, equipamiento y ROI.',
};

export const viewport: Viewport = {
  themeColor: '#ffffff',
};

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

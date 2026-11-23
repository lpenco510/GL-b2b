import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';
import { AppProvider } from '@/context/AppContext';
import ClientLayout from '@/components/layout/ClientLayout';

const plusJakarta = Plus_Jakarta_Sans({
  variable: '--font-plus-jakarta',
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
});

const jetbrainsMono = JetBrains_Mono({
  variable: '--font-jetbrains',
  subsets: ['latin'],
  weight: ['400', '600', '700'],
});

export const metadata: Metadata = {
  title: {
    default: 'GRAVL Partner OS',
    template: '%s · GRAVL Partner OS',
  },
  description: 'Plataforma B2B de GRAVL para cadenas de gimnasios, Corporate Wellness y coaches: retención, equipamiento y ROI.',
};

export const viewport: Viewport = {
  themeColor: '#080A0E',
  colorScheme: 'dark',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="es" className={`${plusJakarta.variable} ${jetbrainsMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <AppProvider>
          <ClientLayout>{children}</ClientLayout>
        </AppProvider>
      </body>
    </html>
  );
}

import React, { useMemo } from 'react';
import QRCode from 'qrcode';

/** Matriz de módulos de un QR real (escaneable). Sincrónico → apto para SSR. */
export function qrModules(value: string): { size: number; dark: (r: number, c: number) => boolean } {
  const qr = QRCode.create(value, { errorCorrectionLevel: 'M' });
  const { size, data } = qr.modules;
  return { size, dark: (r, c) => !!data[r * size + c] };
}

/** Path SVG con todos los módulos oscuros (un solo nodo, liviano). */
export function qrPath(value: string, cell: number, offset = 0) {
  const { size, dark } = qrModules(value);
  let d = '';
  for (let r = 0; r < size; r++)
    for (let c = 0; c < size; c++) if (dark(r, c)) d += `M${offset + c * cell} ${offset + r * cell}h${cell}v${cell}h-${cell}z`;
  return { d, size };
}

export default function QrCode({ value, size = 160, fg = '#080e18', bg = '#ffffff' }: { value: string; size?: number; fg?: string; bg?: string }) {
  const { d, modules } = useMemo(() => {
    const p = qrPath(value, 1, 4); // 4 módulos de quiet zone
    return { d: p.d, modules: p.size + 8 };
  }, [value]);
  return (
    <svg width={size} height={size} viewBox={`0 0 ${modules} ${modules}`} role="img" aria-label={`Código QR que abre ${value}`} shapeRendering="crispEdges">
      <rect width={modules} height={modules} fill={bg} rx={2} />
      <path d={d} fill={fg} />
    </svg>
  );
}

/** Póster imprimible A5 (SVG vectorial) con marca del partner y el QR de la sede. */
export function buildPosterSvg({ gym, location, url }: { gym: string; location: string; url: string }) {
  const W = 1480;
  const H = 2100;
  const qrBox = 900;
  const { d, size } = qrPath(url, 1, 0);
  const scale = (qrBox - 120) / size;
  const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <rect width="${W}" height="${H}" fill="#080e18"/>
  <rect x="60" y="60" width="${W - 120}" height="${H - 120}" rx="48" fill="none" stroke="var(--color-gravl-volt)" stroke-opacity="0.35" stroke-width="4"/>
  <text x="${W / 2}" y="250" fill="var(--color-gravl-volt)" font-family="Helvetica, Arial, sans-serif" font-size="64" font-weight="800" text-anchor="middle" letter-spacing="12">${esc(gym.toUpperCase())} × GRAVL</text>
  <text x="${W / 2}" y="420" fill="var(--color-gravl-text)" font-family="Helvetica, Arial, sans-serif" font-size="110" font-weight="800" text-anchor="middle">Tu rutina con IA,</text>
  <text x="${W / 2}" y="540" fill="var(--color-gravl-text)" font-family="Helvetica, Arial, sans-serif" font-size="110" font-weight="800" text-anchor="middle">gratis para socios.</text>
  <rect x="${(W - qrBox) / 2}" y="660" width="${qrBox}" height="${qrBox}" rx="40" fill="var(--color-gravl-text)"/>
  <g transform="translate(${(W - qrBox) / 2 + 60} ${660 + 60}) scale(${scale})"><path d="${d}" fill="#080e18" shape-rendering="crispEdges"/></g>
  <text x="${W / 2}" y="1720" fill="var(--color-gravl-text)" font-family="Helvetica, Arial, sans-serif" font-size="58" font-weight="700" text-anchor="middle">Escaneá, descargá la app y entrená</text>
  <text x="${W / 2}" y="1800" fill="var(--color-gravl-text-secondary)" font-family="Helvetica, Arial, sans-serif" font-size="46" text-anchor="middle">con las máquinas exactas de ${esc(location)}.</text>
  <text x="${W / 2}" y="1960" fill="var(--color-gravl-text-muted)" font-family="Courier New, monospace" font-size="36" text-anchor="middle">${esc(url.replace('https://', ''))}</text>
</svg>`;
}

# 06 · Design system

- **Tokens** en `packages/ui/src/tokens.css` (`@theme`), compartidos por portal y consola: `gravl-canvas/surface/card`, `gravl-volt` (marca), `cyan`, `emerald`, `amber`, `crimson`, `violet`, y textos `gravl-text/-secondary/-muted`. Usá las clases (`bg-gravl-volt`, `text-gravl-text-muted`) en vez de hex sueltos.
- **Regla de oro de Tailwind v4:** todo CSS propio va dentro de `@layer base` o `@layer components`. Una regla fuera de capa le gana a cualquier utilidad; el viejo reset `* { padding: 0 }` anulaba todos los `p-*`/`pl-*` (por eso el sidebar tapaba el contenido).
- **Semántica de color:** volt = acción/marca, emerald = sano, amber = atención, crimson = riesgo/pérdida, cyan = información/fuerza. Nunca usar crimson para algo positivo.
- **Números:** `.tabular-nums` para alinear cifras; la fuente mono solo en cifras protagonistas (KPIs). Todo número visible pasa por `lib/format.ts`.
- **Accesibilidad:** foco visible en volt, modales con trampa de foco y Esc, toggles con `role="switch"`, tablas con `caption`/`scope`, gráficos con `aria-label` descriptivo, link para saltar al contenido, `prefers-reduced-motion` respetado.
- **Responsive:** sidebar fijo desde `lg`, drawer en mobile; tablas con scroll horizontal propio, nunca el de la página.
- **Copy:** español rioplatense, en voseo y orientado a la acción ("Enviá", "Sacar de servicio"). Términos de producto en inglés solo cuando son marca (Strength Score, PR, Command Center).

- **Portal vs. consola:** el portal usa volt como acento; la consola usa **cyan** y una banda de "acceso interno". Nadie debería confundir en qué app está.
- **Componentes:** todo lo reutilizable vive en `packages/ui` (Card, KpiTile, Badge, Button, Toggle, Segmented, ProgressBar, Sparkline, Modal, Drawer, Field). Si copiás clases entre dos pantallas, es un componente.

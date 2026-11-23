# GRAVL Partner OS (B2B)

Panel B2B de GRAVL para los partners que pagan por la app de entrenamiento con IA de sus socios:

| Vertical | Comprador | Qué decide con el panel |
| --- | --- | --- |
| **Gym Chain** | Dueño o gerente de una cadena | A quién rescatar antes de que se dé de baja, qué máquina comprar, qué reto lanzar |
| **Corporate Wellness** | RR. HH. | Dónde hay riesgo de burnout, qué área activar (siempre con datos agregados y anónimos) |
| **Coach Studio** | Entrenador independiente | Qué cliente necesita un deload, qué form check responder |

La tesis del producto: **el panel no es para mirar, es para actuar**. Cada métrica relevante termina en una acción de un clic con impacto estimado en USD (enviar nudges, asignar una rutina, crear un reto, sacar una máquina de servicio).

## Cómo correrlo

```bash
npm install
npm run dev     # http://localhost:3000 (redirige a /dashboard)
npm run build   # build de producción: todas las rutas se prerenderizan estáticas
npm run lint
```

> Next.js 16 con `cacheComponents` y Tailwind v4. Antes de tocar APIs de Next leé `node_modules/next/dist/docs/` (ver `AGENTS.md`).

## Módulos

| Ruta | Módulo | Lo principal |
| --- | --- | --- |
| `/dashboard` | Command Center | KPIs por sede, **Acciones recomendadas** (copiloto), curva de retención por cohorte, balance muscular, heatmap de horarios pico y feed en vivo |
| `/retention` | Retención & Nudges | Segmentos, tabla ordenada por riesgo de baja, selección masiva, ficha del socio con explicación del riesgo y composer de nudges, export CSV, reglas automáticas |
| `/locations-equipment` | Equipamiento & Planta | Plano isométrico SVG generado desde el inventario de cada sede, sugerencias de CapEx, mantenimiento con "Deshacer" |
| `/community` | Comunidad & Retos | Wizard de retos con validación (precargable desde el Command Center), ranking por sede |
| `/provisioning` | QR, Asientos & ROI | QR reales y póster A5 descargable, embudo de activación, asientos y upgrade, integraciones, simulador de ROI para ventas |
| `/corporate` | Corporate Wellness | Readiness y sueño, burnout por área con k-anonimato |
| `/coach` | Coach Studio | Inbox de form checks, clientes en alerta, tendencia de e1RM |

Atajos: **⌘K / Ctrl+K** abre la paleta de comandos (socios, módulos y acciones). El selector de workspace (arriba en el sidebar) cambia de vertical.

Deep links: `/retention?segment=AT_RISK`, `/retention?member=usr_0042`, `/community?new=1&focus=Core`.

## Arquitectura

```
src/
├─ app/                      Rutas (App Router). Cada página es un client component;
│                            el layout.tsx de cada ruta solo define el <title>.
├─ components/
│  ├─ ui/                    Primitivas del design system (Card, KpiTile, Badge, Button,
│  │                         Toggle, Segmented, ProgressBar, Sparkline, Modal, Drawer…)
│  ├─ layout/                Shell: Sidebar, TopBar, CommandPalette, Toasts, preview de la app
│  │                         nav.ts = navegación por vertical (fuente única)
│  └─ dashboard|retention|equipment|provisioning/   Componentes de cada módulo
├─ context/AppContext.tsx    Estado global: UI + estado de dominio compartido
├─ data/
│  ├─ mockGravlB2B.ts        Dataset determinístico (PRNG con semilla)
│  └─ selectors.ts           Métricas derivadas por sede: TODAS las pantallas usan estas
├─ lib/format.ts             Formato es-AR (números, USD, fechas, tiempos relativos)
└─ types/gravl-b2b.ts        Contratos de dominio (espejo de la API .NET)
```

Decisiones clave:

- **Una sola fuente de verdad.** Estado de máquinas, nudges enviados, retos e integraciones viven en `AppContext`. El plano 3D y la tabla de equipamiento leen el mismo estado; un nudge enviado desde el Command Center aparece en la tabla de Retención.
- **Métricas por sede en selectores puros.** `scopeStats(locationId)` alimenta el TopBar, los KPIs y los badges del sidebar, así los números nunca se contradicen entre pantallas.
- **Datos determinísticos.** Todas las fechas son relativas a `REFERENCE_NOW` (en `mockGravlB2B.ts`) y los formateadores fijan la zona `America/Argentina/Buenos_Aires`, así el render del servidor y del browser coinciden (sin errores de hidratación). Cambiá `REFERENCE_NOW` para "rejuvenecer" la demo.
- **Estados coherentes.** El estado del socio se deriva de su comportamiento (días sin entrenar, racha, tendencia); el riesgo de baja usa una sigmoide sobre esas señales y la ficha muestra qué factores lo explican.
- **`cacheComponents` / Activity.** Next oculta las páginas en vez de desmontarlas. Modales y drawers se cierran en el cleanup de `useLayoutEffect` (ver `components/ui/Overlay.tsx`) y el feed en vivo pausa su intervalo cuando la página no se ve. Los intents de URL se leen con `useSearchParams` dentro de `<Suspense>` para no romper el prerender.

### Pasar de mocks a la API real

1. Mantener los nombres de `types/gravl-b2b.ts` alineados con los DTO del backend.
2. Reemplazar los exports de `data/mockGravlB2B.ts` por fetchers (server components o React Query) que devuelvan esos mismos tipos.
3. Reemplazar las mutaciones del `AppContext` (`markNudged`, `setMachineStatus`, `addChallenge`, `connectIntegration`) por llamadas a la API con actualización optimista; la UI no cambia.
4. El feed en vivo (`components/dashboard/LiveFeed.tsx`) ya está aislado: cambiar el `setInterval` por la suscripción al WebSocket de GRAVL Core.

## Design system

- **Tokens** en `app/globals.css` (`@theme`): `gravl-canvas/surface/card`, `gravl-volt` (marca), `cyan`, `emerald`, `amber`, `crimson`, `violet`, y textos `gravl-text/-secondary/-muted`. Usá las clases (`bg-gravl-volt`, `text-gravl-text-muted`) en vez de hex sueltos.
- **Regla de oro de Tailwind v4:** todo CSS propio va dentro de `@layer base` o `@layer components`. Una regla fuera de capa le gana a cualquier utilidad; el viejo reset `* { padding: 0 }` anulaba todos los `p-*`/`pl-*` (por eso el sidebar tapaba el contenido).
- **Semántica de color:** volt = acción/marca, emerald = sano, amber = atención, crimson = riesgo/pérdida, cyan = información/fuerza. Nunca usar crimson para algo positivo.
- **Números:** `.tabular-nums` para alinear cifras; la fuente mono solo en cifras protagonistas (KPIs). Todo número visible pasa por `lib/format.ts`.
- **Accesibilidad:** foco visible en volt, modales con trampa de foco y Esc, toggles con `role="switch"`, tablas con `caption`/`scope`, gráficos con `aria-label` descriptivo, link para saltar al contenido, `prefers-reduced-motion` respetado.
- **Responsive:** sidebar fijo desde `lg`, drawer en mobile; tablas con scroll horizontal propio, nunca el de la página.
- **Copy:** español rioplatense, en voseo y orientado a la acción ("Enviá", "Sacar de servicio"). Términos de producto en inglés solo cuando son marca (Strength Score, PR, Command Center).

## Roadmap sugerido

1. **Backend real** (ver arriba) y autenticación por partner con roles (dueño, gerente de sede, coach de piso).
2. **Atribución de nudges:** cerrar el loop midiendo si cada socio contactado volvió en 72 h y mostrar el ingreso efectivamente recuperado.
3. **Reporte mensual automático** en PDF para el dueño (retención, ROI, CapEx sugerido).
4. **Alertas a Slack/WhatsApp** para coaches de piso (PR en curso, socio en riesgo que acaba de entrar).
5. **Tests:** unitarios de `selectors.ts` y `format.ts`; e2e con Playwright de los flujos de nudge, reto y mantenimiento.
6. **i18n** (es/pt/en) para expandir a Brasil y México.

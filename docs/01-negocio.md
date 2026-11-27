# 01 · Lógica de negocio

> Fuente de verdad del B2B. Si el código contradice este documento, uno de los dos está mal: se corrige en el mismo PR.
> Reglas implementadas en `packages/domain` (con tests en `rules.test.ts`).

## 1. Qué vendemos, en una línea

**Un coach con IA dentro de la app de GRAVL que se adapta al equipamiento de cada sede, más un panel que convierte esa telemetría en decisiones de plata para el que paga.**

El socio usa la app. El partner paga porque le cambia una métrica de su P&L. Si no podemos nombrar esa métrica para un partner concreto, no hay venta.

## 2. Quién paga y por qué

| Segmento | Cómo gana plata el partner | Qué nos compra | Métrica norte |
| --- | --- | --- | --- |
| **Boutique / premium** | Asistencia y experiencia. Socio que no viene, se va. | Retención por asistencia, programación que justifica la cuota | % de socios activos por semana |
| **Cadena regional** | Mezcla: asistencia + débito | Retención a 6 meses, uso de equipamiento, onboarding | Retención a 180 días |
| **Alto volumen / low-cost** | **Débito automático (breakage).** La sala está dimensionada para que NO venga todo el mundo. | Menos **bajas** (no más visitas), valor percibido de la cuota, upsell con revenue share | Bajas evitadas por mes |
| **Corporate** | Paga la empresa por empleado elegible | Participación del beneficio, burnout agregado | Participación |
| **Coach** | Su tiempo y su programación | Atender más clientes con el mismo tiempo | Clientes retenidos |

Código: `playbooks` en `packages/domain/src/deals.ts`.

## 3. La verdad incómoda del low-cost

En las grandes franquicias el negocio está en **quien paga y no viene**. Una cadena de 38.000 socios con 15% de asistencia real colapsa si viene el 40%.

Consecuencias que no se negocian:

1. **Inactividad ≠ riesgo.** En modelo `BREAKAGE` el ingreso en riesgo solo cuenta **intención de baja** (entró a "dar de baja", débito rechazado, pidió congelar, preguntó por plan menor). Ver `revenueAtRiskUsd()`.
2. **No se reactiva a los durmientes.** Un push de "te extrañamos" le recuerda que está pagando: es el disparador de baja más barato que existe. Por defecto `contactDormantPayers = false`.
3. **La intención de baja la atiende una persona**, con una oferta (congelar, plan menor), no un push. `cancelIntentHandler = 'STAFF'`.
4. **Qué ganan con nosotros:** menos cancelaciones, una cuota que "vale más" (coach con IA incluido amortigua aumentos de precio), visitas movidas a horario valle e ingreso nuevo por upsell a GRAVL Pro con revenue share.

Lo que **nunca** hacemos, en ningún modelo:

- Esconder, trabar ni demorar la baja del socio. Además de ser ilegal en varios mercados (ej. "botón de baja" en Argentina), destruye la marca GRAVL frente al usuario, que es *nuestro* usuario también.
- Vender datos de socios.
- Usar datos de salud (readiness, sueño) para segmentar ofertas comerciales.

Si un partner pide cualquiera de esas tres cosas, no hay deal.

## 4. El acuerdo (Deal) manda

Todo lo que se negocia cara a cara se guarda como datos del `Deal` (`packages/domain/src/deals.ts`), no como lógica en la UI:

| Campo | Qué define |
| --- | --- |
| `monetization` | Qué es "riesgo" y qué acciones propone el copiloto |
| `northStar` | Qué optimiza el panel y qué reportamos en la QBR |
| `contactPolicy` | A quién se puede contactar, cada cuánto, por qué canal |
| `pricing` | Modelo de cobro, precio, mínimo, revenue share, plazo, descuento |
| `whiteLabel` | Si la app se muestra con la marca del partner |
| `specialTerms` | Lo que se acordó y no entra en un campo; se le muestra tal cual al partner |

El partner **ve** su acuerdo (portal → *Acuerdo & Activación*) pero no lo **edita**: lo edita GRAVL en la consola.

## 5. A quién se contacta: la regla

`nudgeDecision()` en `packages/domain/src/engagement.ts`. Gana la primera que aplica:

1. Sin consentimiento de mensajes del partner → **nunca**.
2. Contactado dentro de la ventana de frecuencia → **no** (fatiga).
3. Intención de baja → **sí**, por el canal del acuerdo (staff o push).
4. Durmiente y el acuerdo prohíbe contactarlos → **no**.
5. Inactivo o con riesgo de churn → **push**.
6. Activo → no hace falta.

Cada "no" tiene un motivo legible que la UI muestra tal cual. El staff nunca tiene que adivinar por qué un botón está deshabilitado.

## 6. Cómo cobramos

| Modelo | Cuándo | Por qué |
| --- | --- | --- |
| `PER_ACTIVE_USER` | Gimnasios (todos los segmentos) | Pagan por quien usa la app. Alinea nuestro ingreso con el valor real y hace viable el low-cost (pagar por 38.000 socios sería imposible). |
| `PER_ELIGIBLE` | Corporate | Estándar de mercado (PEPM); RR. HH. presupuesta por headcount. |
| `PER_LOCATION` | Cadenas que no toleran variabilidad | Precio fijo predecible; pedir mínimo de activación. |
| `PER_COACH` | Coaches | Precio por coach + escalón por cliente adicional (de 15 en adelante). |

Siempre hay **mínimo mensual**. Cotizamos en USD en mercados inflacionarios y facturamos en moneda local (ver `03-mercados.md`).

Guardarraíles (`pricing.ts`):

- Costo variable estimado: **US$ 0,35 por usuario activo/mes** (infra + IA + soporte). *Supuesto a validar con finanzas.*
- **Margen bruto mínimo 60%.** Por debajo, aprueba el CEO.
- Descuento > 15% o plazo < 12 meses → Head of Sales. Descuento > 30% → CEO.

## 7. Qué reportamos y cómo lo medimos

- **Contra la línea base del propio partner**, nunca contra "la industria", salvo en ventas. La curva "con GRAVL vs. industria" es material comercial, no un resultado del cliente.
- **Atribución honesta:** un nudge solo "recupera" a un socio si vuelve a entrenar en 72 h. Lo que pasa después no es mérito nuestro.
- **Grupo de control:** en cada partner grande, el 10% de los elegibles no recibe nudges durante el primer trimestre. Sin eso, el ROI es una opinión. *(Pendiente de implementar.)*

## 8. Supuestos que hay que validar antes de escalar

| Supuesto | Valor en la demo | Cómo validarlo |
| --- | --- | --- |
| Costo por usuario activo | US$ 0,35/mes | Factura de infra + IA ÷ MAU B2B |
| Recuperación del push "Volvé suave" | 41% en 72 h | Primeros 3 partners con grupo de control |
| Retención "con GRAVL" de la curva | 88% a 12 meses | Hoy sale del B2C; sesgo de autoselección. **No usarla como promesa contractual.** |
| Conversión a Pro en low-cost | 8% de los muy activos | Piloto con una franquicia |
| Tasa de rescate de staff ante intención de baja | 35% | Piloto con recepción entrenada |

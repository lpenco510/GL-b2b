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

## 3. La verdad incómoda del abono fijo (lo que antes llamábamos "low-cost")

En los planes de abono fijo (débito automático) una parte del negocio está en **quien paga y no viene**. En SportClub conviven los dos modelos: el **Flex** cobra base + uso, el **Plus/Total** es abono fijo. Por eso la política se define **por plan**, no por gimnasio (`planPolicies` en el Deal). Una cadena de 38.000 socios con 15% de asistencia real colapsa si viene el 40%.

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

## 9. Lo que GRAVL ya tiene (y este B2B aprovecha)

Relevado de gravl.ai. No es lo que imaginamos: es lo que está publicado.

| Activo | Dónde | Cómo lo usa el B2B |
| --- | --- | --- |
| +1 millón de usuarios, 4,9★ en +50K valoraciones, #1 en apps de fitness | Home | Argumento de venta: el socio ya conoce o adopta rápido la app |
| Entrenamientos adaptados **al equipamiento de cada gimnasio** ("Busca tu gimnasio") | Home | El inventario por sede es el corazón del producto B2B |
| **"¿Máquina ocupada?" → cambiar ejercicio** | Home | Señal real de demanda insatisfecha por máquina (módulo Equipamiento) |
| Strength Score, ranking entre amigos, feed, grupos | Home | Retos y ranking por sede (Comunidad) |
| Página **Empresas** con "panel de partner", prueba gratis y propuesta a medida según socios y sedes | /es/enterprise | Este proyecto es la versión seria de ese panel. Cliente citado: MrFit MX |
| Programa de **Creadores** con página propia ("Entrena con Vicky") y pago por video | /es/creators | Base natural del segmento coach |
| **API pública** con OAuth y scopes + MCP | /es/developers | Cómo conectamos sin tocar el core (ver `02-arquitectura.md`) |
| Suscripción Pro mensual o anual vía App Store / Play Store, precios personalizados por usuario (Botsi) | Términos | Define cómo pensar el ticket (sección 11) |
| Empresa: GAINS COACH PTY LTD, equipo chico y remoto, sitio en 8 idiomas | Términos / Empleo | Contexto para el plan de mercados |

## 10. Datos: la ventaja real, y su límite

**La idea:** que el gimnasio no se pueda ir porque nosotros tenemos los datos. Es la ventaja correcta, pero hay que plantearla bien. Si no, se rompe sola.

**Lo que sí nos da una posición fuerte (y es legítimo):**

1. **El historial es del socio, y el socio está en GRAVL.** Si SportClub se va, sus socios siguen entrenando con GRAVL. SportClub pierde el panel y GRAVL conserva al usuario. Esa asimetría es la ventaja.
2. **Datos de red que nadie más tiene:** qué máquinas se usan, cuáles faltan, a qué hora y en qué sedes. Como agregados anónimos entre muchos gimnasios, sirve de benchmark que ningún gimnasio puede armar solo.
3. **Integración profunda:** inventario cargado, carnet vinculado, ERP conectado, staff entrenado en la bandeja de bajas. Irse cuesta meses.
4. **El catálogo de equipamiento por gimnasio** ("Busca tu gimnasio") crece con cada partner y mejora el producto para todos.

**Lo que NO hacemos, aunque lo pida el modelo de negocio:**

- **No "secuestramos" los datos del gimnasio.** Sus datos operativos (altas, bajas, asistencia que vino de su ERP) se los devolvemos si se va. Retenerlos es ilegal en la mayoría de los mercados y mata la próxima venta.
- **No le damos al gimnasio datos que el socio no autorizó**, aunque los tengamos. La propia API de GRAVL lo dice: ningún scope da acceso a datos de otra persona.
- **No vendemos datos.** La ventaja es usarlos para dar un mejor servicio, no comercializarlos.

**La frase para la reunión:** *"El gimnasio se queda porque su panel solo funciona con GRAVL. El socio se queda porque su historial vive en GRAVL. No hace falta encerrar a nadie."*

## 11. El ticket: cómo lo vamos a definir (sin inventar números)

No sabemos el ticket promedio de GRAVL B2C y no lo vamos a adivinar. Lo que sí se sabe por los términos:

- Pro se cobra **mensual o anual** por App Store / Play Store.
- Los **precios se personalizan por usuario** (Botsi): no hay un precio único, hay un rango.
- App Store y Play Store se quedan una comisión. En B2B, con cobro directo, esa comisión no existe.

Preguntas para los founders (y por qué importan):

| Pregunta | Para qué |
| --- | --- |
| ¿Ingreso neto promedio por suscriptor Pro y mes, después de las tiendas? | Es el techo: el B2B no puede costar por socio más que un B2C, o canibaliza |
| ¿Qué % elige anual vs. mensual? | Define si cotizamos B2B anual por defecto |
| ¿Costo real por usuario activo/mes (infra + IA)? | Es el piso: debajo de eso perdemos plata con cada socio |
| ¿Conversión free → Pro y churn mensual de Pro? | Dice cuánto vale un socio que entra por el gimnasio y después se queda solo |

La regla, con o sin números: **precio B2B por socio activo entre el costo (piso) y el ingreso neto B2C (techo)**. Más cerca del piso cuando el volumen es grande, como en SportClub.

## 12. Coaches: fee por tramos

El coach paga según cuántos clientes maneja (`COACH_TIERS` en `pricing.ts`): Inicial (≤15), Pro (≤40), Studio (≤100), Equipo (+100). El precio sube con su negocio, no con funciones bloqueadas.

A futuro hay dos ingresos más:

- Una **comisión sobre lo que el coach cobra a sus clientes** a través de GRAVL.
- Su **página propia**, como hoy los Creadores ("Entrena con Vicky").

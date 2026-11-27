# 05 · Roadmap y decisiones abiertas

## Dónde estamos

Demo funcional sobre datos determinísticos. Las reglas de negocio ya están en código y con tests. No hay backend, autenticación ni pagos reales.

## Próximas versiones

### v0.3 · De demo a piloto (un partner real)
- `packages/api-client` con los tipos de `domain`; reemplazar `mock-data` pantalla por pantalla.
- Login real en el portal (staff del partner) y en la consola (SSO Google + MFA).
- Conector EVO (el ERP de 9 Fitness): altas, bajas y check-ins.
- **Grupo de control del 10%** para medir el efecto real de los nudges.
- Atribución: socio contactado → volvió en 72 h → ingreso recuperado.

### v0.4 · Low-cost a escala
- Señales de intención de baja en tiempo real (webhook del ERP al entrar a la página de baja, débito rechazado).
- Bandeja de recepción: lista del día con guion y oferta sugerida; registra el resultado.
- Oferta in-app de GRAVL Pro con revenue share y liquidación mensual al partner.
- Sugerencia de horario valle dentro de la rutina del socio.

### v0.5 · Coaches como producto propio
- Alta self-serve con tarjeta, sin vendedor (`PER_COACH`).
- El coach cobra a sus clientes a través de GRAVL (Stripe Connect / Mercado Pago marketplace) y GRAVL cobra una comisión. **Este es el negocio grande del segmento**, no la suscripción.
- Marca propia del coach en la app (white-label liviano).

### v0.6 · El socio individual como cliente directo
La misma cuenta que hoy usa la app (ver `04-identidad-y-datos.md`):
- "Mis gimnasios, mi empresa, mi coach": el socio ve y revoca sus vínculos.
- Si deja su gimnasio, la app le ofrece seguir con GRAVL Pro directo. La cuenta es suya, así que no pierde nada. Esto convierte cada baja de un partner en un posible cliente B2C. Tiene que estar en el contrato: **el partner lo acepta al firmar.**
- Pase multi-gimnasio propio (a largo plazo; compite con agregadores, decisión estratégica).

### Transversal
- i18n: es-AR → es-MX/es-ES, pt-BR, en.
- Reporte mensual automático en PDF para el dueño y QBR para la consola.
- Tests e2e (Playwright) de los flujos críticos: nudge, derivación a staff, reto, mantenimiento.

## Preguntas abiertas (necesito tus respuestas)

1. **Mercados reales:** ¿en qué países opera hoy GRAVL B2C y en cuáles hay partners o conversaciones? Los estados de `markets.ts` son supuestos.
2. **Backend actual:** ¿la app usa .NET como dice el PRD? ¿Qué proveedor de identidad (Auth0, Firebase, Cognito, propio)? Define cómo se implementa el realm de partners.
3. **Precio real:** ¿hay precios ya conversados con 9 Fitness u otros? Los del playbook son de partida.
4. **Costo por usuario activo:** ¿cuánto cuesta hoy un MAU (infra + IA)? Sin ese número el piso de margen es una suposición.
5. **Revenue share con low-cost:** ¿GRAVL Pro se vende dentro de la app con la marca del gimnasio o con la de GRAVL? Cambia el contrato y la UX.
6. **Coaches:** ¿queremos procesar pagos de sus clientes (marketplace)? Implica KYC, impuestos y soporte; es otra escala de compromiso.
7. **Socio que deja el gimnasio:** ¿estamos dispuestos a ofrecerle GRAVL directo? Es el puente B2B → B2C, pero algunos partners lo van a sentir como competencia.
8. **Agregadores:** ¿hay conversación con Wellhub o TotalPass? Define el go-to-market en BR y MX.

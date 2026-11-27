# 03 · Mercados

> Configuración en `packages/domain/src/markets.ts`; vista en la consola → *Mercados*.
> **Los estados (live/piloto/planeado) y las cifras impositivas son supuestos.** Hay que confirmarlos con el equipo y con un contador local antes de cotizar.

## Qué cambia por país

| | Moneda de cotización | Cobro | Factura fiscal | Ley de datos | Región de datos |
| --- | --- | --- | --- | --- | --- |
| 🇦🇷 Argentina | **USD** (factura en ARS) | Mercado Pago, dLocal, Stripe USD | Factura electrónica ARCA | Ley 25.326 | sa-east |
| 🇺🇾 Uruguay | USD | dLocal, Stripe USD | CFE | Ley 18.331 | sa-east |
| 🇨🇱 Chile | CLP | Stripe, dLocal | SII | Ley 19.628 → 21.719 | sa-east |
| 🇧🇷 Brasil | BRL | Pix, boleto, Stripe | NFS-e municipal | LGPD | sa-east |
| 🇲🇽 México | MXN | Stripe, OXXO, SPEI | CFDI 4.0 | LFPDPPP | us-east |
| 🇨🇴 Colombia | COP | PSE, dLocal, Stripe | DIAN | Ley 1581 | us-east |
| 🇪🇸 España | EUR | Stripe SEPA | Factura electrónica | GDPR | **eu-west** |
| 🇺🇸 EE. UU. | USD | Stripe | Invoice + sales tax por estado | CCPA y estatales | us-east |

## Reglas

1. **Mercados inflacionarios (AR): precio en USD, factura en moneda local** al tipo de cambio del día de emisión, con revisión trimestral. Nunca un precio fijo en ARS a 12 meses.
2. **Un precio de lista por segmento en USD**; cada mercado tiene un factor de paridad (poder adquisitivo y cuota promedio de gimnasio). Los descuentos van sobre el precio local resultante, con las mismas reglas de aprobación.
3. **Datos de salud = dato sensible** en LGPD, GDPR y la nueva ley chilena: consentimiento explícito y separado por finalidad. Ya está modelado como alcance `WELLNESS` aparte.
4. **Residencia de datos:** socios de la UE en la UE. LatAm puede vivir en São Paulo. El tenant guarda su región; la API enruta.
5. **Agregadores (Wellhub, TotalPass):** en Brasil y México son el canal dominante del corporate. Decidir por mercado si competimos o nos integramos como capa de entrenamiento. Recomendación: **integrarnos**, porque el agregador trae el volumen y nosotros la retención.
6. **Producto en tres idiomas** (es, pt-BR, en). Hoy la UI está en español rioplatense. El paso siguiente es extraer los textos a catálogos por locale. Los formatos de número, moneda y fecha ya salen del mercado (`fmtMoney`).

## Orden de expansión sugerido

1. **AR** (casa, partners de referencia y casos de estudio).
2. **CL y UY** (regulación y cultura de cadenas parecidas; bajo costo de entrada).
3. **MX y BR** (volumen y low-cost; requieren el modelo `BREAKAGE` bien resuelto y la integración con agregadores).
4. **ES** como puerta a la UE, solo cuando la residencia de datos en la UE esté lista.
5. **US** solo con un partner ancla. Es caro de vender sin presencia local.

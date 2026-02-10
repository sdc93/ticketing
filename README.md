# Posh REAL (España) — marketplace multi-vertical

Incluye: **feed social**, **trending**, **explore con filtros**, **dashboard organizador**, **ticketing (gratis + Stripe)**,
**check-in QR**, y **Stripe Connect (Express) onboarding** (esqueleto para payouts).

Stack: Next.js 14 + Supabase + Stripe + Tailwind + TS.

## Quickstart
1) Supabase SQL Editor: ejecuta `supabase/migrations/001_init.sql`
2) Crea `.env.local` desde `.env.example`
3) Stripe webhook: `/api/stripe/webhook`
4) `npm i && npm run dev`


## Comisión híbrida (comprador paga fee)
Regla incluida:
- **fee_por_ticket = max(1.00€, 8% del precio base)**
- El comprador paga: **base + fee**
- El organizador recibe **base** (vía Stripe Connect)
- La plataforma se queda **fee** (application_fee_amount)

Para tickets de pago, el organizador debe completar **Stripe Connect** en `/dashboard/connect`.


## Refunds + Admin (añadido)
- Panel `/admin` (solo perfiles con `is_admin=true`).
- Listado de órdenes pagadas y estado.
- Acción de **reembolso** (Stripe) con opción:
  - **Reembolsar también la comisión** (refund_application_fee=true) o no.
- Payouts: vista de ingresos por organizador (base) y revenue plataforma (fee).

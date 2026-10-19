# VowFound

Matchmaking and marriage-readiness coaching for people who mean it.
Next.js 16 · React 19 · Tailwind 4 · Supabase · Flutterwave · Resend.

## The offer

| Step | Price (USD / NGN) | What it is |
| --- | --- | --- |
| Readiness Check | Free | 18 statements, 6 dimensions, instant results |
| The Read | $49 / ₦25,000 | Written report + 30-min coach call; credited toward Ready or Matched within 30 days |
| Ready | $1,200 / ₦450,000 | 12 weeks: 6 one-to-ones, weekly small group, feedback |
| Matched | $3,900 / ₦1,450,000 | 6 months: Ready + a named matchmaker and introductions |
| Private | from $15,000 / ₦6,000,000 | 12 months, principal-led, by application |

Prices and the reasoning behind them live in `src/lib/products.ts` — the only
place a fee is read at charge time. Naira is available to Nigerian visitors
only, decided from edge headers and re-checked at checkout.

## Running it

```bash
npm install
npm run dev
```

Environment (see `.env.example`): `NEXT_PUBLIC_SUPABASE_URL`,
`NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SECRET_KEY`,
`FLUTTERWAVE_SECRET_KEY`, `FLUTTERWAVE_SECRET_HASH`, `RESEND_API_KEY`,
`EMAIL_FROM`, `STAFF_EMAIL`, `NEXT_PUBLIC_SITE_URL`.

Database: apply `supabase/migrations/0012_rebuild.sql`. It only adds tables
(`members`, `readiness_checks`, `orders`, `applications`, `enquiries`) and
leaves the earlier schema untouched. Point the Flutterwave webhook at
`/api/webhooks/flutterwave` with your secret hash.

## Rules the code enforces (`tests/unit/core.test.ts`)

- No claim, anywhere, that we guarantee a marriage.
- No secret key in any module that can reach the browser.
- RLS on every table the rebuild creates.
- No invented popularity badges, testimonials or numbers.
- A payment is marked paid only after Flutterwave confirms it directly.

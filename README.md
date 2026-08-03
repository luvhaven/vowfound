# VowFound

A private marriage-readiness, coaching and curated-matchmaking practice.
Not a dating app: no swiping, no public browsing, no member directory, and no
introduction made without a person deciding it.

---

## Versions

Resolved and pinned at install, not asserted from memory:

| Package | Version |
|---|---|
| Next.js | 16.2.12 (App Router, Turbopack) |
| React | 19.2.4 |
| TypeScript | 5.x, strict |
| Tailwind CSS | 4.x |
| Supabase JS / SSR | 2.x |
| Zod | 4.x |
| Playwright | 1.x |
| Vitest | 3.x |

Fonts are self-hosted: **Newsreader** via `next/font/google`, **Switzer**
downloaded from Fontshare into `src/fonts` and loaded with `next/font/local`.
Both are preloaded. No font is fetched from a third party at runtime.

---

## Local setup

```bash
npm install
cp .env.example .env.local
npm run dev
```

The site runs without Supabase configured — the marketing pages, the
assessment and the readiness map all work, with the assessment persisting to
`localStorage` instead of the database. Accounts, payments and admin need the
environment filled in.

### Database

```bash
supabase db reset
```

Applies `supabase/migrations/*.sql` in order, then `supabase/seed.sql`.

| Migration | Contents |
|---|---|
| `0001_core.sql` | Types, profiles, roles, consent, audit, deletion requests, leads |
| `0002_assessment.sql` | Assessment, answers, readiness map, requirements |
| `0003_commerce.sql` | Plans, programmes, enrolments, payments, appointments |
| `0004_delivery.sql` | V2: coaching, matchmaking, introductions, safety, support |
| `0005_content.sql` | Journal, stories, private storage buckets |

Every table has RLS enabled and at least one policy. A table with RLS on and
no policy denies everything, which is the failure mode we want.

---

## Scripts

```bash
npm run dev         # development server
npm run build       # production build
npm run typecheck   # tsc --noEmit
npm run lint        # eslint
npm run test        # vitest
npm run e2e         # playwright, desktop and mobile
```

---

## What ships in V1

Public marketing site · readiness assessment and map · auth · dual-currency
payments · consultation booking · minimal member area (readiness, appointments,
billing, privacy, export, deletion) · admin (users, leads, assessments, plans,
content, audit log).

## What is deferred to V2

Learning modules and exercises · coach messaging · matchmaking profiles and
verification UI · shortlisting · the introduction and mutual-consent workflow ·
date feedback · the matchmaker portal · safety review queue · support tickets.

**Every V2 table exists now, empty, with its policies.** Building the V2
interfaces is not a migration.

---

## Things that are enforced, not requested

These are the parts most likely to drift under maintenance pressure, so none
of them rely on anyone remembering.

| Rule | Where it is enforced |
|---|---|
| No guarantee of marriage | `tests/unit/non-negotiables.test.ts` scans all source, content and SQL |
| The guarantee wording cannot be edited by an admin | `components/site/guarantee.tsx` takes no props and reads no database field; a test asserts both |
| Every public table has RLS | Test parses the migrations and compares `create table` against `enable row level security` |
| `audit_logs` is append-only | Test asserts no update, delete or `for all` policy exists |
| No public storage bucket | Test asserts every seeded bucket is created with `public = false` |
| No secret reaches the browser | Test asserts every module touching a secret is `server-only`, and that no client component imports the service-role client |
| A story cannot be published without a signed release | `published_requires_release` check constraint |
| Demonstration content can never be published | `demo_never_published` check constraint |
| Private routes are never indexed | Middleware sets `X-Robots-Tag`; asserted end to end |
| A matchmaker override must carry a reason | `override_reason_required` check constraint |
| Introductions open only on two acceptances | `sync_introduction_status` trigger, plus the conversation policy |
| Members are 18 or over | `adults_only` check constraint |

---

## Currency

Region is detected server-side from request headers
(`x-vercel-ip-country`, `cf-ipcountry`). A manual override is stored in a
cookie and always wins. **Only one currency ever reaches a screen** — the
switcher names the other option, it never prices it. An end-to-end test asserts
this.

NGN routes to Paystack, USD routes to Stripe, both behind `PaymentProvider`
in `src/lib/payments/types.ts`. A third provider is one new file and one line
in `providerFor()`.

Webhooks land on `/api/webhooks/[provider]`, verify the signature against the
raw body, and answer `202` to anything unsigned or unrecognised so a prober
learns nothing from the response.

Pricing appears only after the assessment results, and never in the hero, the
nav or the plans page. An end-to-end test asserts that too.

---

## Imagery

There are no photographs of people on this site and no generated faces.

Where imagery is needed, `src/components/ui/plates.tsx` provides engraved line
illustrations — objects and settings drawn as an old stationer's catalogue
would: a table set for two, a sealed envelope, an arch, a calendar, a
signature. They are geometry, they weigh nothing, and they scale without a
second asset. `src/components/ui/ornament.tsx` adds the monogram, rules and
rings.

When real photography exists, it replaces a plate in the same slot.

Likewise there are no testimonials, because there are no clients yet. The
`testimonials` table and its release constraint are built and ready; the
public query returns published, non-demo rows only; and the stories page says
plainly that there are none and why.

---

## Security checklist

- [x] RLS on every table, verified by test
- [x] Role checks in the database, not only the UI
- [x] Service-role key server-only, never in a client component
- [x] Webhook signatures verified against the raw body, timing-safe for Paystack
- [x] Rate limiting on contact, auth and checkout
- [x] Sign-in gives one answer for a wrong password and an unknown address
- [x] Password reset gives the same answer whether or not the account exists
- [x] Honeypot on the contact form
- [x] `noindex` on every authenticated route, set in middleware
- [x] Private routes excluded from `robots.txt` and the sitemap
- [ ] Multi-instance rate limiting (swap the body of `src/lib/rate-limit.ts` for Redis)
- [ ] Penetration test before launch

## Privacy and consent checklist

- [x] Four separate, timestamped, independently revocable consents
- [x] Age confirmation recorded as a consent event at signup
- [x] Self-serve export of every record keyed to the member
- [x] Self-serve deletion, immediate, with no retention flow
- [x] Every admin read of member data written to `audit_logs`
- [x] Members can read the audit entries that concern them
- [x] Private storage only, signed expiring URLs
- [ ] Data processing agreements with Supabase, Stripe, Paystack, Resend
- [ ] Legal review of `src/content/legal.ts` in every operating jurisdiction

## Production readiness checklist

- [x] Type check, lint, unit tests and end-to-end tests pass
- [x] Responsive at 375, 768 and 1280
- [x] Keyboard-only navigation on the hero and the assessment
- [x] `prefers-reduced-motion` honoured, verified end to end
- [ ] Payments tested in both providers' sandboxes with real credentials
- [ ] Account deletion tested against a live Supabase project
- [ ] Error monitoring and structured logging wired to a provider
- [ ] Real booking URL set in `NEXT_PUBLIC_BOOKING_URL`

---

## Design

The concept: **a fine stationery suite rendered as an interface.**

`--ink` is the field. `--stock` is card surfaces only and is never a page
background — that inversion is the whole reason this does not look like every
other AI-generated site, so do not undo it. The foil gradient is a 1px stroke
and never a fill. Radius caps at 4px, because stationery is cut, not rounded.

The typographic fingerprint is `.engraved`: Newsreader, uppercase, 0.18em
tracking, 12–13px, used for every eyebrow, label, button and nav item. There is
no fourth type style.

The motion budget is three things: the hero sequence, 400ms/24px scroll
reveals, and one foil sweep on hover. Everything else is static.

### The signature moment

`src/components/home/save-the-date.tsx`. Choosing a timeline runs one
orchestrated 900ms sequence: the month typesets with a 3px letterpress
impression, the day count resolves digit by digit, and a single highlight
sweeps the foil hairline. Under `prefers-reduced-motion` all three land at once
carrying identical information.

*I need help deciding* is a first-class path, not a fallback: it defers the
timeline question to the end of the assessment rather than penalising it.

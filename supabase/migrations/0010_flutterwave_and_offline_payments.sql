-- =============================================================================
-- 0010_flutterwave_and_offline_payments.sql
--
-- Two changes, both driven by what this business actually sells.
--
-- 1. Flutterwave as a payment provider. It collects in NGN and USD from one
--    integration, and it carries the Nigerian bank-transfer rails that matter
--    at these prices — a ₦450,000 programme is not a card transaction.
--
-- 2. An offline provider, for money that arrives by bank transfer outside any
--    gateway. Concierge is ₦3,500,000 / $8,500; nobody puts that on a debit
--    card, and pretending otherwise would mean either losing the sale or
--    keeping the payment off the books entirely. Recording it here keeps one
--    ledger, so billing history, revenue and the audit log stay true.
-- =============================================================================

alter type public.payment_provider add value if not exists 'flutterwave';
alter type public.payment_provider add value if not exists 'offline';

-- Postgres will not let a new enum value be used in the same transaction that
-- created it, so everything below runs in its own statement batch.
commit;

-- --- Offline payment provenance ---------------------------------------------
-- A gateway payment carries its own evidence in raw_event. An offline one has
-- none, so it has to say who recorded it and on what basis. Without that an
-- offline row is just an assertion.

alter table public.payments
  add column if not exists recorded_by uuid references public.profiles (id) on delete set null,
  add column if not exists recorded_note text,
  add column if not exists bank_reference text;

comment on column public.payments.recorded_by is
  'Staff member who recorded an offline payment. Null for gateway payments.';
comment on column public.payments.recorded_note is
  'Why this offline payment was accepted — which account, which invoice.';
comment on column public.payments.bank_reference is
  'The transfer reference from the bank, so it can be reconciled later.';

-- An offline payment must say who recorded it and give a reference. A gateway
-- payment must not pretend to have been recorded by a person.
alter table public.payments
  drop constraint if exists offline_payments_are_attributable;

alter table public.payments
  add constraint offline_payments_are_attributable check (
    case
      when provider = 'offline'
        then recorded_by is not null and bank_reference is not null
      else recorded_by is null
    end
  );

-- --- Idempotency -------------------------------------------------------------
-- Flutterwave retries webhooks. Reconciling on (provider, reference) needs that
-- pair to be unique or a retry can create a second row and double-count.

create unique index if not exists payments_provider_reference_key
  on public.payments (provider, provider_reference);

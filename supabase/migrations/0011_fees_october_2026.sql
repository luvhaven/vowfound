-- =============================================================================
-- 0011_fees_october_2026.sql
--
-- Brings the plans catalogue in line with src/lib/products.ts, which remains
-- the authority at the moment of charge. The reasoning for each fee lives
-- beside the numbers in products.ts so it is read whenever they change.
-- =============================================================================

update public.plans set price_ngn = 75000,   price_usd = 129   where slug = 'clarity-audit';
update public.plans set price_ngn = 495000,  price_usd = 1450  where slug = 'ready-in-90';
update public.plans set price_ngn = 1650000, price_usd = 4500  where slug = 'match';
update public.plans set price_ngn = 4750000, price_usd = 12500 where slug = 'private-concierge';

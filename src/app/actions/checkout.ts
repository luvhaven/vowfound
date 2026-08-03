"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  CURRENCY_COOKIE,
  isCurrencyAllowed,
  priceFor,
  productBySlug,
  type Currency,
} from "@/lib/products";
import { providerFor, toMinorUnits } from "@/lib/payments";
import { resolveCurrency, detectCountry } from "@/lib/currency.server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient, supabaseConfigured } from "@/lib/supabase/admin";
import { rateLimit } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/brand";

/**
 * Records a currency preference — but only one the visitor's region actually
 * permits. Setting the cookie to NGN from outside Nigeria is rejected here
 * and would be rejected again at checkout even if it were not.
 */
export async function setCurrency(next: Currency) {
  const country = await detectCountry();
  if (!isCurrencyAllowed(next, country)) {
    return { ok: false as const, error: "not_available_in_your_region" };
  }

  const store = await cookies();
  store.set(CURRENCY_COOKIE, next, {
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

const schema = z.object({
  slug: z.string().min(1).max(64),
  email: z.string().email().max(320),
  name: z.string().trim().min(1).max(160).optional(),
});

export async function startCheckout(input: unknown) {
  const parsed = schema.safeParse(input);
  if (!parsed.success) return { ok: false as const, error: "invalid" };

  const h = await headers();
  const allowed = await rateLimit(
    `checkout:${h.get("x-forwarded-for") ?? "local"}`,
    10,
    600,
  );
  if (!allowed) return { ok: false as const, error: "rate_limited" };

  const product = productBySlug(parsed.data.slug);
  if (!product) return { ok: false as const, error: "unknown_product" };

  if (product.applicationOnly) {
    if (!supabaseConfigured()) {
      return { ok: false as const, error: "provider_not_configured" };
    }

    const db = createAdminClient();
    const { error } = await db.from("leads").insert({
      email: parsed.data.email,
      full_name: parsed.data.name ?? null,
      source: `application:${product.slug}`,
    });

    if (error) {
      console.error("[application] lead insert failed", error);
      return { ok: false as const, error: "provider_failed" };
    }

    redirect(`${SITE_URL}/checkout/${product.slug}/confirmation`);
  }

  // Authoritative check, at the moment money is about to move. resolveCurrency
  // already refuses a region-mismatched cookie, but this is the line that
  // actually protects local pricing, so it re-derives rather than trusting
  // anything carried in from the page that rendered the form.
  const country = await detectCountry();
  const currency = await resolveCurrency();
  if (!isCurrencyAllowed(currency, country)) {
    return { ok: false as const, error: "currency_not_available" };
  }

  const provider = providerFor(currency);

  if (!provider.isConfigured()) {
    return { ok: false as const, error: "provider_not_configured" };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let session;
  try {
    session = await provider.createCheckout({
      productSlug: product.slug,
      productName: product.name,
      amountMinor: toMinorUnits(priceFor(product, currency), currency),
      currency,
      email: parsed.data.email,
      userId: user?.id,
      successUrl: `${SITE_URL}/checkout/${product.slug}/confirmation`,
      cancelUrl: `${SITE_URL}/checkout/${product.slug}`,
    });
  } catch (error) {
    console.error("[checkout] provider failed", error);
    return { ok: false as const, error: "provider_failed" };
  }

  // Record the attempt before sending anyone to pay, so a webhook always has
  // a row to reconcile against.
  if (supabaseConfigured()) {
    const db = createAdminClient();
    await db.from("payments").upsert(
      {
        user_id: user?.id ?? null,
        provider: provider.name,
        provider_reference: session.reference,
        status: "pending",
        currency,
        amount_minor: toMinorUnits(priceFor(product, currency), currency),
        email: parsed.data.email,
      },
      { onConflict: "provider,provider_reference" },
    );
  }

  redirect(session.url);
}

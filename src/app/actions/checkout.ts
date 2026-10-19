"use server";

import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { CURRENCY_COOKIE, productBySlug, toMinor, type Currency } from "@/lib/products";
import { currencyOptions } from "@/lib/currency.server";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";
import { getUser } from "@/lib/supabase/server";
import { createPaymentLink, flutterwaveConfigured } from "@/lib/flutterwave";
import { amountDue } from "@/lib/orders.server";
import { rateLimit } from "@/lib/rate-limit";
import { SITE_URL } from "@/lib/brand";

export async function chooseCurrency(next: Currency) {
  if (!(await currencyOptions()).includes(next)) return;
  (await cookies()).set(CURRENCY_COOKIE, next, { path: "/", sameSite: "lax", maxAge: 31_536_000 });
}

const schema = z.object({
  slug: z.string().min(1).max(40),
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(320),
  currency: z.enum(["NGN", "USD"]),
});

export type CheckoutState = { error?: string } | undefined;

export async function startCheckout(_: CheckoutState, form: FormData): Promise<CheckoutState> {
  const parsed = schema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: "Please add your name and a valid email." };

  const product = productBySlug(parsed.data.slug);
  if (!product || product.applicationOnly) return { error: "This plan isn't available to buy directly." };

  // The currency is re-derived from region here, at the moment money moves.
  if (!(await currencyOptions()).includes(parsed.data.currency)) {
    return { error: "That currency isn't available in your region." };
  }

  const ip = (await headers()).get("x-forwarded-for") ?? "local";
  if (!rateLimit(`checkout:${ip}`, 10, 600)) return { error: "Too many attempts. Try again in a few minutes." };
  if (!adminConfigured() || !flutterwaveConfigured()) {
    return { error: "Payments are being set up. Email hello@vowfound.com and we'll invoice you directly." };
  }

  const { name, email, currency } = parsed.data;
  const { amount } = await amountDue(product.slug, currency, email);
  const txRef = `vf_${product.slug}_${crypto.randomUUID().slice(0, 18)}`;
  const user = await getUser().catch(() => null);

  const { error } = await createAdminClient().from("orders").insert({
    member_id: user?.id ?? null,
    email,
    product: product.slug,
    currency,
    amount_minor: toMinor(amount),
    tx_ref: txRef,
  });
  if (error) {
    console.error("[checkout] order insert failed", error);
    return { error: "We couldn't start checkout. Please try again." };
  }

  let link: string;
  try {
    link = await createPaymentLink({
      txRef,
      amount,
      currency,
      email,
      name,
      title: product.name,
      redirectUrl: `${SITE_URL}/checkout/done`,
    });
  } catch (e) {
    console.error("[checkout] flutterwave failed", e);
    return { error: "The payment provider didn't respond. Please try again." };
  }
  redirect(link);
}

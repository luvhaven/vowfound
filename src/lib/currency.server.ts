import "server-only";
import { cookies, headers } from "next/headers";
import {
  CURRENCY_COOKIE,
  allowedCurrencies,
  isCurrencyAllowed,
  type Currency,
} from "@/lib/products";

/**
 * Region is read from the edge headers the platform attaches. A visitor
 * cannot set these — unlike a cookie, which they can.
 */
export async function detectCountry(): Promise<string | null> {
  const h = await headers();
  return (
    h.get("x-vercel-ip-country") ??
    h.get("cf-ipcountry") ??
    h.get("x-country-code") ??
    // Explicit opt-in for local work and end-to-end tests. Off unless
    // ALLOW_DEBUG_COUNTRY is set, so a deployed environment cannot be talked
    // into local pricing by a request header.
    (process.env.ALLOW_DEBUG_COUNTRY === "1"
      ? h.get("x-debug-country")
      : null) ??
    null
  );
}

/**
 * The currency this request may transact in.
 *
 * A stored preference is honoured only if the region permits it, so someone
 * outside Nigeria who forges the cookie still resolves to dollars. This is
 * the single function every screen and the checkout action agree on.
 */
export async function resolveCurrency(): Promise<Currency> {
  const country = await detectCountry();
  const allowed = allowedCurrencies(country);

  const store = await cookies();
  const preferred = store.get(CURRENCY_COOKIE)?.value;

  if (
    (preferred === "NGN" || preferred === "USD") &&
    isCurrencyAllowed(preferred, country)
  ) {
    return preferred;
  }

  return allowed[0];
}

/** True when the visitor has a real choice to offer. */
export async function currencyOptions(): Promise<Currency[]> {
  return allowedCurrencies(await detectCountry());
}

export async function currencyWasChosen(): Promise<boolean> {
  const store = await cookies();
  const v = store.get(CURRENCY_COOKIE)?.value;
  return v === "NGN" || v === "USD";
}

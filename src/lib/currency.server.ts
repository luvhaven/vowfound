import "server-only";
import { cookies, headers } from "next/headers";
import { allowedCurrencies, CURRENCY_COOKIE, type Currency } from "@/lib/products";

/** Region comes from edge headers a visitor cannot set, never from a cookie. */
export async function detectCountry(): Promise<string | null> {
  const h = await headers();
  return (
    h.get("x-vercel-ip-country") ??
    h.get("cf-ipcountry") ??
    (process.env.ALLOW_DEBUG_COUNTRY === "1" ? h.get("x-debug-country") : null) ??
    null
  );
}

export async function currencyOptions() {
  return allowedCurrencies(await detectCountry());
}

/** A stored preference is honoured only where the region permits it. */
export async function resolveCurrency(): Promise<Currency> {
  const allowed = await currencyOptions();
  const preferred = (await cookies()).get(CURRENCY_COOKIE)?.value as Currency | undefined;
  return preferred && allowed.includes(preferred) ? preferred : allowed[0];
}

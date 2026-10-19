import "server-only";
import type { Currency } from "@/lib/products";

const API = "https://api.flutterwave.com/v3";

export function flutterwaveConfigured() {
  return Boolean(process.env.FLUTTERWAVE_SECRET_KEY);
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.FLUTTERWAVE_SECRET_KEY}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: "no-store",
  });
  const body = (await res.json().catch(() => ({}))) as T & { status?: string; message?: string };
  if (!res.ok) throw new Error(`Flutterwave ${path} ${res.status}: ${body.message ?? "error"}`);
  return body;
}

/** Creates a hosted payment link. Amount is in major units, as Flutterwave expects. */
export async function createPaymentLink(input: {
  txRef: string;
  amount: number;
  currency: Currency;
  email: string;
  name?: string;
  title: string;
  redirectUrl: string;
}) {
  const body = await call<{ data: { link: string } }>("/payments", {
    method: "POST",
    body: JSON.stringify({
      tx_ref: input.txRef,
      amount: input.amount,
      currency: input.currency,
      redirect_url: input.redirectUrl,
      customer: { email: input.email, name: input.name },
      customizations: { title: "VowFound", description: input.title },
      payment_options: input.currency === "NGN" ? "card,banktransfer,ussd" : "card",
    }),
  });
  return body.data.link;
}

export interface VerifiedTransaction {
  id: number;
  tx_ref: string;
  status: string;
  amount: number;
  currency: string;
}

/** The only source of truth for whether money moved: ask Flutterwave directly. */
export async function verifyTransaction(id: string | number) {
  const body = await call<{ data: VerifiedTransaction }>(`/transactions/${encodeURIComponent(String(id))}/verify`);
  return body.data;
}

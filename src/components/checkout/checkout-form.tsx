"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { startCheckout, chooseCurrency, type CheckoutState } from "@/app/actions/checkout";
import type { Currency } from "@/lib/products";
import { track } from "@/lib/track";

export function CheckoutForm({
  slug,
  currency,
  options,
  defaultEmail,
  defaultName,
}: {
  slug: string;
  currency: Currency;
  options: Currency[];
  defaultEmail?: string;
  defaultName?: string;
}) {
  const router = useRouter();
  const [state, action, pending] = React.useActionState<CheckoutState, FormData>(startCheckout, undefined);
  const [switching, startSwitch] = React.useTransition();
  const other = options.find((c) => c !== currency);

  React.useEffect(() => {
    track("checkout_view", { plan: slug, currency });
  }, [slug, currency]);

  return (
    <form action={action} onSubmit={() => track("checkout_submit", { plan: slug, currency })} className="grid gap-5">
      <input type="hidden" name="slug" value={slug} />
      <input type="hidden" name="currency" value={currency} />
      <label className="grid gap-2">
        <span className="label">Full name</span>
        <input name="name" className="field" required autoComplete="name" defaultValue={defaultName} />
      </label>
      <label className="grid gap-2">
        <span className="label">Email</span>
        <input name="email" type="email" className="field" required autoComplete="email" defaultValue={defaultEmail} />
        <span className="text-[13px] text-ink-mute">
          Bought The Read in the last 30 days? Use the same email and it&apos;s credited automatically.
        </span>
      </label>
      {state?.error && (
        <p role="alert" className="rounded-2xl border-2 border-ink bg-bubble px-4 py-3 font-bold">
          {state.error}
        </p>
      )}
      <button type="submit" className="btn btn-lg w-full bg-tomato text-ink" disabled={pending}>
        {pending ? "Opening secure payment…" : "Continue to secure payment"}
      </button>
      {other && (
        <button
          type="button"
          disabled={switching}
          onClick={() =>
            startSwitch(async () => {
              await chooseCurrency(other);
              router.refresh();
            })
          }
          className="text-[14px] font-bold underline underline-offset-4"
        >
          Pay in {other === "NGN" ? "naira" : "dollars"} instead
        </button>
      )}
    </form>
  );
}

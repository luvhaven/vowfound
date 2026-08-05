"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { recordOfflinePayment } from "@/app/actions/offline-payment";
import { PRODUCTS, formatPrice, type Currency } from "@/lib/products";

/**
 * Banking a transfer that arrived outside any gateway. The amount is not typed
 * in — it is taken from the catalogue for the plan and currency chosen, so a
 * slipped digit cannot quietly enter the ledger.
 */
export function OfflinePaymentForm() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [email, setEmail] = React.useState("");
  const [productSlug, setProductSlug] = React.useState(PRODUCTS[0].slug);
  const [currency, setCurrency] = React.useState<Currency>("NGN");
  const [bankReference, setBankReference] = React.useState("");
  const [note, setNote] = React.useState("");
  const [confirmation, setConfirmation] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState<string | null>(null);
  const [pending, start] = React.useTransition();

  const product = PRODUCTS.find((p) => p.slug === productSlug) ?? PRODUCTS[0];
  const amount = formatPrice(product.price[currency], currency);

  function reset() {
    setEmail("");
    setBankReference("");
    setNote("");
    setConfirmation("");
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    start(async () => {
      const result = await recordOfflinePayment({
        email,
        productSlug,
        currency,
        bankReference,
        note,
        confirmation,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDone(`${amount} recorded against ${email}.`);
      reset();
      router.refresh();
    });
  }

  if (!open) {
    return (
      <div className="rounded-[14px] border border-hairline bg-onink/[0.02] px-6 py-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-xl">
            <p className="engraved text-rose">Bank transfer</p>
            <p className="mt-2 text-[15px] leading-relaxed text-onink-dim">
              Record money that arrived by transfer rather than through the
              payment page. It lands in the same ledger, against your name.
            </p>
          </div>
          <Button type="button" variant="quiet" onClick={() => setOpen(true)}>
            Record a transfer
          </Button>
        </div>
        {done && (
          <p className="mt-4 border-l-2 border-sage-ink pl-4 text-[15px] text-sage">
            {done}
          </p>
        )}
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      noValidate
      className="rounded-[14px] border border-hairline bg-onink/[0.02] px-6 py-6"
    >
      <p className="engraved text-rose">Record a bank transfer</p>

      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <div>
          <label htmlFor="op-email" className="engraved block text-onink-faint">
            Payer&rsquo;s email
          </label>
          <input
            id="op-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="field-dark mt-2.5"
            autoComplete="off"
          />
          <p className="mt-2 text-[13px] text-onink-faint">
            If they have an account, it attaches to their billing history.
          </p>
        </div>

        <div>
          <label htmlFor="op-ref" className="engraved block text-onink-faint">
            Bank reference
          </label>
          <input
            id="op-ref"
            value={bankReference}
            onChange={(e) => setBankReference(e.target.value)}
            className="field-dark mt-2.5"
            autoComplete="off"
          />
          <p className="mt-2 text-[13px] text-onink-faint">
            From the statement. Recording the same one twice is refused.
          </p>
        </div>

        <div>
          <label htmlFor="op-plan" className="engraved block text-onink-faint">
            Plan
          </label>
          <select
            id="op-plan"
            value={productSlug}
            onChange={(e) => setProductSlug(e.target.value)}
            className="field-dark mt-2.5"
          >
            {PRODUCTS.map((p) => (
              <option key={p.slug} value={p.slug}>
                {p.name}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label htmlFor="op-currency" className="engraved block text-onink-faint">
            Currency
          </label>
          <select
            id="op-currency"
            value={currency}
            onChange={(e) => setCurrency(e.target.value as Currency)}
            className="field-dark mt-2.5"
          >
            <option value="NGN">Naira</option>
            <option value="USD">Dollars</option>
          </select>
        </div>

        <div className="md:col-span-2">
          <label htmlFor="op-note" className="engraved block text-onink-faint">
            Note — optional
          </label>
          <textarea
            id="op-note"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            className="field-dark mt-2.5 min-h-20 resize-y"
          />
        </div>
      </div>

      {/* The amount is shown, not typed. */}
      <div className="mt-6 flex flex-wrap items-baseline justify-between gap-4 border-t border-hairline pt-5">
        <p className="engraved text-onink-faint">Amount to record</p>
        <p className="numeral display-md text-onink">{amount}</p>
      </div>

      <div className="mt-5">
        <label htmlFor="op-confirm" className="engraved block text-onink-faint">
          Type RECORD PAYMENT to confirm
        </label>
        <input
          id="op-confirm"
          value={confirmation}
          onChange={(e) => setConfirmation(e.target.value)}
          className="field-dark mt-2.5"
          autoComplete="off"
        />
      </div>

      {error && (
        <p
          role="alert"
          className="mt-5 border-l-2 border-oxblood pl-4 text-[15px] text-oxblood"
        >
          {error}
        </p>
      )}

      <div className="mt-7 flex flex-wrap gap-3">
        <Button type="submit" disabled={pending}>
          {pending ? "Recording" : "Record payment"}
        </Button>
        <Button
          type="button"
          variant="quiet"
          onClick={() => {
            setOpen(false);
            setError(null);
          }}
          disabled={pending}
        >
          Cancel
        </Button>
      </div>
    </form>
  );
}

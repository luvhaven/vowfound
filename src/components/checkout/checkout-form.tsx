"use client";

import * as React from "react";
import { Button } from "@/components/ui/button";
import { startCheckout } from "@/app/actions/checkout";

export function CheckoutForm({
  slug,
  applicationOnly,
}: {
  slug: string;
  applicationOnly: boolean;
}) {
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [confirmed, setConfirmed] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [pending, startTransition] = React.useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);

    if (applicationOnly && !name.trim()) {
      setError("Tell us what to call you.");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("That email address does not look right.");
      return;
    }
    if (!confirmed) {
      setError("Please confirm you are 18 or over.");
      return;
    }

    startTransition(async () => {
      const result = await startCheckout({
        slug,
        email,
        name: applicationOnly ? name : undefined,
      });
      // A success redirects and never returns.
      if (result && !result.ok) {
        setError(
          result.error === "provider_not_configured"
            ? applicationOnly
              ? "Applications are not connected on this environment yet. Book a consultation and we will take it from there."
              : "Payments are not connected on this environment yet. Book a consultation and we will take it from there."
            : applicationOnly
              ? "We could not submit the application. Try again in a moment."
              : "We could not open the payment page. Try again in a moment.",
        );
      }
    });
  }

  return (
    <form onSubmit={submit} noValidate>
      <div className="flex items-start justify-between gap-6 border-b border-stone pb-6">
        <div>
          <p className="engraved text-oxblood">
            {applicationOnly ? "Private application" : "Step 1 of 2"}
          </p>
          <h2 className="display-md mt-3 text-ink">
            {applicationOnly ? "Request consideration" : "Your details"}
          </h2>
        </div>
        <p className="numeral display text-[2rem] leading-none text-stone" aria-hidden>
          {applicationOnly ? "A" : "01"}
        </p>
      </div>
      {applicationOnly && (
        <p className="mt-4 text-[15px] leading-relaxed text-slate">
          Places are capped. This records your interest and opens a private
          conversation; it does not take payment. We reply either way within
          five working days.
        </p>
      )}

      {applicationOnly && (
        <div className="mt-7">
          <label htmlFor="application-name" className="engraved block text-slate">
            Your name
          </label>
          <input
            id="application-name"
            autoComplete="name"
            className="field mt-2.5"
            value={name}
            onChange={(event) => setName(event.target.value)}
            aria-invalid={error === "Tell us what to call you."}
            required
          />
        </div>
      )}

      <div className={applicationOnly ? "mt-6" : "mt-7"}>
        <label htmlFor="email" className="engraved block text-slate">
          Email
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="field mt-2.5"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          aria-invalid={error === "That email address does not look right."}
          aria-describedby={error ? "checkout-error" : undefined}
        />
        <p className="mt-2 text-[14px] text-slate">
          Your receipt and everything that follows goes here.
        </p>
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={confirmed}
          onChange={(e) => setConfirmed(e.target.checked)}
          aria-invalid={error === "Please confirm you are 18 or over."}
          className="mt-1 h-4 w-4 shrink-0 accent-[#4A202C]"
        />
        <span className="text-[15px] leading-relaxed text-slate">
          I am 18 or over and I am seeking a lasting marriage.
        </span>
      </label>

      {error && (
        <p
          id="checkout-error"
          role="alert"
          className="mt-5 border-l-2 border-oxblood pl-4 text-[15px] text-oxblood"
        >
          {error}
        </p>
      )}

      <div className="mt-8">
        <Button type="submit" size="lg" disabled={pending} className="w-full">
          {pending
            ? applicationOnly
              ? "Sending application"
              : "Opening secure payment"
            : applicationOnly
              ? "Request a private review"
              : "Continue to payment"}
        </Button>
      </div>
    </form>
  );
}

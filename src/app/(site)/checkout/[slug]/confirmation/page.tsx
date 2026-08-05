import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Section } from "@/components/ui/layout";
import { Paper, PaperInset } from "@/components/ui/paper";
import { Button } from "@/components/ui/button";
import { productBySlug } from "@/lib/products";
import { VowMark } from "@/components/ui/ornament";
import { confirmFlutterwaveRedirect } from "@/lib/payments";
import { CONTACT_EMAIL } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Confirmation",
  robots: { index: false, follow: false },
};

/**
 * This page used to announce success to anyone who reached the URL.
 *
 * That is wrong twice over. A payment provider redirects here on cancellation
 * and on failure as well as on success, and the address is guessable, so the
 * page was capable of telling somebody their place was held when no money had
 * moved. Now it reads the transaction back from the provider and says only
 * what it can actually establish.
 *
 * Settlement still belongs to the webhook. This page reports; it never writes.
 */
type Outcome = "succeeded" | "failed" | "unverified";

export default async function ConfirmationPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const [{ slug }, query] = await Promise.all([params, searchParams]);
  const product = productBySlug(slug);
  if (!product) notFound();

  const one = (value: string | string[] | undefined) =>
    Array.isArray(value) ? value[0] : value;

  // Flutterwave returns status, tx_ref and transaction_id on the redirect.
  const transactionId = one(query.transaction_id);
  const reference = one(query.tx_ref);
  const declared = one(query.status);

  let outcome: Outcome = "unverified";

  if (product.applicationOnly) {
    // Nothing was charged, so there is nothing to verify.
    outcome = "succeeded";
  } else if (declared === "cancelled") {
    outcome = "failed";
  } else if (transactionId && reference) {
    const verified = await confirmFlutterwaveRedirect(transactionId, reference);
    if (verified) outcome = verified.status === "succeeded" ? "succeeded" : "failed";
  }

  const heading =
    product.applicationOnly
      ? "That is with us."
      : outcome === "succeeded"
        ? `That is done. ${product.name} is yours.`
        : outcome === "failed"
          ? "That payment did not go through."
          : "We are still confirming that payment.";

  const eyebrow =
    product.applicationOnly
      ? "Application received"
      : outcome === "succeeded"
        ? "Confirmed"
        : outcome === "failed"
          ? "Not completed"
          : "Awaiting confirmation";

  const sub =
    product.applicationOnly
      ? "No payment has been taken"
      : outcome === "succeeded"
        ? "Your place is recorded"
        : outcome === "failed"
          ? "No money has left your account"
          : "This usually takes a moment";

  return (
    <Section>
      <Container width="narrow">
        <Paper className="px-7 py-10 md:px-12 md:py-14">
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="engraved text-oxblood">{eyebrow}</p>
              <p className="engraved mt-2 text-slate">{sub}</p>
            </div>
            <VowMark size={76} />
          </div>

          <h1 className="display-lg mt-6 text-ink">{heading}</h1>

          {product.applicationOnly ? (
            <div className="mt-8 space-y-5 text-[16px] leading-relaxed text-slate">
              <p>
                Places are capped, so this one is read by a person rather than
                processed. We will reply either way within five working days.
              </p>
              <p>
                Nothing has been charged. If we go ahead, fees are agreed after
                a private review and a fit call.
              </p>
            </div>
          ) : outcome === "succeeded" ? (
            <div className="mt-8 space-y-5 text-[16px] leading-relaxed text-slate">
              <p>
                A receipt is on its way to the address you used. A coach will
                contact you within one working day to arrange the first session.
              </p>
              <p>
                If you have taken the assessment, they will have read your
                readiness map before you speak, so the call starts somewhere
                useful.
              </p>
            </div>
          ) : outcome === "failed" ? (
            <div className="mt-8 space-y-5 text-[16px] leading-relaxed text-slate">
              <p>
                Nothing was taken, and your place has not been held. The usual
                cause at this amount is a card limit rather than anything wrong
                with the card.
              </p>
              <p>
                Paying by bank transfer avoids that entirely, and is what most
                clients use for a programme this size.
              </p>
            </div>
          ) : (
            <div className="mt-8 space-y-5 text-[16px] leading-relaxed text-slate">
              <p>
                We have not been able to confirm this payment from here yet.
                That is usually a delay rather than a problem — confirmation can
                take a minute to reach us.
              </p>
              <p>
                Your billing history is the authority. If the payment shows
                there, it is done and nothing else is needed from you.
              </p>
            </div>
          )}

          <hr className="hairline-stock my-9" />

          <div className="flex flex-wrap gap-3">
            {outcome === "failed" && !product.applicationOnly ? (
              <>
                <Button asChild size="lg">
                  <Link href={`/checkout/${product.slug}`}>Try again</Link>
                </Button>
                <Button asChild variant="onpaper" size="lg">
                  <Link href={`/contact?about=${product.slug}`}>
                    Pay by bank transfer
                  </Link>
                </Button>
              </>
            ) : (
              <>
                <Button asChild size="lg">
                  <Link href="/account/billing">
                    {outcome === "succeeded" ? "See your billing history" : "Check your billing history"}
                  </Link>
                </Button>
                <Button asChild variant="onpaper" size="lg">
                  <Link href="/account">Go to your account</Link>
                </Button>
              </>
            )}
          </div>

          {outcome !== "succeeded" && !product.applicationOnly && (
            <PaperInset className="mt-8">
              <p className="text-[15px] leading-relaxed text-slate">
                If money has left your account and nothing appears within an
                hour, write to{" "}
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="underline decoration-stone underline-offset-4"
                >
                  {CONTACT_EMAIL}
                </a>{" "}
                and quote{reference ? ` ${reference}` : " the reference from your bank"}.
                A person will reconcile it by hand.
              </p>
            </PaperInset>
          )}
        </Paper>
      </Container>
    </Section>
  );
}

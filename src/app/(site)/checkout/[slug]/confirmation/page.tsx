import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Container, Section } from "@/components/ui/layout";
import { Paper } from "@/components/ui/paper";
import { Button } from "@/components/ui/button";
import { productBySlug } from "@/lib/products";
import { VowMark } from "@/components/ui/ornament";

export const metadata: Metadata = {
  title: "Confirmed",
  robots: { index: false, follow: false },
};

export default async function ConfirmationPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = productBySlug(slug);
  if (!product) notFound();

  return (
    <Section>
      <Container width="narrow">
        <Paper className="px-7 py-10 md:px-12 md:py-14">
          <div className="flex items-center justify-between gap-6">
            <div>
              <p className="engraved text-oxblood">
                {product.applicationOnly ? "Application received" : "Confirmed"}
              </p>
              <p className="engraved mt-2 text-slate">
                {product.applicationOnly ? "No payment has been taken" : "Your place is recorded"}
              </p>
            </div>
            <VowMark size={76} />
          </div>
          <h1 className="display-lg mt-6 text-ink">
            {product.applicationOnly
              ? `Your ${product.name} application is with us.`
              : `That is done. ${product.name} is yours.`}
          </h1>

          <div className="mt-8 space-y-5 text-[16px] leading-relaxed text-slate">
            {product.applicationOnly ? (
              <>
                <p>
                  A principal reviews every request personally. We will reply
                  either way within five working days and, where the fit is
                  plausible, arrange a private call before discussing fees.
                </p>
                <p>
                  Nothing has been reserved and no payment has been taken. That
                  happens only after both sides agree the work is appropriate.
                </p>
              </>
            ) : (
              <>
                <p>
                  A receipt is on its way to the address you used. Payment
                  confirmation can take a minute to reach us, so if your account
                  does not show it yet, refresh shortly.
                </p>
                <p>
                  A coach will contact you within one working day to arrange the
                  first session. If you have taken the assessment, they will have
                  read your readiness map before you speak, so the call starts
                  somewhere useful.
                </p>
              </>
            )}
          </div>

          <hr className="hairline-stock my-9" />

          <div className="flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href={product.applicationOnly ? "/" : "/account"}>
                {product.applicationOnly ? "Return home" : "Go to your account"}
              </Link>
            </Button>
            <Button asChild variant="onpaper" size="lg">
              <Link href="/assessment">Take the assessment</Link>
            </Button>
          </div>
        </Paper>
      </Container>
    </Section>
  );
}

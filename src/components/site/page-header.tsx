import Link from "next/link";
import { Container } from "@/components/ui/layout";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { KineticTitle } from "@/components/ui/kinetic";

export function PageHeader({
  eyebrow,
  title,
  standfirst,
  children,
}: {
  eyebrow: string;
  title: string;
  standfirst?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="page-header hero-2027 relative overflow-hidden border-b border-hairline">
      <div className="aurora opacity-70" aria-hidden>
        <span />
        <span />
        <span />
      </div>
      <Container
        width="wide"
        className="relative z-10 py-14 md:py-20 lg:py-24"
      >
        <div className="max-w-4xl">
          <div className="flex items-center gap-3 text-[13px]">
            <Link href="/" className="text-onink-faint transition-colors hover:text-onink">VowFound</Link>
            <span aria-hidden className="text-onink-faint">›</span>
            <p className="engraved text-rose">{eyebrow}</p>
          </div>
          <h1 className="page-title display-xl mt-7 text-onink">
            <KineticTitle text={title} />
          </h1>
          {standfirst && (
            <p className="fade-up mt-7 max-w-2xl text-base leading-relaxed text-onink-dim md:text-lg" style={{ "--d": "450ms" } as React.CSSProperties}>
              {standfirst}
            </p>
          )}
          {children && (
            <div className="fade-up mt-10" style={{ "--d": "600ms" } as React.CSSProperties}>
              {children}
            </div>
          )}
        </div>

      </Container>
    </header>
  );
}

/** A closing conversion block. Every page ends with one. */
/**
 * `plan` is how a page that has just argued for a specific programme lets a
 * convinced reader act on it. Without it, every service page ended in the same
 * two options — take the assessment, or book a call — and somebody who already
 * knew what they wanted had nowhere to go.
 *
 * It links to the fee in context rather than straight into checkout: the price,
 * what is included, and the payment step all sit on one screen there.
 */
export function PageCta({
  title,
  body,
  plan,
}: {
  title: string;
  body: string;
  plan?: { slug: string; label: string };
}) {
  return (
    <section className="page-cta border-t border-hairline py-16 md:py-24 lg:py-28">
      <Container width="wide">
        <Reveal>
          <div className="foil-ring relative overflow-hidden rounded-[32px] bg-[radial-gradient(120%_90%_at_0%_100%,rgba(156,47,89,0.35),transparent_55%),linear-gradient(160deg,#1f1823,#141117)] px-7 py-12 shadow-[0_40px_120px_rgba(4,3,8,0.45)] md:px-12 md:py-16 lg:px-16 lg:py-20">
            <div className="relative grid gap-10 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-16">
              <div>
                <h2 className="display-lg max-w-3xl text-onink">{title}</h2>
                <p className="mt-6 max-w-xl text-[17px] leading-relaxed text-onink-dim">{body}</p>
              </div>
              <div className="flex flex-col items-stretch gap-4 sm:items-start lg:items-stretch">
                <Button asChild size="lg">
                  <Link href="/assessment" data-analytics-event="cta_click" data-analytics-label="begin_assessment" data-analytics-placement="page_cta">
                    Get my free readiness map
                  </Link>
                </Button>
                <Link href="/book" className="text-center text-sm font-medium text-onink-dim underline decoration-onink-faint/50 underline-offset-4 transition-colors hover:text-onink lg:text-left">Talk to a practitioner</Link>
                {plan && (
                  <Link
                    href={`/plans#${plan.slug}`}
                    className="engraved mt-1 text-center text-rose underline decoration-rose/40 underline-offset-4 transition-colors hover:text-onink lg:text-left"
                  >
                    {plan.label}
                  </Link>
                )}
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

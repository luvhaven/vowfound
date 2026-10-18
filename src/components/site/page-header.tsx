import Link from "next/link";
import { Container } from "@/components/ui/layout";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { Rings } from "@/components/ui/ornament";

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
    <header className="page-header relative overflow-hidden border-b border-hairline">
      <div className="page-header-glow" aria-hidden />
      <Container
        width="wide"
        className="relative z-10 py-12 md:py-16 lg:py-20"
      >
        <div className="max-w-4xl">
          <div className="flex items-center gap-3 text-[13px]">
            <Link href="/" className="text-onink-faint transition-colors hover:text-onink">VowFound</Link>
            <span aria-hidden className="text-onink-faint">›</span>
            <p className="font-medium text-rose">{eyebrow}</p>
          </div>
          <h1 className="page-title display-xl mt-6 text-onink">
            {title}
          </h1>
          {standfirst && (
            <p className="mt-6 max-w-2xl text-base leading-relaxed text-onink-dim md:text-lg">
              {standfirst}
            </p>
          )}
          {children && <div className="mt-10">{children}</div>}
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
          <div className="paper relative overflow-hidden rounded-[24px] px-7 py-10 text-ink shadow-[0_34px_100px_rgba(7,4,10,0.3)] md:px-12 md:py-14 lg:px-16 lg:py-16">
            <Rings
              size={250}
              className="pointer-events-none absolute -right-10 -top-2 opacity-[0.1]"
            />
            <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center lg:gap-12">
              <div>
                <h2 className="display-lg max-w-3xl text-ink">{title}</h2>
                <p className="mt-6 max-w-xl text-slate">{body}</p>
              </div>
              <div className="flex flex-col items-stretch gap-4 sm:items-start lg:items-stretch">
                <Button asChild size="lg">
                  <Link href="/assessment">Begin your plan</Link>
                </Button>
                <Link href="/book" className="text-center text-sm font-medium text-slate underline decoration-stone underline-offset-4 transition-colors hover:text-ink lg:text-left">Talk to a practitioner</Link>
                {plan && (
                  <Link
                    href={`/plans#${plan.slug}`}
                    className="engraved mt-1 text-center text-slate underline decoration-stone underline-offset-4 transition-colors hover:text-ink lg:text-left"
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

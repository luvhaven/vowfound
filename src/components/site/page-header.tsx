import Link from "next/link";
import { Container } from "@/components/ui/layout";
import { Reveal } from "@/components/ui/reveal";
import { Button } from "@/components/ui/button";
import { Rings, VowMark } from "@/components/ui/ornament";

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
        className="relative grid min-h-[34rem] items-end gap-14 py-20 md:min-h-[42rem] md:py-28 lg:grid-cols-12 lg:gap-8"
      >
        <Reveal className="lg:col-span-8">
          <div className="flex items-center gap-4">
            <span className="numeral engraved text-rose">VF</span>
            <span aria-hidden className="h-px w-10 bg-hairline" />
            <p className="engraved text-onink-faint">{eyebrow}</p>
          </div>
          <h1 className="page-title display-xl mt-8 max-w-5xl text-onink">
            {title}
          </h1>
          {standfirst && (
            <p className="measure mt-8 max-w-2xl text-lg leading-relaxed text-onink-dim md:text-xl">
              {standfirst}
            </p>
          )}
          {children && <div className="mt-10">{children}</div>}
        </Reveal>

        <Reveal delay={120} className="hidden lg:col-span-3 lg:col-start-10 lg:block">
          <aside className="page-header-note border-l border-hairline pl-7">
            <VowMark size={82} className="opacity-80" />
            <p className="display mt-8 text-[1.4rem] leading-tight text-onink">
              Marriage, with intention.
            </p>
            <dl className="mt-7 grid gap-4 text-[12px] leading-relaxed text-onink-faint">
              <div>
                <dt className="engraved text-rose">Approach</dt>
                <dd className="mt-1.5">Private, human-led, accountable</dd>
              </div>
              <div>
                <dt className="engraved text-rose">Built for</dt>
                <dd className="mt-1.5">A lasting marriage, not more attention</dd>
              </div>
            </dl>
          </aside>
        </Reveal>

        <div className="hidden border-t border-hairline pt-5 lg:col-span-12 lg:flex lg:items-center lg:justify-between">
          <p className="engraved text-onink-faint">Read slowly. Decide clearly.</p>
          <p className="numeral engraved text-onink-faint">VowFound / Private practice</p>
        </div>
      </Container>
    </header>
  );
}

/** A closing conversion block. Every page ends with one. */
export function PageCta({
  title,
  body,
}: {
  title: string;
  body: string;
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
            <div className="relative grid gap-10 lg:grid-cols-12 lg:items-end lg:gap-8">
              <div>
                <p className="engraved text-oxblood">A private invitation</p>
              </div>
              <div className="lg:col-span-7 lg:col-start-2">
                <h2 className="display-lg max-w-3xl text-ink">{title}</h2>
                <p className="mt-6 max-w-xl text-slate">{body}</p>
              </div>
              <div className="flex flex-wrap gap-3 lg:col-span-3 lg:col-start-10 lg:flex-col lg:items-stretch">
                <Button asChild size="lg">
                  <Link href="/assessment">Begin your plan</Link>
                </Button>
                <Button asChild variant="onpaper" size="lg">
                  <Link href="/book">Book a consultation</Link>
                </Button>
              </div>
            </div>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}

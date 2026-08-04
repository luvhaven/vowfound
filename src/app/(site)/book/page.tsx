import Link from "next/link";
import { Container, Section } from "@/components/ui/layout";
import { PageHeader } from "@/components/site/page-header";
import { Reveal } from "@/components/ui/reveal";
import { Paper, PaperInset } from "@/components/ui/paper";
import { Button } from "@/components/ui/button";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Book a consultation",
  description:
    "Sixty minutes with a coach about your readiness map, your situation and whether we are any use to you.",
  path: "/book",
});

export default function BookPage() {
  const bookingUrl = process.env.NEXT_PUBLIC_BOOKING_URL;

  return (
    <>
      <PageHeader
        eyebrow="Book a consultation"
        title="Sixty minutes, about your situation specifically."
        standfirst="Bring your readiness map if you have one. If you have not taken the assessment, the first fifteen minutes will be spent gathering what it would have told us, so it is worth doing first."
      />

      <Section>
        <Container width="default">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
            <Reveal className="lg:col-span-7">
              <Paper className="p-7 md:p-9">
                <h2 className="display-md text-ink">Choose a time</h2>
                {bookingUrl ? (
                  <>
                    <p className="mt-5 text-[16px] leading-relaxed text-slate">
                      Times are shown in your local timezone. You will receive a
                      confirmation and a joining link by email.
                    </p>
                    <div className="mt-7">
                      <Button asChild size="lg">
                        <a
                          href={bookingUrl}
                          target="_blank"
                          rel="noreferrer noopener"
                        >
                          Open the calendar
                        </a>
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <p className="mt-5 text-[16px] leading-relaxed text-slate">
                      We are opening consultation times individually at the
                      moment. Send a private note and we will reply with suitable
                      times in your timezone.
                    </p>
                    <PaperInset className="mt-6">
                      <p className="text-[15px] leading-relaxed text-slate">
                        If you take the assessment first, the coach can read your
                        map before the call and spend the hour on what matters.
                      </p>
                    </PaperInset>
                    <div className="mt-7 flex flex-wrap gap-3">
                      <Button asChild size="lg">
                        <Link href="/contact">Request a consultation</Link>
                      </Button>
                      <Button asChild size="lg" variant="onpaper">
                        <Link href="/assessment">Take the assessment first</Link>
                      </Button>
                    </div>
                  </>
                )}
              </Paper>
            </Reveal>

            <Reveal delay={80} className="lg:col-span-4 lg:col-start-9 lg:mt-14">
              <aside className="border-y border-hairline py-8">
                <p className="engraved text-rose">What happens on the call</p>
                <ul className="mt-6 space-y-4">
                  {[
                    ["We read your map back to you", "Including the parts you will not enjoy."],
                    ["We ask about the last one", "Specifically about the month it changed."],
                    ["We tell you what we would do", "And whether that is us or someone else."],
                    ["You decide, afterwards", "Nobody is asked to commit on the call."],
                  ].map(([title, body]) => (
                    <li key={title}>
                      <p className="display text-[1.15rem] text-onink">{title}</p>
                      <p className="mt-1.5 text-[15px] leading-relaxed text-onink-dim">
                        {body}
                      </p>
                    </li>
                  ))}
                </ul>
              </aside>
            </Reveal>
          </div>
        </Container>
      </Section>
    </>
  );
}

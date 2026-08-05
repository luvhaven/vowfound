import { Container, Section, SectionIntro } from "@/components/ui/layout";
import { PageHeader, PageCta } from "@/components/site/page-header";
import { Reveal } from "@/components/ui/reveal";
import { PlateSignature } from "@/components/ui/plates";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Coaching",
  description:
    "Specific, unsentimental readiness coaching. What you tolerate, how you present, and the thing that happens at week six.",
  path: "/coaching",
});

const WORK = [
  {
    title: "How you tell your story",
    body: "Everyone has three or four sentences about their last relationship. Most people's are defensive without knowing it. We rewrite yours until it is true and does not cost you anything to say.",
  },
  {
    title: "What you tolerate, and for how long",
    body: "The problem is rarely that you have no standards. It is that you apply them at month nine instead of week three. We work on the timing.",
  },
  {
    title: "The thing that happens at week six",
    body: "Almost everyone has a point where it reliably changes. Finding yours is usually a single session, and it reframes the previous decade.",
  },
  {
    title: "Difficult first conversations",
    body: "Children, faith, money, an ex who is still in the picture. These are not late-stage topics. We practise them until you can raise them early without it becoming an event.",
  },
  {
    title: "How you are read in ten minutes",
    body: "Direct feedback on how you present, from someone with no reason to protect your feelings and every reason to be accurate.",
  },
  {
    title: "What you would end a good thing over",
    body: "Until this is written down, you will discover it in the middle of something you did not want to lose.",
  },
];

export default function CoachingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Stage two / Coaching"
        title="Someone finally tells you the truth, kindly."
        standfirst="Your friends want you to feel better. Your family wants grandchildren. We are the only people in this with a reason to be accurate."
      />

      <Section>
        <Container width="wide">
          <Reveal>
            <SectionIntro
              index="02"
              eyebrow="The private work"
              title="Specific conversations, not a generic curriculum."
              body="Your readiness map sets the agenda. Every session should change a decision, a behaviour, or the way you are understood."
            />
          </Reveal>

          <div className="mt-16 grid gap-12 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <Reveal>
              <aside className="lg:sticky lg:top-28">
                <PlateSignature className="max-w-md" />
                <p className="engraved mt-6 text-onink-faint">A working document</p>
                <p className="mt-4 max-w-sm text-[15px] leading-relaxed text-onink-dim">
                  You leave each session with one written observation and one
                  action to test before the next conversation.
                </p>
              </aside>
            </Reveal>

            <ol className="border-b border-hairline">
              {WORK.map((item, index) => (
                <Reveal as="li" key={item.title} delay={(index % 3) * 55}>
                  <article className="group grid gap-5 border-t border-hairline py-8 md:grid-cols-[4rem_1fr] md:py-10">
                    <p className="numeral engraved text-rose">{String(index + 1).padStart(2, "0")}</p>
                    <div className="transition-transform duration-300 group-hover:translate-x-1">
                      <h2 className="display text-[1.45rem] text-onink md:text-[1.7rem]">
                        {item.title}
                      </h2>
                      <p className="mt-4 max-w-2xl text-[16px] leading-relaxed text-onink-dim">
                        {item.body}
                      </p>
                    </div>
                  </article>
                </Reveal>
              ))}
            </ol>
          </div>
        </Container>
      </Section>

      <Section className="overflow-hidden bg-ink-deep">
        <Container width="wide">
          <Reveal>
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-5">
                <p className="engraved text-rose">The boundary</p>
                <h2 className="display-lg mt-6 text-onink">
                  This is not therapy, and we will tell you when you need it.
                </h2>
              </div>
              <div className="measure space-y-5 border-l border-hairline pl-7 text-onink-dim lg:col-span-6 lg:col-start-7 lg:pl-10">
                <p>
                  Coaching here is practical and forward-facing. It is about how
                  you present, what you decide, and how you behave in the first
                  three months of something new.
                </p>
                <p>
                  Grief, a childhood that is still operating, or anything that
                  needs a clinician belongs elsewhere. When we see it we say so,
                  refer, and do not charge you to keep working around it.
                </p>
                <p>
                  We also do not use compatibility astrology, personality types
                  as identity, or a four-letter code you can hide behind.
                </p>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      <PageCta
        title="The first session is a reading of your map."
        body="Take the assessment, and the diagnostic call has something specific to be about."
        plan={{ slug: "ready-in-90", label: "See the coaching fee" }}
      />
    </>
  );
}

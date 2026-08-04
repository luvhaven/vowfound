import Image from "next/image";
import ringsImage from "../../../../public/images/vowfound-rings.png";
import { Container, Section, SectionIntro } from "@/components/ui/layout";
import { PageHeader, PageCta } from "@/components/site/page-header";
import { Reveal } from "@/components/ui/reveal";
import { Paper, PaperInset } from "@/components/ui/paper";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Private matchmaking",
  description:
    "Two stages. Hard requirements eliminate, weighted preferences rank, and a matchmaker makes every final decision.",
  path: "/matchmaking",
  image: "/images/vowfound-rings.png",
});

const DIMENSIONS = [
  "Values",
  "Life plans",
  "Family expectations",
  "Location and relocation",
  "Communication preferences",
  "Lifestyle",
  "Stated flexibility",
] as const;

export default function MatchmakingPage() {
  return (
    <>
      <PageHeader
        eyebrow="Stage four / Matchmaking"
        title="Private matchmaking, with the reasoning shown."
        standfirst="A structured shortlist narrows the field. A matchmaker then reads the people behind it and decides whether the ranking deserves to be trusted."
      />

      <Section>
        <Container width="wide">
          <Reveal>
            <SectionIntro
              index="04"
              eyebrow="The search discipline"
              title="First remove what cannot work. Then examine what might."
              body="The order matters. Hard requirements are mutual and absolute. Preferences are weighted, questioned, and allowed to bend."
            />
          </Reveal>

          <div className="mt-16 grid gap-8 lg:grid-cols-12 lg:items-start">
            <Reveal className="lg:col-span-5">
              <Paper className="p-8 md:p-10 lg:mt-16">
                <div className="flex items-baseline justify-between gap-5">
                  <p className="engraved text-oxblood">Stage one</p>
                  <p className="numeral display text-[3.25rem] text-stone">01</p>
                </div>
                <h2 className="display-lg mt-8 text-ink">Eliminate</h2>
                <p className="mt-6 text-[16px] leading-relaxed text-slate">
                  Anyone who fails your hard requirements is removed. So is
                  anyone whose hard requirements you fail. This is mutual,
                  absolute, and not scored.
                </p>
                <PaperInset className="mt-8">
                  <p className="engraved text-oxblood">The discipline</p>
                  <p className="mt-3 text-[15px] leading-relaxed text-slate">
                    We push you to cut the list to three. A long list does not
                    improve what survives. It removes people who could have
                    worked.
                  </p>
                </PaperInset>
              </Paper>
            </Reveal>

            <Reveal delay={90} className="lg:col-span-7">
              <div className="relative overflow-hidden rounded-[24px] border border-hairline bg-ink-raised">
                <div className="relative aspect-[16/10] min-h-[24rem]">
                  <Image
                    src={ringsImage}
                    alt="Wedding bands beside handwritten vows and a deep red flower"
                    fill
                    placeholder="blur"
                    sizes="(max-width: 1024px) 100vw, 58vw"
                    className="object-cover"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-ink-deep via-ink-deep/45 to-transparent" />
                </div>
                <div className="relative -mt-32 p-7 md:p-10">
                  <div className="max-w-2xl rounded-[12px] border border-onink/12 bg-ink-deep/82 p-7 shadow-[0_24px_70px_rgba(7,4,10,0.35)] backdrop-blur-xl md:p-9">
                    <div className="flex items-baseline justify-between gap-5">
                      <p className="engraved text-rose">Stage two</p>
                      <p className="numeral display text-[2.75rem] text-onink-faint">02</p>
                    </div>
                    <h2 className="display-md mt-5 text-onink">Rank, then read.</h2>
                    <p className="mt-4 text-[15px] leading-relaxed text-onink-dim">
                      Whoever remains is compared across seven declared
                      dimensions. The weights are versioned and reviewable.
                    </p>
                    <ul className="mt-7 grid gap-x-6 gap-y-3 border-t border-hairline pt-6 sm:grid-cols-2">
                      {DIMENSIONS.map((dimension) => (
                        <li key={dimension} className="text-[13px] text-onink-dim">
                          {dimension}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section className="bg-ink-deep">
        <Container width="wide">
          <Reveal>
            <div className="grid gap-10 lg:grid-cols-12 lg:gap-8">
              <div className="lg:col-span-5">
                <p className="engraved text-rose">The decision</p>
                <h2 className="display-lg mt-6 text-onink">
                  The ranking is advice. The matchmaker decides.
                </h2>
              </div>
              <div className="measure space-y-5 border-l border-hairline pl-7 text-onink-dim lg:col-span-6 lg:col-start-7 lg:pl-10">
                <p>
                  A ranked list is good at compatibility on paper and bad at
                  everything that actually decides a marriage. It cannot hear
                  the way two people describe family, faith, or an uncertain
                  future.
                </p>
                <p>
                  So the list goes to a person. They accept, reject, or overrule
                  it entirely. Every override is written down so the reasoning
                  can be examined later.
                </p>
                <p>No model makes the final call. There is no version in which one does.</p>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section>
        <Container width="wide">
          <Reveal>
            <div className="grid gap-10 border-y border-hairline py-10 md:grid-cols-[0.72fr_1.28fr] md:py-14">
              <div>
                <p className="engraved text-rose">Mutual consent</p>
                <p className="numeral display mt-5 text-[4rem] text-onink-faint">2 × yes</p>
              </div>
              <div>
                <h2 className="display-md max-w-2xl text-onink">
                  Nothing about you reaches anyone until you have both agreed.
                </h2>
                <div className="mt-6 max-w-2xl space-y-4 text-[16px] leading-relaxed text-onink-dim">
                  <p>
                    Both people receive the reason first. Neither sees a name,
                    photograph, contact detail, or whether the other has replied.
                  </p>
                  <p>
                    Two acceptances open the introduction. One decline ends it
                    privately, without explanation or penalty.
                  </p>
                </div>
              </div>
            </div>
          </Reveal>
        </Container>
      </Section>

      <PageCta
        title="Matchmaking starts at stage four, not stage one."
        body="We do not take matchmaking clients who have skipped the readiness work. The assessment is where that is decided."
      />
    </>
  );
}

import type { Metadata } from "next";
import { CtaButton, PageHero } from "@/components/ui/kit";
import { CardRun, Split } from "@/components/site/story";
import { FinalCta } from "@/components/site/final-cta";
import { Pair } from "@/components/art/shapes";

export const metadata: Metadata = {
  title: "Matchmaking",
  description: "Human-picked introductions to people who want marriage, each with a written reason. Private, verified, double opt-in.",
};

export default function MatchmakingPage() {
  return (
    <>
      <PageHero
        eyebrow="Matched · 6 months"
        field="bubble"
        title={<>Fewer people. <span className="say font-normal">Better reasons.</span></>}
        body="A named matchmaker searches, verifies and hand-picks people who want marriage too. You'll never browse a feed, and nobody can browse you."
        art={<Pair a="cobalt" b="tomato" />}
      >
        <div className="flex flex-wrap items-center gap-5">
          <CtaButton href="/checkout/matched" tone="ink">Start Matched</CtaButton>
          <CtaButton href="/check" tone="paper" size="md">Check I&apos;m ready first</CtaButton>
        </div>
      </PageHero>

      <CardRun
        eyebrow="The search"
        title={<>First what can&apos;t work. <span className="say font-normal">Then what might.</span></>}
        field="paper"
        items={[
          { title: "Your must-haves", body: "We cut your list to the few things that genuinely decide a marriage — faith, children, where you'll live, the non-negotiables.", colour: "butter" },
          { title: "Verified and interviewed", body: "Everyone in matchmaking is ID-checked and interviewed by a person before they can be introduced to anyone.", colour: "moss" },
          { title: "Hand-picked shortlist", body: "Your matchmaker reads the people behind the profiles and decides. No algorithm introduces anyone.", colour: "cobalt" },
          { title: "A written reason", body: "Every introduction explains why this person, why now, and what's worth asking early.", colour: "tomato" },
          { title: "Double opt-in", body: "Names, photos and contact details stay private until you both accept.", colour: "lilac" },
          { title: "Debrief after every date", body: "Honest feedback both ways, fed straight back into the search.", colour: "bubble" },
        ]}
      />

      <Split
        field="moss"
        eyebrow="Our word"
        title={<>We guarantee the work. <span className="say font-normal">Not the outcome.</span></>}
        body="Matched includes an agreed number of qualified introductions. If we haven't made them by the end of your six months, your search is extended at no cost until we do. Nobody can promise you a marriage — anyone who does is the red flag."
        listTitle="Matched includes"
        list={["Everything in Ready — six one-to-ones and the group", "A named matchmaker for six months", "Verified, private profile", "Introductions with a written reason", "A debrief after every date"]}
      />

      <FinalCta />
    </>
  );
}

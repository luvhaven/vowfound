import type { Metadata } from "next";
import { CtaButton, PageHero } from "@/components/ui/kit";
import { CardRun, Split } from "@/components/site/story";
import { FinalCta } from "@/components/site/final-cta";
import { Overlap } from "@/components/art/shapes";
import { TeamSection } from "@/components/site/team";

export const metadata: Metadata = {
  title: "How it works",
  description: "Check, get ready, get introduced, decide well. How VowFound takes you from single to serious.",
};

export default function HowItWorksPage() {
  return (
    <>
      <PageHero
        eyebrow="How it works"
        field="cobalt"
        title={<>From <span className="say font-normal">“still single”</span> to sure.</>}
        body="Most matchmakers start with introductions. We start with you — because the best match in the world won't survive a pattern nobody has named."
        art={<Overlap a="tomato" b="butter" lens="bubble" />}
      >
        <CtaButton href="/check" tone="butter">Start with the free check</CtaButton>
      </PageHero>

      <CardRun
        eyebrow="The four steps"
        title={<>One order. <span className="say font-normal">On purpose.</span></>}
        items={[
          { title: "Take the check", body: "Ten minutes, eighteen statements, six dimensions. You see your strengths, your first priority and the smallest useful next step.", colour: "tomato" },
          { title: "Talk to a coach", body: "With The Read, a coach goes through your results with you for 30 minutes and tells you, honestly, what matters most.", colour: "butter" },
          { title: "Get ready", body: "In Ready, you work on the specific thing in the way — patterns, presence, standards, repair — with one-to-ones and a small group.", colour: "bubble" },
          { title: "Get introduced", body: "In Matched, your matchmaker searches, verifies and hand-picks. Every introduction comes with a written reason why.", colour: "cobalt" },
          { title: "Both say yes", body: "You see the reason first, not a photo grid. Names and contact details are shared only when you both accept.", colour: "moss" },
          { title: "Debrief and decide", body: "After every date we talk it through, so you can tell a real red flag from an old reflex — and the search gets sharper.", colour: "lilac" },
        ]}
      />

      <Split
        field="tomato"
        eyebrow="What a match looks like"
        title={<>Not a profile. <span className="say font-normal">A reason.</span></>}
        body="Every introduction arrives as a short letter from your matchmaker: where your intentions line up, which of your must-haves are met, and what's worth asking about early. Decline any of them without explaining yourself."
        listTitle="Every introduction tells you"
        list={["Why this person, and why now", "Which of your must-haves they meet", "Where you differ — said plainly", "A good first question to ask them"]}
      />

      <TeamSection />
      <FinalCta />
    </>
  );
}

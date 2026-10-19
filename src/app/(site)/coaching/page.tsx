import type { Metadata } from "next";
import { CtaButton, PageHero } from "@/components/ui/kit";
import { CardRun, Split } from "@/components/site/story";
import { FinalCta } from "@/components/site/final-cta";
import { Arch } from "@/components/art/shapes";

export const metadata: Metadata = {
  title: "Coaching",
  description: "Ready: twelve weeks of marriage-readiness coaching — one-to-ones, a small group, and honest feedback.",
};

export default function CoachingPage() {
  return (
    <>
      <PageHero
        eyebrow="Ready · 12 weeks"
        field="tomato"
        title={<>Become the partner <span className="say font-normal">you&apos;re looking for.</span></>}
        body="Twelve weeks on the specific thing in your way — with a coach who'll tell you the truth, kindly, and a small group who get it."
        art={<Arch fill="butter" />}
      >
        <div className="flex flex-wrap items-center gap-5">
          <CtaButton href="/checkout/ready" tone="ink">Start Ready</CtaButton>
          <CtaButton href="/checkout/the-read" tone="paper" size="md">Or start with The Read</CtaButton>
        </div>
      </PageHero>

      <CardRun
        eyebrow="What you work on"
        title={<>Specific. <span className="say font-normal">Not vibes.</span></>}
        items={[
          { title: "The pattern", body: "Name what keeps repeating — who you choose, when you leave, what you tolerate — and practise a different move.", colour: "bubble" },
          { title: "Your story", body: "How you talk about your past, your work and what you want. We rewrite it so it sounds like you on a good day.", colour: "butter" },
          { title: "Your standards", body: "Three true must-haves, a list of nice-to-haves, and the trade-offs you're genuinely willing to make.", colour: "moss" },
          { title: "First dates", body: "Showing interest without playing it cool, asking the real questions early, and reading the answers.", colour: "cobalt" },
          { title: "Conflict and repair", body: "What you do when it gets hard. The single best predictor of whether a marriage lasts.", colour: "lilac" },
          { title: "Your timeline", body: "A real plan with a real horizon — not a countdown, but a direction.", colour: "tomato" },
        ]}
      />

      <Split
        field="butter"
        eyebrow="The shape of it"
        title={<>Twelve weeks. <span className="say font-normal">Small group.</span></>}
        body="Fortnightly one-to-ones with your coach, a weekly session with a group of no more than eight, and exercises with written feedback in between. You'll leave with a new story, clear standards and the habits that make a relationship hold."
        listTitle="Ready includes"
        listColour="paper"
        list={["Everything in The Read", "Six one-to-one coaching sessions", "Weekly small-group sessions (max 8)", "Exercises with written feedback", "A profile and story rewrite"]}
      />

      <FinalCta />
    </>
  );
}

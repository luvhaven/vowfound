import type { Metadata } from "next";
import { PageHero } from "@/components/ui/kit";
import { CardRun } from "@/components/site/story";
import { FinalCta } from "@/components/site/final-cta";
import { Overlap } from "@/components/art/shapes";

export const metadata: Metadata = {
  title: "Safety & privacy",
  description: "No directory, no public profiles, verified members and double opt-in. How VowFound keeps you safe and private.",
};

export default function SafetyPage() {
  return (
    <>
      <PageHero
        eyebrow="Safety & privacy"
        field="moss"
        title={<>Private <span className="say font-normal text-butter">by default.</span></>}
        body="This category has more than its share of fakes and fraud. So our rules are simple, strict and the same for everyone."
        art={<Overlap a="butter" b="bubble" lens="paper" />}
      />
      <CardRun
        eyebrow="The rules"
        title={<>Nothing about you is <span className="say font-normal">public.</span></>}
        items={[
          { title: "No directory", body: "There is nothing to browse and nothing to search. Your profile is seen by your matchmaker — that's it.", colour: "butter" },
          { title: "Double opt-in", body: "Someone learns your name only after you've both accepted an introduction. Decline, and they're told nothing.", colour: "bubble" },
          { title: "Verified people", body: "Everyone in matchmaking is ID-checked and interviewed before they can be introduced.", colour: "cobalt" },
          { title: "Report in one tap", body: "Anything that feels wrong after a date goes straight to a person, who acts on it.", colour: "tomato" },
          { title: "Your data, your call", body: "Export or delete everything from your account at any time, without asking anyone.", colour: "lilac" },
          { title: "We never sell data", body: "Not to advertisers, not to partners, not ever. We make money from fees, so we don't need to.", colour: "moss" },
        ]}
      />
      <FinalCta />
    </>
  );
}

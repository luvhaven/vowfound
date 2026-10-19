import type { Metadata } from "next";
import { Block, PageHero, Wrap } from "@/components/ui/kit";
import { Faq } from "@/components/site/faq";
import { FinalCta } from "@/components/site/final-cta";
import { Sparkle } from "@/components/art/shapes";
import { FAQ } from "@/lib/content";

export const metadata: Metadata = { title: "Questions", description: "Straight answers about VowFound matchmaking, coaching, privacy and prices." };

export default function FaqPage() {
  return (
    <>
      <PageHero eyebrow="Questions" field="lilac" title={<>Fair <span className="say font-normal">questions.</span></>} body="The ones people ask before they trust us with something this important." art={<Sparkle fill="ink" className="spin-slow" />} />
      <Block field="paper">
        <Wrap className="max-w-4xl">
          <Faq items={FAQ} />
        </Wrap>
      </Block>
      <FinalCta />
    </>
  );
}

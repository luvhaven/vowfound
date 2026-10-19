import { Block, CtaButton, Wrap } from "@/components/ui/kit";
import { Overlap } from "@/components/art/shapes";

export function FinalCta({ title, body }: { title?: React.ReactNode; body?: string }) {
  return (
    <Block field="tomato" className="py-24 md:py-32">
      <Wrap className="grid items-center gap-12 lg:grid-cols-[1.25fr_0.75fr]">
        <div>
          <h2 className="mega">{title ?? <>Ten minutes. <span className="say font-normal">Then you&apos;ll know.</span></>}</h2>
          <p className="mt-8 max-w-xl text-[20px] font-medium leading-relaxed">
            {body ?? "The free Readiness Check shows you where you're strong, what's in the way, and the smallest useful next step. No card. No profile. Nothing public."}
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-5">
            <CtaButton href="/check" tone="ink">Take the free check</CtaButton>
            <CtaButton href="/pricing" tone="paper" size="md">See pricing</CtaButton>
          </div>
        </div>
        <Overlap a="cobalt" b="butter" lens="bubble" className="spin-slow mx-auto w-full max-w-md [animation-duration:60s]" />
      </Wrap>
    </Block>
  );
}

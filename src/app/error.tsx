"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrandLockup } from "@/components/site/brand-lockup";
import { VowMark } from "@/components/ui/ornament";

export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <main className="relative grid min-h-[100dvh] overflow-hidden px-6 py-10 md:px-10">
      <div className="pointer-events-none absolute -bottom-36 -right-28 opacity-[0.07]" aria-hidden>
        <VowMark size={560} />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col">
        <Link href="/" aria-label="VowFound home" className="w-fit text-onink">
          <BrandLockup />
        </Link>

        <div className="my-auto grid gap-8 py-20 md:grid-cols-[8rem_1fr] md:gap-14">
          <p className="numeral display text-[5rem] leading-none text-onink-faint" aria-hidden>
            —
          </p>
          <div>
            <p className="engraved text-rose">The page stopped unexpectedly</p>
            <h1 className="display-xl mt-6 max-w-4xl text-onink">
              We could not finish that step.
            </h1>
            <p className="mt-7 max-w-xl text-onink-dim">
              Nothing has been submitted twice. Try the step again, or return
              to the practice and choose another route.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Button type="button" size="lg" onClick={reset}>
                Try again
              </Button>
              <Button asChild variant="quiet" size="lg">
                <Link href="/">Return home</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

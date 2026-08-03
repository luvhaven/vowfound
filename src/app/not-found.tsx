import Link from "next/link";
import { BrandLockup } from "@/components/site/brand-lockup";
import { VowMark } from "@/components/ui/ornament";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main id="main" className="relative flex min-h-screen overflow-hidden px-6 py-10 md:px-10">
      <VowMark
        size={620}
        className="pointer-events-none absolute -bottom-20 -right-48 opacity-[0.07]"
      />
      <div className="mx-auto flex w-full max-w-7xl flex-col">
        <Link href="/" aria-label="VowFound home" className="text-onink">
          <BrandLockup />
        </Link>

        <div className="my-auto grid gap-10 py-20 lg:grid-cols-12">
          <div className="lg:col-span-2">
            <p className="numeral display text-[5rem] leading-none text-onink-faint">404</p>
          </div>
          <div className="lg:col-span-7">
            <p className="engraved text-rose">This path ends here</p>
            <h1 className="display-xl mt-7 max-w-3xl text-onink">
              The page is not part of the plan.
            </h1>
            <p className="mt-7 max-w-xl text-onink-dim">
              The address may have changed, or the page may never have existed.
              Return to the practice and continue from somewhere useful.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Button asChild size="lg">
                <Link href="/">Return home</Link>
              </Button>
              <Button asChild variant="quiet" size="lg">
                <Link href="/services">View services</Link>
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}

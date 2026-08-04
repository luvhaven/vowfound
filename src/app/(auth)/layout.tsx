import Link from "next/link";
import { Suspense } from "react";
import { TRUST_LINE } from "@/lib/brand";
import { Paper } from "@/components/ui/paper";
import { BrandLockup } from "@/components/site/brand-lockup";
import { VowMark } from "@/components/ui/ornament";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen lg:grid lg:grid-cols-[0.9fr_1.1fr]">
      <aside className="relative hidden overflow-hidden border-r border-hairline bg-ink-deep p-12 lg:sticky lg:top-0 lg:flex lg:h-dvh lg:self-start lg:flex-col xl:p-16">
        <Link href="/" aria-label="VowFound home" className="relative z-10 text-onink">
          <BrandLockup />
        </Link>
        <VowMark
          size={430}
          className="pointer-events-none absolute -bottom-20 -right-32 opacity-[0.09]"
        />
        <div className="relative z-10 my-auto max-w-lg py-12">
          <p className="engraved text-rose">The private side of VowFound</p>
          <h2 className="display-lg mt-6 text-balance text-onink">
            Your relationship work belongs to you.
          </h2>
          <p className="mt-6 max-w-md text-[16px] leading-relaxed text-onink-dim">
            No public profile. No browsing. Your map, appointments, and plan
            stay inside one private client space.
          </p>
          <div className="mt-8 flex flex-wrap gap-x-6 gap-y-3 border-t border-hairline pt-6">
            {TRUST_LINE.map((item) => (
              <span key={item} className="engraved text-onink-faint">
                {item}
              </span>
            ))}
          </div>
        </div>
      </aside>

      <div className="flex min-h-screen flex-col">
        <header className="px-6 py-7 md:px-10 lg:hidden">
          <Link href="/" aria-label="VowFound home" className="text-onink">
            <BrandLockup compact />
          </Link>
        </header>

        <main id="main" className="flex flex-1 items-start justify-center px-6 py-8 md:px-10 lg:items-center lg:py-10">
          <div className="w-full max-w-xl">
            <p className="engraved mb-4 text-onink-faint">Private client access</p>
            <Paper className="px-7 py-8 md:px-9 md:py-9">
              <Suspense fallback={<div className="min-h-64" aria-busy="true" />}>
                {children}
              </Suspense>
            </Paper>
            <div className="mt-7 flex flex-wrap justify-center gap-x-5 gap-y-2 lg:hidden">
              {TRUST_LINE.map((item) => (
                <span key={item} className="engraved text-onink-faint">
                  {item}
                </span>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

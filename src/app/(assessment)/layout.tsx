import Link from "next/link";
import { TRUST_LINE } from "@/lib/brand";
import { BrandLockup } from "@/components/site/brand-lockup";

/** The assessment removes normal site navigation so the work stays focused. */
export default function AssessmentLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="border-b border-hairline bg-ink/88 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-4xl items-center justify-between px-6 md:h-20 md:px-10">
          <Link href="/" aria-label="VowFound home" className="text-onink">
            <BrandLockup compact />
          </Link>
          <div className="hidden items-center gap-3 sm:flex">
            <span className="size-1.5 rounded-full bg-sage shadow-[0_0_0_4px_rgba(118,130,119,0.12)]" />
            <p className="engraved text-onink-faint">Private and confidential</p>
          </div>
        </div>
      </header>

      <main id="main" className="assessment-field flex-1 px-6 py-14 md:py-20">
        {children}
      </main>

      <footer className="border-t border-hairline py-8">
        <div className="flex flex-wrap justify-center gap-x-6 gap-y-2">
          {TRUST_LINE.map((item) => (
            <span key={item} className="engraved text-onink-faint">
              {item}
            </span>
          ))}
        </div>
      </footer>
    </>
  );
}

import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/admin.server";
import { signOut } from "@/app/actions/auth";
import { AccountNav } from "@/components/account/account-nav";
import { BrandLockup } from "@/components/site/brand-lockup";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default async function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in?next=/account");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-hairline bg-ink/88 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 md:h-20 md:px-10">
          <Link href="/" aria-label="VowFound home" className="text-onink">
            <BrandLockup compact />
          </Link>
          <div className="flex items-center gap-5">
            {viewer.isAdmin ? (
              <Link
                href="/admin"
                className="engraved rounded-[8px] border border-rose/35 bg-rose/10 px-4 py-2.5 text-rose transition-colors hover:border-rose/60 hover:bg-rose/15"
              >
                Admin dashboard
              </Link>
            ) : (
              <span className="engraved hidden text-onink-faint sm:block">Client folio</span>
            )}
            <form action={signOut}>
              <button
                type="submit"
                className="engraved rounded-[8px] border border-onink/12 px-4 py-2.5 text-onink-dim transition-colors hover:border-onink/30 hover:text-onink"
              >
                Sign out
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="account-field mx-auto w-full max-w-6xl flex-1 px-6 py-10 md:px-10 md:py-14">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div>
            <p className="engraved text-rose">Private client space</p>
            <p className="display mt-3 text-[1.65rem] text-onink">
              Your work, in one place.
            </p>
          </div>
          <p className="hidden max-w-xs text-right text-[13px] leading-relaxed text-onink-faint md:block">
            Nothing in this area is public, browsable, or indexed.
          </p>
        </div>
        <AccountNav />
        <main id="main" className="mt-10">
          {children}
        </main>
      </div>
    </div>
  );
}

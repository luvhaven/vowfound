import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { getViewer } from "@/lib/admin.server";
import { signOut } from "@/app/actions/auth";
import { AdminNav } from "@/components/admin/admin-nav";
import { BrandLockup } from "@/components/site/brand-lockup";

export const metadata: Metadata = {
  robots: { index: false, follow: false, nocache: true },
};

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const viewer = await getViewer();
  if (!viewer) redirect("/sign-in?next=/admin");
  if (!viewer.isAdmin) redirect("/account");

  return (
    <div className="flex min-h-screen flex-col">
      <header className="border-b border-hairline bg-ink-deep/88 backdrop-blur-xl">
        <div className="mx-auto flex h-16 w-full max-w-7xl items-center justify-between px-6 md:px-10">
          <div className="flex items-center gap-4">
            <Link href="/" aria-label="VowFound home" className="text-onink">
              <BrandLockup compact />
            </Link>
            <span className="h-5 w-px bg-hairline" aria-hidden />
            <span className="engraved text-rose">Operations</span>
          </div>
          <div className="flex items-center gap-5">
            <span className="engraved hidden text-onink-faint sm:block">
              {viewer.email}
            </span>
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

      <div className="mx-auto grid w-full max-w-7xl flex-1 gap-10 px-6 py-10 md:px-10 lg:grid-cols-[13rem_1fr] lg:gap-14">
        <AdminNav />
        <main id="main" className="min-w-0">
          {children}
        </main>
      </div>
    </div>
  );
}

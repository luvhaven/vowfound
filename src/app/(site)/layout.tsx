import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";
import { getUser } from "@/lib/supabase/server";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const user = await getUser().catch(() => null);
  return (
    <>
      <Header signedIn={Boolean(user)} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}

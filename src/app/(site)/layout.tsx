import { Header } from "@/components/site/header";
import { Footer } from "@/components/site/footer";

/**
 * The public site is statically rendered and regenerated in the background.
 *
 * Copy comes from the database, so baking it at build time would mean a
 * deploy is needed to publish an edit — and worse, a build that cannot reach
 * the database would silently ship defaults. Revalidating on an interval,
 * plus revalidatePath the moment an editor saves, means pages stay static and
 * fast while an edit is live within seconds.
 */
export const revalidate = 60;

export default function SiteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <main id="main" className="flex-1">
        {children}
      </main>
      <Footer />
    </>
  );
}

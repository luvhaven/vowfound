import { AudienceLayout } from "@/components/site/audience-page";
import { FOR_MEN } from "@/content/audiences";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "For men",
  description:
    "The problem is usually not effort. It is that nothing about how you present says what you actually want.",
  path: "/for-men",
});

export default function ForMenPage() {
  return <AudienceLayout page={FOR_MEN} />;
}

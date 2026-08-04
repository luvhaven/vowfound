import { AudienceLayout } from "@/components/site/audience-page";
import { FOR_WOMEN } from "@/content/audiences";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "For women",
  description:
    "You are not too much. The problem is almost never the standard. Nothing is filtering for it.",
  path: "/for-women",
});

export default function ForWomenPage() {
  return <AudienceLayout page={FOR_WOMEN} />;
}

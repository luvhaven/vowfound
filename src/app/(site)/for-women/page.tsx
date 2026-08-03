import type { Metadata } from "next";
import { AudienceLayout } from "@/components/site/audience-page";
import { FOR_WOMEN } from "@/content/audiences";

export const metadata: Metadata = {
  title: "For women",
  description:
    "You are not too much. The problem is almost never the standard. Nothing is filtering for it.",
};

export default function ForWomenPage() {
  return <AudienceLayout page={FOR_WOMEN} />;
}

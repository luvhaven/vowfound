import type { Metadata } from "next";
import { AudienceLayout } from "@/components/site/audience-page";
import { FOR_MEN } from "@/content/audiences";

export const metadata: Metadata = {
  title: "For men",
  description:
    "The problem is usually not effort. It is that nothing about how you present says what you actually want.",
};

export default function ForMenPage() {
  return <AudienceLayout page={FOR_MEN} />;
}

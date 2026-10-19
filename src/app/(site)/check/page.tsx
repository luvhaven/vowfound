import type { Metadata } from "next";
import { CheckRunner } from "@/components/check/runner";

export const metadata: Metadata = {
  title: "Free Readiness Check",
  description: "Eighteen honest statements, six dimensions, ten minutes. Free, private, instant results.",
};

export default function CheckPage() {
  return <CheckRunner />;
}

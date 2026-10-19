import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/brand";

const PATHS = ["", "/check", "/how-it-works", "/matchmaking", "/coaching", "/pricing", "/private", "/safety", "/faq", "/contact", "/legal/terms", "/legal/privacy", "/legal/refunds"];

export default function sitemap(): MetadataRoute.Sitemap {
  return PATHS.map((p) => ({ url: `${SITE_URL}${p}`, lastModified: new Date() }));
}

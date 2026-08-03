import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/brand";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        // Nothing behind an account, and nothing personal, is ever crawled.
        disallow: [
          "/account",
          "/admin",
          "/api",
          "/auth",
          "/checkout",
          "/assessment/results",
          "/sign-in",
          "/sign-up",
          "/forgot-password",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}

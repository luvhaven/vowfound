import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "VowFound",
    short_name: "VowFound",
    description:
      "A private marriage-readiness, coaching, and curated-matchmaking practice.",
    start_url: "/",
    display: "standalone",
    background_color: "#111218",
    theme_color: "#111218",
    orientation: "portrait-primary",
    categories: ["lifestyle", "social"],
    icons: [
      {
        src: "/api/brand/apple-icon",
        sizes: "180x180",
        type: "image/png",
      },
      {
        src: "/api/brand/favicon",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}

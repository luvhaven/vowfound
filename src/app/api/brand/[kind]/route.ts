import { NextResponse } from "next/server";
import { getBrandAssets } from "@/lib/brand-assets.server";

export const dynamic = "force-dynamic";

const CONFIG = {
  logo: {
    field: "logo_url",
    fallback: "/brand/vowfound-mark.svg",
  },
  favicon: {
    field: "favicon_url",
    fallback: "/brand/vowfound-favicon.svg",
  },
  "apple-icon": {
    field: "apple_icon_url",
    fallback: "/apple-icon",
  },
} as const;

export async function GET(
  request: Request,
  { params }: { params: Promise<{ kind: string }> },
) {
  const { kind } = await params;
  const config = CONFIG[kind as keyof typeof CONFIG];
  if (!config) return new NextResponse(null, { status: 404 });

  const assets = await getBrandAssets();
  const destination = assets[config.field] ?? config.fallback;
  const response = NextResponse.redirect(new URL(destination, request.url), 307);
  response.headers.set("cache-control", "public, max-age=60, stale-while-revalidate=300");
  return response;
}

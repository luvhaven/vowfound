import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { getBrandAssets } from "@/lib/brand-assets.server";

export const dynamic = "force-dynamic";

const FALLBACK_PATH = join(
  process.cwd(),
  "public",
  "brand",
  "vowfound-favicon.ico",
);

function faviconResponse(body: BodyInit, contentType: string) {
  return new NextResponse(body, {
    status: 200,
    headers: {
      "content-type": contentType,
      "cache-control":
        "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400",
      "x-content-type-options": "nosniff",
    },
  });
}

async function originalFavicon() {
  const file = await readFile(FALLBACK_PATH);
  return faviconResponse(new Uint8Array(file), "image/x-icon");
}

/**
 * A conventional, crawlable favicon URL for browsers and search engines.
 *
 * The destination remains administrator-managed, but the public URL never
 * changes and does not sit below /api (which robots.txt correctly blocks).
 */
export async function GET(request: Request) {
  const assets = await getBrandAssets();
  if (!assets.favicon_url) return originalFavicon();

  try {
    const source = new URL(assets.favicon_url, request.url);
    const current = new URL(request.url);
    const loopsBack =
      source.origin === current.origin && source.pathname === current.pathname;
    if (!["http:", "https:"].includes(source.protocol) || loopsBack) {
      return originalFavicon();
    }

    const upstream = await fetch(source, {
      next: { revalidate: 300 },
      signal: AbortSignal.timeout(5_000),
    });
    const contentType = upstream.headers.get("content-type")?.split(";")[0];
    if (!upstream.ok || !contentType?.startsWith("image/")) {
      return originalFavicon();
    }

    return faviconResponse(await upstream.arrayBuffer(), contentType);
  } catch {
    return originalFavicon();
  }
}

"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { createAdminClient, supabaseConfigured } from "@/lib/supabase/admin";
import { getViewer, recordAudit } from "@/lib/admin.server";

const kinds = ["logo", "favicon", "apple-icon"] as const;
type AssetKind = (typeof kinds)[number];

const kindSchema = z.enum(kinds);
const columns: Record<AssetKind, "logo_url" | "favicon_url" | "apple_icon_url"> = {
  logo: "logo_url",
  favicon: "favicon_url",
  "apple-icon": "apple_icon_url",
};

const MIME_EXTENSIONS: Record<string, string> = {
  "image/png": "png",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/x-icon": "ico",
  "image/vnd.microsoft.icon": "ico",
};

async function authorisedViewer() {
  const viewer = await getViewer();
  return viewer?.isAdmin ? viewer : null;
}

export async function uploadBrandAsset(input: FormData) {
  const kindResult = kindSchema.safeParse(input.get("kind"));
  const file = input.get("file");
  if (!kindResult.success || !(file instanceof File)) {
    return { ok: false as const, error: "Choose a valid brand asset." };
  }

  const viewer = await authorisedViewer();
  if (!viewer) return { ok: false as const, error: "Administrator access required." };
  if (!supabaseConfigured()) {
    return { ok: false as const, error: "Brand storage is not connected." };
  }

  const extension = MIME_EXTENSIONS[file.type];
  if (!extension) {
    return { ok: false as const, error: "Use SVG, PNG, WebP, or ICO." };
  }
  if (file.size === 0 || file.size > 1_572_864) {
    return { ok: false as const, error: "Keep the asset below 1.5 MB." };
  }

  const kind = kindResult.data;
  const db = createAdminClient();
  const path = `${kind}/current.${extension}`;
  const { error: uploadError } = await db.storage
    .from("brand-assets")
    .upload(path, Buffer.from(await file.arrayBuffer()), {
      contentType: file.type,
      cacheControl: "60",
      upsert: true,
    });

  if (uploadError) return { ok: false as const, error: uploadError.message };

  const { data } = db.storage.from("brand-assets").getPublicUrl(path);
  const { error } = await db.from("brand_assets").upsert(
    {
      id: true,
      [columns[kind]]: `${data.publicUrl}?v=${Date.now()}`,
      updated_by: viewer.id,
    },
    { onConflict: "id" },
  );

  if (error) return { ok: false as const, error: error.message };

  await recordAudit({
    actorId: viewer.id,
    action: "brand.asset_updated",
    subjectTable: "brand_assets",
    subjectId: kind,
    detail: { mime: file.type, bytes: file.size },
  });
  revalidatePath("/", "layout");
  revalidatePath("/admin/brand");
  return { ok: true as const };
}

export async function resetBrandAsset(input: { kind: string }) {
  const parsed = kindSchema.safeParse(input.kind);
  if (!parsed.success) return { ok: false as const, error: "Unknown asset." };

  const viewer = await authorisedViewer();
  if (!viewer) return { ok: false as const, error: "Administrator access required." };
  if (!supabaseConfigured()) {
    return { ok: false as const, error: "Brand storage is not connected." };
  }

  const db = createAdminClient();
  const { error } = await db.from("brand_assets").upsert(
    { id: true, [columns[parsed.data]]: null, updated_by: viewer.id },
    { onConflict: "id" },
  );
  if (error) return { ok: false as const, error: error.message };

  await recordAudit({
    actorId: viewer.id,
    action: "brand.asset_reset",
    subjectTable: "brand_assets",
    subjectId: parsed.data,
  });
  revalidatePath("/", "layout");
  revalidatePath("/admin/brand");
  return { ok: true as const };
}

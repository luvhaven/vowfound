import { WorkspaceHeader } from "@/components/ui/workspace-header";
import { BrandAssetManager } from "@/components/admin/brand-asset-manager";
import { getBrandAssets } from "@/lib/brand-assets.server";

export default async function AdminBrandPage() {
  const assets = await getBrandAssets();

  return (
    <div>
      <WorkspaceHeader
        eyebrow="Identity control"
        title="Brand assets"
        body="Manage the mark shown across the site, the browser-tab favicon, and the Apple home-screen icon. Every page uses these sources automatically."
        detail={assets.updated_at ? `Updated ${new Date(assets.updated_at).toLocaleDateString()}` : "Original identity live"}
      />

      <div className="mt-8 rounded-[12px] border border-hairline bg-onink/[0.02] px-6 py-5">
        <p className="engraved text-rose">Before publishing</p>
        <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-onink-dim">
          Keep the two-ring silhouette recognisable at small sizes. Files are capped at 1.5 MB, published immediately, and can always be restored to the original identity.
        </p>
      </div>

      <div className="mt-8">
        <BrandAssetManager
          current={{
            logo: assets.logo_url,
            favicon: assets.favicon_url,
            "apple-icon": assets.apple_icon_url,
          }}
        />
      </div>
    </div>
  );
}

"use client";

import * as React from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { resetBrandAsset, uploadBrandAsset } from "@/app/actions/brand";

type AssetKind = "logo" | "favicon" | "apple-icon";

const ASSETS: ReadonlyArray<{
  kind: AssetKind;
  label: string;
  help: string;
  accept: string;
  ratio: string;
}> = [
  {
    kind: "logo",
    label: "Logo mark",
    help: "The symbol beside VowFound in every header and footer. A transparent SVG or PNG works best.",
    accept: "image/svg+xml,image/png,image/webp",
    ratio: "aspect-[16/9]",
  },
  {
    kind: "favicon",
    label: "Browser favicon",
    help: "The tab icon on every page. Use a square SVG, PNG, or ICO with strong contrast at 16 pixels.",
    accept: "image/svg+xml,image/png,image/webp,image/x-icon,image/vnd.microsoft.icon",
    ratio: "aspect-square",
  },
  {
    kind: "apple-icon",
    label: "Apple touch icon",
    help: "Used when someone saves VowFound to an iPhone or iPad home screen. Use a square PNG.",
    accept: "image/png,image/webp",
    ratio: "aspect-square",
  },
];

export function BrandAssetManager({
  current,
}: {
  current: Record<AssetKind, string | null>;
}) {
  return (
    <div className="grid gap-5 xl:grid-cols-3">
      {ASSETS.map((asset) => (
        <AssetEditor key={asset.kind} asset={asset} current={current[asset.kind]} />
      ))}
    </div>
  );
}

function AssetEditor({
  asset,
  current,
}: {
  asset: (typeof ASSETS)[number];
  current: string | null;
}) {
  const router = useRouter();
  const inputRef = React.useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);
  const [pending, start] = React.useTransition();
  const preview = `/api/brand/${asset.kind}?v=${encodeURIComponent(current ?? "default")}`;

  function upload() {
    const file = inputRef.current?.files?.[0];
    if (!file) {
      setError("Choose a file first.");
      return;
    }
    setError(null);
    setSaved(false);
    start(async () => {
      const form = new FormData();
      form.set("kind", asset.kind);
      form.set("file", file);
      const result = await uploadBrandAsset(form);
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    });
  }

  function reset() {
    setError(null);
    setSaved(false);
    start(async () => {
      const result = await resetBrandAsset({ kind: asset.kind });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  return (
    <article className="rounded-[16px] border border-hairline bg-onink/[0.025] p-5 md:p-6">
      <div
        className={`relative ${asset.ratio} max-h-44 overflow-hidden rounded-[12px] border border-hairline bg-stock`}
      >
        <Image
          src={preview}
          alt={`${asset.label} preview`}
          fill
          unoptimized
          sizes="(max-width: 1280px) 100vw, 28vw"
          className="object-contain p-7"
        />
      </div>
      <div className="mt-5 flex items-baseline justify-between gap-3">
        <h2 className="display text-[1.35rem] text-onink">{asset.label}</h2>
        <span className="engraved text-[9px] text-onink-faint">
          {current ? "Custom" : "Original"}
        </span>
      </div>
      <p className="mt-3 min-h-16 text-[13px] leading-relaxed text-onink-dim">
        {asset.help}
      </p>
      <input
        ref={inputRef}
        type="file"
        accept={asset.accept}
        className="mt-5 block w-full text-[12px] text-onink-dim file:mr-3 file:rounded-[7px] file:border file:border-hairline file:bg-onink/[0.05] file:px-3 file:py-2 file:text-[10px] file:font-semibold file:uppercase file:tracking-[0.12em] file:text-onink"
      />
      {error && <p role="alert" className="mt-3 text-[13px] text-rose">{error}</p>}
      {saved && <p className="engraved mt-3 text-sage">Saved and live</p>}
      <div className="mt-5 flex flex-wrap gap-2">
        <Button type="button" size="sm" onClick={upload} disabled={pending}>
          {pending ? "Publishing" : "Publish asset"}
        </Button>
        {current && (
          <Button type="button" size="sm" variant="quiet" onClick={reset} disabled={pending}>
            Restore original
          </Button>
        )}
      </div>
    </article>
  );
}

"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import type { ContentField } from "@/lib/content/registry";
import { saveContent, revertContent } from "@/app/actions/content";

export function ContentField_({
  field,
  current,
  canEdit,
}: {
  field: ContentField;
  current: string | null;
  canEdit: boolean;
}) {
  const router = useRouter();
  const live = current ?? field.fallback;
  const [value, setValue] = React.useState(live);
  const [error, setError] = React.useState<string | null>(null);
  const [saved, setSaved] = React.useState(false);
  const [pending, start] = React.useTransition();

  const overridden = current !== null;
  const locked = Boolean(field.locked);
  const editable = canEdit && !locked;
  const dirty = editable && value.trim() !== live.trim();

  function save() {
    setError(null);
    setSaved(false);
    start(async () => {
      const result = await saveContent({ key: field.key, value });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setSaved(true);
      router.refresh();
    });
  }

  function revert() {
    setError(null);
    setSaved(false);
    start(async () => {
      const result = await revertContent({ key: field.key });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setValue(field.fallback);
      router.refresh();
    });
  }

  const Input = field.kind === "paragraph" ? "textarea" : "input";

  return (
    <div className="border-t border-hairline py-6 first:border-t-0 first:pt-0">
      <div className="flex flex-wrap items-baseline justify-between gap-3">
        <label
          htmlFor={field.key}
          className="engraved text-onink"
        >
          {field.label}
        </label>
        <div className="flex items-center gap-3">
          {locked && (
            <span className="engraved rounded-[8px] border border-hairline px-2.5 py-1 text-[10px] text-onink-faint">
              Fixed position
            </span>
          )}
          {overridden && !locked && (
            <span className="engraved rounded-[8px] border border-rose/45 px-2.5 py-1 text-[10px] text-rose">
              Edited
            </span>
          )}
          <code className="text-[11px] text-onink-faint">{field.key}</code>
        </div>
      </div>

      {locked && (
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-onink-faint">
          Taken verbatim from the brief. Changing what the business promises
          takes a code change and a review, not a form submission.
        </p>
      )}

      {field.help && (
        <p className="mt-2 max-w-2xl text-[13px] leading-relaxed text-onink-faint">
          {field.help}
        </p>
      )}

      <Input
        id={field.key}
        value={value}
        disabled={!editable}
        rows={field.kind === "paragraph" ? 3 : undefined}
        onChange={(
          e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
        ) => {
          setValue(e.target.value);
          setSaved(false);
        }}
        className={cn(
          "mt-3 w-full rounded-[12px] border bg-onink/[0.03] px-4 py-3 text-[15px] leading-relaxed text-onink",
          "focus:border-onink/35 disabled:opacity-60",
          error ? "border-oxblood-lift" : "border-hairline",
          field.kind === "paragraph" && "resize-y",
        )}
      />

      {overridden && (
        <details className="mt-3">
          <summary className="engraved cursor-pointer text-onink-faint hover:text-onink-dim">
            What shipped originally
          </summary>
          <p className="mt-2 border-l-2 border-hairline pl-4 text-[14px] leading-relaxed text-onink-faint">
            {field.fallback}
          </p>
        </details>
      )}

      {error && (
        <p role="alert" className="mt-3 text-[14px] leading-relaxed text-rose">
          {error}
        </p>
      )}

      {editable && (dirty || overridden) && (
        <div className="mt-4 flex flex-wrap items-center gap-3">
          {dirty && (
            <Button type="button" size="sm" onClick={save} disabled={pending}>
              {pending ? "Saving" : "Save"}
            </Button>
          )}
          {overridden && (
            <Button
              type="button"
              size="sm"
              variant="quiet"
              onClick={revert}
              disabled={pending}
            >
              Revert to original
            </Button>
          )}
          {saved && !dirty && (
            <span className="engraved text-sage">Saved and live</span>
          )}
        </div>
      )}
    </div>
  );
}

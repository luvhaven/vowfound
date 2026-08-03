"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { resolveSafetyReport } from "@/app/actions/admin";

export function ReportReviewer({ id }: { id: string }) {
  const router = useRouter();
  const [outcome, setOutcome] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, start] = React.useTransition();

  function decide(status: "investigating" | "actioned" | "dismissed") {
    setError(null);
    if (status !== "investigating" && outcome.trim().length < 5) {
      setError("Record what you decided and why before closing a report.");
      return;
    }
    start(async () => {
      const result = await resolveSafetyReport({ id, status, outcome });
      if (result.ok) router.refresh();
      else setError(result.error);
    });
  }

  return (
    <div>
      <label htmlFor={`outcome-${id}`} className="engraved block text-onink-faint">
        What you decided, and why
      </label>
      <textarea
        id={`outcome-${id}`}
        value={outcome}
        onChange={(e) => setOutcome(e.target.value)}
        rows={3}
        className="mt-2.5 w-full rounded-[12px] border border-hairline bg-onink/[0.03] px-4 py-3 text-[14px] leading-relaxed text-onink placeholder:text-onink-faint focus:border-onink/30"
        placeholder="The reporter is told what happened, so write it for them to read."
      />

      {error && (
        <p role="alert" className="mt-3 text-[14px] text-rose">
          {error}
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          type="button"
          size="sm"
          variant="quiet"
          disabled={pending}
          onClick={() => decide("investigating")}
        >
          Investigating
        </Button>
        <Button
          type="button"
          size="sm"
          disabled={pending}
          onClick={() => decide("actioned")}
        >
          Action taken
        </Button>
        <Button
          type="button"
          size="sm"
          variant="quiet"
          disabled={pending}
          onClick={() => decide("dismissed")}
        >
          Dismiss
        </Button>
      </div>
    </div>
  );
}

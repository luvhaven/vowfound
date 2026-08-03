"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Paper, PaperInset } from "@/components/ui/paper";
import { Button } from "@/components/ui/button";
import { exportMyData, deleteMyAccount, setConsent } from "@/app/actions/account";

const CONSENTS = [
  {
    kind: "introductions" as const,
    title: "Introductions",
    body: "Allows a matchmaker to propose you to another member. Withdrawing this pauses your search and does not affect coaching.",
  },
  {
    kind: "photography_use" as const,
    title: "Photography",
    body: "Allows your photographs to be shown to someone who has already accepted an introduction. Never used publicly, and never in marketing.",
  },
  {
    kind: "background_check" as const,
    title: "Background checks",
    body: "Allows us to run a check where one is legally available. Withdrawing this does not remove a check already completed.",
  },
  {
    kind: "marketing" as const,
    title: "Marketing email",
    body: "Occasional writing from the practice. Off by default, and withdrawing it never affects anything operational.",
  },
];

export function PrivacyControls({
  granted,
}: {
  granted: Record<string, boolean>;
}) {
  const router = useRouter();
  const [pending, start] = React.useTransition();

  function toggle(kind: (typeof CONSENTS)[number]["kind"], next: boolean) {
    start(async () => {
      await setConsent({ kind, granted: next });
      router.refresh();
    });
  }

  return (
    <div className="space-y-6">
      <Paper className="p-7 md:p-9">
        <h2 className="display-md text-ink">Consent</h2>
        <p className="mt-4 text-[15px] leading-relaxed text-slate">
          Four separate permissions. Each one is timestamped and each can be
          withdrawn on its own.
        </p>

        <ul className="mt-8 space-y-6">
          {CONSENTS.map((consent) => {
            const on = Boolean(granted[consent.kind]);
            return (
              <li key={consent.kind} className="border-t border-stone pt-6">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="max-w-md">
                    <p className="engraved text-ink">{consent.title}</p>
                    <p className="mt-2 text-[15px] leading-relaxed text-slate">
                      {consent.body}
                    </p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={on}
                    aria-label={`${consent.title} consent`}
                    disabled={pending}
                    onClick={() => toggle(consent.kind, !on)}
                    className={
                      "engraved shrink-0 rounded-[8px] border px-4 py-2 transition-colors " +
                      (on
                        ? "border-sage-ink bg-sage-ink text-stock"
                        : "border-stone text-slate hover:border-ink hover:text-ink")
                    }
                  >
                    {on ? "Granted" : "Not granted"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      </Paper>

      <ExportCard />
      <DeleteCard />
    </div>
  );
}

function ExportCard() {
  const [pending, start] = React.useTransition();
  const [failed, setFailed] = React.useState(false);

  function run() {
    setFailed(false);
    start(async () => {
      const result = await exportMyData();
      if (!result.ok) {
        setFailed(true);
        return;
      }
      const blob = new Blob([JSON.stringify(result.bundle, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = `vowfound-export-${new Date().toISOString().slice(0, 10)}.json`;
      anchor.click();
      URL.revokeObjectURL(url);
    });
  }

  return (
    <Paper className="p-7 md:p-9">
      <h2 className="display-md text-ink">Export everything</h2>
      <p className="mt-4 text-[15px] leading-relaxed text-slate">
        A machine-readable file containing every record we hold that is keyed to
        you, including your assessment answers word for word.
      </p>
      {failed && (
        <p role="alert" className="mt-4 text-[15px] text-oxblood">
          That did not work. Try again, or email privacy@vowfound.com.
        </p>
      )}
      <div className="mt-7">
        <Button type="button" variant="onpaper" onClick={run} disabled={pending}>
          {pending ? "Preparing" : "Download my data"}
        </Button>
      </div>
    </Paper>
  );
}

function DeleteCard() {
  const router = useRouter();
  const [open, setOpen] = React.useState(false);
  const [confirmation, setConfirmation] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, start] = React.useTransition();

  function run() {
    setError(null);
    start(async () => {
      const result = await deleteMyAccount({ confirmation, reason });
      if (result.ok) router.push("/");
      else setError(result.error);
    });
  }

  return (
    <Paper className="p-7 md:p-9">
      <h2 className="display-md text-ink">Delete your account</h2>
      <p className="mt-4 text-[15px] leading-relaxed text-slate">
        Immediate and self-serve. There is no retention call and nobody will try
        to talk you out of it.
      </p>

      <PaperInset className="mt-6">
        <p className="text-[15px] leading-relaxed text-slate">
          This removes your profile, assessment, answers, readiness map,
          preferences and files. Anyone you have been introduced to loses access
          at the same moment. Financial records are kept only for as long as the
          law requires.
        </p>
      </PaperInset>

      {!open ? (
        <div className="mt-7">
          <Button
            type="button"
            variant="onpaper"
            onClick={() => setOpen(true)}
            className="border-oxblood text-oxblood hover:bg-oxblood hover:text-stock"
          >
            Delete my account
          </Button>
        </div>
      ) : (
        <div className="mt-7 space-y-5">
          <div>
            <label htmlFor="delete-reason" className="engraved block text-slate">
              Why are you leaving? Optional
            </label>
            <textarea
              id="delete-reason"
              className="field mt-2.5 min-h-24 resize-y"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="delete-confirm" className="engraved block text-slate">
              Type DELETE to confirm
            </label>
            <input
              id="delete-confirm"
              className="field mt-2.5"
              value={confirmation}
              onChange={(e) => setConfirmation(e.target.value)}
              autoComplete="off"
            />
          </div>

          {error && (
            <p role="alert" className="border-l-2 border-oxblood pl-4 text-[15px] text-oxblood">
              {error}
            </p>
          )}

          <div className="flex flex-wrap gap-3">
            <Button type="button" onClick={run} disabled={pending}>
              {pending ? "Deleting" : "Delete permanently"}
            </Button>
            <Button
              type="button"
              variant="onpaper"
              onClick={() => setOpen(false)}
              disabled={pending}
            >
              Keep my account
            </Button>
          </div>
        </div>
      )}
    </Paper>
  );
}

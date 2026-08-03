"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Paper } from "@/components/ui/paper";
import { Button } from "@/components/ui/button";
import { checkPassword, PASSWORD_HINT } from "@/lib/auth/password";
import { PasswordRequirements } from "@/components/auth/password-requirements";
import { changePassword } from "@/app/actions/auth";

function Field({
  id,
  label,
  value,
  onChange,
  autoComplete,
  describedBy,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
  autoComplete: string;
  describedBy?: string;
}) {
  const [visible, setVisible] = React.useState(false);

  return (
    <div>
      <label htmlFor={id} className="engraved block text-slate">
        {label}
      </label>
      <div className="relative mt-2.5">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          autoComplete={autoComplete}
          aria-describedby={describedBy}
          onChange={(e) => onChange(e.target.value)}
          className="field pr-20"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-pressed={visible}
          className="engraved absolute right-3 top-1/2 -translate-y-1/2 text-slate hover:text-ink"
        >
          {visible ? "Hide" : "Show"}
        </button>
      </div>
    </div>
  );
}

export function PasswordForm({ mustChange }: { mustChange: boolean }) {
  const router = useRouter();
  const [current, setCurrent] = React.useState("");
  const [next, setNext] = React.useState("");
  const [confirm, setConfirm] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [done, setDone] = React.useState(false);
  const [pending, start] = React.useTransition();

  const ready = checkPassword(next).ok && next === confirm && current.length > 0;

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    start(async () => {
      const result = await changePassword({
        currentPassword: current,
        newPassword: next,
        confirmPassword: confirm,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setDone(true);
      setCurrent("");
      setNext("");
      setConfirm("");
      router.refresh();
    });
  }

  if (done) {
    return (
      <Paper className="p-7 md:p-9">
        <h2 className="display-md text-ink">Password changed.</h2>
        <p className="mt-4 text-[16px] leading-relaxed text-slate">
          Use the new one next time you sign in. Other devices stay signed in —
          if you were changing it because someone else had access, sign out
          everywhere from your account settings as well.
        </p>
      </Paper>
    );
  }

  return (
    <Paper className="p-7 md:p-9">
      {mustChange && (
        <div className="mb-7 rounded-[12px] border border-oxblood/40 bg-oxblood/5 px-5 py-4">
          <p className="engraved text-oxblood">Change required</p>
          <p className="mt-2 text-[15px] leading-relaxed text-slate">
            This account was set up with a temporary password. Choose your own
            before doing anything else — nobody else should know how to sign in
            as you.
          </p>
        </div>
      )}

      <form onSubmit={submit} noValidate>
        <h2 className="display-md text-ink">
          {mustChange ? "Choose your password" : "Change your password"}
        </h2>
        <p id="password-hint" className="mt-4 text-[15px] leading-relaxed text-slate">
          {PASSWORD_HINT}
        </p>

        <div className="mt-7 space-y-5">
          <Field
            id="current-password"
            label={mustChange ? "Temporary password" : "Current password"}
            value={current}
            onChange={setCurrent}
            autoComplete="current-password"
          />

          <div>
            <Field
              id="new-password"
              label="New password"
              value={next}
              onChange={setNext}
              autoComplete="new-password"
              describedBy="password-hint"
            />
            <PasswordRequirements value={next} />
          </div>

          <Field
            id="confirm-password"
            label="New password again"
            value={confirm}
            onChange={setConfirm}
            autoComplete="new-password"
          />

          {confirm.length > 0 && next !== confirm && (
            <p className="text-[14px] text-oxblood">
              Both new password fields must match.
            </p>
          )}
        </div>

        {error && (
          <p
            role="alert"
            className="mt-5 border-l-2 border-oxblood pl-4 text-[15px] text-oxblood"
          >
            {error}
          </p>
        )}

        <div className="mt-8">
          <Button type="submit" size="lg" disabled={pending || !ready}>
            {pending ? "Saving" : "Save new password"}
          </Button>
        </div>
      </form>
    </Paper>
  );
}

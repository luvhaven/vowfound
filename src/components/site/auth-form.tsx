"use client";

import * as React from "react";
import { sendMagicLink, type AuthState } from "@/app/actions/auth";

export function AuthForm({ mode, next }: { mode: "sign-in" | "sign-up"; next?: string }) {
  const [state, action, pending] = React.useActionState<AuthState, FormData>(sendMagicLink, undefined);

  if (state?.sent) {
    return (
      <div className="sticker bg-moss p-8 text-paper" role="status">
        <p className="h3">Check your inbox.</p>
        <p className="mt-3 font-medium">We&apos;ve sent you a sign-in link. It works once and expires in an hour.</p>
      </div>
    );
  }

  return (
    <form action={action} className="grid gap-5">
      {next && <input type="hidden" name="next" value={next} />}
      {mode === "sign-up" && (
        <label className="grid gap-2">
          <span className="label">First name</span>
          <input name="full_name" className="field" autoComplete="given-name" />
        </label>
      )}
      <label className="grid gap-2">
        <span className="label">Email</span>
        <input name="email" type="email" className="field" required autoComplete="email" />
      </label>
      {state?.error && <p role="alert" className="rounded-2xl border-2 border-ink bg-bubble px-4 py-3 font-bold">{state.error}</p>}
      <button className="btn btn-lg bg-tomato text-ink" disabled={pending}>
        {pending ? "Sending…" : mode === "sign-up" ? "Create my account" : "Email me a sign-in link"}
      </button>
      <p className="text-[13px] text-ink-mute">No password. We email you a one-time link.</p>
    </form>
  );
}

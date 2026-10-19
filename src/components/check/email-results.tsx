"use client";

import * as React from "react";
import { emailMyResults, type EmailResultsState } from "@/app/actions/check";

/** Shown on results that have no email yet: one field, one button. */
export function EmailResults({ id }: { id: string }) {
  const [state, action, pending] = React.useActionState<EmailResultsState, FormData>(emailMyResults, undefined);
  if (state?.ok) {
    return <p className="sticker bg-moss px-6 py-5 font-bold text-paper" role="status">Sent. Check your inbox for your private link.</p>;
  }
  return (
    <form action={action} className="sticker grid gap-4 bg-butter p-6 md:grid-cols-[1fr_auto] md:items-end md:p-7">
      <input type="hidden" name="id" value={id} />
      <label className="grid gap-2">
        <span className="label">Don&apos;t lose these — email me the link</span>
        <input name="email" type="email" required className="field" autoComplete="email" placeholder="you@example.com" />
      </label>
      <button className="btn bg-ink text-paper" disabled={pending}>{pending ? "Sending…" : "Email my results"}</button>
      {state?.error && <p role="alert" className="font-bold md:col-span-2">{state.error}</p>}
    </form>
  );
}

"use client";

import * as React from "react";
import { applyPrivate, sendEnquiry, type FormState } from "@/app/actions/forms";

function Honeypot() {
  return (
    <label className="hidden" aria-hidden>
      Website <input name="website" tabIndex={-1} autoComplete="off" />
    </label>
  );
}

function Done({ title, body }: { title: string; body: string }) {
  return (
    <div className="sticker bg-moss p-8 text-paper" role="status">
      <p className="h3">{title}</p>
      <p className="mt-3 font-medium">{body}</p>
    </div>
  );
}

export function ApplyForm() {
  const [state, action, pending] = React.useActionState<FormState, FormData>(applyPrivate, undefined);
  if (state?.ok) return <Done title="Application received." body="A principal reads every one personally. You'll hear back within a week." />;
  return (
    <form action={action} className="grid gap-5">
      <Honeypot />
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2"><span className="label">Full name</span><input name="full_name" className="field" required autoComplete="name" /></label>
        <label className="grid gap-2"><span className="label">Email</span><input name="email" type="email" className="field" required autoComplete="email" /></label>
        <label className="grid gap-2"><span className="label">City</span><input name="city" className="field" autoComplete="address-level2" /></label>
        <label className="grid gap-2">
          <span className="label">When would you like to be married?</span>
          <select name="timeline" className="field">
            <option>Within 2 years</option>
            <option>2–4 years</option>
            <option>No fixed timeline</option>
          </select>
        </label>
      </div>
      <label className="grid gap-2">
        <span className="label">A little about you and what you&apos;re looking for</span>
        <textarea name="about" className="field min-h-40" required />
      </label>
      {state?.error && <p role="alert" className="rounded-2xl border-2 border-ink bg-bubble px-4 py-3 font-bold">{state.error}</p>}
      <button className="btn btn-lg bg-ink text-paper" disabled={pending}>{pending ? "Sending…" : "Send my application"}</button>
      <p className="text-[13px] font-medium opacity-75">Applications are confidential and read only by a principal.</p>
    </form>
  );
}

export function ContactForm() {
  const [state, action, pending] = React.useActionState<FormState, FormData>(sendEnquiry, undefined);
  if (state?.ok) return <Done title="Sent." body="A real person will reply, usually within two working days." />;
  return (
    <form action={action} className="grid gap-5">
      <Honeypot />
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="grid gap-2"><span className="label">Name</span><input name="name" className="field" required autoComplete="name" /></label>
        <label className="grid gap-2"><span className="label">Email</span><input name="email" type="email" className="field" required autoComplete="email" /></label>
      </div>
      <label className="grid gap-2"><span className="label">Message</span><textarea name="message" className="field min-h-40" required /></label>
      {state?.error && <p role="alert" className="rounded-2xl border-2 border-ink bg-bubble px-4 py-3 font-bold">{state.error}</p>}
      <button className="btn btn-lg bg-tomato text-ink" disabled={pending}>{pending ? "Sending…" : "Send message"}</button>
    </form>
  );
}

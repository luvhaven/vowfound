"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signIn, signUp, requestPasswordReset } from "@/app/actions/auth";

function Field({
  id,
  label,
  type = "text",
  autoComplete,
  hint,
  value,
  onChange,
}: {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <label htmlFor={id} className="engraved block text-slate">
        {label}
      </label>
      <input
        id={id}
        type={type}
        autoComplete={autoComplete}
        className="field mt-2.5"
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      {hint && <p className="mt-2 text-[14px] text-slate">{hint}</p>}
    </div>
  );
}

function ErrorNote({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <p
      role="alert"
      className="mt-5 border-l-2 border-oxblood pl-4 text-[15px] text-oxblood"
    >
      {message}
    </p>
  );
}

export function SignInForm() {
  const router = useRouter();
  const params = useSearchParams();
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [error, setError] = React.useState<string | null>(null);
  const [pending, start] = React.useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    start(async () => {
      const result = await signIn({ email, password });
      if (result.ok) router.push(params.get("next") ?? "/account");
      else setError(result.error);
    });
  }

  return (
    <form onSubmit={submit} noValidate>
      <h1 className="display-md text-ink">Sign in</h1>
      <div className="mt-7 space-y-5">
        <Field id="email" label="Email" type="email" autoComplete="email" value={email} onChange={setEmail} />
        <Field
          id="password"
          label="Password"
          type="password"
          autoComplete="current-password"
          value={password}
          onChange={setPassword}
        />
      </div>
      <ErrorNote message={error} />
      <div className="mt-8">
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Signing in" : "Sign in"}
        </Button>
      </div>
      <div className="mt-7 flex flex-wrap justify-between gap-3">
        <Link href="/forgot-password" className="engraved text-slate underline decoration-stone underline-offset-4">
          Forgotten password
        </Link>
        <Link href="/sign-up" className="engraved text-slate underline decoration-stone underline-offset-4">
          Create an account
        </Link>
      </div>
    </form>
  );
}

export function SignUpForm() {
  const router = useRouter();
  const [values, setValues] = React.useState({ fullName: "", email: "", password: "" });
  const [ageConfirmed, setAge] = React.useState(false);
  const [acceptTerms, setTerms] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [sent, setSent] = React.useState(false);
  const [pending, start] = React.useTransition();

  function set(key: keyof typeof values) {
    return (v: string) => setValues((prev) => ({ ...prev, [key]: v }));
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    if (!ageConfirmed) return setError("You must confirm you are 18 or over.");
    if (!acceptTerms) return setError("Please accept the terms and privacy policy.");

    start(async () => {
      const result = await signUp({ ...values, ageConfirmed, acceptTerms });
      if (!result.ok) setError(result.error);
      else if (result.needsConfirmation) setSent(true);
      else router.push("/account");
    });
  }

  if (sent) {
    return (
      <div>
        <h1 className="display-md text-ink">Check your email.</h1>
        <p className="mt-5 text-[16px] leading-relaxed text-slate">
          We have sent a confirmation link to {values.email}. Open it and your
          account is live. The link expires in an hour.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <h1 className="display-md text-ink">Create your account</h1>
      <p className="mt-4 text-[15px] leading-relaxed text-slate">
        An account keeps your readiness map, your plan and your appointments in
        one place. Nothing about you becomes visible to anyone else.
      </p>

      <div className="mt-7 space-y-5">
        <Field id="fullName" label="Your name" autoComplete="name" value={values.fullName} onChange={set("fullName")} />
        <Field id="email" label="Email" type="email" autoComplete="email" value={values.email} onChange={set("email")} />
        <Field
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          hint="At least ten characters. A short sentence works well."
          value={values.password}
          onChange={set("password")}
        />
      </div>

      <div className="mt-7 space-y-4">
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={ageConfirmed}
            onChange={(e) => setAge(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-[#4A202C]"
          />
          <span className="text-[15px] leading-relaxed text-slate">
            I am 18 or over.
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3">
          <input
            type="checkbox"
            checked={acceptTerms}
            onChange={(e) => setTerms(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-[#4A202C]"
          />
          <span className="text-[15px] leading-relaxed text-slate">
            I accept the{" "}
            <Link href="/legal/terms" className="underline decoration-stone underline-offset-4">
              terms
            </Link>{" "}
            and the{" "}
            <Link href="/legal/privacy-policy" className="underline decoration-stone underline-offset-4">
              privacy policy
            </Link>
            .
          </span>
        </label>
      </div>

      <ErrorNote message={error} />

      <div className="mt-8">
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Creating" : "Create account"}
        </Button>
      </div>

      <p className="mt-7 text-[15px] text-slate">
        Already have one?{" "}
        <Link href="/sign-in" className="underline decoration-stone underline-offset-4">
          Sign in
        </Link>
      </p>
    </form>
  );
}

export function ForgotPasswordForm() {
  const [email, setEmail] = React.useState("");
  const [sent, setSent] = React.useState(false);
  const [pending, start] = React.useTransition();

  function submit(event: React.FormEvent) {
    event.preventDefault();
    start(async () => {
      await requestPasswordReset({ email });
      setSent(true);
    });
  }

  if (sent) {
    return (
      <div>
        <h1 className="display-md text-ink">Check your email.</h1>
        <p className="mt-5 text-[16px] leading-relaxed text-slate">
          If an account exists for {email}, a reset link is on its way. We give
          the same answer either way, so that this form cannot be used to find
          out who has an account here.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} noValidate>
      <h1 className="display-md text-ink">Reset your password</h1>
      <div className="mt-7">
        <Field id="email" label="Email" type="email" autoComplete="email" value={email} onChange={setEmail} />
      </div>
      <div className="mt-8">
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Sending" : "Send the link"}
        </Button>
      </div>
      <p className="mt-7 text-[15px] text-slate">
        <Link href="/sign-in" className="underline decoration-stone underline-offset-4">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}

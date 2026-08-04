"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { signIn, signUp, requestPasswordReset } from "@/app/actions/auth";
import { PASSWORD_HINT, checkPassword } from "@/lib/auth/password";
import { PasswordRequirements } from "@/components/auth/password-requirements";
import { trackEvent } from "@/lib/analytics/client";

function Field({
  id,
  label,
  type = "text",
  autoComplete,
  hint,
  value,
  onChange,
  error,
}: {
  id: string;
  label: string;
  type?: string;
  autoComplete?: string;
  hint?: string;
  value: string;
  onChange: (v: string) => void;
  error?: string;
}) {
  return (
    <div>
      <label htmlFor={id} className="engraved block text-slate">
        {label}
      </label>
      <input
        id={id}
        name={id}
        type={type}
        autoComplete={autoComplete}
        className="field mt-2.5"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : hint ? `${id}-hint` : undefined}
      />
      {hint && <p id={`${id}-hint`} className="mt-2 text-[14px] text-slate">{hint}</p>}
      {error && <p id={`${id}-error`} role="alert" className="mt-2 text-[13px] text-oxblood">{error}</p>}
    </div>
  );
}

/**
 * Until React takes over, the submit button is a plain browser submit that
 * reloads the page and does nothing — which reads as "sign in is broken"
 * rather than "the page is still loading". This says which it is.
 */
function HydrationGuard() {
  return (
    <noscript>
      <p className="mt-5 border-l-2 border-oxblood pl-4 text-[15px] text-oxblood">
        Signing in needs JavaScript. If it is switched off, or a browser
        extension is blocking it, the form will reload and nothing will happen.
      </p>
    </noscript>
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
      if (result.ok) {
        trackEvent("sign_in", { method: "email" });
        const requested = params.get("next");
        const destination =
          requested?.startsWith("/") && !requested.startsWith("//")
            ? requested
            : result.destination;

        // A real navigation guarantees that middleware observes the session
        // cookie written by the server action. A client-router transition can
        // otherwise reuse a signed-out route payload from before submission.
        window.location.assign(destination);
      } else setError(result.error);
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
      <HydrationGuard />
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
  const [fieldErrors, setFieldErrors] = React.useState<Partial<Record<keyof typeof values, string>>>({});
  const [showPassword, setShowPassword] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [pending, start] = React.useTransition();

  function set(key: keyof typeof values) {
    return (v: string) => {
      setValues((prev) => ({ ...prev, [key]: v }));
      setFieldErrors((prev) => ({ ...prev, [key]: undefined }));
      setError(null);
    };
  }

  function submit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const nextErrors: Partial<Record<keyof typeof values, string>> = {};
    if (values.fullName.trim().length < 2) nextErrors.fullName = "Enter the name you would like us to use.";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email)) nextErrors.email = "Enter a valid email address.";
    if (!checkPassword(values.password).ok) nextErrors.password = "Complete the password requirements below.";
    setFieldErrors(nextErrors);
    const firstInvalid = (Object.keys(nextErrors)[0] as keyof typeof values | undefined);
    if (firstInvalid) {
      requestAnimationFrame(() => document.getElementById(firstInvalid)?.focus());
      return;
    }
    if (!ageConfirmed) {
      setError("You must confirm you are 18 or over.");
      requestAnimationFrame(() => document.getElementById("signup-age")?.focus());
      return;
    }
    if (!acceptTerms) {
      setError("Please accept the terms and privacy policy.");
      requestAnimationFrame(() => document.getElementById("signup-terms")?.focus());
      return;
    }

    start(async () => {
      const result = await signUp({ ...values, ageConfirmed, acceptTerms });
      if (!result.ok) setError(result.error);
      else if (result.needsConfirmation) {
        trackEvent("sign_up", { method: "email", confirmation: "required" });
        setSent(true);
      }
      else {
        trackEvent("sign_up", { method: "email" });
        router.push("/account");
      }
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
      <div className="flex items-start justify-between gap-6">
        <div>
          <p className="engraved text-oxblood">One private space</p>
          <h1 className="display-md mt-3 text-ink">Create your account</h1>
        </div>
        <span className="numeral display text-[1.7rem] text-stone" aria-hidden>01</span>
      </div>
      <p className="mt-4 max-w-lg text-[15px] leading-relaxed text-slate">
        An account keeps your readiness map, your plan and your appointments in
        one place. Nothing about you becomes visible to anyone else.
      </p>

      <div className="mt-6 space-y-5">
        <div className="grid gap-5 md:grid-cols-2">
          <Field id="fullName" label="Your name" autoComplete="name" value={values.fullName} onChange={set("fullName")} error={fieldErrors.fullName} />
          <Field id="email" label="Email" type="email" autoComplete="email" value={values.email} onChange={set("email")} error={fieldErrors.email} />
        </div>
        <div>
          <div className="flex items-baseline justify-between gap-4">
            <label htmlFor="password" className="engraved block text-slate">Password</label>
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="engraved text-[9px] text-slate underline decoration-stone underline-offset-4 hover:text-ink"
              aria-controls="password"
              aria-pressed={showPassword}
            >
              {showPassword ? "Hide" : "Show"}
            </button>
          </div>
          <input
            id="password"
            name="password"
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            className="field mt-2.5"
            value={values.password}
            onChange={(event) => set("password")(event.target.value)}
            aria-invalid={Boolean(fieldErrors.password)}
            aria-describedby={fieldErrors.password ? "password-error" : "password-hint"}
          />
          <p id="password-hint" className="mt-2 text-[13px] text-slate">{PASSWORD_HINT}</p>
          {fieldErrors.password && <p id="password-error" role="alert" className="mt-2 text-[13px] text-oxblood">{fieldErrors.password}</p>}
          <PasswordRequirements value={values.password} />
        </div>
      </div>

      <div className="mt-6 grid gap-3 sm:grid-cols-2">
        <label className="flex cursor-pointer items-start gap-3 rounded-[10px] border border-stone bg-white/35 px-4 py-3">
          <input
            id="signup-age"
            type="checkbox"
            checked={ageConfirmed}
            onChange={(e) => setAge(e.target.checked)}
            className="mt-1 h-4 w-4 shrink-0 accent-[#4A202C]"
          />
          <span className="text-[15px] leading-relaxed text-slate">
            I am 18 or over.
          </span>
        </label>
        <label className="flex cursor-pointer items-start gap-3 rounded-[10px] border border-stone bg-white/35 px-4 py-3">
          <input
            id="signup-terms"
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

      <HydrationGuard />
      <ErrorNote message={error} />

      <div className="mt-6">
        <Button type="submit" size="lg" className="w-full" disabled={pending}>
          {pending ? "Creating" : "Create account"}
        </Button>
      </div>

      <p className="mt-5 text-center text-[14px] text-slate">
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

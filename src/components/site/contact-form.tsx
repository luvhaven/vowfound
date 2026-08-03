"use client";

import * as React from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { sendContactMessage } from "@/app/actions/contact";
import { VowMark } from "@/components/ui/ornament";

const schema = z.object({
  name: z.string().min(1, "Tell us what to call you."),
  email: z.string().email("That address does not look right."),
  message: z
    .string()
    .min(10, "A sentence or two is enough, but we do need a sentence or two.")
    .max(4000),
  // Bots fill this. People never see it.
  company: z.string().max(0).optional(),
});

type Values = z.infer<typeof schema>;

export function ContactForm() {
  const [sent, setSent] = React.useState(false);
  const [failed, setFailed] = React.useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<Values>({ resolver: zodResolver(schema) });
  const messageLength = useWatch({
    control,
    name: "message",
    defaultValue: "",
  }).length;

  async function onSubmit(values: Values) {
    setFailed(null);
    const result = await sendContactMessage(values);
    if (result.ok) {
      setSent(true);
    } else {
      setFailed(
        "That did not send. Try again, or email us directly using the address on the right.",
      );
    }
  }

  if (sent) {
    return (
      <div className="grid min-h-80 content-center text-center">
        <VowMark size={88} className="mx-auto" />
        <p className="engraved mt-7 text-oxblood">Safely received</p>
        <h2 className="display-md mt-4 text-ink">Your note is with us.</h2>
        <p className="mx-auto mt-5 max-w-md text-[16px] leading-relaxed text-slate">
          A person will read it and reply, usually within two working days. If
          it is urgent, email us directly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} noValidate>
      <div className="flex items-start justify-between gap-6 border-b border-stone pb-6">
        <div>
          <p className="engraved text-oxblood">A private note</p>
          <h2 className="display-md mt-3 text-ink">Write to us</h2>
        </div>
        <p className="hidden max-w-[12rem] text-right text-[12px] leading-relaxed text-slate sm:block">
          Read by a person. Usually answered within two working days.
        </p>
      </div>

      <div className="mt-7 space-y-6">
        <div>
          <label htmlFor="name" className="engraved block text-slate">
            Your name
          </label>
          <input
            id="name"
            className="field mt-2.5"
            autoComplete="name"
            aria-invalid={Boolean(errors.name)}
            aria-describedby={errors.name ? "name-error" : undefined}
            {...register("name")}
          />
          {errors.name && (
            <p id="name-error" role="alert" className="mt-2 text-[14px] text-oxblood">
              {errors.name.message}
            </p>
          )}
        </div>

        <div>
          <label htmlFor="email" className="engraved block text-slate">
            Email
          </label>
          <input
            id="email"
            type="email"
            className="field mt-2.5"
            autoComplete="email"
            aria-invalid={Boolean(errors.email)}
            aria-describedby={errors.email ? "email-error" : undefined}
            {...register("email")}
          />
          {errors.email && (
            <p id="email-error" role="alert" className="mt-2 text-[14px] text-oxblood">
              {errors.email.message}
            </p>
          )}
        </div>

        <div>
          <div className="flex items-baseline justify-between gap-4">
            <label htmlFor="message" className="engraved block text-slate">
              Your question
            </label>
            <p className="numeral text-[11px] text-slate" aria-live="polite">
              {messageLength} / 4000
            </p>
          </div>
          <textarea
            id="message"
            className="field mt-2.5 min-h-36 resize-y"
            aria-invalid={Boolean(errors.message)}
            aria-describedby={errors.message ? "message-error" : undefined}
            {...register("message")}
          />
          {errors.message && (
            <p id="message-error" role="alert" className="mt-2 text-[14px] text-oxblood">
              {errors.message.message}
            </p>
          )}
        </div>

        <div aria-hidden className="absolute left-[-9999px]">
          <label htmlFor="company">Company</label>
          <input id="company" tabIndex={-1} autoComplete="off" {...register("company")} />
        </div>
      </div>

      {failed && (
        <p role="alert" className="mt-5 border-l-2 border-oxblood pl-4 text-[15px] text-oxblood">
          {failed}
        </p>
      )}

      <div className="mt-8 flex flex-wrap items-center justify-between gap-5 border-t border-stone pt-7">
        <p className="max-w-xs text-[12px] leading-relaxed text-slate">
          Sending this message does not create a public profile or subscribe
          you to marketing.
        </p>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending privately" : "Send privately"}
        </Button>
      </div>
    </form>
  );
}

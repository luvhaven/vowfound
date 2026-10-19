import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/site/auth-form";
import { Pair } from "@/components/art/shapes";
import { Wrap } from "@/components/ui/kit";

export const metadata: Metadata = { title: "Create an account", robots: { index: false } };

export default function SignUpPage() {
  return (
    <section className="py-16 md:py-24">
      <Wrap className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <h1 className="h1">Keep your results <span className="say font-normal">safe.</span></h1>
          <p className="mt-6 max-w-md text-[18px] font-medium text-ink-soft">An account keeps your Readiness Checks, orders and sessions in one private place.</p>
          <div className="mt-10 max-w-md"><AuthForm mode="sign-up" /></div>
          <p className="mt-8 text-[15px] font-medium">Already a member? <Link href="/sign-in" className="font-bold underline">Sign in</Link></p>
        </div>
        <Pair className="bob mx-auto w-full max-w-xs" />
      </Wrap>
    </section>
  );
}

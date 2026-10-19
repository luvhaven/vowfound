import type { Metadata } from "next";
import Link from "next/link";
import { AuthForm } from "@/components/site/auth-form";
import { Overlap } from "@/components/art/shapes";
import { Wrap } from "@/components/ui/kit";

export const metadata: Metadata = { title: "Sign in", robots: { index: false } };

export default async function SignInPage({ searchParams }: { searchParams: Promise<{ next?: string; error?: string }> }) {
  const { next, error } = await searchParams;
  return (
    <section className="py-16 md:py-24">
      <Wrap className="grid items-center gap-12 lg:grid-cols-2">
        <div>
          <h1 className="h1">Welcome <span className="say font-normal">back.</span></h1>
          {error && <p className="mt-6 rounded-2xl border-2 border-ink bg-bubble px-4 py-3 font-bold">That link didn&apos;t work or has expired. Request a new one.</p>}
          <div className="mt-10 max-w-md"><AuthForm mode="sign-in" next={next} /></div>
          <p className="mt-8 text-[15px] font-medium">New here? <Link href="/sign-up" className="font-bold underline">Create an account</Link></p>
        </div>
        <Overlap a="cobalt" b="bubble" lens="butter" className="bob mx-auto w-full max-w-md" />
      </Wrap>
    </section>
  );
}

import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { createAdminClient, adminConfigured } from "@/lib/supabase/admin";
import { Block, Wrap } from "@/components/ui/kit";

export const metadata: Metadata = { title: "Unsubscribe", robots: { index: false } };

const UUID = /^[0-9a-f-]{36}$/i;

async function unsubscribe(form: FormData) {
  "use server";
  const id = String(form.get("id") ?? "");
  if (UUID.test(id) && adminConfigured()) {
    const db = createAdminClient();
    const { data } = await db.from("readiness_checks").select("email").eq("id", id).maybeSingle();
    // Stop every sequence for this address, not just this one check.
    if (data?.email) await db.from("readiness_checks").update({ unsubscribed: true }).ilike("email", data.email);
  }
  redirect(`/unsubscribe/${id}?done=1`);
}

/** A button, not a bare link: mail scanners follow links, people press buttons. */
export default async function UnsubscribePage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ done?: string }> }) {
  const { id } = await params;
  const { done } = await searchParams;
  return (
    <Block field="paper">
      <Wrap className="max-w-2xl text-center">
        {done ? (
          <>
            <h1 className="h1">Done.</h1>
            <p className="mt-6 text-[19px] font-medium">You won&apos;t get any more follow-up emails from us.</p>
          </>
        ) : (
          <>
            <h1 className="h1">Stop the emails?</h1>
            <p className="mt-6 text-[19px] font-medium">You&apos;ll still be able to open your results link.</p>
            <form action={unsubscribe} className="mt-10">
              <input type="hidden" name="id" value={id} />
              <button className="btn btn-lg bg-ink text-paper">Unsubscribe me</button>
            </form>
          </>
        )}
      </Wrap>
    </Block>
  );
}

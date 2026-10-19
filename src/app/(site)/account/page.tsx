import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient, getMember } from "@/lib/supabase/server";
import { signOut, updateName, deleteAccount } from "@/app/actions/auth";
import { productBySlug, formatPrice, type Currency } from "@/lib/products";
import { DIMENSIONS, firstPriority, type Scores } from "@/lib/readiness";
import { Block, Wrap } from "@/components/ui/kit";

export const metadata: Metadata = { title: "My account", robots: { index: false } };

const STATUS: Record<string, string> = { paid: "Paid", pending: "Awaiting payment", failed: "Failed", refunded: "Refunded" };

export default async function AccountPage({ searchParams }: { searchParams: Promise<{ saved?: string; delete?: string }> }) {
  const member = await getMember();
  if (!member) redirect("/sign-in?next=/account");
  const sp = await searchParams;
  const supabase = await createClient();
  const [{ data: checks }, { data: orders }] = await Promise.all([
    supabase.from("readiness_checks").select("id, scores, recommended, created_at").eq("member_id", member.id).order("created_at", { ascending: false }),
    supabase.from("orders").select("id, product, currency, amount_minor, status, created_at").eq("member_id", member.id).order("created_at", { ascending: false }),
  ]);

  return (
    <>
      <Block field="butter" className="py-14 md:py-20">
        <Wrap className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="label">My account</p>
            <h1 className="h1 mt-4">Hi{member.full_name ? `, ${member.full_name}` : ""}.</h1>
          </div>
          <div className="flex flex-wrap gap-3">
            {(member.role === "admin" || member.role === "staff") && <Link href="/admin" className="btn bg-ink text-paper">Admin</Link>}
            <form action={signOut}><button className="btn bg-paper text-ink">Sign out</button></form>
          </div>
        </Wrap>
      </Block>

      <Block field="paper" className="py-14">
        <Wrap className="grid gap-8 lg:grid-cols-2">
          <section className="sticker bg-paper p-7">
            <div className="flex items-center justify-between gap-4">
              <h2 className="h3">Readiness Checks</h2>
              <Link href="/check" className="btn min-h-11 bg-tomato px-4 text-[14px] text-ink">New check</Link>
            </div>
            {checks?.length ? (
              <ul className="mt-6 grid gap-3">
                {checks.map((c) => {
                  const first = DIMENSIONS.find((d) => d.key === firstPriority(c.scores as Scores));
                  return (
                    <li key={c.id}>
                      <Link href={`/results/${c.id}`} className="flex items-center justify-between gap-4 rounded-2xl border-2 border-ink px-4 py-3 hover:bg-butter">
                        <span className="font-bold">{new Date(c.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</span>
                        <span className="text-[14px] font-medium">Start with {first?.name} · {productBySlug(c.recommended)?.name}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <p className="mt-6 font-medium text-ink-soft">No checks yet. It takes ten minutes.</p>
            )}
          </section>

          <section className="sticker bg-paper p-7">
            <h2 className="h3">Orders</h2>
            {orders?.length ? (
              <ul className="mt-6 grid gap-3">
                {orders.map((o) => (
                  <li key={o.id} className="flex items-center justify-between gap-4 rounded-2xl border-2 border-ink px-4 py-3">
                    <span className="font-bold">{productBySlug(o.product)?.name ?? o.product}</span>
                    <span className="text-[14px] font-medium">
                      {formatPrice(Number(o.amount_minor) / 100, o.currency as Currency)} · {STATUS[o.status] ?? o.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-6 font-medium text-ink-soft">Nothing yet. <Link href="/pricing" className="font-bold underline">See plans</Link></p>
            )}
          </section>

          <section className="sticker bg-paper p-7">
            <h2 className="h3">Your details</h2>
            <form action={updateName} className="mt-6 grid gap-4">
              <label className="grid gap-2">
                <span className="label">Name</span>
                <input name="full_name" className="field" defaultValue={member.full_name ?? ""} />
              </label>
              <p className="text-[14px] text-ink-mute">Signed in as {member.email}</p>
              <button className="btn bg-ink text-paper">Save</button>
              {sp.saved && <p className="font-bold text-moss" role="status">Saved.</p>}
            </form>
          </section>

          <section className="sticker bg-bubble p-7">
            <h2 className="h3">Your data</h2>
            <p className="mt-3 font-medium">Download everything we hold about you, or delete your account for good.</p>
            <a href="/account/export" className="btn mt-6 bg-paper text-ink">Download my data</a>
            <form action={deleteAccount} className="mt-8 grid gap-3 border-t-2 border-ink pt-6">
              <label className="grid gap-2">
                <span className="label">Type DELETE to delete your account</span>
                <input name="confirm" className="field" autoComplete="off" />
              </label>
              {sp.delete === "confirm" && <p className="font-bold" role="alert">Type DELETE exactly to confirm.</p>}
              <button className="btn bg-ink text-paper">Delete my account</button>
            </form>
          </section>
        </Wrap>
      </Block>
    </>
  );
}

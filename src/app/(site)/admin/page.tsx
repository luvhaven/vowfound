import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { createClient, getMember } from "@/lib/supabase/server";
import { productBySlug, formatPrice, type Currency } from "@/lib/products";
import { Block, Wrap } from "@/components/ui/kit";

export const metadata: Metadata = { title: "Admin", robots: { index: false } };

function when(iso: string) {
  return new Date(iso).toLocaleString("en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

/** Reads go through the member's own session; RLS lets staff see these tables
 *  and nobody else. */
export default async function AdminPage() {
  const member = await getMember();
  if (!member) redirect("/sign-in?next=/admin");
  if (member.role !== "admin" && member.role !== "staff") notFound();

  const db = await createClient();
  const [orders, apps, enquiries, checks, members] = await Promise.all([
    db.from("orders").select("*").order("created_at", { ascending: false }).limit(50),
    db.from("applications").select("*").order("created_at", { ascending: false }).limit(50),
    db.from("enquiries").select("*").order("created_at", { ascending: false }).limit(50),
    db.from("readiness_checks").select("id, email, first_name, recommended, created_at").order("created_at", { ascending: false }).limit(50),
    db.from("members").select("id", { count: "exact", head: true }),
  ]);

  const paid = (orders.data ?? []).filter((o) => o.status === "paid");
  const revenue = (c: Currency) => paid.filter((o) => o.currency === c).reduce((s, o) => s + Number(o.amount_minor) / 100, 0);

  const stats = [
    ["Members", members.count ?? 0],
    ["Checks (last 50)", checks.data?.length ?? 0],
    ["Paid orders", paid.length],
    ["Revenue", `${formatPrice(revenue("USD"), "USD")} · ${formatPrice(revenue("NGN"), "NGN")}`],
    ["Applications", apps.data?.length ?? 0],
  ] as const;

  return (
    <>
      <Block field="ink" className="py-12">
        <Wrap>
          <p className="label text-butter">Admin</p>
          <h1 className="h1 mt-3">The desk.</h1>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {stats.map(([k, v]) => (
              <div key={k} className="rounded-[20px] border-2 border-paper/30 p-5">
                <p className="label opacity-60">{k}</p>
                <p className="num mt-2 font-display text-2xl font-extrabold">{v}</p>
              </div>
            ))}
          </div>
        </Wrap>
      </Block>

      <Block field="paper" className="py-12">
        <Wrap className="grid gap-10">
          <Table
            title="Orders"
            head={["When", "Email", "Plan", "Amount", "Status", "Reference"]}
            rows={(orders.data ?? []).map((o) => [when(o.created_at), o.email, productBySlug(o.product)?.name ?? o.product, formatPrice(Number(o.amount_minor) / 100, o.currency), o.status, o.tx_ref])}
          />
          <Table
            title="Private applications"
            head={["When", "Name", "Email", "City", "Timeline", "About"]}
            rows={(apps.data ?? []).map((a) => [when(a.created_at), a.full_name, a.email, a.city ?? "", a.timeline ?? "", a.about])}
          />
          <Table
            title="Enquiries"
            head={["When", "Name", "Email", "Message"]}
            rows={(enquiries.data ?? []).map((e) => [when(e.created_at), e.name, e.email, e.message])}
          />
          <Table
            title="Readiness Checks"
            head={["When", "Name", "Email", "Recommended"]}
            rows={(checks.data ?? []).map((c) => [when(c.created_at), c.first_name ?? "", c.email ?? "—", productBySlug(c.recommended)?.name ?? c.recommended])}
          />
        </Wrap>
      </Block>
    </>
  );
}

function Table({ title, head, rows }: { title: string; head: string[]; rows: string[][] }) {
  return (
    <section>
      <h2 className="h3">{title}</h2>
      <div className="sticker mt-4 overflow-x-auto bg-paper shadow-[4px_4px_0_#1a1410]">
        <table className="w-full min-w-[48rem] text-left text-[14px]">
          <thead>
            <tr className="border-b-2 border-ink">
              {head.map((h) => (
                <th key={h} scope="col" className="label p-4">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.length ? (
              rows.map((r, i) => (
                <tr key={i} className="border-b border-ink/10 align-top last:border-0">
                  {r.map((cell, j) => (
                    <td key={j} className="max-w-md whitespace-pre-wrap p-4 font-medium">{cell}</td>
                  ))}
                </tr>
              ))
            ) : (
              <tr><td colSpan={head.length} className="p-4 text-ink-mute">Nothing yet.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  );
}

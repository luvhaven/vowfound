import { Paper } from "@/components/ui/paper";
import { createClient, getSessionUser } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/admin";
import type { Currency } from "@/lib/products";
import { WorkspaceHeader } from "@/components/ui/workspace-header";
import { CurrencyAmount } from "@/components/ui/currency-amount";

interface Row {
  id: string;
  status: string;
  currency: Currency;
  amount_minor: number;
  paid_at: string | null;
  created_at: string;
}

async function payments(): Promise<Row[]> {
  if (!supabaseConfigured()) return [];
  const user = await getSessionUser();
  if (!user) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("payments")
    .select("id, status, currency, amount_minor, paid_at, created_at")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  return (data ?? []) as Row[];
}

export default async function BillingPage() {
  const rows = await payments();

  return (
    <div className="max-w-4xl">
      <WorkspaceHeader
        eyebrow="Your records"
        title="Billing"
        body="A quiet, complete record of cleared payments. Receipts are sent separately to the email on your account."
        detail={rows.length === 1 ? "1 transaction" : `${rows.length} transactions`}
      />
      <div className="mt-8">
        <Paper className="p-7 md:p-9">
          {rows.length === 0 ? (
            <div className="grid gap-8 md:grid-cols-[5rem_1fr] md:items-start">
              <p className="numeral display text-[3.5rem] leading-none text-stone" aria-hidden>
                00
              </p>
              <div>
                <p className="engraved text-oxblood">No payments recorded</p>
                <p className="mt-3 text-[16px] leading-relaxed text-slate">
                  Payments appear as soon as they clear, and a receipt goes to
                  your email at the same moment.
                </p>
              </div>
            </div>
          ) : (
            <ul className="divide-y divide-stone">
              {rows.map((row) => (
                <li key={row.id} className="flex items-baseline justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div>
                    <p className="numeral engraved text-ink">
                      <CurrencyAmount
                        amount={row.amount_minor / 100}
                        currency={row.currency}
                      />
                    </p>
                    <p className="mt-1 text-[14px] text-slate">
                      {new Date(row.paid_at ?? row.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <p className="engraved text-slate">{row.status}</p>
                </li>
              ))}
            </ul>
          )}
        </Paper>
      </div>
    </div>
  );
}

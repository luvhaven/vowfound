import { AdminTable } from "@/components/admin/table";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/admin";
import { WorkspaceHeader } from "@/components/ui/workspace-header";

interface Row {
  id: string;
  action: string;
  actor_id: string | null;
  subject_table: string | null;
  subject_user_id: string | null;
  created_at: string;
}

export default async function AdminAuditPage() {
  let rows: Row[] = [];

  if (supabaseConfigured()) {
    const supabase = await createClient();
    const { data } = await supabase
      .from("audit_logs")
      .select(
        "id, action, actor_id, subject_table, subject_user_id, created_at",
      )
      .order("created_at", { ascending: false })
      .limit(200);
    rows = (data ?? []).map((r) => ({ ...r, id: String(r.id) })) as Row[];
  }

  return (
    <div>
      <WorkspaceHeader
        eyebrow="Immutable record"
        title="Audit log"
        body="Append only. There is no update policy and no delete policy on this table for anyone, including a super administrator."
        detail={`${rows.length} most recent events`}
      />
      <div className="mt-10">
        <AdminTable
          rows={rows}
          empty="Nothing logged yet."
          columns={[
            { key: "action", header: "Action", render: (r) => r.action },
            {
              key: "actor",
              header: "Actor",
              render: (r) => r.actor_id?.slice(0, 8) ?? "system",
            },
            {
              key: "table",
              header: "Table",
              render: (r) => r.subject_table ?? "—",
            },
            {
              key: "subject",
              header: "Subject",
              render: (r) => r.subject_user_id?.slice(0, 8) ?? "—",
            },
            {
              key: "when",
              header: "When",
              render: (r) => new Date(r.created_at).toLocaleString(),
            },
          ]}
        />
      </div>
    </div>
  );
}

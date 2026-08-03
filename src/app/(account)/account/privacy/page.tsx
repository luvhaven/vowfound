import { PrivacyControls } from "@/components/account/privacy-controls";
import { createClient, getSessionUser } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/admin";
import { WorkspaceHeader } from "@/components/ui/workspace-header";

/** Latest state per consent kind. A withdrawal is a new row, not an edit. */
async function currentConsents(): Promise<Record<string, boolean>> {
  if (!supabaseConfigured()) return {};
  const user = await getSessionUser();
  if (!user) return {};

  const supabase = await createClient();
  const { data } = await supabase
    .from("consent_records")
    .select("kind, granted, granted_at")
    .eq("user_id", user.id)
    .order("granted_at", { ascending: false });

  const latest: Record<string, boolean> = {};
  for (const row of data ?? []) {
    if (!(row.kind in latest)) latest[row.kind] = row.granted;
  }
  return latest;
}

export default async function AccountPrivacyPage() {
  const granted = await currentConsents();

  return (
    <div className="max-w-4xl">
      <WorkspaceHeader
        eyebrow="Your control"
        title="Privacy and your data"
        body="Everything here is self-serve. None of it requires an email, a phone call, or a conversation with someone trying to keep you."
        detail="Four independent permissions"
      />
      <div className="mt-8 max-w-3xl">
        <PrivacyControls granted={granted} />
      </div>
    </div>
  );
}

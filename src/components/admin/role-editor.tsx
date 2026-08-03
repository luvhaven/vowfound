"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { setUserRole } from "@/app/actions/admin";

const ROLES = [
  { value: "member", label: "Member", note: "Buying or enrolled" },
  { value: "coach", label: "Coach", note: "Sees assigned members only" },
  { value: "matchmaker", label: "Matchmaker", note: "Sees assigned members only" },
  { value: "safety_reviewer", label: "Safety reviewer", note: "Verification and reports" },
  { value: "support_agent", label: "Support agent", note: "Tickets" },
  { value: "content_editor", label: "Content editor", note: "Journal and stories" },
  { value: "administrator", label: "Administrator", note: "Runs the business" },
  {
    value: "super_administrator",
    label: "Super administrator",
    note: "Can change roles. Grant sparingly.",
  },
] as const;

export function RoleEditor({
  userId,
  held,
  canEdit,
}: {
  userId: string;
  held: string[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [error, setError] = React.useState<string | null>(null);
  const [busy, setBusy] = React.useState<string | null>(null);

  async function toggle(role: string, grant: boolean) {
    setError(null);
    setBusy(role);
    const result = await setUserRole({ userId, role, grant });
    setBusy(null);
    if (!result.ok) setError(result.error);
    else router.refresh();
  }

  return (
    <div>
      {!canEdit && (
        <p className="mb-5 rounded-[12px] border border-hairline px-4 py-3 text-[14px] text-onink-faint">
          Roles are shown for reference. Only a super administrator can change
          them, and the database enforces that independently of this screen.
        </p>
      )}

      <ul className="divide-y divide-hairline">
        {ROLES.map((role) => {
          const on = held.includes(role.value);
          return (
            <li
              key={role.value}
              className="flex flex-wrap items-center justify-between gap-4 py-3.5 first:pt-0 last:pb-0"
            >
              <div>
                <p className="engraved text-onink">{role.label}</p>
                <p className="mt-1 text-[13px] text-onink-faint">{role.note}</p>
              </div>

              <button
                type="button"
                role="switch"
                aria-checked={on}
                aria-label={`${role.label} role`}
                disabled={!canEdit || busy === role.value}
                onClick={() => toggle(role.value, !on)}
                className={cn(
                  "engraved shrink-0 rounded-[8px] border px-3.5 py-2 transition-colors",
                  on
                    ? "border-sage/50 bg-sage/15 text-onink"
                    : "border-hairline text-onink-faint",
                  canEdit && "hover:border-onink/35 hover:text-onink",
                  (!canEdit || busy === role.value) &&
                    "cursor-not-allowed opacity-55",
                )}
              >
                {busy === role.value ? "Saving" : on ? "Held" : "Not held"}
              </button>
            </li>
          );
        })}
      </ul>

      {error && (
        <p
          role="alert"
          className="mt-5 border-l-2 border-oxblood pl-4 text-[14px] text-rose"
        >
          {error}
        </p>
      )}
    </div>
  );
}

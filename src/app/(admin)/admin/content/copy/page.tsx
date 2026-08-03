import Link from "next/link";
import { WorkspaceHeader } from "@/components/ui/workspace-header";
import { Panel } from "@/components/admin/primitives";
import { ContentField_ } from "@/components/admin/content-editor";
import { CONTENT_GROUPS } from "@/lib/content/registry";
import { getContentMap } from "@/lib/content/read.server";
import { getViewer } from "@/lib/admin.server";

export default async function AdminCopyPage() {
  const [overrides, viewer] = await Promise.all([
    getContentMap(),
    getViewer(),
  ]);

  const canEdit = Boolean(
    viewer?.isAdmin || viewer?.roles.includes("content_editor"),
  );
  const editedCount = CONTENT_GROUPS.flatMap((g) => g.fields).filter((f) =>
    overrides.has(f.key),
  ).length;

  return (
    <div>
      <WorkspaceHeader
        eyebrow="Front-end copy"
        title="Site content"
        body="Every editable line on the public site. Saving publishes immediately, the previous value is kept, and reverting restores exactly what shipped in the code."
        detail={`${editedCount} edited`}
      />

      <div className="mt-8 rounded-[12px] border border-hairline bg-onink/[0.02] px-6 py-5">
        <p className="engraved text-rose">What cannot be edited here</p>
        <p className="mt-3 max-w-3xl text-[14px] leading-relaxed text-onink-dim">
          The guarantee wording is a legal position rather than content, so it
          lives in code and takes no CMS field. Saving also refuses anything
          that promises a marriage, publishes a success rate, invents a member
          count, or manufactures scarcity — with the reason shown, so you can
          tell a rejection from a bug.
        </p>
      </div>

      <div className="mt-10 space-y-8">
        {CONTENT_GROUPS.map((group) => (
          <Panel
            key={group.id}
            title={group.title}
            description={group.description}
            action={
              <Link
                href={group.appearsOn.split(" ")[0]}
                target="_blank"
                rel="noreferrer"
                className="engraved shrink-0 text-onink-faint underline decoration-onink-faint/40 underline-offset-4 hover:text-onink"
              >
                View page
              </Link>
            }
          >
            <div>
              {group.fields.map((field) => (
                <ContentField_
                  key={field.key}
                  field={field}
                  current={overrides.get(field.key) ?? null}
                  canEdit={canEdit}
                />
              ))}
            </div>
          </Panel>
        ))}
      </div>
    </div>
  );
}

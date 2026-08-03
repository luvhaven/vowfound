import { AdminTable } from "@/components/admin/table";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/supabase/admin";
import { WorkspaceHeader } from "@/components/ui/workspace-header";

interface ArticleRow {
  id: string;
  title: string;
  slug: string;
  status: string;
  published_at: string | null;
  is_demo: boolean;
}

interface StoryRow {
  id: string;
  author_first_name: string;
  status: string;
  release_signed_at: string | null;
  is_demo: boolean;
}

export default async function AdminContentPage() {
  let articles: ArticleRow[] = [];
  let stories: StoryRow[] = [];

  if (supabaseConfigured()) {
    const supabase = await createClient();
    const [a, s] = await Promise.all([
      supabase
        .from("articles")
        .select("id, title, slug, status, published_at, is_demo")
        .order("created_at", { ascending: false })
        .limit(100),
      supabase
        .from("testimonials")
        .select("id, author_first_name, status, release_signed_at, is_demo")
        .order("created_at", { ascending: false })
        .limit(100),
    ]);
    articles = (a.data ?? []) as ArticleRow[];
    stories = (s.data ?? []) as StoryRow[];
  }

  return (
    <div>
      <WorkspaceHeader
        eyebrow="Editorial register"
        title="Content"
        body="Publication status, release permissions, and the small body of work the practice is prepared to stand behind."
        detail={`${articles.length + stories.length} records shown`}
      />

      <section className="mt-10">
        <h2 className="engraved text-onink-faint">Journal</h2>
        <div className="mt-6">
          <AdminTable
            rows={articles}
            empty="No articles yet."
            columns={[
              { key: "title", header: "Title", render: (r) => r.title },
              { key: "slug", header: "Slug", render: (r) => r.slug },
              { key: "status", header: "Status", render: (r) => r.status },
              {
                key: "published",
                header: "Published",
                render: (r) =>
                  r.published_at
                    ? new Date(r.published_at).toLocaleDateString()
                    : "—",
              },
            ]}
          />
        </div>
      </section>

      <section className="mt-16">
        <h2 className="engraved text-onink-faint">Stories</h2>
        <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-onink-dim">
          A story cannot be set to published without a signed release on file.
          That is a database constraint, so this screen cannot bypass it and
          neither can anything else.
        </p>
        <div className="mt-6">
          <AdminTable
            rows={stories}
            empty="No stories yet. There are no seeded testimonials, by design."
            columns={[
              {
                key: "author",
                header: "Author",
                render: (r) => r.author_first_name,
              },
              { key: "status", header: "Status", render: (r) => r.status },
              {
                key: "release",
                header: "Release signed",
                render: (r) =>
                  r.release_signed_at
                    ? new Date(r.release_signed_at).toLocaleDateString()
                    : "Not on file",
              },
            ]}
          />
        </div>
      </section>
    </div>
  );
}

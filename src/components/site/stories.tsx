import { createClient, supabaseConfigured } from "@/lib/supabase/server";
import { Block, Eyebrow, Wrap } from "@/components/ui/kit";
import { HUE } from "@/components/art/shapes";

const TILES = ["butter", "bubble", "lilac"] as const;

/**
 * Client words, straight from the database. RLS returns approved rows only,
 * and a row cannot exist without a signed-consent date. With no rows, this
 * renders nothing: the site never fills the gap with invented praise.
 */
export async function Stories() {
  if (!supabaseConfigured()) return null;
  const db = await createClient();
  const { data } = await db.from("stories").select("id, quote, first_name, detail").order("created_at", { ascending: false }).limit(6);
  if (!data?.length) return null;

  return (
    <Block field="paper">
      <Wrap>
        <div className="rise max-w-3xl">
          <Eyebrow className="bg-butter">In their words</Eyebrow>
          <h2 className="h1 mt-6">
            From people who <span className="say font-normal">did it.</span>
          </h2>
        </div>
        <ul className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {data.map((s, i) => (
            <li key={s.id} className="sticker rise p-7" style={{ background: HUE[TILES[i % TILES.length]], rotate: `${i % 2 ? 0.8 : -0.8}deg` }}>
              <blockquote className="text-[19px] font-semibold leading-snug tracking-[-0.01em]">“{s.quote}”</blockquote>
              <p className="label mt-6">
                {s.first_name}
                {s.detail ? ` · ${s.detail}` : ""}
              </p>
            </li>
          ))}
        </ul>
      </Wrap>
    </Block>
  );
}

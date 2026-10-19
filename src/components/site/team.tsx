import Image from "next/image";
import { Block, Eyebrow, Wrap } from "@/components/ui/kit";
import { HUE, Overlap } from "@/components/art/shapes";
import { FOUNDER_NOTE, TEAM } from "@/lib/team";

const TILES = ["tomato", "butter", "cobalt", "bubble", "moss", "lilac"] as const;

/** Renders nothing until real people are listed in src/lib/team.ts. */
export function TeamSection() {
  if (!TEAM.length && !FOUNDER_NOTE) return null;
  return (
    <Block field="paper" id="team" className="scroll-mt-24">
      <Wrap>
        {FOUNDER_NOTE && (
          <figure className="sticker rise mx-auto max-w-4xl bg-butter p-8 md:p-12">
            <blockquote className="h2">“{FOUNDER_NOTE.quote}”</blockquote>
            <figcaption className="label mt-6">— {FOUNDER_NOTE.name}</figcaption>
          </figure>
        )}
        {TEAM.length > 0 && (
          <>
            <div className="rise mt-16 max-w-3xl">
              <Eyebrow className="bg-bubble">Who you&apos;ll work with</Eyebrow>
              <h2 className="h1 mt-6">
                Real people. <span className="say font-normal">Named.</span>
              </h2>
            </div>
            <ul className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {TEAM.map((m, i) => {
                const tile = TILES[i % TILES.length];
                const dark = tile === "cobalt" || tile === "moss";
                return (
                  <li key={m.name} className="sticker rise overflow-hidden bg-paper">
                    <div className="relative aspect-square border-b-2 border-ink" style={{ background: HUE[tile] }}>
                      {m.photo ? (
                        <Image src={m.photo} alt={`${m.name}, ${m.role}`} fill sizes="(max-width: 640px) 100vw, 33vw" className="object-cover" />
                      ) : (
                        <Overlap a="paper" b={dark ? "butter" : "ink"} lens="bubble" className="absolute inset-[18%]" />
                      )}
                    </div>
                    <div className="p-6">
                      <h3 className="h3">{m.name}</h3>
                      <p className="label mt-2 text-ink-mute">{m.role}</p>
                      <p className="mt-4 text-[15px] font-medium leading-relaxed text-ink-soft">{m.bio}</p>
                      {m.credentials && (
                        <ul className="mt-4 flex flex-wrap gap-2">
                          {m.credentials.map((c) => (
                            <li key={c} className="rounded-full border-2 border-ink px-3 py-1 text-[12px] font-bold">{c}</li>
                          ))}
                        </ul>
                      )}
                    </div>
                  </li>
                );
              })}
            </ul>
          </>
        )}
      </Wrap>
    </Block>
  );
}

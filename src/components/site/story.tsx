import { Block, Eyebrow, Tick, Wrap, type Field } from "@/components/ui/kit";
import { HUE, type Hue } from "@/components/art/shapes";

/** A numbered run of chunky cards — the workhorse section for service pages. */
export function CardRun({
  eyebrow,
  title,
  items,
  field = "paper",
}: {
  eyebrow: string;
  title: React.ReactNode;
  items: { title: string; body: string; colour: Hue }[];
  field?: Field;
}) {
  return (
    <Block field={field}>
      <Wrap>
        <div className="rise max-w-3xl">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="h1 mt-6">{title}</h2>
        </div>
        <ol className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const dark = item.colour === "cobalt" || item.colour === "moss" || item.colour === "ink";
            return (
              <li
                key={item.title}
                className="sticker sticker-hover rise p-7 text-ink"
                style={{ background: HUE[item.colour], color: dark ? "#fff6e9" : "#1a1410", rotate: `${i % 2 ? 0.8 : -0.8}deg` }}
              >
                <span className="font-display text-5xl font-extrabold tracking-[-0.05em]">{String(i + 1).padStart(2, "0")}</span>
                <h3 className="h3 mt-6">{item.title}</h3>
                <p className="mt-3 text-[16px] font-medium leading-relaxed opacity-90">{item.body}</p>
              </li>
            );
          })}
        </ol>
      </Wrap>
    </Block>
  );
}

/** Copy on one side, a checklist sticker on the other. */
export function Split({
  field = "paper",
  eyebrow,
  title,
  body,
  listTitle,
  list,
  listColour = "butter",
}: {
  field?: Field;
  eyebrow: string;
  title: React.ReactNode;
  body: string;
  listTitle: string;
  list: readonly string[];
  listColour?: Hue;
}) {
  return (
    <Block field={field}>
      <Wrap className="grid items-center gap-12 lg:grid-cols-2">
        <div className="rise">
          <Eyebrow>{eyebrow}</Eyebrow>
          <h2 className="h1 mt-6">{title}</h2>
          <p className="mt-6 max-w-xl text-[19px] font-medium leading-relaxed opacity-90">{body}</p>
        </div>
        <div className="sticker rise p-8 text-ink" style={{ background: HUE[listColour] }}>
          <p className="h3">{listTitle}</p>
          <ul className="mt-6 grid gap-4">
            {list.map((l) => (
              <li key={l} className="flex gap-3 text-[16px] font-semibold">
                <Tick className="bg-paper" />
                {l}
              </li>
            ))}
          </ul>
        </div>
      </Wrap>
    </Block>
  );
}

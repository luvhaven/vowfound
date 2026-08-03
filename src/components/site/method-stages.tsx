import { resolvedMethod } from "@/lib/content/resolve.server";
import { Reveal } from "@/components/ui/reveal";

export async function MethodStages({ detailed = false }: { detailed?: boolean }) {
  const METHOD = await resolvedMethod();

  return (
    <ol className="mt-16 border-b border-hairline">
      {METHOD.map((stage, index) => (
        <Reveal as="li" key={stage.name} delay={index * 55}>
          <article
            className={
              detailed
                ? "group grid gap-7 border-t border-hairline py-10 md:grid-cols-[7rem_1fr] md:py-14 lg:grid-cols-[9rem_0.72fr_1.28fr] lg:gap-12"
                : "group grid gap-5 border-t border-hairline py-7 md:grid-cols-[6rem_1fr] md:py-8 lg:grid-cols-[6rem_1fr_18rem] lg:items-baseline lg:gap-12"
            }
          >
            <div>
              <p
                className={
                  detailed
                    ? "numeral display text-[3.5rem] leading-none text-onink-faint transition-colors duration-300 group-hover:text-rose"
                    : "numeral display text-[2.25rem] leading-none text-onink-faint transition-colors duration-300 group-hover:text-rose"
                }
              >
                {String(index + 1).padStart(2, "0")}
              </p>
              {detailed && (
                <p className="engraved mt-3 text-onink-faint">
                  Stage {stage.index}
                </p>
              )}
            </div>

            <div>
              <h3 className={detailed ? "display-md text-onink" : "display text-[1.55rem] text-onink"}>
                {stage.name}
              </h3>
              <p className="mt-3 text-[16px] leading-relaxed text-onink-dim">
                {stage.summary}
              </p>
            </div>

            {/* The row earns its height: what you actually leave the stage with. */}
            {!detailed && (
              <p className="text-[14px] leading-relaxed text-onink-faint lg:text-right">
                {stage.outputs[0]}
              </p>
            )}

            {detailed && (
              <div className="md:col-start-2 lg:col-start-auto">
                <p className="measure text-[16px] leading-relaxed text-onink-dim">
                  {stage.body}
                </p>
                <div className="mt-7 border-l border-rose/35 pl-6">
                  <p className="engraved text-rose">What you leave with</p>
                  <ul className="mt-4 grid gap-2.5">
                    {stage.outputs.map((output) => (
                      <li key={output} className="text-[14px] leading-relaxed text-onink-dim">
                        {output}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </article>
        </Reveal>
      ))}
    </ol>
  );
}

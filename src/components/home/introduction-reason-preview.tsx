import { Paper } from "@/components/ui/paper";
import { Reveal } from "@/components/ui/reveal";

/**
 * What an introduction actually looks like when it arrives.
 *
 * The claim "every introduction comes with a written reason" is the main thing
 * separating this from a dating app, and until you can see one it is just a
 * sentence. This is that document, at the size a person would read it.
 *
 * Three deliberate constraints:
 *
 *  - No name, no photograph, no age, no profile. Showing those would make it a
 *    dating profile, which is the exact thing the business says it is not.
 *  - No scores or percentages. The internal weighting is not published, and a
 *    number would invite an argument about the number rather than the reason.
 *  - Marked as an example, everywhere, so it is never mistaken for a real
 *    client. There are no clients yet to draw from.
 */
export function IntroductionReasonPreview() {
  return (
    <Reveal>
      <figure className="relative">
        <Paper className="relative overflow-hidden p-7 md:p-9">
          <div className="flex flex-wrap items-baseline justify-between gap-3">
            <p className="engraved text-oxblood">
              Why this introduction is being proposed
            </p>
            {/* Never subtle about this. It is not a real person. */}
            <p className="engraved rounded-full border border-stone px-3 py-1 text-slate">
              Example only
            </p>
          </div>

          <hr className="hairline-stock mt-6" />

          <dl className="mt-6 space-y-6">
            <div>
              <dt className="engraved text-slate">Shared intentions</dt>
              <dd className="mt-2 text-[16px] leading-relaxed text-ink">
                Both of you have stated marriage within the year, and both have
                said so before meeting rather than after.
              </dd>
            </div>

            <div>
              <dt className="engraved text-slate">Where your requirements meet</dt>
              <dd className="mt-2 text-[16px] leading-relaxed text-ink">
                Your three absolutes are met without qualification. Nothing in
                their situation crosses a line you have drawn.
              </dd>
            </div>

            <div>
              <dt className="engraved text-slate">Family direction</dt>
              <dd className="mt-2 text-[16px] leading-relaxed text-ink">
                You want children; so do they, on a similar timescale. Neither
                of you is undecided, which is what usually surfaces at month
                nine.
              </dd>
            </div>

            <div>
              <dt className="engraved text-slate">
                Worth raising in the first conversation
              </dt>
              <dd className="mt-2 text-[16px] leading-relaxed text-ink">
                They expect to move cities within two years. You said you would
                relocate for the right marriage but have not tested that against
                a specific place. Ask early rather than late.
              </dd>
            </div>
          </dl>

          <hr className="hairline-stock mt-7" />

          <p className="mt-6 text-[14px] leading-relaxed text-slate">
            Names, photographs and contact details are not included here. They
            are exchanged only after both people have accepted.
          </p>
        </Paper>
      </figure>
    </Reveal>
  );
}

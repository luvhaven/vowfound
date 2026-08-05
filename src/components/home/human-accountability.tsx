import { Reveal } from "@/components/ui/reveal";
import { ROLES, PRACTICE_STANCE } from "@/config/business";

/**
 * Trust without publishing anybody's identity.
 *
 * Most matchmaking sites build credibility on a founder's face. This practice
 * deliberately does not, which leaves a gap: a visitor still needs to know a
 * person is answerable for what happens to them.
 *
 * Roles close that gap. A role can be described precisely — what it decides,
 * what it cannot decide — without naming anyone, and it is checkable against
 * how the business actually runs. Every role listed here exists in the
 * database as an assignable position, so this is a description rather than a
 * claim.
 *
 * A rail rather than cards: three cards would read as features, and this is
 * meant to read as a chain of responsibility.
 */
export function HumanAccountability() {
  return (
    <div>
      <Reveal>
        <div className="grid gap-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-end lg:gap-16">
          <h2 className="display-lg text-onink">A person remains accountable.</h2>
          <p className="text-[17px] leading-relaxed text-onink-dim lg:pb-2">
            Software can organise information. It does not decide who you meet.
            A person reviews readiness, considers every proposed introduction,
            and holds the line on consent and safety.
          </p>
        </div>
      </Reveal>

      <ol className="mt-14 border-t border-hairline">
        {ROLES.map((role, index) => (
          <Reveal as="li" key={role.name} delay={index * 70}>
            <div className="grid gap-4 border-b border-hairline py-8 md:grid-cols-[4rem_1fr_1.4fr] md:items-baseline md:gap-10 md:py-9">
              <p className="numeral display text-[1.6rem] leading-none text-onink-faint/60">
                {String(index + 1).padStart(2, "0")}
              </p>
              <h3 className="display text-[1.35rem] text-onink">{role.name}</h3>
              <p className="text-[16px] leading-relaxed text-onink-dim">
                {role.does}
              </p>
            </div>
          </Reveal>
        ))}
      </ol>

      <Reveal>
        {/* Why there are no faces on this page. Said plainly, because the
            absence is otherwise read as something being hidden. */}
        <p className="measure mt-10 text-[15px] leading-relaxed text-onink-faint">
          {PRACTICE_STANCE}
        </p>
      </Reveal>
    </div>
  );
}

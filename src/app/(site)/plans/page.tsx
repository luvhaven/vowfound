import { Container, Section } from "@/components/ui/layout";
import { PageHeader, PageCta } from "@/components/site/page-header";
import { PriceLadder, Tick } from "@/components/site/price-ladder";
import { CurrencySwitch } from "@/components/site/currency-switch";
import { Guarantee } from "@/components/site/guarantee";
import { FaqList } from "@/components/site/faq-list";
import { Reveal } from "@/components/ui/reveal";
import { resolveCurrency, currencyOptions } from "@/lib/currency.server";
import { createPageMetadata } from "@/lib/seo";
import { cn } from "@/lib/utils";

export const metadata = createPageMetadata({
  title: "Plans and fees",
  description:
    "Every VowFound fee, published: the free readiness assessment, the Clarity Audit, Ready in 90, VowFound Match, and Private Concierge.",
  path: "/plans",
});

/* What each tier includes, row by row. A row is a thing a buyer would ask
   about, phrased the way they would ask it. */
const COMPARISON: { label: string; values: [string | boolean, string | boolean, string | boolean, string | boolean] }[] = [
  { label: "Full readiness assessment and written map", values: [true, true, true, true] },
  { label: "Diagnostic call with a coach", values: ["60 minutes", true, true, true] },
  { label: "One-to-one coaching", values: [false, "6 sessions", "6 sessions", "6 sessions"] },
  { label: "Small-cohort group work", values: [false, "12 weeks", "12 weeks", "12 weeks"] },
  { label: "Exercises with written feedback", values: [false, true, true, true] },
  { label: "Verified, private matchmaking profile", values: [false, false, true, true] },
  { label: "Named matchmaker", values: [false, false, "9 months", "A principal"] },
  { label: "Introductions with a written reason", values: [false, false, "Agreed number", "Agreed number"] },
  { label: "Debrief after every meeting", values: [false, false, true, true] },
  { label: "Discreet off-platform outreach", values: [false, false, false, true] },
  { label: "Travel and scheduling handled", values: [false, false, false, true] },
];

const TIERS = ["Clarity Audit", "Ready in 90", "Match", "Concierge"] as const;

const AFTER_PAYMENT = [
  { when: "Within minutes", what: "A receipt, and an invitation to set up your private account." },
  { when: "Next", what: "A member of the team introduces themselves by name and books your first session." },
  { when: "Your first session", what: "Your readiness map, read with you, and the first priority agreed." },
  { when: "Every review point", what: "What changed, what did not, and whether the plan should too." },
];

const MONEY_QUESTIONS = [
  {
    q: "Why are the naira and dollar fees different?",
    a: "They are set separately for each economy rather than converted. Naira fees are available to clients in Nigeria; everyone else pays in dollars.",
  },
  {
    q: "Can I pay by bank transfer?",
    a: "Yes. Larger programmes are often paid by transfer, and a member of the team will confirm it against your account. Write to us before you pay and we will send the details.",
  },
  {
    q: "What if I start small and want more later?",
    a: "Most people should start small. If the Clarity Audit shows you need more, you move up; nobody is asked to buy the largest programme first.",
  },
  {
    q: "What if you do not deliver the introductions you agreed?",
    a: "Then the guarantee applies: complete your milestones and your active search period is extended at no cost until we do.",
  },
];

function Cell({ value, featured }: { value: string | boolean; featured: boolean }) {
  if (value === true) {
    return (
      <span className="inline-flex justify-center">
        <Tick />
        <span className="sr-only">Included</span>
      </span>
    );
  }
  if (value === false) {
    return (
      <span className="text-onink-faint/50" aria-label="Not included">
        —
      </span>
    );
  }
  return <span className={cn("text-[13px]", featured ? "text-onink" : "text-onink-dim")}>{value}</span>;
}

export default async function PlansPage() {
  const [currency, options] = await Promise.all([resolveCurrency(), currencyOptions()]);

  return (
    <>
      <PageHeader
        eyebrow="Plans and fees"
        title="Every fee, in the open."
        standfirst="No sales call to find out what it costs. Begin with the free assessment, and pay only for the smallest step that will actually help."
      >
        {options.length > 1 && <CurrencySwitch current={currency} options={options} />}
      </PageHeader>

      <Section className="pt-10 md:pt-14">
        <Container width="wide">
          <PriceLadder currency={currency} placement="plans" />
        </Container>
      </Section>

      <Section className="border-t border-hairline">
        <Container width="wide">
          <Reveal className="max-w-2xl">
            <p className="engraved text-rose">Side by side</p>
            <h2 className="display-lg mt-6 text-onink">Each level adds responsibility, not decoration.</h2>
          </Reveal>

          <Reveal>
            <div className="mt-12 overflow-x-auto rounded-[24px] border border-hairline">
              <table className="w-full min-w-[44rem] border-collapse text-left">
                <caption className="sr-only">What each plan includes</caption>
                <thead>
                  <tr className="border-b border-hairline">
                    <th scope="col" className="p-5 text-[13px] font-medium text-onink-faint">
                      Included
                    </th>
                    {TIERS.map((tier) => (
                      <th
                        key={tier}
                        scope="col"
                        className={cn(
                          "p-5 text-center font-display text-[1.15rem] font-normal",
                          tier === "Match" ? "bg-oxblood/15 text-onink" : "text-onink-dim",
                        )}
                      >
                        {tier}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {COMPARISON.map((row) => (
                    <tr key={row.label} className="border-b border-hairline last:border-b-0">
                      <th scope="row" className="p-5 text-[14px] font-normal text-onink">
                        {row.label}
                      </th>
                      {row.values.map((value, i) => (
                        <td
                          key={TIERS[i]}
                          className={cn("p-5 text-center", TIERS[i] === "Match" && "bg-oxblood/10")}
                        >
                          <Cell value={value} featured={TIERS[i] === "Match"} />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Reveal>
        </Container>
      </Section>

      <Section className="bg-ink-raised/60">
        <Container width="wide">
          <div className="grid gap-12 lg:grid-cols-[0.8fr_1.2fr] lg:gap-20">
            <Reveal>
              <p className="engraved text-rose">After you pay</p>
              <h2 className="display-lg mt-6 text-onink">A person, by name. Not a queue.</h2>
              <p className="mt-6 max-w-md text-[17px] leading-relaxed text-onink-dim">
                Paying should be the start of being looked after, not the end of
                being sold to.
              </p>
            </Reveal>
            <ol className="relative grid gap-0 border-l border-hairline">
              {AFTER_PAYMENT.map((step, i) => (
                <Reveal as="li" key={step.when} delay={i * 70} className="relative pb-10 pl-8 last:pb-0">
                  <span className="absolute -left-[5px] top-2 size-[9px] rounded-full bg-rose shadow-[0_0_0_5px_rgba(224,122,158,0.15)]" aria-hidden />
                  <p className="engraved text-onink-faint">{step.when}</p>
                  <p className="display mt-3 text-[1.5rem] text-onink">{step.what}</p>
                </Reveal>
              ))}
            </ol>
          </div>
        </Container>
      </Section>

      <Section>
        <Container width="wide">
          <Reveal>
            <Guarantee />
          </Reveal>

          <aside className="mt-10 rounded-[24px] border border-hairline p-7 md:p-10" aria-labelledby="scope-title">
            <h2 id="scope-title" className="display-md text-onink">Before committing to a search</h2>
            <p className="mt-4 max-w-2xl text-onink-dim">Confirm service availability and agree the search scope in writing. A listed fee does not establish that a suitable pool is available for your requirements.</p>
            <dl className="mt-7 grid gap-7 md:grid-cols-2">
              <div><dt className="font-semibold text-onink">Coverage and requirements</dt><dd className="mt-2 text-onink-dim">Your location, acceptable travel or relocation, essential preferences, and the areas the search can realistically cover.</dd></div>
              <div><dt className="font-semibold text-onink">Qualified introductions</dt><dd className="mt-2 text-onink-dim">The agreed count, eligibility criteria, mutual consent process, and what happens when either person declines.</dd></div>
              <div><dt className="font-semibold text-onink">Delivery and timing</dt><dd className="mt-2 text-onink-dim">Your practitioner, start date, sessions, review points, and any pauses or exclusions.</dd></div>
              <div><dt className="font-semibold text-onink">Fees and changes</dt><dd className="mt-2 text-onink-dim">Payment schedule, cancellation terms, third-party costs, and the terms that apply if the agreed work changes.</dd></div>
            </dl>
          </aside>
        </Container>
      </Section>

      <Section className="border-t border-hairline">
        <Container width="wide">
          <div className="grid gap-10 lg:grid-cols-[0.7fr_1.3fr] lg:gap-20">
            <Reveal>
              <p className="engraved text-rose">About money</p>
              <h2 className="display-lg mt-6 text-onink">Straight answers.</h2>
            </Reveal>
            <div className="[&>div]:mt-0">
              <FaqList items={MONEY_QUESTIONS} />
            </div>
          </div>
        </Container>
      </Section>

      <PageCta
        title="Not sure which? That is what the free assessment is for."
        body="Twelve private minutes. One recommended starting point, with the reasoning behind it — and it is often the least expensive one."
      />
    </>
  );
}

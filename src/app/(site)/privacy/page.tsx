import Link from "next/link";
import { Container, Section, SectionIntro } from "@/components/ui/layout";
import { PageHeader, PageCta } from "@/components/site/page-header";
import { Reveal } from "@/components/ui/reveal";
import { Paper } from "@/components/ui/paper";
import { BRAND, PRIVACY_EMAIL } from "@/lib/brand";
import { createPageMetadata } from "@/lib/seo";

export const metadata = createPageMetadata({
  title: "Privacy",
  description:
    "What we hold, who can see it, how long we keep it, and how to remove all of it yourself.",
  path: "/privacy",
});

const WHO_SEES = [
  {
    role: "You",
    body: "Everything you have given us, at any time, exported in a machine-readable file from your account.",
  },
  {
    role: "Your coach",
    body: "Your coach sees your assessment, readiness map, and exercises only while they are assigned to you. Access ends the day the assignment does.",
  },
  {
    role: "Your matchmaker",
    body: "Your requirements, preferences and matchmaking profile, while assigned. They do not see your coaching notes.",
  },
  {
    role: "A safety reviewer",
    body: "Verification evidence and anything attached to a report. Nothing else.",
  },
  {
    role: "Administrators",
    body: "Whatever is necessary to run the business and investigate problems. Every one of those reads is written to an audit log that you can also read.",
  },
  {
    role: "Other members",
    body: "Nothing. There is no directory, no search and no browsing. Another member learns your name only after you have both accepted an introduction.",
  },
];

export default function PrivacyPage() {
  return (
    <>
      <PageHeader
        eyebrow="Privacy"
        title="What we hold, who can see it, and how to take it back."
        standfirst="The formal policy is on the legal page. This one is the plain-language version, and where the two disagree we will fix this page."
      />

      <Section>
        <Container width="wide">
          <Reveal>
            <SectionIntro
              index="ACCESS"
              eyebrow="Who can see what"
              title="Access follows a role, and ends with the assignment."
            />
          </Reveal>
          <div className="mt-14 space-y-px">
            {WHO_SEES.map((item, i) => (
              <Reveal key={item.role} delay={(i % 3) * 50}>
                <div className="grid gap-4 border-t border-hairline py-8 md:grid-cols-[14rem_1fr] md:gap-10">
                  <h2 className="engraved text-onink">{item.role}</h2>
                  <p className="text-[16px] leading-relaxed text-onink-dim">
                    {item.body}
                  </p>
                </div>
              </Reveal>
            ))}
          </div>
        </Container>
      </Section>

      <Section className="bg-ink-deep">
        <Container width="wide">
          <div className="grid gap-8 lg:grid-cols-12 lg:items-start">
            <Reveal className="lg:col-span-7">
              <Paper className="p-8 md:p-10">
                <p className="engraved text-oxblood">Consent architecture</p>
                <h2 className="display-md mt-5 text-ink">Consent, one at a time</h2>
                <p className="mt-5 text-[16px] leading-relaxed text-slate">
                  Photography use, introductions, background checks and
                  marketing are four separate consents. Each is timestamped,
                  each is recorded against a policy version, and each can be
                  withdrawn on its own without affecting the others.
                </p>
                <p className="mt-4 text-[16px] leading-relaxed text-slate">
                  You will never be asked to agree to all four in one checkbox,
                  because that is not consent.
                </p>
              </Paper>
            </Reveal>

            <Reveal delay={80} className="lg:col-span-4 lg:col-start-9 lg:mt-16">
              <article className="border-y border-hairline py-8">
                <p className="engraved text-rose">Leaving cleanly</p>
                <h2 className="display-md mt-5 text-onink">Leaving</h2>
                <p className="mt-5 text-[16px] leading-relaxed text-onink-dim">
                  You can export everything and delete your account from inside
                  your account. It does not require an email, a phone call, or a
                  conversation with someone trying to keep you.
                </p>
                <p className="mt-4 text-[16px] leading-relaxed text-onink-dim">
                  Deletion removes your profile, assessment, answers, map,
                  preferences and files. Anyone you were introduced to loses
                  access at the same moment. Financial records are kept only for
                  as long as the law requires, and nothing else.
                </p>
                <div className="mt-7">
                  <Link
                    href="/account/privacy"
                    className="engraved text-onink underline decoration-onink-faint underline-offset-4"
                  >
                    Export or delete
                  </Link>
                </div>
              </article>
            </Reveal>
          </div>
        </Container>
      </Section>

      <Section>
        <Container width="default">
          <Reveal>
            <Paper className="px-7 py-9 md:px-12">
              <p className="engraved text-slate">Never</p>
              <ul className="mt-6 space-y-3">
                {[
                  `${BRAND} does not sell your data, and does not share it with advertisers.`,
                  "Your private profile is excluded from search engines, sitemaps and link previews.",
                  "No file we hold sits in a public location. Every one is served through a link that expires.",
                  "We do not use your answers to train a model that leaves this business.",
                ].map((line) => (
                  <li key={line} className="flex gap-3 text-[16px] text-ink">
                    <span
                      aria-hidden
                      className="mt-[0.65em] h-px w-4 shrink-0 bg-oxblood"
                    />
                    {line}
                  </li>
                ))}
              </ul>
              <hr className="hairline-stock my-8" />
              <p className="text-[15px] text-slate">
                Questions about any of this go to{" "}
                <a
                  href={`mailto:${PRIVACY_EMAIL}`}
                  className="underline decoration-stone underline-offset-4"
                >
                  {PRIVACY_EMAIL}
                </a>
                , and a person answers them.
              </p>
            </Paper>
          </Reveal>
        </Container>
      </Section>

      <PageCta
        title="You can start without giving us your name."
        body="The assessment asks for contact details at the very end, and not before."
      />
    </>
  );
}

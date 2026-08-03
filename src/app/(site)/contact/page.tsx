import type { Metadata } from "next";
import { Container, Section } from "@/components/ui/layout";
import { PageHeader } from "@/components/site/page-header";
import { Reveal } from "@/components/ui/reveal";
import { Paper } from "@/components/ui/paper";
import { ContactForm } from "@/components/site/contact-form";
import { CONTACT_EMAIL, PRIVACY_EMAIL } from "@/lib/brand";

export const metadata: Metadata = {
  title: "Contact",
  description: "Ask a question. A person reads and answers it.",
};

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="Contact"
        title="Ask the question you actually want to ask."
        standfirst="A person reads these. If your question belongs on the FAQ page, we will answer you and then add it there."
      />

      <Section>
        <Container width="default">
          <div className="grid gap-10 lg:grid-cols-12 lg:items-start">
            <Reveal className="lg:col-span-7">
              <Paper className="p-7 md:p-9">
                <ContactForm />
              </Paper>
            </Reveal>

            <Reveal delay={80} className="lg:col-span-4 lg:col-start-9 lg:mt-14">
              <aside className="border-y border-hairline py-8">
                <p className="engraved text-rose">Direct addresses</p>
                <h2 className="display-md mt-5 text-onink">Or write directly.</h2>
                <ul className="mt-6 space-y-5">
                  <li>
                    <p className="engraved text-onink-faint">General</p>
                    <a
                      href={`mailto:${CONTACT_EMAIL}`}
                      className="mt-1.5 block text-[16px] text-onink underline decoration-onink-faint underline-offset-4"
                    >
                      {CONTACT_EMAIL}
                    </a>
                  </li>
                  <li>
                    <p className="engraved text-onink-faint">Privacy and deletion</p>
                    <a
                      href={`mailto:${PRIVACY_EMAIL}`}
                      className="mt-1.5 block text-[16px] text-onink underline decoration-onink-faint underline-offset-4"
                    >
                      {PRIVACY_EMAIL}
                    </a>
                  </li>
                </ul>
                <hr className="hairline my-7" />
                <p className="text-[15px] leading-relaxed text-onink-dim">
                  If something has gone wrong with another member, do not use
                  this form. Report it from inside your account so it reaches a
                  safety reviewer directly.
                </p>
              </aside>
            </Reveal>
          </div>
        </Container>
      </Section>
    </>
  );
}

import type { Metadata } from "next";
import { Block, PageHero, Wrap } from "@/components/ui/kit";
import { ContactForm } from "@/components/site/forms";
import { Sun } from "@/components/art/shapes";
import { CONTACT_EMAIL } from "@/lib/brand";

export const metadata: Metadata = { title: "Contact", description: "Write to a real person at VowFound." };

export default function ContactPage() {
  return (
    <>
      <PageHero eyebrow="Contact" field="butter" title={<>Write to a <span className="say font-normal">person.</span></>} body="Not a bot, not a ticket queue. Ask anything — including whether we're right for you at all." art={<Sun fill="tomato" />} />
      <Block field="paper">
        <Wrap className="grid gap-12 lg:grid-cols-[0.7fr_1.3fr]">
          <div>
            <p className="label">Or email</p>
            <a href={`mailto:${CONTACT_EMAIL}`} className="h3 mt-3 block break-words underline decoration-2 underline-offset-4 hover:text-tomato">{CONTACT_EMAIL}</a>
          </div>
          <ContactForm />
        </Wrap>
      </Block>
    </>
  );
}

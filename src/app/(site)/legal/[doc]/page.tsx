import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { Block, Wrap } from "@/components/ui/kit";

/* Plain-language drafts. Have them reviewed by a lawyer in each jurisdiction
   you sell into before launch. */
const DOCS: Record<string, { title: string; updated: string; sections: [string, string][] }> = {
  terms: {
    title: "Terms",
    updated: "19 October 2026",
    sections: [
      ["Who we are", "VowFound provides marriage-readiness coaching and curated matchmaking to adults aged 21 and over."],
      ["What we promise", "We promise the work described for each plan. We do not and cannot promise that you will marry, become engaged or form a relationship."],
      ["Introductions", "Introductions are made by a person, require both people to accept, and may be declined at any time without explanation."],
      ["Your conduct", "Be honest, be kind, and never share another member's details. We may end any membership for unsafe or dishonest behaviour."],
      ["Fees", "Fees are shown on the pricing page in your currency and are taken in advance. Refunds follow our refunds policy."],
    ],
  },
  privacy: {
    title: "Privacy",
    updated: "19 October 2026",
    sections: [
      ["What we collect", "What you give us: your answers, contact details, and what you share with your coach and matchmaker. Payments are processed by Flutterwave; we never see your card."],
      ["Who sees it", "Your assigned coach and matchmaker, and staff who need it to run the service. Nothing is public or searchable."],
      ["What we never do", "We never sell your data or use it for advertising."],
      ["Your rights", "Export or delete your data from your account at any time, or email us and we'll do it for you."],
    ],
  },
  refunds: {
    title: "Refunds",
    updated: "19 October 2026",
    sections: [
      ["The Read", "Fully refundable until your coaching call takes place."],
      ["Ready and Matched", "Refundable within 14 days of your start date, minus the value of any sessions already held."],
      ["Private", "Set out in your written agreement before any payment."],
      ["How to ask", "Email hello@vowfound.com with your payment reference. Refunds return to the original payment method."],
    ],
  },
};

export function generateStaticParams() {
  return Object.keys(DOCS).map((doc) => ({ doc }));
}

export async function generateMetadata({ params }: { params: Promise<{ doc: string }> }): Promise<Metadata> {
  const d = DOCS[(await params).doc];
  return { title: d?.title ?? "Legal" };
}

export default async function LegalPage({ params }: { params: Promise<{ doc: string }> }) {
  const d = DOCS[(await params).doc];
  if (!d) notFound();
  return (
    <Block field="paper">
      <Wrap className="max-w-3xl">
        <p className="label">Updated {d.updated}</p>
        <h1 className="h1 mt-4">{d.title}</h1>
        <div className="mt-12 grid gap-10">
          {d.sections.map(([h, body]) => (
            <section key={h}>
              <h2 className="h3">{h}</h2>
              <p className="mt-3 text-[17px] leading-relaxed text-ink-soft">{body}</p>
            </section>
          ))}
        </div>
      </Wrap>
    </Block>
  );
}

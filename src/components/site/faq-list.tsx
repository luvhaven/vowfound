"use client";

import * as Accordion from "@radix-ui/react-accordion";
import { OBJECTIONS } from "@/content/site";

export interface FaqItem {
  q: string;
  a: string;
}

/** Copy is resolved on the server and passed in, so an admin edit reaches
 *  this client component without it needing database access of its own. */
export function FaqList({
  limit,
  items: provided,
}: {
  limit?: number;
  items?: readonly FaqItem[];
}) {
  const source = provided ?? OBJECTIONS;
  const items = limit ? source.slice(0, limit) : source;

  return (
    <Accordion.Root type="single" collapsible className="mt-14 border-b border-hairline">
      {items.map((item, i) => (
        <Accordion.Item
          key={item.q}
          value={`q-${i}`}
          className="group/item border-t border-hairline transition-colors data-[state=open]:bg-onink/[0.025]"
        >
          <Accordion.Header>
            <Accordion.Trigger className="group grid w-full grid-cols-[2.75rem_1fr_auto] items-start gap-4 px-3 py-7 text-left md:grid-cols-[5rem_1fr_auto] md:px-5 md:py-8">
              <span className="numeral engraved mt-1 text-rose">
                {String(i + 1).padStart(2, "0")}
              </span>
              <span className="display text-[1.2rem] leading-snug text-onink md:text-[1.5rem]">
                {item.q}
              </span>
              <span
                aria-hidden
                className="engraved mt-2 shrink-0 text-onink-faint transition-transform duration-300 group-data-[state=open]:rotate-45"
              >
                +
              </span>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="overflow-hidden data-[state=closed]:animate-[accordion-up_240ms_ease-out] data-[state=open]:animate-[accordion-down_320ms_var(--ease-press)]">
            <div className="grid grid-cols-[2.75rem_1fr] gap-4 px-3 pb-8 md:grid-cols-[5rem_1fr] md:px-5 md:pb-10">
              <span />
              <p className="measure max-w-2xl text-onink-dim">{item.a}</p>
            </div>
          </Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}

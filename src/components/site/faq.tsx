"use client";

import * as Accordion from "@radix-ui/react-accordion";

export function Faq({ items }: { items: readonly { q: string; a: string }[] }) {
  return (
    <Accordion.Root type="single" collapsible className="grid gap-3">
      {items.map((item, i) => (
        <Accordion.Item key={item.q} value={`q${i}`} className="sticker overflow-hidden rounded-[22px] bg-paper text-ink shadow-[4px_4px_0_#1a1410]">
          <Accordion.Header>
            <Accordion.Trigger className="group flex w-full items-center justify-between gap-6 px-6 py-5 text-left text-[18px] font-bold tracking-[-0.02em]">
              {item.q}
              <span className="grid size-9 shrink-0 place-items-center rounded-full border-2 border-ink bg-butter transition-transform duration-300 group-data-[state=open]:rotate-45" aria-hidden>
                <svg viewBox="0 0 12 12" className="size-3"><path d="M6 1v10M1 6h10" stroke="#1a1410" strokeWidth="2" strokeLinecap="round" /></svg>
              </span>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content className="px-6 pb-6 text-[16px] leading-relaxed text-ink-soft">{item.a}</Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}

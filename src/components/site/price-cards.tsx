import Link from "next/link";
import { PRODUCTS, formatPrice, priceFor, type Currency } from "@/lib/products";
import { Tick } from "@/components/ui/kit";
import { cn } from "@/lib/utils";

const TONE = {
  butter: "bg-butter text-ink",
  bubble: "bg-bubble text-ink",
  cobalt: "bg-cobalt text-paper",
  tomato: "bg-tomato text-ink",
  moss: "bg-moss text-paper",
} as const;

const TILT = ["-rotate-1", "rotate-1", "-rotate-[0.5deg]", "rotate-[0.8deg]"];

/** Matched is featured because it is the complete thing we do — not because
 *  of any popularity claim, which there is no data to support. */
export function PriceCards({ currency }: { currency: Currency }) {
  return (
    <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      {PRODUCTS.map((p, i) => {
        const price = priceFor(p, currency);
        const weekly = p.weeks && !p.applicationOnly ? Math.round(price / p.weeks) : null;
        const featured = p.slug === "matched";
        const dark = p.colour === "cobalt" || p.colour === "moss";
        return (
          <article
            key={p.slug}
            id={p.slug}
            className={cn("sticker sticker-hover relative flex scroll-mt-28 flex-col p-7", TONE[p.colour], TILT[i], featured && "xl:-translate-y-4")}
          >
            {featured && (
              <span className="label absolute -top-4 right-6 rotate-3 rounded-full border-2 border-ink bg-butter px-3 py-1.5 text-ink">
                The full thing
              </span>
            )}
            <p className="label opacity-75">
              {p.applicationOnly ? "By application" : p.weeks ? `${p.weeks} weeks` : "One sitting"}
            </p>
            <h3 className="h3 mt-3 text-[2.2rem]">{p.name}</h3>
            <p className="mt-3 min-h-[3.25rem] text-[15px] font-medium leading-snug opacity-90">{p.hook}</p>
            <p className="num mt-6 font-display text-[3rem] font-extrabold leading-none tracking-[-0.05em]">
              {p.applicationOnly && <span className="mr-1.5 align-middle text-base font-bold tracking-normal opacity-75">from</span>}
              {formatPrice(price, currency)}
            </p>
            <p className="mt-2 min-h-5 text-[13px] font-semibold opacity-75">
              {weekly ? `About ${formatPrice(weekly, currency)} a week` : p.applicationOnly ? "Twelve months, scope agreed first" : "Paid once"}
            </p>
            <ul className="mt-6 grid flex-1 content-start gap-3 border-t-2 border-current/30 pt-6">
              {p.includes.map((line) => (
                <li key={line} className="flex gap-3 text-[14px] font-medium leading-snug">
                  <Tick />
                  {line}
                </li>
              ))}
            </ul>
            <Link
              href={p.applicationOnly ? "/private#apply" : `/checkout/${p.slug}`}
              className={cn("btn mt-8 w-full", dark ? "bg-paper text-ink" : "bg-ink text-paper")}
            >
              {p.applicationOnly ? "Apply privately" : `Start ${p.name}`}
            </Link>
          </article>
        );
      })}
    </div>
  );
}

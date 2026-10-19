import { formatPrice, type Currency } from "@/lib/products";
import { cn } from "@/lib/utils";

/**
 * A price that always fits its box.
 *
 * Naira figures run to ten characters ("₦6,000,000") where dollars run to
 * four, so a fixed size that suits "$49" overflows a card in naira. The size
 * is derived from the container's width and the figure's length, capped at
 * `max`, so every price is as large as its space allows and never larger.
 * The parent must establish a container (`@container`).
 */
export function Price({
  amount,
  currency,
  from = false,
  max = "3rem",
  className,
}: {
  amount: number;
  currency: Currency;
  from?: boolean;
  max?: string;
  className?: string;
}) {
  const text = formatPrice(amount, currency);
  return (
    <p className={cn("num font-display font-extrabold leading-none tracking-[-0.045em]", className)}>
      {from && <span className="mb-1.5 block text-[13px] font-bold uppercase tracking-[0.08em] opacity-75">From</span>}
      <span
        className="block whitespace-nowrap"
        style={{ fontSize: `min(${max}, calc(165cqi / ${Math.max(text.length, 4)}))` }}
      >
        {text}
      </span>
    </p>
  );
}

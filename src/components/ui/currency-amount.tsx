import { formatPrice, type Currency } from "@/lib/products";

export function CurrencyAmount({
  amount,
  currency,
}: {
  amount: number;
  currency: Currency;
}) {
  const formatted = formatPrice(amount, currency);

  if (currency !== "USD") return <>{formatted}</>;

  return (
    <span className="whitespace-nowrap">
      <span
        className="font-sans text-[0.8em] font-medium leading-none tracking-normal"
      >
        $
      </span>
      <span>{formatted.slice(1)}</span>
    </span>
  );
}

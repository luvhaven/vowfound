"use client";

import * as React from "react";
import Link from "next/link";
import * as Tabs from "@radix-ui/react-tabs";
import { ArrowLeft, ArrowRight } from "@phosphor-icons/react/dist/ssr";
import { Paper } from "@/components/ui/paper";
import { Button } from "@/components/ui/button";
import { Guarantee } from "@/components/site/guarantee";
import { cn } from "@/lib/utils";
import {
  BAND_LABEL,
  BAND_MEANING,
  BANDS,
  dimensionByKey,
  type Band,
} from "@/lib/assessment/dimensions";
import type {
  DimensionResult,
  ReadinessMap,
} from "@/lib/assessment/scoring";
import { productBySlug, priceFor, type Currency } from "@/lib/products";
import { PlanCards } from "@/components/site/plan-cards";
import { VowMark } from "@/components/ui/ornament";
import { CurrencyAmount } from "@/components/ui/currency-amount";

export function ReadinessMapView({
  map,
  currency,
  name,
}: {
  map: ReadinessMap;
  currency: Currency;
  name?: string;
}) {
  const product = productBySlug(map.recommendedProduct);

  return (
    <div className="mx-auto w-full max-w-5xl">
      <header className="grid gap-8 border-b border-hairline pb-10 md:grid-cols-[1fr_auto] md:items-end">
        <div>
          <p className="engraved text-rose">Your private readiness dossier</p>
          <h1 className="display-lg mt-6 max-w-4xl text-onink">
            {name ? `${name}, here is what we see.` : "Here is what we see."}
          </h1>
          <p className="measure mt-6 text-onink-dim">{map.summary}</p>
        </div>
        <div className="flex items-center gap-4 md:flex-col md:items-end">
          <VowMark size={82} />
          <p className="engraved max-w-[13rem] text-onink-faint md:text-right">
            Eight dimensions / no aggregate score
          </p>
        </div>
      </header>

      <ReadinessPatternExplorer dimensions={map.dimensions} />

      {/* --- Strengths and obstacles -------------------------------------- */}
      <Paper className="mt-8 grid overflow-hidden md:grid-cols-2">
        <section className="px-6 py-8 md:px-9 md:py-10">
          <p className="engraved text-sage-ink">What you can lean on</p>
          {map.strengths.length > 0 ? (
            <ul className="mt-5 space-y-2.5">
              {map.strengths.map((s) => (
                <li key={s} className="flex gap-3 text-[16px] text-ink">
                  <span
                    aria-hidden
                    className="mt-[0.65em] h-px w-4 shrink-0 bg-sage"
                  />
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 text-[16px] leading-relaxed text-slate">
              Nothing is sitting in the top band yet. That is common at the
              start and it moves quickly once the first obstacle is named.
            </p>
          )}
        </section>

        <section className="border-t border-stone bg-stock-warm/55 px-6 py-8 md:border-l md:border-t-0 md:px-9 md:py-10">
          <p className="engraved text-oxblood">What is in the way</p>
          {map.obstacles.length > 0 ? (
            <ul className="mt-5 space-y-2.5">
              {map.obstacles.map((s) => (
                <li key={s} className="flex gap-3 text-[16px] text-ink">
                  <span
                    aria-hidden
                    className="mt-[0.65em] h-px w-4 shrink-0 bg-oxblood"
                  />
                  {s}
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-5 text-[16px] leading-relaxed text-slate">
              Nothing is blocking you. What is missing is a filtered pool and
              someone making introductions on purpose.
            </p>
          )}
        </section>
      </Paper>

      {/* --- Recommendation and the two paths ----------------------------- */}
      {product && (
        <Paper className="mt-8 overflow-hidden">
          <div className="grid md:grid-cols-[1.3fr_0.7fr]">
            <div className="px-6 py-9 md:px-10 md:py-12">
              <p className="engraved text-oxblood">Our first recommendation</p>
              <h2 className="display-lg mt-5 max-w-xl text-ink">{product.name}</h2>
              <p className="mt-5 max-w-xl text-[16px] leading-relaxed text-slate">
                {product.summary}
              </p>
              <p className="mt-8 max-w-xl border-l border-oxblood/35 pl-5 text-[14px] leading-relaxed text-slate">
                This is a starting point, not an upsell ladder. Choose the
                consultation instead if you want to challenge the recommendation.
              </p>
            </div>
            <div className="flex flex-col justify-between border-t border-stone bg-stock-warm/65 px-6 py-9 md:border-l md:border-t-0 md:px-8 md:py-12">
              <div>
                <p className="engraved text-slate">Programme fee</p>
                <p className="numeral display-md mt-3 text-ink">
                  <CurrencyAmount
                    amount={priceFor(product, currency)}
                    currency={currency}
                  />
                </p>
              </div>
              <div className="mt-9 grid gap-3">
                <Button asChild size="lg">
                  <Link href={`/checkout/${product.slug}`}>
                    {product.applicationOnly ? "Apply" : "Start now"}
                  </Link>
                </Button>
                <Button asChild variant="onpaper" size="lg">
                  <Link href="/book">Talk it through first</Link>
                </Button>
              </div>
            </div>
          </div>
        </Paper>
      )}

      <div className="mt-6">
        <Guarantee />
      </div>

      {/* --- Everything else ---------------------------------------------- */}
      <div className="mt-20">
        <div className="flex flex-wrap items-end justify-between gap-5 border-b border-hairline pb-7">
          <div>
            <p className="engraved text-rose">The complete practice</p>
            <h2 className="display-md mt-4 text-onink">Every other way in.</h2>
          </div>
          <p className="max-w-sm text-[14px] leading-relaxed text-onink-faint">
            Shown for context. The highlighted recommendation remains the
            smallest useful starting point we found.
          </p>
        </div>
        <PlanCards
          currency={currency}
          showPrices
          recommended={map.recommendedProduct}
        />
      </div>

      <p className="mt-12 text-[14px] leading-relaxed text-onink-faint">
        This map is a reading of what you told us, not a diagnosis and not a
        prediction. Nobody can promise you a marriage, including us.
      </p>
    </div>
  );
}

function BandChip({ band }: { band: Band }) {
  return (
    <span
      className={cn(
        "engraved rounded-[8px] border px-3 py-1.5",
        band === "ready" && "border-sage-ink text-sage-ink",
        band === "workable" && "border-stone text-slate",
        band === "emerging" && "border-stone text-slate",
        band === "not_yet" && "border-oxblood text-oxblood",
      )}
    >
      {BAND_LABEL[band]}
    </span>
  );
}

function ReadinessPatternExplorer({
  dimensions,
}: {
  dimensions: DimensionResult[];
}) {
  const [activeKey, setActiveKey] = React.useState(dimensions[0]?.key ?? "");

  if (dimensions.length === 0) {
    return (
      <Paper className="mt-10 px-6 py-9 md:px-10 md:py-12">
        <p className="engraved text-oxblood">The map</p>
        <h2 className="display-md mt-4 text-ink">This map is incomplete.</h2>
        <p className="mt-5 max-w-xl text-[15px] leading-relaxed text-slate">
          We could not recover the dimension readings from this result. Take
          the assessment again to build a complete map.
        </p>
        <Button asChild className="mt-7">
          <Link href="/assessment">Rebuild my map</Link>
        </Button>
      </Paper>
    );
  }

  const resolvedActiveKey = dimensions.some(
    (dimension) => dimension.key === activeKey,
  )
    ? activeKey
    : dimensions[0].key;

  const bandCounts = dimensions.reduce<Record<Band, number>>(
    (counts, dimension) => {
      counts[dimension.band] += 1;
      return counts;
    },
    { not_yet: 0, emerging: 0, workable: 0, ready: 0 },
  );

  return (
    <Paper className="mt-10 overflow-hidden px-5 py-8 sm:px-6 md:px-10 md:py-12">
      <div className="border-b border-stone pb-8">
        <p className="engraved text-oxblood">The map</p>
        <h2 className="display-md mt-4 text-ink">Your readiness pattern.</h2>
        <p className="mt-4 max-w-2xl text-[14px] leading-relaxed text-slate">
          There is no single score. Choose any dimension to understand the
          reading and the most useful next move.
        </p>
      </div>

      <dl
        aria-label="Readiness pattern by band"
        className="mt-7 grid grid-cols-2 gap-px overflow-hidden rounded-[12px] border border-stone bg-stone sm:grid-cols-4"
      >
        {BANDS.map((band) => (
          <div key={band} className="bg-stock px-4 py-4 sm:px-3 md:px-4">
            <dt className={cn("text-[11px] font-semibold leading-tight", bandTextClass(band))}>
              {BAND_LABEL[band]}
            </dt>
            <dd className="mt-2 flex items-baseline gap-2 text-slate">
              <span className="numeral display text-[1.65rem] leading-none text-ink">
                {bandCounts[band]}
              </span>
              <span className="text-[11px] leading-none">
                {bandCounts[band] === 1 ? "dimension" : "dimensions"}
              </span>
            </dd>
          </div>
        ))}
      </dl>

      <Tabs.Root
        value={resolvedActiveKey}
        onValueChange={setActiveKey}
        orientation="horizontal"
        className="no-print mt-7"
      >
        <div className="grid gap-6 lg:grid-cols-[0.82fr_1.18fr] lg:items-start lg:gap-7">
          <Tabs.List
            aria-label="Readiness dimensions"
            className="grid grid-cols-1 gap-px overflow-hidden rounded-[12px] border border-stone bg-stone min-[360px]:grid-cols-2"
          >
            {dimensions.map((dimension) => (
              <Tabs.Trigger
                key={dimension.key}
                value={dimension.key}
                className="group min-h-[92px] bg-stock px-4 py-4 text-left text-ink transition-[background-color,color] duration-200 hover:bg-stock-warm data-[state=active]:bg-ink data-[state=active]:text-stock sm:min-h-[100px]"
              >
                <span className="display block text-[1.08rem] leading-[1.08]">
                  {dimension.name}
                </span>
                <span
                  className={cn(
                    "mt-3 block text-[10px] font-semibold uppercase leading-tight tracking-[0.08em] group-data-[state=active]:text-rose",
                    bandTextClass(dimension.band),
                  )}
                >
                  {BAND_LABEL[dimension.band]}
                </span>
              </Tabs.Trigger>
            ))}
          </Tabs.List>

          <div>
            {dimensions.map((dimension, index) => (
              <Tabs.Content
                key={dimension.key}
                value={dimension.key}
                className="focus-visible:outline-none"
              >
                <DimensionReading
                  dimension={dimension}
                  previous={dimensions[(index - 1 + dimensions.length) % dimensions.length]}
                  next={dimensions[(index + 1) % dimensions.length]}
                  onPrevious={() =>
                    setActiveKey(
                      dimensions[(index - 1 + dimensions.length) % dimensions.length]
                        .key,
                    )
                  }
                  onNext={() =>
                    setActiveKey(dimensions[(index + 1) % dimensions.length].key)
                  }
                />
              </Tabs.Content>
            ))}
          </div>
        </div>
      </Tabs.Root>

      <ol className="hidden print:block">
        {dimensions.map((dimension) => (
          <li key={dimension.key} className="border-b border-stone py-7 last:border-b-0">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <h3 className="display text-[1.5rem] text-ink">{dimension.name}</h3>
              <BandChip band={dimension.band} />
            </div>
            {dimensionByKey(dimension.key)?.description && (
              <p className="mt-3 text-[14px] leading-relaxed text-slate">
                {dimensionByKey(dimension.key)?.description}
              </p>
            )}
            <p className="mt-5 text-[15px] leading-relaxed text-ink">
              {dimension.note}
            </p>
            {dimension.firstAction && (
              <div className="mt-5 border-l border-oxblood pl-4">
                <p className="engraved text-oxblood">First useful move</p>
                <p className="mt-2 text-[14px] leading-relaxed text-ink">
                  {dimension.firstAction}
                </p>
              </div>
            )}
          </li>
        ))}
      </ol>
    </Paper>
  );
}

function DimensionReading({
  dimension,
  previous,
  next,
  onPrevious,
  onNext,
}: {
  dimension: DimensionResult;
  previous: DimensionResult;
  next: DimensionResult;
  onPrevious: () => void;
  onNext: () => void;
}) {
  const definition = dimensionByKey(dimension.key);

  return (
    <article className="flex min-h-[31rem] flex-col overflow-hidden rounded-[12px] border border-stone bg-stock-warm/45">
      <div className="flex-1">
        <div className="px-5 py-6 sm:px-6 sm:py-7">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <h3 className="display max-w-[20rem] text-[1.75rem] text-ink">
              {dimension.name}
            </h3>
            <BandChip band={dimension.band} />
          </div>

          {definition?.description && (
            <p className="mt-5 text-[14px] leading-relaxed text-slate">
              {definition.description}
            </p>
          )}

          <div className="mt-7 grid gap-2 border-t border-stone pt-5 sm:grid-cols-[9rem_1fr] sm:gap-5">
            <p className="text-[12px] font-semibold text-ink">How this band reads</p>
            <p className="text-[13px] leading-relaxed text-slate">
              {BAND_MEANING[dimension.band]}
            </p>
          </div>
        </div>

        <div className="border-t border-stone bg-stock px-5 py-6 sm:px-6 sm:py-7">
          <p className="engraved text-oxblood">What this means for you</p>
          <p className="mt-5 text-[16px] leading-[1.75] text-ink">
            {dimension.note}
          </p>

          {dimension.firstAction && (
            <div className="mt-7 border-l border-oxblood/55 pl-5">
              <p className="engraved text-oxblood">First useful move</p>
              <p className="mt-3 text-[14px] leading-relaxed text-ink">
                {dimension.firstAction}
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-stone bg-stock px-4 py-4 sm:px-5">
        <button
          type="button"
          onClick={onPrevious}
          aria-label={`Previous dimension: ${previous.name}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-[8px] px-3 text-[13px] font-semibold text-slate transition-colors hover:bg-stock-warm hover:text-ink"
        >
          <ArrowLeft size={17} weight="bold" aria-hidden />
          Previous
        </button>
        <button
          type="button"
          onClick={onNext}
          aria-label={`Next dimension: ${next.name}`}
          className="inline-flex min-h-11 items-center gap-2 rounded-[8px] px-3 text-[13px] font-semibold text-slate transition-colors hover:bg-stock-warm hover:text-ink"
        >
          Next
          <ArrowRight size={17} weight="bold" aria-hidden />
        </button>
      </div>
    </article>
  );
}

function bandTextClass(band: Band) {
  return cn(
    band === "ready" && "text-sage-ink",
    (band === "workable" || band === "emerging") && "text-slate",
    band === "not_yet" && "text-oxblood",
  );
}

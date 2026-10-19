import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { DIMENSIONS, STATEMENTS, bandFor, firstPriority, recommend, score } from "@/lib/readiness";
import { PRODUCTS, allowedCurrencies, formatPrice, toMinor } from "@/lib/products";

function all(value: number) {
  return Object.fromEntries(STATEMENTS.map((s) => [s.id, value]));
}

describe("readiness scoring", () => {
  it("has three statements per dimension", () => {
    for (const d of DIMENSIONS) expect(STATEMENTS.filter((s) => s.dim === d.key)).toHaveLength(3);
  });

  it("scores reversed statements in the opposite direction", () => {
    const best = Object.fromEntries(STATEMENTS.map((s) => [s.id, s.reverse ? 1 : 5]));
    const worst = Object.fromEntries(STATEMENTS.map((s) => [s.id, s.reverse ? 5 : 1]));
    expect(Object.values(score(best)).every((v) => v === 100)).toBe(true);
    expect(Object.values(score(worst)).every((v) => v === 0)).toBe(true);
  });

  it("recommends coaching for real gaps, matchmaking for none, The Read between", () => {
    const worst = Object.fromEntries(STATEMENTS.map((s) => [s.id, s.reverse ? 5 : 1]));
    const best = Object.fromEntries(STATEMENTS.map((s) => [s.id, s.reverse ? 1 : 5]));
    expect(recommend(score(worst))).toBe("ready");
    expect(recommend(score(best))).toBe("matched");
    const mostlyGood = { ...best, c1: 3, c2: 3, c3: 3 };
    expect(recommend(score(mostlyGood))).toBe("the-read");
  });

  it("names the weakest dimension first", () => {
    const answers = { ...all(5), p1: 1, p3: 1, p2: 5 };
    expect(firstPriority(score(answers))).toBe("patterns");
  });

  it("bands at the documented thresholds", () => {
    expect([bandFor(20), bandFor(40), bandFor(60), bandFor(80)]).toEqual(["start", "growing", "solid", "strong"]);
  });
});

describe("products and currency", () => {
  it("only Nigeria may pay in naira", () => {
    expect(allowedCurrencies("NG")).toEqual(["NGN", "USD"]);
    expect(allowedCurrencies("GB")).toEqual(["USD"]);
    expect(allowedCurrencies(null)).toEqual(["USD"]);
  });

  it("every product has a positive price in both currencies", () => {
    for (const p of PRODUCTS) {
      expect(p.price.NGN).toBeGreaterThan(0);
      expect(p.price.USD).toBeGreaterThan(0);
    }
  });

  it("formats and converts to minor units", () => {
    expect(formatPrice(1200, "USD")).toBe("$1,200");
    expect(formatPrice(450000, "NGN")).toBe("₦450,000");
    expect(toMinor(49)).toBe(4900);
  });
});

/* --- Non-negotiables, enforced as tests ------------------------------------ */

const SRC = join(process.cwd(), "src");
function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((f) => {
    const full = join(dir, f);
    return statSync(full).isDirectory() ? walk(full) : /\.(ts|tsx)$/.test(f) ? [full] : [];
  });
}
const files = walk(SRC);

describe("non-negotiables", () => {
  it("never claims to guarantee a marriage", () => {
    const CLAIM = /(guarantee[sd]?|promise)\s+(you\s+)?(a\s+)?(marriage|husband|wife|spouse)|you\s+will\s+(be\s+)?(married|engaged)/gi;
    const DENIAL = /\b(no|not|never|nobody|no one|cannot|can't|anyone who)\b/i;
    const offenders: string[] = [];
    for (const f of files) {
      const text = readFileSync(f, "utf8");
      for (const m of text.matchAll(CLAIM)) {
        const before = text.slice(Math.max(0, (m.index ?? 0) - 60), m.index);
        if (!DENIAL.test(before)) offenders.push(`${f}: ${m[0]}`);
      }
    }
    expect(offenders).toEqual([]);
  });

  it("never exposes a secret to the browser", () => {
    const offenders = files.filter((f) => {
      const text = readFileSync(f, "utf8");
      const usesSecret = /SUPABASE_SECRET_KEY|FLUTTERWAVE_SECRET|RESEND_API_KEY/.test(text);
      const serverOnly = text.includes('import "server-only"') || text.includes('"use server"') || f.includes(join("app", "api"));
      return usesSecret && !serverOnly;
    });
    expect(offenders).toEqual([]);
    expect(files.some((f) => /NEXT_PUBLIC_\w*SECRET/.test(readFileSync(f, "utf8")))).toBe(false);
  });

  it("no client component imports the service-role client", () => {
    const offenders = files.filter((f) => {
      const text = readFileSync(f, "utf8");
      return text.trimStart().startsWith('"use client"') && text.includes("supabase/admin");
    });
    expect(offenders).toEqual([]);
  });

  it("enables RLS on every table the rebuild creates", () => {
    const sql = readFileSync(join(process.cwd(), "supabase", "migrations", "0012_rebuild.sql"), "utf8");
    const created = [...sql.matchAll(/create table if not exists public\.(\w+)/g)].map((m) => m[1]);
    const enabled = new Set([...sql.matchAll(/alter table public\.(\w+)\s+enable row level security/g)].map((m) => m[1]));
    expect(created.length).toBeGreaterThan(0);
    expect(created.filter((t) => !enabled.has(t))).toEqual([]);
  });

  it("never invents popularity: no 'most popular' badge", () => {
    expect(files.filter((f) => /most popular/i.test(readFileSync(f, "utf8")))).toEqual([]);
  });
});

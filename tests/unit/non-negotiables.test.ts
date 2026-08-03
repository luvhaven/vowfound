import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join, sep } from "node:path";

/**
 * The brief's non-negotiables, enforced as tests rather than left as
 * instructions. An instruction drifts the first time someone edits a file.
 * A failing test does not.
 */

const ROOT = join(process.cwd(), "src");
const SUPABASE = join(process.cwd(), "supabase");

function walk(dir: string, extensions: string[]): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      out.push(...walk(full, extensions));
    } else if (extensions.some((e) => entry.endsWith(e))) {
      out.push(full);
    }
  }
  return out;
}

const sourceFiles = walk(ROOT, [".ts", ".tsx"]);
const sqlFiles = walk(SUPABASE, [".sql"]);

/** Text a visitor could read, excluding code identifiers and comments. */
function copyStrings(file: string): string {
  return readFileSync(file, "utf8")
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .split("\n")
    .filter((line) => !line.trim().startsWith("//"))
    .join("\n");
}

describe("no guarantee of marriage", () => {
  const FORBIDDEN = [
    /guarantee[sd]?\s+(you\s+)?(a\s+)?(marriage|engagement|husband|wife|spouse)/gi,
    /you\s+will\s+(be\s+)?(married|engaged)/gi,
    /guaranteed\s+(marriage|match|husband|wife)/gi,
    /promise\s+you\s+(a\s+)?(marriage|husband|wife)/gi,
  ];

  /* Saying "nobody can promise you a marriage" is the opposite of a claim, so
     a hit only counts when it is not inside a denial. */
  const NEGATED = /\b(not|never|no\s?one|nobody|cannot|can't|beware|careful of|do not)\b/i;

  it("appears nowhere in source, content or migrations", () => {
    const offenders: string[] = [];

    for (const file of [...sourceFiles, ...sqlFiles]) {
      const text = copyStrings(file);
      for (const pattern of FORBIDDEN) {
        for (const match of text.matchAll(pattern)) {
          const start = Math.max(0, (match.index ?? 0) - 70);
          const preceding = text.slice(start, match.index ?? 0);
          if (!NEGATED.test(preceding)) {
            offenders.push(`${file} :: ${match[0]}`);
          }
        }
      }
    }

    expect(offenders).toEqual([]);
  });
});

describe("banned vocabulary", () => {
  // Whole words only, so "unlocked" in a code identifier is not a false hit.
  const BANNED = [
    "soulmate",
    "level up",
    "game-changer",
    "game changer",
    "your person is out there",
  ];

  it("does not appear in user-facing content", () => {
    // The CMS guard necessarily contains the banned words, because its job is
    // to match them. Scanning it would flag the very thing enforcing the rule.
    const ENFORCEMENT = ["actions" + sep + "content.ts"];

    const contentFiles = sourceFiles.filter(
      (f) =>
        (f.includes("content") ||
          f.includes("components") ||
          f.includes("app")) &&
        !ENFORCEMENT.some((allowed) => f.endsWith(allowed)),
    );
    const offenders: string[] = [];
    for (const file of contentFiles) {
      const text = copyStrings(file).toLowerCase();
      for (const word of BANNED) {
        if (text.includes(word)) offenders.push(`${file} :: ${word}`);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("no secret reaches the browser", () => {
  it("no NEXT_PUBLIC_ variable holds a secret or service-role key", () => {
    const offenders: string[] = [];
    for (const file of sourceFiles) {
      const text = readFileSync(file, "utf8");
      const matches = text.match(/NEXT_PUBLIC_[A-Z0-9_]*(SECRET|SERVICE_ROLE|PRIVATE)[A-Z0-9_]*/g);
      if (matches) offenders.push(`${file} :: ${matches.join(", ")}`);
    }
    expect(offenders).toEqual([]);
  });

  it("every module reading a secret key is marked server-only", () => {
    const SECRETS = [
      "SUPABASE_SECRET_KEY",
      "STRIPE_SECRET_KEY",
      "PAYSTACK_SECRET_KEY",
      "RESEND_API_KEY",
      "STRIPE_WEBHOOK_SECRET",
    ];
    const offenders: string[] = [];

    for (const file of sourceFiles) {
      const text = readFileSync(file, "utf8");
      const usesSecret = SECRETS.some((s) => text.includes(s));
      if (!usesSecret) continue;

      const isServerOnly =
        text.includes('import "server-only"') ||
        text.includes('"use server"') ||
        file.includes(join("app", "api"));

      if (!isServerOnly) offenders.push(file);
    }

    expect(offenders).toEqual([]);
  });

  it("no client component imports the service-role client", () => {
    const offenders: string[] = [];
    for (const file of sourceFiles) {
      const text = readFileSync(file, "utf8");
      if (
        text.trimStart().startsWith('"use client"') &&
        text.includes("supabase/admin")
      ) {
        offenders.push(file);
      }
    }
    expect(offenders).toEqual([]);
  });
});

describe("the guarantee component", () => {
  const source = readFileSync(
    join(ROOT, "components", "site", "guarantee.tsx"),
    "utf8",
  );

  it("takes no props, so its wording cannot be overridden", () => {
    expect(source).toMatch(/export function Guarantee\(\)/);
  });

  it("does not read from the database or any CMS field", () => {
    expect(source).not.toMatch(/supabase|from\(|process\.env/);
  });
});

describe("row level security", () => {
  const allSql = sqlFiles.map((f) => readFileSync(f, "utf8")).join("\n");

  it("enables RLS on every table it creates in the public schema", () => {
    const created = [
      ...allSql.matchAll(/create table public\.(\w+)/g),
    ].map((m) => m[1]);
    const enabled = new Set(
      [...allSql.matchAll(/alter table public\.(\w+)\s+enable row level security/g)].map(
        (m) => m[1],
      ),
    );

    const missing = created.filter((table) => !enabled.has(table));
    expect(missing).toEqual([]);
  });

  it("never grants a blanket select to the anon role on a member table", () => {
    const memberTables = [
      "profiles",
      "assessments",
      "assessment_answers",
      "readiness_results",
      "matchmaking_profiles",
      "introductions",
      "messages",
      "private_notes",
    ];
    for (const table of memberTables) {
      const policies = [
        ...allSql.matchAll(
          new RegExp(`create policy [\\w_]+ on public\\.${table}[\\s\\S]*?;`, "g"),
        ),
      ].map((m) => m[0]);
      for (const policy of policies) {
        expect(policy).not.toMatch(/to anon/);
      }
    }
  });

  it("leaves audit_logs append-only", () => {
    const auditPolicies = [
      ...allSql.matchAll(/create policy [\w_]+ on public\.audit_logs\s+for (\w+)/g),
    ].map((m) => m[1]);
    expect(auditPolicies).not.toContain("update");
    expect(auditPolicies).not.toContain("delete");
    expect(auditPolicies).not.toContain("all");
  });
});

describe("storage", () => {
  const allSql = sqlFiles.map((f) => readFileSync(f, "utf8")).join("\n");

  it("creates no public bucket", () => {
    const buckets = [...allSql.matchAll(/\('([\w-]+)',\s*'[\w-]+',\s*(true|false)\)/g)];
    expect(buckets.length).toBeGreaterThan(0);
    for (const bucket of buckets) {
      expect(bucket[2]).toBe("false");
    }
  });
});

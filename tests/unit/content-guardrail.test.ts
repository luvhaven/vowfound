import { describe, it, expect } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import {
  ALL_FIELDS,
  CONTENT_GROUPS,
  isEditableKey,
  defaultFor,
} from "@/lib/content/registry";

/**
 * A CMS is the obvious way the ten non-negotiables get quietly undone: the
 * rules are enforced in code, tested here, and then somebody types a promise
 * into an admin field. These tests cover the field list and the guard that
 * sits in front of every save.
 */

const ACTION = readFileSync(
  join(process.cwd(), "src", "app", "actions", "content.ts"),
  "utf8",
);

describe("content registry", () => {
  it("has a unique key and a non-empty default for every field", () => {
    const seen = new Set<string>();
    for (const field of ALL_FIELDS) {
      expect(seen.has(field.key), `duplicate key ${field.key}`).toBe(false);
      seen.add(field.key);
      expect(field.fallback.trim().length, `empty default ${field.key}`)
        .toBeGreaterThan(0);
      expect(defaultFor(field.key)).toBe(field.fallback);
    }
  });

  it("groups every field and names where it appears", () => {
    for (const group of CONTENT_GROUPS) {
      expect(group.fields.length).toBeGreaterThan(0);
      expect(group.appearsOn.startsWith("/")).toBe(true);
    }
  });

  it("refuses keys that are not declared", () => {
    expect(isEditableKey("home.hero.support")).toBe(true);
    expect(isEditableKey("guarantee.text")).toBe(false);
    expect(isEditableKey("../../etc/passwd")).toBe(false);
    expect(isEditableKey("")).toBe(false);
  });

  it("exposes no editable field that states what we guarantee", () => {
    const guaranteeish = ALL_FIELDS.filter(
      (f) =>
        f.key.toLowerCase().includes("guarantee") ||
        f.fallback.toLowerCase().includes("agreed number of qualified"),
    );

    // Such a field may be listed for reference, but never as editable.
    for (const field of guaranteeish) {
      expect(field.locked, `${field.key} must be locked`).toBe(true);
      expect(isEditableKey(field.key)).toBe(false);
    }
  });

  it("locks the four fixed positions taken from the brief", () => {
    for (let i = 0; i < 4; i += 1) {
      expect(isEditableKey(`faq.${i}.q`)).toBe(false);
      expect(isEditableKey(`faq.${i}.a`)).toBe(false);
    }
    expect(isEditableKey("faq.4.a")).toBe(true);
  });
});

describe("the save guard", () => {
  it("checks the submitted value before writing", () => {
    expect(ACTION).toMatch(/violation\(trimmed\)/);
    expect(ACTION).toMatch(/isEditableKey\(key\)/);
  });

  it("covers every claim the brief forbids", () => {
    for (const claim of [
      "guarantee",
      "success",
      "members|clients|couples",
      "places?|spots?",
      "soulmate",
    ]) {
      expect(ACTION, `no rule matching ${claim}`).toMatch(new RegExp(claim));
    }
  });

  it("still allows the disclaimers, which are negations of those claims", () => {
    expect(ACTION).toMatch(/NEGATED/);
    expect(ACTION).toMatch(/\bnot\|never\|no/);
  });

  it("requires an editor or administrator role", () => {
    expect(ACTION).toMatch(/content_editor/);
    expect(ACTION).toMatch(/isAdmin/);
  });

  it("records the change in the audit log", () => {
    expect(ACTION).toMatch(/recordAudit/);
    expect(ACTION).toMatch(/content\.updated/);
  });
});

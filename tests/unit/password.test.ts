import { describe, it, expect } from "vitest";
import {
  checkPassword,
  evaluatePassword,
  PASSWORD_RULES,
  MIN_LENGTH,
} from "@/lib/auth/password";

describe("password policy", () => {
  it("requires length, a case of each, a number and a symbol", () => {
    expect(checkPassword("short1!A").ok).toBe(false);
    expect(checkPassword("alllowercase1!").ok).toBe(false);
    expect(checkPassword("ALLUPPERCASE1!").ok).toBe(false);
    expect(checkPassword("NoNumbersHere!").ok).toBe(false);
    expect(checkPassword("NoSymbolsHere1").ok).toBe(false);
  });

  it("accepts a strong passphrase", () => {
    const result = checkPassword("Quiet-Harbour-79-Lantern");
    expect(result.ok).toBe(true);
    expect(result.score).toBeGreaterThanOrEqual(3);
  });

  it("rejects long-but-guessable passwords", () => {
    // Long enough, every character class present, still trivial.
    expect(checkPassword("Password1234!x").ok).toBe(false);
    expect(checkPassword("Abcdefghij1!").ok).toBe(false);
    expect(checkPassword("Qwertyuiop1!").ok).toBe(false);
    expect(checkPassword("Vowfound2024!").ok).toBe(false);
  });

  it("rejects long runs of one character", () => {
    expect(checkPassword("Aaaaa-Harbour-79").ok).toBe(false);
  });

  it("reports every problem at once, not one at a time", () => {
    const { problems } = checkPassword("abc");
    expect(problems.length).toBeGreaterThan(2);
  });

  it("states the minimum length it actually enforces", () => {
    const short = "Aa1!".padEnd(MIN_LENGTH - 1, "x");
    expect(checkPassword(short).ok).toBe(false);
  });

  it("never throws on odd input", () => {
    expect(() => checkPassword("")).not.toThrow();
    expect(() => checkPassword(" ".repeat(300))).not.toThrow();
    expect(() => checkPassword("🙂🙂🙂🙂🙂🙂🙂🙂🙂🙂🙂🙂")).not.toThrow();
  });
});

describe("the rule checklist", () => {
  it("shows every rule as unanswered before anything is typed", () => {
    const { rules, ok } = evaluatePassword("");
    expect(ok).toBe(false);
    expect(rules.length).toBeGreaterThanOrEqual(8);
    for (const rule of rules) {
      expect(rule.met, `${rule.id} should be null when empty`).toBeNull();
    }
  });

  it("marks each rule met or unmet once typing starts", () => {
    const { rules } = evaluatePassword("abc");
    const byId = Object.fromEntries(rules.map((r) => [r.id, r.met]));
    expect(byId.lower).toBe(true);
    expect(byId.upper).toBe(false);
    expect(byId.number).toBe(false);
    expect(byId.symbol).toBe(false);
    expect(byId.length).toBe(false);
  });

  it("marks every rule met for a password that passes", () => {
    const { rules, ok } = evaluatePassword("Quiet-Harbour-79-Lantern");
    expect(ok).toBe(true);
    for (const rule of rules) {
      expect(rule.met, `${rule.id} should be met`).toBe(true);
    }
  });

  it("phrases labels as requirements and failures as instructions", () => {
    for (const rule of PASSWORD_RULES) {
      expect(rule.label.length).toBeGreaterThan(0);
      expect(rule.failure.length).toBeGreaterThan(0);
      // A label is shown before typing, so it must not read as an error.
      expect(rule.label).not.toMatch(/^(avoid|include|use|remove)/i);
    }
  });

  it("keeps the checklist and the submitted-value check in agreement", () => {
    for (const candidate of [
      "",
      "abc",
      "Password1234!x",
      "Quiet-Harbour-79-Lantern",
      "Aaaaa-Harbour-79",
    ]) {
      const evaluated = evaluatePassword(candidate);
      const checked = checkPassword(candidate);
      expect(evaluated.ok).toBe(checked.ok);
      // One failing rule produces exactly one problem.
      const unmet = evaluated.rules.filter((r) => r.met === false).length;
      if (candidate.length > 0) {
        expect(checked.problems.length).toBe(unmet);
      }
    }
  });
});

describe("rule regexes mean what they say", () => {
  it("the double-space rule matches whitespace, not the letter s", () => {
    // A lost backslash once turned /\s{2,}/ into /s{2,}/, which quietly
    // rejected every password containing "ss".
    expect(checkPassword("Harbour-Mississippi-79").ok).toBe(true);
    expect(checkPassword("Harbour  Lantern-79!").ok).toBe(false);
  });

  it("the repeat rule counts the same character, not any character", () => {
    expect(checkPassword("Harbour-Lantern-79!").ok).toBe(true);
    expect(checkPassword("Harbouuuur-Lantern-79!").ok).toBe(false);
  });
});

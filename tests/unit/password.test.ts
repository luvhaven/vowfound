import { describe, it, expect } from "vitest";
import { checkPassword, MIN_LENGTH } from "@/lib/auth/password";

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

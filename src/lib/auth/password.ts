import { z } from "zod";

/**
 * One password policy, used by sign-up, reset and change alike. Anything that
 * accepts a password imports from here, so the rules cannot drift apart
 * between three forms.
 *
 * The shape follows current guidance rather than the older "one of each
 * class, changed every 90 days" habit: length carries most of the strength,
 * and the checks below exist to catch the passwords that are long but still
 * trivially guessable.
 */

export const MIN_LENGTH = 12;
export const MAX_LENGTH = 200;

/** Sequences a cracker tries first. Checked in both directions. */
const SEQUENCES = [
  "abcdefghijklmnopqrstuvwxyz",
  "0123456789",
  "qwertyuiop",
  "asdfghjkl",
  "zxcvbnm",
];

/** Substrings that make a password guessable regardless of its length. */
const BANNED_SUBSTRINGS = [
  "password",
  "passw0rd",
  "vowfound",
  "letmein",
  "welcome",
  "admin",
  "qwerty",
  "iloveyou",
  "marriage",
];

export interface PasswordCheck {
  ok: boolean;
  problems: string[];
  /** 0–4, for the strength meter. Not a security guarantee. */
  score: number;
}

function hasRun(value: string, minRun: number): boolean {
  const lower = value.toLowerCase();
  for (const sequence of SEQUENCES) {
    const reversed = [...sequence].reverse().join("");
    for (const source of [sequence, reversed]) {
      for (let i = 0; i + minRun <= source.length; i += 1) {
        if (lower.includes(source.slice(i, i + minRun))) return true;
      }
    }
  }
  return false;
}

function hasRepeat(value: string, minRepeat: number): boolean {
  return new RegExp(`(.)\\1{${minRepeat - 1},}`).test(value);
}

export function checkPassword(value: string): PasswordCheck {
  const problems: string[] = [];

  if (value.length < MIN_LENGTH) {
    problems.push(`Use at least ${MIN_LENGTH} characters.`);
  }
  if (value.length > MAX_LENGTH) {
    problems.push("That is longer than we can store.");
  }
  if (!/[a-z]/.test(value)) problems.push("Include a lowercase letter.");
  if (!/[A-Z]/.test(value)) problems.push("Include a capital letter.");
  if (!/[0-9]/.test(value)) problems.push("Include a number.");
  if (!/[^A-Za-z0-9]/.test(value)) {
    problems.push("Include a symbol, such as ! ? & or -.");
  }
  if (/\s{2,}/.test(value)) problems.push("Remove the double spaces.");

  const lower = value.toLowerCase();
  if (BANNED_SUBSTRINGS.some((word) => lower.includes(word))) {
    problems.push("Avoid words a stranger could guess from this site.");
  }
  if (hasRun(value, 5)) {
    problems.push(
      "Avoid runs like 12345 or abcde — they are the first thing tried.",
    );
  }
  if (hasRepeat(value, 4)) {
    problems.push("Avoid four or more of the same character in a row.");
  }

  // Rough strength signal for the meter only.
  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) =>
    r.test(value),
  ).length;
  const lengthPoints = value.length >= 20 ? 2 : value.length >= 14 ? 1 : 0;
  const score = problems.length > 0 ? Math.min(1, classes) : Math.min(4, 2 + lengthPoints);

  return { ok: problems.length === 0, problems, score };
}

export const SCORE_LABEL = [
  "Too weak",
  "Weak",
  "Acceptable",
  "Strong",
  "Very strong",
] as const;

/** Zod field for any form that takes a new password. */
export const passwordField = z
  .string()
  .min(1, "Choose a password.")
  .superRefine((value, ctx) => {
    for (const problem of checkPassword(value).problems) {
      ctx.addIssue({ code: "custom", message: problem });
    }
  });

export const PASSWORD_HINT =
  "At least 12 characters, with a capital, a number and a symbol. A short phrase you will remember beats a short scramble you will not.";

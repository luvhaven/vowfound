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

/**
 * The policy as a list of named rules rather than a bag of error strings.
 *
 * Stating every requirement up front and ticking each one off as it is met is
 * the difference between a form that helps and a form that scolds: nobody has
 * to guess what is still missing, or submit twice to find the next rule.
 *
 * `label` is the requirement phrased positively, because it is shown before
 * the person has typed anything. `failure` is what to say when it is not met.
 */
export interface PasswordRule {
  id: string;
  label: string;
  failure: string;
  test: (value: string) => boolean;
}

export const PASSWORD_RULES: readonly PasswordRule[] = [
  {
    id: "length",
    label: `At least ${MIN_LENGTH} characters`,
    failure: `Use at least ${MIN_LENGTH} characters.`,
    test: (v) => v.length >= MIN_LENGTH && v.length <= MAX_LENGTH,
  },
  {
    id: "lower",
    label: "A lowercase letter",
    failure: "Include a lowercase letter.",
    test: (v) => /[a-z]/.test(v),
  },
  {
    id: "upper",
    label: "A capital letter",
    failure: "Include a capital letter.",
    test: (v) => /[A-Z]/.test(v),
  },
  {
    id: "number",
    label: "A number",
    failure: "Include a number.",
    test: (v) => /[0-9]/.test(v),
  },
  {
    id: "symbol",
    label: "A symbol, such as ! ? & or -",
    failure: "Include a symbol, such as ! ? & or -.",
    test: (v) => /[^A-Za-z0-9]/.test(v),
  },
  {
    id: "no-run",
    label: "No run like 12345 or abcde",
    failure: "Avoid runs like 12345 or abcde — they are the first thing tried.",
    test: (v) => !hasRun(v, 5),
  },
  {
    id: "no-repeat",
    label: "No character four times over",
    failure: "Avoid four or more of the same character in a row.",
    test: (v) => !hasRepeat(v, 4),
  },
  {
    id: "not-guessable",
    label: "Nothing guessable from this site",
    failure: "Avoid words a stranger could guess from this site.",
    test: (v) => {
      const lower = v.toLowerCase();
      return !BANNED_SUBSTRINGS.some((word) => lower.includes(word));
    },
  },
  {
    id: "no-double-space",
    label: "No double spaces",
    failure: "Remove the double spaces.",
    test: (v) => !/\s{2,}/.test(v),
  },
];

export interface RuleResult {
  id: string;
  label: string;
  /** null before anything is typed, so the list reads as a checklist rather
   *  than as nine failures. */
  met: boolean | null;
}

export function evaluatePassword(value: string): {
  rules: RuleResult[];
  ok: boolean;
  problems: string[];
  score: number;
} {
  const empty = value.length === 0;

  const rules = PASSWORD_RULES.map((rule) => ({
    id: rule.id,
    label: rule.label,
    met: empty ? null : rule.test(value),
  }));

  const problems = PASSWORD_RULES.filter((rule) => !rule.test(value)).map(
    (rule) => rule.failure,
  );
  const ok = !empty && problems.length === 0;

  // Rough strength signal for the meter only.
  const classes = [/[a-z]/, /[A-Z]/, /[0-9]/, /[^A-Za-z0-9]/].filter((r) =>
    r.test(value),
  ).length;
  const lengthPoints = value.length >= 20 ? 2 : value.length >= 14 ? 1 : 0;
  const score = ok ? Math.min(4, 2 + lengthPoints) : Math.min(1, classes);

  return { rules, ok, problems, score };
}

export function checkPassword(value: string): PasswordCheck {
  const { ok, problems, score } = evaluatePassword(value);
  return { ok, problems, score };
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

/** Advice, not rules — the rules are the checklist beneath the field. */
export const PASSWORD_HINT =
  "A short phrase you will remember beats a short scramble you will not.";

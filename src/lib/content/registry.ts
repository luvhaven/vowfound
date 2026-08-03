import { HERO, REFRAME, RECOGNITION, METHOD, OBJECTIONS } from "@/content/site";

/**
 * Everything an editor may change, declared once.
 *
 * A key here is a contract: the code asks for it, the admin lists it, and the
 * default below is what ships when nobody has touched it. Adding a new
 * editable string means adding one entry — the admin screen, the fallback and
 * the validation all follow from this list.
 *
 * The guarantee wording is deliberately absent. It is a legal position, not
 * content, and lives hard-coded in components/site/guarantee.tsx.
 */

export type FieldKind = "line" | "paragraph";

export interface ContentField {
  key: string;
  label: string;
  help?: string;
  kind: FieldKind;
  fallback: string;
  /**
   * Shown in the admin but not editable. Reserved for the positions the
   * business is committed to — the four objections taken verbatim from the
   * brief — so a wording change there has to be a code change and a review,
   * not a form submission.
   */
  locked?: boolean;
}

export interface ContentGroup {
  id: string;
  title: string;
  description: string;
  /** Where on the public site this appears, for the editor's benefit. */
  appearsOn: string;
  fields: ContentField[];
}

export const CONTENT_GROUPS: ContentGroup[] = [
  {
    id: "hero",
    title: "Home — hero",
    description:
      "The first screen. Three lines doing three jobs: who we are, how this works, what we do.",
    appearsOn: "/",
    fields: [
      {
        key: "home.hero.eyebrow",
        label: "Eyebrow",
        kind: "line",
        fallback: HERO.eyebrow,
      },
      {
        key: "home.hero.title.line1",
        label: "Headline, first line",
        kind: "line",
        fallback: "Get married",
      },
      {
        key: "home.hero.title.line2",
        label: "Headline, second line",
        kind: "line",
        fallback: "on purpose.",
      },
      {
        key: "home.hero.support",
        label: "Supporting sentence",
        help: "Says what we actually do. The photograph already carries the warmth.",
        kind: "paragraph",
        fallback:
          "We find what has been getting in the way, help you change it, and introduce you to people who want the same thing.",
      },
      {
        key: "home.hero.cta",
        label: "Primary button",
        kind: "line",
        fallback: "Begin your plan",
      },
      {
        key: "home.hero.reassurance",
        label: "Cost of entry",
        help: "Sits under the button, where the decision is made.",
        kind: "line",
        fallback: "Free · Twelve minutes · No payment to begin",
      },
    ],
  },
  {
    id: "begin",
    title: "Home — timeline card",
    description: "The section the hero button leads into.",
    appearsOn: "/#begin",
    fields: [
      {
        key: "home.begin.title",
        label: "Heading",
        kind: "line",
        fallback: "Give your future a date.",
      },
      {
        key: "home.begin.body",
        label: "Body",
        kind: "paragraph",
        fallback:
          "Choose the season you hope to be married. We will work backward from it with honesty.",
      },
      {
        key: "home.begin.note",
        label: "Note beneath",
        kind: "paragraph",
        fallback:
          "This is not a countdown or a promise. It gives the work a real horizon.",
      },
    ],
  },
  {
    id: "recognition",
    title: "Home — recognition",
    description:
      "The situations clients arrive in. These work by naming the problem, not by resolving it — the solution comes later on the page.",
    appearsOn: "/#recognition",
    fields: [
      {
        key: "home.recognition.title",
        label: "Heading",
        kind: "line",
        fallback: "You do not need more attention. You need a better pattern.",
      },
      {
        key: "home.recognition.standfirst",
        label: "Standfirst",
        kind: "paragraph",
        fallback:
          "We start with the part dating apps cannot see: what keeps repeating, and what a good marriage will ask of you.",
      },
      ...RECOGNITION.slice(0, 4).flatMap((item, i) => [
        {
          key: `home.recognition.${i}.title`,
          label: `Card ${i + 1} — title`,
          kind: "line" as const,
          fallback: item.title,
        },
        {
          key: `home.recognition.${i}.body`,
          label: `Card ${i + 1} — body`,
          kind: "paragraph" as const,
          fallback: item.body,
        },
      ]),
    ],
  },
  {
    id: "reframe",
    title: "Home — the reframe",
    description:
      "The clearest statement of why this is not a dating app. Placed where recognition has just done its work.",
    appearsOn: "/",
    fields: [
      {
        key: "home.reframe.heading",
        label: "Heading",
        kind: "line",
        fallback: REFRAME.heading,
      },
      {
        key: "home.reframe.body",
        label: "Body",
        kind: "paragraph",
        fallback: REFRAME.body,
      },
    ],
  },
  {
    id: "method",
    title: "The method",
    description:
      "Five stages, in order. The order is the argument, so renaming a stage changes the pitch.",
    appearsOn: "/ and /method",
    fields: METHOD.flatMap((stage, i) => [
      {
        key: `method.${i}.name`,
        label: `Stage ${i + 1} — name`,
        kind: "line" as const,
        fallback: stage.name,
      },
      {
        key: `method.${i}.summary`,
        label: `Stage ${i + 1} — summary`,
        kind: "line" as const,
        fallback: stage.summary,
      },
    ]),
  },
  {
    id: "faq",
    title: "Questions",
    description:
      "Four of these are fixed positions from the brief. Changing an answer changes what the business is promising, so read twice.",
    appearsOn: "/faq and /",
    // The first four are fixed positions from the brief, including the one
    // that states what we do and do not guarantee.
    fields: OBJECTIONS.flatMap((item, i) => [
      {
        key: `faq.${i}.q`,
        label: `Question ${i + 1}`,
        kind: "line" as const,
        fallback: item.q,
        locked: i < 4,
      },
      {
        key: `faq.${i}.a`,
        label: `Answer ${i + 1}`,
        kind: "paragraph" as const,
        fallback: item.a,
        locked: i < 4,
      },
    ]),
  },
  {
    id: "closing",
    title: "Home — closing",
    description: "The final ask, after every objection has been handled.",
    appearsOn: "/",
    fields: [
      {
        key: "home.closing.title",
        label: "Heading",
        kind: "line",
        fallback: "Let marriage become more than a someday.",
      },
      {
        key: "home.closing.body",
        label: "Body",
        kind: "paragraph",
        fallback:
          "Begin with twelve private minutes. Leave with a clear reading of what comes next.",
      },
    ],
  },
];

export const ALL_FIELDS: ContentField[] = CONTENT_GROUPS.flatMap(
  (g) => g.fields,
);

const BY_KEY = new Map(ALL_FIELDS.map((f) => [f.key, f]));

export function fieldFor(key: string): ContentField | undefined {
  return BY_KEY.get(key);
}

export function isEditableKey(key: string): boolean {
  const field = BY_KEY.get(key);
  return Boolean(field) && !field!.locked;
}

/** Defaults, for a fresh database and for the "revert" action. */
export function defaultFor(key: string): string {
  return BY_KEY.get(key)?.fallback ?? "";
}

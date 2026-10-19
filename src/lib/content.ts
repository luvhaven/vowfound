/* Site copy in one place so the voice stays consistent.
   Voice: warm, direct, a little funny, never cute about serious things.
   Rules: no guarantees of marriage, no invented testimonials or numbers,
   no "soulmate", no exclamation marks. */

export const STEPS = [
  {
    n: "01",
    title: "Take the check",
    body: "Ten minutes, eighteen honest statements, six dimensions. Free, private, instant results.",
    colour: "tomato",
  },
  {
    n: "02",
    title: "Get ready",
    body: "A coach works on the thing your results flagged — the pattern, the story, the standards — before you meet anyone.",
    colour: "butter",
  },
  {
    n: "03",
    title: "Get introduced",
    body: "A matchmaker hand-picks people who want marriage too, and writes you the reason for every introduction.",
    colour: "cobalt",
  },
  {
    n: "04",
    title: "Decide well",
    body: "A debrief after every date, so you can tell a real red flag from an old reflex.",
    colour: "bubble",
  },
] as const;

export const NOT_AN_APP = [
  ["Endless swiping", "A few people, picked by a human"],
  ["Anyone can see you", "Nobody can browse you. Ever."],
  ["Match on photos", "Match on values, timing and intent"],
  ["You're on your own", "A coach and a matchmaker in your corner"],
  ["Ghosting", "A debrief after every date"],
  ["Free, so you're the product", "Clear fees. Your data is yours."],
] as const;

export const PROMISES = [
  { title: "Human-picked", body: "No algorithm introduces anyone. A matchmaker reads every profile and makes the call." },
  { title: "Double opt-in", body: "Names and photos stay private until you both say yes to the introduction." },
  { title: "Verified", body: "Everyone in matchmaking is ID-checked and interviewed before they meet anyone." },
  { title: "Yours to delete", body: "Export or delete everything from your account, any time, without asking." },
] as const;

export const FAQ = [
  {
    q: "Is this a dating app?",
    a: "No. There's no feed, no swiping and no public profile. You're introduced to a small number of people, picked by a person, each with a written reason.",
  },
  {
    q: "Can you guarantee I'll get married?",
    a: "No — and be careful of anyone who says they can. What we guarantee is the work: if you're on Matched and we haven't made your agreed introductions, we extend your search at no cost until we do.",
  },
  {
    q: "Who is this for?",
    a: "Adults who want marriage, not just dating: professionals, people who are divorced, single parents, people over 40, people who've tried everything else. If you're serious, you're who it's for.",
  },
  {
    q: "Why coaching before matchmaking?",
    a: "Because the best introduction in the world won't survive a pattern nobody has named. Fix the thing first and every introduction after it works harder.",
  },
  {
    q: "Will anyone I know find out?",
    a: "Not from us. There's no directory and nothing is searchable. Someone only learns your name after you've both accepted an introduction.",
  },
  {
    q: "Why are naira and dollar prices different?",
    a: "They're set for each economy rather than converted. Naira prices are for clients in Nigeria; everyone else pays in dollars.",
  },
  {
    q: "What if I'm not sure which plan?",
    a: "Take the free check. It recommends the smallest useful next step — often The Read, at $49 — and you can move up only if it helps.",
  },
  {
    q: "Can I get a refund?",
    a: "The Read is refundable until your call happens. Programmes are refundable within 14 days of starting, minus any sessions already held. Full terms are on the refunds page.",
  },
] as const;

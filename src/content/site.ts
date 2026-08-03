/* Site copy lives here so voice stays consistent and reviewable in one file.
   Banned throughout: journey, soulmate, unlock, transform, your person is out
   there, level up, game-changer, exclamation marks, emoji, hearts.
   Register: short declaratives, second person, sentence case. */

export const HERO = {
  eyebrow: "A private practice",
  question: "When do you want to be married?",
  support:
    "Tell us the future you want. We'll help you understand what has been getting in the way, become ready for it, and meet people who share the intention.",
  cta: "Begin your plan",
} as const;

export const REFRAME = {
  heading: "You are not unlucky. You are unadvised.",
  body: "Nobody has sat you down and told you the truth about how you come across, who you keep attracting, and why the last one didn't work. Your friends are too kind. Your family is too invested. The internet is too loud.",
} as const;

/* The situations clients actually arrive in. Specific, or they are worthless. */
export const RECOGNITION = [
  {
    title: "You keep meeting the same person in different bodies.",
    body: "Different name, different city, the same three months and the same ending. You have noticed. You have not been able to name it.",
  },
  {
    title: "You are respected at work and unreadable in private.",
    body: "The composure that makes you good at your job reads as distance across a table. Nobody close to you is willing to tell you that.",
  },
  {
    title: "The last one was serious and it still ended.",
    body: "You did nothing obviously wrong. Something quieter went wrong, and it has never been named for you. Until it is, you will meet it again.",
  },
  {
    title: "You are ready. The people around you are not.",
    body: "This is not a standards problem, whatever you have been told. You are choosing from a group that was never filtered for intent.",
  },
  {
    title: "You have started saying you are fine with it.",
    body: "You are not, particularly. You are tired of the conversation, and of the face people make when you have it.",
  },
  {
    title: "People introduce you to people. None of them are close.",
    body: "Everyone means well. Nobody is matching on the things that actually decide whether a marriage holds.",
  },
] as const;

export const METHOD = [
  {
    index: "One",
    name: "See Clearly",
    summary: "An honest reading of where you actually stand.",
    body: "You answer a long, careful assessment. We read it against everything we know about how people describe themselves and how they are received. Then we tell you what we see, including the parts your friends have decided not to mention.",
    outputs: [
      "A readiness map across every dimension",
      "The patterns your history is showing",
      "One first action per obstacle",
    ],
  },
  {
    index: "Two",
    name: "Become Ready",
    summary: "Fix what is in the way before you meet anyone.",
    body: "Readiness is not a mood. It is a set of specific, workable things: how you tell your story, what you tolerate, what you avoid, how you handle a difficult first conversation. We work on those directly, with a coach, on a schedule.",
    outputs: [
      "Fortnightly one-to-one coaching",
      "Exercises with written feedback",
      "Honest feedback on how you present",
    ],
  },
  {
    index: "Three",
    name: "Define the Right Fit",
    summary: "Separate what you require from what you prefer.",
    body: "Most people carry a long list and cannot say which three items are absolute. We split them: hard requirements, which no introduction will ever cross, and flexible preferences, which we weight. The list gets shorter and much more useful.",
    outputs: [
      "Hard requirements, written and mutual",
      "Weighted preferences you can defend",
      "The trade-offs you are genuinely willing to make",
    ],
  },
  {
    index: "Four",
    name: "Meet Intentionally",
    summary: "Few introductions. Each one explained.",
    body: "We search, verify, and shortlist. A matchmaker reviews every candidate and writes you the reason this person surfaced. Nothing opens without both people agreeing first. No profile browsing, no queue, no volume.",
    outputs: [
      "Curated introductions, not a feed",
      "A written reason for every one",
      "Mutual consent before any identity is shared",
    ],
  },
  {
    index: "Five",
    name: "Build Toward Commitment",
    summary: "The part everyone skips.",
    body: "Meeting is not the hard bit. Deciding is. After each meeting we debrief with both sides, feed what we learn back into the search, and help you tell the difference between a real reservation and an old reflex.",
    outputs: [
      "A structured debrief after each meeting",
      "The search adjusts on real evidence",
      "Support through the deciding, not just the meeting",
    ],
  },
] as const;

export const OBJECTIONS = [
  {
    q: "Is this matchmaking?",
    a: "Partly. Matchmaking sends you people. We first find the reason the last ones didn't stay.",
  },
  {
    q: "Can you guarantee I'll be married?",
    a: "No, and be careful of anyone who does. We guarantee the work: an agreed number of qualified introductions, and an extended search period if we don't deliver them.",
  },
  {
    q: "I'm divorced, a single parent, over 40, or doing very well professionally.",
    a: "These are the four things clients raise most. All four are positioning questions, and positioning is what we're best at.",
  },
  {
    q: "What if I'm not ready?",
    a: "Then the Clarity Audit is exactly where to start.",
  },
  {
    q: "Who sees my information?",
    a: "Your coach and your matchmaker, and only if they are assigned to you. Nothing is browsable. Your profile is not indexed and never appears in search. You can export or delete everything you have given us, from your account, without asking a person.",
  },
  {
    q: "Is there an app with profiles I can scroll?",
    a: "No. There is no directory, no feed and no swiping. Introductions are made one at a time by a person who can explain the reasoning.",
  },
  {
    q: "How long does this take?",
    a: "You set the timeline. We tell you honestly whether the work in front of you fits inside it, and we would rather say so at the start than at the end.",
  },
  {
    q: "What if I want to stop?",
    a: "You can pause or leave at any time. Deleting your account removes your data, and anyone we have introduced you to loses access at the same moment.",
  },
] as const;

export const SAFETY_POINTS = [
  {
    title: "Adults only, and checked",
    body: "Age confirmation at signup, email and phone verification, and optional government-ID verification before any introduction.",
  },
  {
    title: "Mutual consent before identity",
    body: "Names, photographs and contact details are exchanged only after both people have accepted. Declining is private and costs you nothing.",
  },
  {
    title: "Nothing is browsable",
    body: "There is no member directory. No one can search for you here. Private profiles are excluded from search engines, sitemaps and link previews.",
  },
  {
    title: "Consent is recorded and revocable",
    body: "Photography, introductions, background checks and marketing are each consented to separately, timestamped, and withdrawable one at a time.",
  },
  {
    title: "Files are private by default",
    body: "Every document and photograph is served through a signed link that expires. Nothing sits in a public bucket.",
  },
  {
    title: "A person reviews reports",
    body: "Blocking is immediate. Reports go to a trained reviewer, not a queue, and we tell you what happened.",
  },
] as const;

export const EXPERT_ROLES = [
  {
    role: "Matchmakers",
    body: "They read every shortlist, write the reason each candidate surfaced, and make the final call on every introduction. No system makes that decision.",
  },
  {
    role: "Readiness coaches",
    body: "They do the work in stage two: the patterns, the presentation, the difficult conversations you have been avoiding.",
  },
  {
    role: "Clinical advisers",
    body: "They review our assessment design and tell us where we are out of our depth. When something belongs with a therapist, we say so and refer.",
  },
  {
    role: "Safety reviewers",
    body: "They handle verification, reports and anything that looks wrong. They can end a membership without consulting anyone in sales.",
  },
] as const;

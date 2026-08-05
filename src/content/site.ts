/* Site copy lives here so voice stays consistent and reviewable in one file.
   Banned throughout: journey, soulmate, unlock, transform, your person is out
   there, level up, game-changer, exclamation marks, emoji, hearts.
   Register: short declaratives, second person, sentence case. */

export const HERO = {
  eyebrow: "A private practice",
  question: "When do you want to be married?",
  support:
    "Stop leaving marriage to chance or dating algorithms. We pinpoint what is quietly sabotaging your dating, coach you for lasting commitment, and introduce you to vetted candidates ready for marriage.",
  cta: "Get your marriage plan",
} as const;

export const REFRAME = {
  /* "You are not unlucky. You are unadvised." kept the two-beat rhythm but
     told the reader what was wrong with them before they had asked. This
     keeps the structure and the insight, and leaves the diagnosis open. */
  heading: "It may not be bad luck. It may be a pattern nobody has named.",
  body: "Few people get a clear, unbiased account of how they come across, who they tend to choose, or what quietly went wrong last time. People who care about us do not always know how to give that, and the internet is too loud to be useful. An independent view is a different thing, and it is most of the work.",
} as const;

/* The situations clients actually arrive in. Specific, or they are worthless. */
/* Recognition, not diagnosis.
   These are read by strangers, and an earlier version told them what their
   own history meant — "you will meet it again", "you are not, particularly".
   Being right about some readers is not worth being presumptuous with all of
   them, and a reader who feels assessed by a homepage does not trust the
   assessment that follows. Each of these now describes something that may be
   true and leaves the reader to decide whether it is. */
export const RECOGNITION = [
  {
    title: "Different people. Familiar endings.",
    body: "Different name, different city, and yet something about how it finishes can feel like it has happened before. A pattern is not a flaw. It is simply something that has not been named yet.",
  },
  {
    title: "Respected at work. Harder to read in private.",
    body: "The composure that serves you professionally can be received differently across a table. It is the kind of thing people who love you rarely know how to say.",
  },
  {
    title: "The last one was serious, and it still ended.",
    body: "Often nothing obvious went wrong. Something quieter did, and it may never have been named for you — which makes it difficult to account for next time.",
  },
  {
    title: "You may be ready before the people you are meeting are.",
    body: "That is usually not a standards problem, whatever you have been told. It can simply be a group that was never filtered for intent.",
  },
  {
    title: "Saying you are fine is easier than the longer answer.",
    body: "Not because it is untrue, but because the conversation is tiring, and so is the face people make when you have it.",
  },
  {
    title: "The introductions you get are kind, but rarely close.",
    body: "Everyone means well, and most matching happens on four things: age, faith, income, availability. None of the four is what decides whether a marriage holds.",
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
    q: "Will anyone I know find out I am doing this?",
    a: "Not from us. There is no directory to appear in, no profile that can be searched, and nothing about you is indexed. Another member learns your name only after you have both accepted an introduction — and if you recognise someone, you decline, they are told nothing, and it ends there.",
  },
  {
    q: "Who sees my information?",
    a: "Your coach and your matchmaker, and only while they are assigned to you. Administrators can see what running the business requires, and every one of those reads is written to a log you can also read. You can export or delete everything from your account without asking a person.",
  },
  {
    q: "What does it cost?",
    a: "From the price of a good dinner for the audit, to a significant sum for a nine-month search. We do not put the figure before the recommendation, because half the people who ask should be buying the cheapest thing we sell. Finish the assessment and you get both at once.",
  },
  {
    q: "I have tried a matchmaker before and it did not work.",
    a: "Then you already know the failure mode: a stack of introductions and no explanation. Ask whoever it was why each name reached you. If they cannot answer, that is what went wrong, and it is the thing we do differently.",
  },
  {
    q: "Is there an app with profiles I can scroll?",
    a: "No. There is no directory, no feed and no swiping. Introductions arrive one at a time, from a person who can tell you exactly why they sent that name.",
  },
  {
    q: "I am not in Lagos or London. Does this still work?",
    a: "Yes. Coaching is remote and always has been. Introductions depend on where you are willing to meet and whether you would relocate, which is why we ask both early rather than discovering it at the end.",
  },
  {
    q: "How long does this take?",
    a: "You set the timeline. We tell you honestly whether the work in front of you fits inside it, and we would rather say so on the first call than in the ninth month.",
  },
  {
    q: "What if I want to stop?",
    a: "Pause or leave at any time, from inside your account. Nobody rings you to talk you out of it. Deleting removes your data, and anyone we introduced you to loses access at the same moment.",
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

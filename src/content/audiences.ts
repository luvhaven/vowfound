/* For Men and For Women address different real obstacles.
   No stereotyping, no hostility toward either, and neither is the problem. */

export interface AudiencePage {
  eyebrow: string;
  title: string;
  standfirst: string;
  obstacles: { title: string; body: string }[];
  closing: { heading: string; body: string[] };
}

export const FOR_MEN: AudiencePage = {
  eyebrow: "For men",
  title: "The problem is usually not effort. It is legibility.",
  standfirst:
    "Most of the men who come to us are working hard at this and getting nothing back. In almost every case the issue is that nothing about how they present says what they actually want.",
  obstacles: [
    {
      title: "You want marriage and nothing about you says so",
      body: "You are careful not to seem intense, so you signal nothing, and serious women filter you out in the first two weeks along with everyone else who signalled nothing. Saying it early costs you the people who were never going to work, which is the point.",
    },
    {
      title: "You are waiting to be finished",
      body: "One more promotion, one more year, one more thing settled. The version of you that is worth marrying is not downstream of that, and the people who would have waited with you are getting married in the meantime.",
    },
    {
      title: "Nobody has told you how you are read",
      body: "Men receive almost no honest feedback about how they come across in the first ten minutes. Not from friends, not from dates, and not from the internet. This is the single most valuable thing coaching gives you, and it usually takes one session.",
    },
    {
      title: "You are treating rejection as data about your worth",
      body: "It is data about fit, and you are collecting it inefficiently. A filtered pool and an explained introduction turn a demoralising numbers game into four or five real conversations.",
    },
    {
      title: "You have a long list you have never examined",
      body: "It usually contains one absolute requirement and eleven preferences you inherited. Separating them is uncomfortable and it changes the search completely.",
    },
    {
      title: "You are further along than you think",
      body: "A surprising number of men arrive convinced they need years of work and leave the first call with two specific things to change. We will tell you honestly which case you are.",
    },
  ],
  closing: {
    heading: "What we will not do",
    body: [
      "We will not teach you to perform confidence, run a script, or treat women as a category to be solved. That material is everywhere, it is degrading to everyone involved, and it does not produce marriages.",
      "We will tell you the truth about how you land, help you say what you want without apologising for it, and then introduce you to people who want the same thing.",
    ],
  },
};

export const FOR_WOMEN: AudiencePage = {
  eyebrow: "For women",
  title: "You are not too much. You are unfiltered.",
  standfirst:
    "Most women who come to us have been told, in a hundred polite ways, to want less. That is bad advice. The problem is almost never the standard. Nothing is filtering for it before you spend nine months finding out.",
  obstacles: [
    {
      title: "You are meeting men who are not trying to marry anyone",
      body: "This is a pool problem, and no amount of self-improvement fixes it. Every candidate we introduce has stated an intention to marry and paid to be taken seriously about it.",
    },
    {
      title: "You find out too late what they actually want",
      body: "Children, faith, where you would live. These arrive at month nine because raising them at week three feels like an interrogation. We rehearse those conversations until you can have them early and lightly.",
    },
    {
      title: "You have been told your success is the obstacle",
      body: "It is not. What sometimes gets in the way is what success taught you about needing nobody, which is a specific and workable thing rather than a reason to become smaller.",
    },
    {
      title: "Being warm is being read as being available",
      body: "Some women get treated as an option because nothing in how they present marks the difference between interested and decided. That is a presentation problem, and it is fixable without becoming cold.",
    },
    {
      title: "The timeline is real and everyone is weird about it",
      body: "If children are part of what you want, time matters, and pretending otherwise to spare your feelings is not kindness. We will talk about it directly, without alarm and without dismissing it.",
    },
    {
      title: "You are carrying the whole search alone",
      body: "Searching, screening, and deciding, unpaid, on top of everything else. The point of a matchmaker is that the first two stop being your job.",
    },
  ],
  closing: {
    heading: "What we will not do",
    body: [
      "We will not tell you to lower your standards, soften yourself, or wait more gracefully. We will make you cut a long list to three absolutes, which is a different exercise and a much harder one.",
      "We will also tell you when a requirement is doing damage. It may be standing in for something you have not named yet, rather than asking for too much.",
    ],
  },
};

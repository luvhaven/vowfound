/* Plain-language legal pages. These are a starting position drafted for
   review by a qualified lawyer in each operating jurisdiction — they are not
   a substitute for that review, and the README says so. */

export interface LegalDoc {
  title: string;
  standfirst: string;
  reviewed: string;
  sections: { heading: string; body: string[] }[];
}

export const LEGAL_DOCS = {
  terms: {
    title: "Terms of service",
    standfirst:
      "What we agree to do, what you agree to do, and what neither of us can promise.",
    reviewed: "August 2026",
    sections: [
      {
        heading: "Who may use this service",
        body: [
          "You must be 18 or over. We ask you to confirm this at signup and we verify identity before any introduction is made.",
          "You must intend to marry. This is not a dating service and we will end a membership that is clearly being used as one.",
        ],
      },
      {
        heading: "What we provide",
        body: [
          "Assessment and readiness materials, coaching where you have bought it, and curated introductions where you have bought those.",
          "Every introduction decision is made by a person. We will explain the reasoning behind any introduction you receive, on request.",
        ],
      },
      {
        heading: "What we do not promise",
        body: [
          "We do not guarantee that you will marry, become engaged, or meet any particular person. Nobody can, and you should treat any service that says otherwise with suspicion.",
          "What we guarantee is the work: if you complete every milestone in your programme and we have not delivered the agreed number of qualified introductions, your active search period is extended at no cost until we do.",
          "Timelines discussed with you are your stated goals. They are never a commitment by us to a date.",
        ],
      },
      {
        heading: "Your obligations",
        body: [
          "Answer honestly. The assessment, your requirements and your verification documents must be accurate, and a material misrepresentation ends the membership without refund.",
          "Treat other members with basic decency. Harassment, deception about marital status, and pressure of any kind end a membership immediately.",
        ],
      },
      {
        heading: "Payment, cancellation and refunds",
        body: [
          "Fees are charged in your local currency at the point of purchase. Programmes are billed as stated on the plan you bought.",
          "You may cancel at any time. Work already delivered is not refunded; unstarted programme months are.",
          "Where consumer law in your jurisdiction gives you a stronger right than this clause, that law applies and this clause does not reduce it.",
        ],
      },
      {
        heading: "Ending the relationship",
        body: [
          "You may close your account at any time from inside your account. Deletion is self-serve and does not require a conversation.",
          "We may end a membership for safety reasons, and a safety reviewer can do so without consulting anyone whose work involves revenue.",
        ],
      },
    ],
  },
  "privacy-policy": {
    title: "Privacy policy",
    standfirst:
      "The formal version. The plain-language summary is on the privacy page, and if the two disagree we will fix the summary.",
    reviewed: "August 2026",
    sections: [
      {
        heading: "What we collect",
        body: [
          "Account details: name, email, phone, date of birth, country and city.",
          "Assessment answers, stored verbatim, including free-text answers.",
          "Requirements, preferences and matchmaking profile content where you provide them.",
          "Verification evidence where you choose to verify, and payment records where you buy something.",
          "Technical logs necessary to run and secure the service.",
        ],
      },
      {
        heading: "Why we hold it",
        body: [
          "To produce your readiness map, to deliver coaching and introductions you have bought, to verify identity, to keep members safe, and to meet legal and accounting obligations.",
          "We do not sell personal data, do not share it with advertisers, and do not use your answers to train any model that leaves this business.",
        ],
      },
      {
        heading: "Who can see it",
        body: [
          "You, always and in full. Your assigned coach and matchmaker, only while assigned. Safety reviewers, only what a report or verification requires. Administrators, where operationally necessary.",
          "Every access to another person's private record is written to an audit log, and you can read the entries that concern you.",
          "Other members see nothing until you have both accepted an introduction.",
        ],
      },
      {
        heading: "How long we keep it",
        body: [
          "Until you delete it, except for financial records, which are kept for the period required by law and for nothing else.",
          "Deleting your account removes your profile, assessment, answers, readiness map, preferences and uploaded files.",
        ],
      },
      {
        heading: "Your rights",
        body: [
          "Access, export, correct, delete, and withdraw any individual consent. All of these are available from inside your account without contacting us.",
          "Where your jurisdiction gives you additional rights, you have those too. Write to privacy@vowfound.com and a person will answer.",
        ],
      },
      {
        heading: "Security",
        body: [
          "Data is encrypted in transit and at rest. Files are held in private storage and served only through signed links that expire.",
          "Access is enforced at the database level rather than only in the interface, so a bug in a screen cannot expose a record the viewer was never entitled to.",
        ],
      },
    ],
  },
  cookies: {
    title: "Cookies",
    standfirst: "There are four, and none of them are for advertising.",
    reviewed: "August 2026",
    sections: [
      {
        heading: "What we set",
        body: [
          "A session cookie, so you stay signed in. Strictly necessary.",
          "An assessment cookie, so a partly finished assessment can be recovered. Strictly necessary to that feature.",
          "A timeline cookie, holding the answer you gave on the home page so the assessment does not ask twice.",
          "A currency cookie, holding your manual currency choice so we do not override it on your next visit.",
        ],
      },
      {
        heading: "What we do not set",
        body: [
          "No advertising cookies, no cross-site trackers, and no third-party analytics that identify you personally.",
          "Because we set no non-essential cookies, there is no consent banner. That is deliberate rather than an oversight.",
        ],
      },
    ],
  },
  complaints: {
    title: "Complaints",
    standfirst:
      "How to complain, who reads it, and what happens if you are not satisfied with the answer.",
    reviewed: "August 2026",
    sections: [
      {
        heading: "How to raise one",
        body: [
          "Email hello@vowfound.com with the word complaint in the subject, or raise it from inside your account. Either route reaches a person the same day.",
          "If your complaint concerns the conduct of another member, use the report function in your account instead. It goes directly to a safety reviewer.",
        ],
      },
      {
        heading: "What happens",
        body: [
          "You get an acknowledgement within one working day and a substantive answer within ten.",
          "Complaints about a coach or matchmaker are never reviewed by that coach or matchmaker.",
        ],
      },
      {
        heading: "If you are not satisfied",
        body: [
          "Ask for it to be escalated and it will be reviewed by someone who has had no involvement so far.",
          "You retain every right you have under the consumer law of your jurisdiction, and nothing in our terms reduces it.",
        ],
      },
    ],
  },
} satisfies Record<string, LegalDoc>;

export type LegalSlug = keyof typeof LEGAL_DOCS;

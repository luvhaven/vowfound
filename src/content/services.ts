export type ServiceIcon =
  | "audit"
  | "coaching"
  | "matchmaking"
  | "concierge"
  | "style"
  | "photography"
  | "verification"
  | "advisor";

export type ServiceAvailability =
  | "Available now"
  | "Application only"
  | "By request"
  | "Included with Match"
  | "In development";

export interface ServiceOffering {
  id: string;
  name: string;
  shortName: string;
  description: string;
  detail: string;
  href: string;
  actionHref: string;
  actionLabel: string;
  availability: ServiceAvailability;
  icon: ServiceIcon;
}

export const CORE_SERVICES: readonly ServiceOffering[] = [
  {
    id: "clarity-audit",
    name: "The Clarity Audit",
    shortName: "Clarity Audit",
    description: "A private diagnostic and written readiness map.",
    detail:
      "Understand the patterns, decisions, and practical obstacles shaping your relationship life before choosing a larger programme.",
    href: "/services#clarity-audit",
    actionHref: "/assessment",
    actionLabel: "Begin the assessment",
    availability: "Available now",
    icon: "audit",
  },
  {
    id: "marriage-coaching",
    name: "Marriage Readiness Coaching",
    shortName: "Readiness Coaching",
    description: "Practical coaching for stronger choices and relationships.",
    detail:
      "Work directly on recurring patterns, communication, standards, presentation, and the conversations that decide whether commitment can grow.",
    href: "/coaching",
    actionHref: "/coaching",
    actionLabel: "Explore coaching",
    availability: "Available now",
    icon: "coaching",
  },
  {
    id: "curated-matchmaking",
    name: "Curated Matchmaking",
    shortName: "Matchmaking",
    description: "Private, human-made introductions with a reason behind each.",
    detail:
      "A matchmaker searches and shortlists around your requirements. Identity is shared only after both people agree to an introduction.",
    href: "/matchmaking",
    actionHref: "/matchmaking",
    actionLabel: "Explore matchmaking",
    availability: "Available now",
    icon: "matchmaking",
  },
  {
    id: "private-concierge",
    name: "Private Concierge",
    shortName: "Private Concierge",
    description: "A discreet, hands-on search for complex circumstances.",
    detail:
      "A named principal, off-platform outreach, and direct coordination for clients whose privacy, profile, or circumstances require a bespoke search.",
    href: "/services#private-concierge",
    actionHref: "/plans#private-concierge",
    actionLabel: "See the concierge",
    availability: "Application only",
    icon: "concierge",
  },
] as const;

export const SPECIALIST_SERVICES: readonly ServiceOffering[] = [
  {
    id: "image-and-style",
    name: "Personal Image & Style",
    shortName: "Image & Style",
    description: "Presentation support that still feels like you.",
    detail:
      "A practical review of wardrobe, grooming, and first-impression signals, shaped around your life rather than a generic makeover.",
    href: "/services#image-and-style",
    actionHref: "/contact?service=image-and-style",
    actionLabel: "Enquire about style",
    availability: "By request",
    icon: "style",
  },
  {
    id: "photography",
    name: "Portrait & Profile Photography",
    shortName: "Photography",
    description: "Private portraits with warmth, clarity, and restraint.",
    detail:
      "Direction and photography for introductions, with separate consent controls and no use in public marketing unless you explicitly allow it.",
    href: "/services#photography",
    actionHref: "/contact?service=photography",
    actionLabel: "Enquire about photography",
    availability: "By request",
    icon: "photography",
  },
  {
    id: "verification",
    name: "Identity & Background Verification",
    shortName: "Verification",
    description: "Consent-led checks before an introduction progresses.",
    detail:
      "Age, identity, and optional background checks are handled separately from sales, with clear consent and limited access to the result.",
    href: "/services#verification",
    actionHref: "/safety",
    actionLabel: "Read the safety standard",
    availability: "Included with Match",
    icon: "verification",
  },
  {
    id: "relationship-advisor",
    name: "AI Relationship Advisor",
    shortName: "Relationship Advisor",
    description: "Private guidance between sessions, grounded in your plan.",
    detail:
      "A future support layer for reflection and preparation. It will not diagnose, select matches, or replace a coach when a person is needed.",
    href: "/services#relationship-advisor",
    actionHref: "/contact?service=relationship-advisor",
    actionLabel: "Join the interest list",
    availability: "In development",
    icon: "advisor",
  },
] as const;

export const ALL_SERVICES = [...CORE_SERVICES, ...SPECIALIST_SERVICES] as const;

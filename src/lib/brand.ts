export const BRAND = "VowFound";
export const DOMAIN = "vowfound.com";
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? `https://${DOMAIN}`;

export const TAGLINE = "Get married on purpose.";

export const TRUST_LINE = [
  "Private and confidential",
  "Adults only",
  "No public browsing",
  "No swiping",
] as const;

export const CONTACT_EMAIL = `hello@${DOMAIN}`;
export const PRIVACY_EMAIL = `privacy@${DOMAIN}`;

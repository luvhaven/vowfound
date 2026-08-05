export const BRAND = "VowFound";
export const DOMAIN = "vowfound.com";

/**
 * Where this instance is actually running. Used for anything that has to come
 * back to the same deployment — payment redirects, auth callbacks — so a
 * preview build sends people back to the preview.
 */
export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? `https://www.${DOMAIN}`;

/**
 * The address the site claims as its own, whatever it is deployed on.
 *
 * Canonical tags, Open Graph URLs and structured data all use this rather than
 * SITE_URL. A preview deployment that advertised its own vercel.app address
 * would compete with the real domain in search and hand out links that expire,
 * and one mis-set environment variable in production would do the same. Fixed
 * here so neither is possible.
 */
export const CANONICAL_ORIGIN = `https://www.${DOMAIN}`;

export const TAGLINE = "Get married on purpose.";

export const TRUST_LINE = [
  "Private and confidential",
  "Adults only",
  "No public browsing",
  "No swiping",
] as const;

export const CONTACT_EMAIL = `hello@${DOMAIN}`;
export const PRIVACY_EMAIL = `privacy@${DOMAIN}`;

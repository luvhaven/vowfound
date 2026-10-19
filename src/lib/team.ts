/**
 * The real people behind VowFound. This is the single most persuasive thing
 * the site can show — and it must be true. Every section that uses it stays
 * hidden until at least one entry exists, so nothing invented ever renders.
 *
 * To fill it in: add entries below and drop photos in /public/team/.
 *
 *   {
 *     name: "Ada Okafor",
 *     role: "Founder & lead matchmaker",
 *     photo: "/team/ada.webp",          // square, at least 800px
 *     bio: "Two or three sentences, first person, specific.",
 *     credentials: ["Certified relationship coach (ICF)", "10 years in HR"],
 *   },
 */
export interface TeamMember {
  name: string;
  role: string;
  photo?: string;
  bio: string;
  credentials?: readonly string[];
}

export const TEAM: readonly TeamMember[] = [];

/** Why VowFound exists, in the founder's own words. Empty hides the section. */
export const FOUNDER_NOTE: { quote: string; name: string } | null = null;

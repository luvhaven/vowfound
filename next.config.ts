import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /**
   * The dev server refuses to serve its own JavaScript to any host it does not
   * recognise, and answers with a cross-origin warning instead. Reaching the
   * site on 127.0.0.1, or on the LAN address it prints for phone testing, then
   * loads the HTML but never hydrates — so forms submit natively, do nothing
   * visible, and look exactly like a broken sign-in.
   *
   * These are development-only origins. They have no effect on a build.
   */
  allowedDevOrigins: ["127.0.0.1", "localhost", "192.168.1.4", "*.local"],

  /**
   * A production build and a running dev server share .next and clobber each
   * other. Setting NEXT_DIST_DIR lets a build run alongside `npm run dev`,
   * which is what makes it possible to verify a production build without
   * stopping whatever is already running.
   */
  distDir: process.env.NEXT_DIST_DIR || ".next",
};

export default nextConfig;

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
};

export default nextConfig;

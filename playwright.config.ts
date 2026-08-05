import { defineConfig, devices } from "@playwright/test";

const PORT = process.env.E2E_PORT ?? "3100";
const BASE_URL = `http://127.0.0.1:${PORT}`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? "github" : "list",
  use: {
    baseURL: BASE_URL,
    trace: "on-first-retry",
  },
  projects: [
    { name: "desktop", use: { ...devices["Desktop Chrome"] } },
    { name: "mobile", use: { ...devices["Pixel 7"] } },
  ],
  webServer: {
    command: `npm run build && npx next start --port ${PORT}`,
    url: BASE_URL,
    reuseExistingServer: !process.env.CI,
    timeout: 240_000,
    // Lets the suite pin a region so the currency rules can be exercised from
    // both sides. Never set outside tests and local development.
    env: {
      ALLOW_DEBUG_COUNTRY: "1",
      // Its own build directory, so the suite can run while a dev server holds
      // .next. The dummy provider key makes checkout render its real payment
      // step rather than the unconfigured fallback.
      NEXT_DIST_DIR: ".next-e2e",
      FLUTTERWAVE_SECRET_KEY: "FLWSECK_TEST-e2e",
      FLUTTERWAVE_SECRET_HASH: "e2e-hash",
    },
  },
});

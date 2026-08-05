/**
 * The real `server-only` package throws unless it is resolved under React's
 * "react-server" condition, which the test runner does not set. Aliasing it
 * here lets server modules be unit-tested directly.
 *
 * This does not weaken the guarantee it provides: the build still resolves the
 * real package, and tests/unit/non-negotiables.test.ts asserts separately that
 * every module touching a secret imports it.
 */
export {};

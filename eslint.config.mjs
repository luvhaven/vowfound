import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // NEXT_DIST_DIR builds to a sibling directory so a production build can
    // run alongside the dev server. Without this, linting a machine that has
    // one of those directories reports hundreds of errors in generated code.
    ".next-*/**",
  ]),
]);

export default eslintConfig;

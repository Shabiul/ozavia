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
    // vendored three.js Draco decoder
    "public/draco/**",
  ]),
  // r3f mutates three.js objects inside useFrame by design; the compiler's immutability rule can't model that
  { files: ["components/scene/**"], rules: { "react-hooks/immutability": "off" } },
]);

export default eslintConfig;

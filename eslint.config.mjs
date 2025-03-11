// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  { ignores: ["cdmd_dist", "node_modules", "pnpm-lock.yaml"] },
  { files: ["**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}"], ...eslint.configs.recommended, ...tseslint.configs.recommended }
);

// @ts-check

import eslint from "@eslint/js";
import tseslint from "typescript-eslint";
import prettier from "eslint-config-prettier";

export default tseslint.config([
  { ignores: ["cdmd_dist", "node_modules", "pnpm-lock.yaml"] },
  { extends: [eslint.configs.recommended, tseslint.configs.recommended, prettier] },
]);

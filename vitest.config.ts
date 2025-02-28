import { configDefaults, defineConfig } from "vitest/config";

import packageJson from "./package.json";

export default defineConfig({
  test: {
    name: packageJson.name,
    environment: "jsdom",
    include: [...configDefaults.include, "**/test/*.ts"],
  },
});

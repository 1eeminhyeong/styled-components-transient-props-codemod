import { describe, expect, it } from "vitest";
import { readFile } from "node:fs/promises";
import { join } from "node:path";
import transform from "../add-transient-props.js";
import { buildApi } from "./utils.js";

const testCases = ["add-transient-props", "do-not-add-transient-default-props"];

describe.each(testCases)("add transient props TEST - %s", (testCase) => {
  it("should transform correctly", async () => {
    const INPUT = await readFile(join(__dirname, "..", "__testfixtures__", `${testCase}.input.tsx`), "utf-8");
    const OUTPUT = await readFile(join(__dirname, "..", "__testfixtures__", `${testCase}.output.tsx`), "utf-8");

    const actualOutput = transform(
      {
        path: `${testCase}.js`,
        source: INPUT,
      },
      buildApi("tsx")
    );

    expect(actualOutput).not.toBeUndefined();
    expect(actualOutput?.trim()).toBe(OUTPUT.trim());
  });
});

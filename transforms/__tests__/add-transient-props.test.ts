import { describe, expect, it } from "vitest"
import assert from "node:assert"
import { readFile } from "node:fs/promises"
import jscodeshift, { API } from "jscodeshift"
import { join } from "node:path"
import transform from "../add-transient-props.js"

const buildApi = (parser: string | undefined): API => ({
  j: parser ? jscodeshift.withParser(parser) : jscodeshift,
  jscodeshift: parser ? jscodeshift.withParser(parser) : jscodeshift,
  stats: () => {
    console.error("The stats function was called, which is not supported on purpose")
  },
  report: () => {
    console.error("The report function was called, which is not supported on purpose")
  },
})

describe("add transient props TEST", () => {
  it("test", async () => {
    const INPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/add-transient-props.input.tsx"),
      "utf-8"
    )
    const OUTPUT = await readFile(
      join(__dirname, "..", "__testfixtures__/add-transient-props.output.tsx"),
      "utf-8"
    )

    const actualOutput = transform(
      {
        path: "add-transient-props.js",
        source: INPUT,
      },
      buildApi("tsx")
    )

    // console.log("Transformed code:", actualOutput)

    expect(actualOutput).not.toBeUndefined()
    expect(actualOutput?.trim()).toBe(OUTPUT.trim())
  })
})

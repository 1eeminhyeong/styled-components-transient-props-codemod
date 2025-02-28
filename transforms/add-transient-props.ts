import { API, FileInfo, Options } from "jscodeshift"

export default function transform(file: FileInfo, api: API, options?: Options) {
  const j = api.jscodeshift
  const root = j(file.source)

  // JSX props add prefix ($)
  root.find(j.JSXAttribute).forEach((path) => {
    const propsName = path.node.name

    if (propsName.type === "JSXIdentifier") {
      const propNameValue = propsName.name

      if (!propNameValue.startsWith("$")) {
        propsName.name = `$${propNameValue}`
      }
    }
  })

  return root.toSource()
}

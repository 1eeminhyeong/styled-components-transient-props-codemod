import type { API, FileInfo, Options, TSTypeLiteral, TSTypeParameterInstantiation } from "jscodeshift";
import { defaultJSXAttributes } from "./constants.js";

export default function transform(file: FileInfo, api: API, options?: Options) {
  const j = api.jscodeshift;
  const root = j(file.source);

  root.find(j.VariableDeclarator).forEach((path) => {
    let isDirty = false;

    if (path.node.init?.type === "TaggedTemplateExpression") {
      if (
        path.node.init.tag.type === "MemberExpression" &&
        "typeParameters" in path.node.init &&
        path.node.init.tag.object.type === "Identifier" &&
        // only styled-components eg. const Button = styled.button`...`
        path.node.init.tag.object.name === "styled"
      ) {
        // edit eg. styled.button<{ isPrimary: boolean; color: string }>...  ===> styled.button<{ $isPrimary: boolean; $color: string }>...
        if ((path.node.init.typeParameters as TSTypeParameterInstantiation).type === "TSTypeParameterInstantiation") {
          const typeParameters = path.node.init.typeParameters as TSTypeParameterInstantiation;
          (typeParameters.params[0] as TSTypeLiteral).members.forEach((member) => {
            if (member.type === "TSPropertySignature" && member.key.type === "Identifier") {
              const propNameValue = member.key.name;

              if (!propNameValue.startsWith("$")) {
                member.key.name = `$${propNameValue}`;
                isDirty = true;
              }
            }
          });
        }

        if (isDirty && path.node.init.quasi.type === "TemplateLiteral" && path.node.init.quasi.expressions.length > 0) {
          path.node.init.quasi.expressions.forEach((expression) => {
            if (expression.type === "ArrowFunctionExpression") {
              if (expression.body.type === "MemberExpression" && expression.body.property.type === "Identifier") {
                const propNameValue = expression.body.property.name;

                if (!propNameValue.startsWith("$")) {
                  expression.body.property.name = `$${propNameValue}`;
                }
              } else if (
                expression.body.type === "ConditionalExpression" &&
                expression.body.test.type === "MemberExpression" &&
                expression.body.test.property.type === "Identifier"
              ) {
                const propNameValue = expression.body.test.property.name;

                if (!propNameValue.startsWith("$")) {
                  expression.body.test.property.name = `$${propNameValue}`;
                }
              }
            }
          });
        }
      }
    }
  });

  // JSX props add prefix ($)
  root.find(j.JSXOpeningElement).forEach((path) => {
    // if (path.node.name.type === "JSXIdentifier") {
    //   console.log(path.node.name.name.startsWith("Styled"));
    // }

    if (path.node.name.type === "JSXIdentifier" && path.node.name.name.startsWith("Styled") && path.node.attributes) {
      path.node.attributes?.forEach((attr) => {
        if (attr.type === "JSXAttribute") {
          const propsName = attr.name;

          if (propsName.type === "JSXIdentifier") {
            const propNameValue = propsName.name;

            if (!defaultJSXAttributes.has(propNameValue) && !propNameValue.startsWith("$")) {
              propsName.name = `$${propNameValue}`;
            }
          }
        }
      });
    }
  });

  return root.toSource();
}

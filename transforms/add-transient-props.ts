import type { API, FileInfo, TaggedTemplateExpression, TSTypeLiteral, TSTypeParameterInstantiation } from "jscodeshift";
import { defaultJSXAttributes } from "./constants.js";

export default function transform(file: FileInfo, api: API) {
  const j = api.jscodeshift;
  const root = j(file.source);

  root.find(j.VariableDeclarator).forEach((path) => {
    if (path.node.init?.type !== "TaggedTemplateExpression") {
      return;
    }

    if (
      path.node.init.tag.type === "MemberExpression" &&
      "typeParameters" in path.node.init &&
      path.node.init.tag.object.type === "Identifier" &&
      // only styled-components eg. const Button = styled.button`...`
      path.node.init.tag.object.name === "styled"
    ) {
      // edit eg. styled.button<{ isPrimary: boolean; color: string }>... => styled.button<{ $isPrimary: boolean; $color: string }>...
      const isDirty = transformStyledComponentsGeneric(path.node.init);

      /**
       * edit eg.
       * width: ${(props) => (props.size === "s" ? "100px" : "200px")}... => width: ${(props) => (props.$size === "s" ? "100px" : "200px")}
       */
      if (isDirty) {
        transformTemplateLiteralExpressions(path.node.init);
      }
    }
  });

  // JSX props add prefix ($)
  root.find(j.JSXOpeningElement).forEach((path) => {
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

function transformStyledComponentsGeneric(init: TaggedTemplateExpression & Record<"typeParameters", unknown>) {
  let isDirty = false;

  if ((init.typeParameters as TSTypeParameterInstantiation).type === "TSTypeParameterInstantiation") {
    const typeParameters = init.typeParameters as TSTypeParameterInstantiation;
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

  return isDirty;
}

function transformTemplateLiteralExpressions(init: TaggedTemplateExpression & Record<"typeParameters", unknown>) {
  if (init.quasi.type === "TemplateLiteral" && init.quasi.expressions.length > 0) {
    init.quasi.expressions.forEach((expression) => {
      if (expression.type !== "ArrowFunctionExpression") {
        return;
      }

      const expressionParam = expression.params[0];

      if (
        expressionParam?.type === "ObjectPattern" &&
        expressionParam.properties[0]?.type === "ObjectProperty" &&
        expressionParam.properties[0].value &&
        expressionParam.properties[0].value.type === "Identifier"
      ) {
        const objParam = expressionParam.properties[0].value.name;

        if (!objParam.startsWith("$")) {
          expressionParam.properties[0].value.name = `$${objParam}`;
        }
      }

      if (expression.body.type === "MemberExpression" && expression.body.property.type === "Identifier") {
        const propNameValue = expression.body.property.name;

        if (!propNameValue.startsWith("$")) {
          expression.body.property.name = `$${propNameValue}`;
        }
      } else if (expression.body.type === "ConditionalExpression") {
        if (expression.body.test.type === "MemberExpression" && expression.body.test.property.type === "Identifier") {
          const propNameValue = expression.body.test.property.name;

          if (!propNameValue.startsWith("$")) {
            expression.body.test.property.name = `$${propNameValue}`;
          }
        } else if (expression.body.test.type === "BinaryExpression" && expression.body.test.left.type === "Identifier") {
          const conditionValue = expression.body.test.left.name;

          if (!conditionValue.startsWith("$")) {
            expression.body.test.left.name = `$${conditionValue}`;
          }
        }
      } else if (
        expression.body.type === "LogicalExpression" &&
        expression.body.left.type === "MemberExpression" &&
        expression.body.left.property.type === "Identifier"
      ) {
        const propNameValue = expression.body.left.property.name;

        if (!propNameValue.startsWith("$")) {
          expression.body.left.property.name = `$${propNameValue}`;
        }
      }
    });
  }
}

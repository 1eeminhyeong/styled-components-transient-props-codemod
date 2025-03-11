import React, { ReactNode } from "react";
import styled, { css } from "styled-components";

const StyledButton = styled.button<{
  $isPrimary: boolean;
  $textColor: string;
  $bgNone: boolean;
  $size: "s" | "m";
}>`
  color: ${(props) => props.$textColor};
  background: ${(props) => (props.$isPrimary ? "blue" : "gray")};
  width: ${({ $size }) => ($size === "s" ? "100px" : "200px")};

  ${(props) =>
    props.$bgNone &&
    css`
      padding: 0;
      background: none;
      border: none;
    `}
`;

interface MyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isPrimary?: boolean;
  textColor?: string;
}

function MyButton({ children, isPrimary = false, textColor = "black" }: MyButtonProps) {
  return (
    <StyledButton $isPrimary={isPrimary} $textColor={textColor} $bgNone $size="s">
      {children}
    </StyledButton>
  );
}

export default function App() {
  return (
    <>
      <h1>Codemod Test</h1>
      <MyButton isPrimary textColor="red">
        This is Button
      </MyButton>
    </>
  );
}

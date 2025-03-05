import React, { ReactNode } from "react";
import styled from "styled-components";

const StyledButton = styled.button<{ $isPrimary: boolean; $textColor: string }>`
  color: ${(props) => props.$textColor};
  background: ${(props) => (props.$isPrimary ? "blue" : "gray")};
`;

interface MyButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  isPrimary?: boolean;
  textColor?: string;
}

function MyButton({ children, isPrimary = false, textColor = "black", onClick }: MyButtonProps) {
  return (
    <StyledButton $isPrimary={isPrimary} $textColor={textColor} onClick={onClick}>
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

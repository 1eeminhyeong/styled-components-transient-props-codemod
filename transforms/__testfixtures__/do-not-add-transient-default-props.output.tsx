import React from "react";
import styled from "styled-components";

const Button = styled.button<{ $isPrimary: boolean; $textColor: string }>`
  color: ${(props) => props.$textColor};
  background: ${(props) => (props.$isPrimary ? "blue" : "gray")};
`;

export default function App() {
  return <Button $textColor="red" $isPrimary={true} onClick={() => console.log("Hello world!")} />;
}

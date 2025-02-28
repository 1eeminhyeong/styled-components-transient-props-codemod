import React from "react";
import styled from "styled-components";

const Button = styled.button<{ $isPrimary: boolean; $color: string }>`
  color: ${(props) => props.$color};
  background: ${(props) => (props.$isPrimary ? "blue" : "gray")};
`;

export default function App() {
  return <Button $color="red" $isPrimary={true} onClick={() => console.log("Hello world!")} />;
}

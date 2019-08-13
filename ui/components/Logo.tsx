import styled from "styled-components";

import src from "./logo.svg";

export const Logo = styled.img.attrs(() => ({ src }))`
    margin: ${({ theme }) => `0 ${theme.spacing.sm} 0 0`};
`;

import styled from "styled-components";

import { Code as VarnishCode } from "@allenai/varnish/components/typography";

export const Code = styled(VarnishCode)`
    font-size: 1rem;
    background: ${({ theme }) => theme.color.N3};
    border: 1px solid ${({ theme }) => theme.color.N4};
    border-radius: 4px;
`;

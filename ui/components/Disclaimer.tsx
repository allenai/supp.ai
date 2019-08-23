import { useState } from "react";
import styled from "styled-components";

export const Disclaimer = () => {
    const [isExpanded, toggleIsExpanded] = useState(false);

    if (isExpanded) {
        return (
            <Warning>
                <strong>Disclaimer:</strong> The information contained herein
                should NOT be used as a substitute for the advice of an
                appropriately qualified and licensed physician or other health
                care provider. The tool is not a substitute for the care
                provided by licensed healthcare practitioners and consumers are
                urged to consult with their healthcare practitioner in all
                instances. The absence of a warning for a given supplement, drug
                or combination thereof in no way should be construed to indicate
                that the supplement, drug or combination is safe, effective or
                appropriate for any given patient. The information provided here
                is for informational purposes only. This tool may not cover all
                possible supplement-drug interactions. Please check with a
                physician if you have health questions or concerns. Although we
                attempt to provide accurate and up-to-date information, no
                guarantee is made to that effect. This tool does not endorse any
                drugs or supplements, diagnose patients, or recommend therapy.{" "}
                <ToggleLink onClick={() => toggleIsExpanded(false)}>
                    (less)
                </ToggleLink>
            </Warning>
        );
    } else {
        return (
            <Warning>
                <strong>Disclaimer:</strong> The information contained herein
                should NOT be used as a substitute for the advice of an
                appropriately qualified and licensed physician or other health
                care provider. The tool is not a substitute for the care
                provided…{" "}
                <ToggleLink onClick={() => toggleIsExpanded(true)}>
                    (more)
                </ToggleLink>
            </Warning>
        );
    }
};

const Warning = styled.div`
    margin: 0 0 ${({ theme }) => theme.spacing.lg};
    background: ${({ theme }) => theme.color.B1};
    border: 1px solid ${({ theme }) => theme.color.B3};
    border-radius: 4px;
    padding: ${({ theme }) => theme.spacing.md};
`;

const ToggleLink = styled.a`
    &,
    &:hover,
    &:active {
        color: ${({ theme }) => theme.color.B6};
    }
`;

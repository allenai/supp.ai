import { useState } from "react";
import styled from "styled-components";

interface Props {
    synonyms: string[];
}

export const Synonyms = ({ synonyms }: Props) => {
    const [isExpanded, toggleIsExpanded] = useState(false);

    const visible = isExpanded ? synonyms : synonyms.slice(0, 3);
    const buttonText = isExpanded ? "(less)" : "(more)";

    return (
        <div>
            A.K.A: <em>{visible.join(", ")}</em>
            {synonyms.length > 3 ? (
                <ToggleLink onClick={() => toggleIsExpanded(!isExpanded)}>
                    {buttonText}
                </ToggleLink>
            ) : null}
        </div>
    );
};

const ToggleLink = styled.a`
    margin-left: ${({ theme }) => theme.spacing.xs};
`;

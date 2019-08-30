import { useState, Fragment } from "react";
import styled from "styled-components";

interface Props {
    tradenames: string[];
}

const MAX_CHARS = 77;

export const Tradenames = ({ tradenames }: Props) => {
    const countTradenames = tradenames.length;
    if (countTradenames === 0) {
        return null;
    }

    const [isExpanded, toggleIsExpanded] = useState(false);

    let chars = tradenames[0].length;
    let numberOfTradenames = 1;
    if (countTradenames > 1) {
        for (let i = 1; i < countTradenames; i++) {
            chars += tradenames[i].length;
            if (chars < MAX_CHARS) {
                numberOfTradenames++;
            } else {
                break;
            }
        }
    }

    const hasMore = numberOfTradenames < tradenames.length;
    const visible = isExpanded
        ? tradenames
        : tradenames.slice(0, numberOfTradenames);
    const buttonText = isExpanded ? "(less)" : "(more)";

    return (
        <div>
            Brand names: <em>{visible.join(", ")}</em>
            {hasMore ? (
                <Fragment>
                    {!isExpanded ? ", …" : null}
                    <ToggleLink onClick={() => toggleIsExpanded(!isExpanded)}>
                        {buttonText}
                    </ToggleLink>
                </Fragment>
            ) : null}
        </div>
    );
};

const ToggleLink = styled.a`
    margin-left: ${({ theme }) => theme.spacing.xs};
`;

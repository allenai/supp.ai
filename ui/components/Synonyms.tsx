import { useState, Fragment } from "react";
import styled from "styled-components";

interface Props {
    synonyms: string[];
}

const MAX_CHARS = 77;

export const Synonyms = ({ synonyms }: Props) => {
    const countSynonyms = synonyms.length;
    if (countSynonyms === 0) {
        return null;
    }

    const [isExpanded, toggleIsExpanded] = useState(false);

    let chars = synonyms[0].length;
    let numberOfSynonyms = 1;
    if (countSynonyms > 1) {
        for (let i = 1; i < countSynonyms; i++) {
            chars += synonyms[i].length;
            if (chars < MAX_CHARS) {
                numberOfSynonyms++;
            } else {
                break;
            }
        }
    }

    const visible = isExpanded ? synonyms : synonyms.slice(0, numberOfSynonyms);
    const buttonText = isExpanded ? "(less)" : "(more)";

    return (
        <div>
            A.K.A: <em>{visible.join(", ")}</em>
            {synonyms.length > 3 ? (
                <Fragment>
                    , …
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

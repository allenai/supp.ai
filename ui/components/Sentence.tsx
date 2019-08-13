import React from "react";
import styled from "styled-components";

import { model } from "../api";

interface Props {
    sentence: model.SupportingSentence;
    target: model.Agent;
}

export const Sentence = ({ sentence, target }: Props) => {
    return (
        <div>
            “
            {sentence.spans.map(({ text, cui }, idx) => {
                const type =
                    cui == target.cui
                        ? MentionType.INTERACTING
                        : MentionType.SUBJECT;
                return (
                    <React.Fragment key={`${text}-${idx}`}>
                        {idx > 0 ? " " : null}
                        {cui ? (
                            <MentionedAgent type={type}>{text}</MentionedAgent>
                        ) : (
                            text
                        )}
                    </React.Fragment>
                );
            })}
            ” via{" "}
            <a href={`https://semanticscholar.org/paper/${sentence.paper_id}`}>
                this paper.
            </a>
        </div>
    );
};

enum MentionType {
    SUBJECT,
    INTERACTING
}

const MentionedAgent = styled.em<{ type: MentionType }>`
    padding: 1px 3px;
    font-style: normal;
    border-radius: 4px;
    color: ${({ type, theme }) =>
        type == MentionType.SUBJECT ? theme.color.B8 : theme.color.G8};
    background: ${({ type, theme }) =>
        type == MentionType.SUBJECT ? theme.color.B1 : theme.color.G1};
`;

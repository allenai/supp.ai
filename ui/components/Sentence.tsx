import React from "react";
import styled from "styled-components";

import { model } from "../api";

interface Props {
    sentence: model.SupportingSentence;
    agentsById: { [k: string]: model.Agent };
}

export const Sentence = ({ sentence, agentsById }: Props) => {
    return (
        <div>
            “
            {sentence.spans.map(({ text, cui }, idx) => {
                const maybeAgent = cui ? agentsById[cui] : undefined;
                return (
                    <React.Fragment key={`${text}-${idx}`}>
                        {idx > 0 ? " " : null}
                        {cui && maybeAgent ? (
                            <MentionedAgent agentType={maybeAgent.ent_type}>
                                {text}
                            </MentionedAgent>
                        ) : (
                            text
                        )}
                    </React.Fragment>
                );
            })}
            ”
        </div>
    );
};

const MentionedAgent = styled.em<{ agentType: model.AgentType }>`
    padding: 1px 3px;
    font-style: normal;
    border-radius: 4px;
    color: ${({ agentType, theme }) =>
        agentType == model.AgentType.DRUG ? theme.color.O6 : theme.color.G7};
    background: ${({ agentType, theme }) =>
        agentType == model.AgentType.DRUG ? theme.color.O1 : theme.color.G1};
`;

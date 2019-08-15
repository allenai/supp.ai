import { useState, Fragment } from "react";
import styled from "styled-components";
import { BodySmall } from "@allenai/varnish/components/typography";

import { model } from "../api";
import { AgentListItemContent } from "./AgentList";
import { Sentence } from "./Sentence";
import { PaperInfo } from "./PaperInfo";

interface Props {
    interaction: model.InteractingAgent;
}

export const EvidenceList = ({ interaction }: Props) => {
    const [showAll, toggleShowAll] = useState(false);

    const visibleEvidence = showAll
        ? interaction.evidence
        : interaction.evidence.slice(0, 3);
    const buttonText = showAll ? "Show Less" : "Show More";

    return (
        <Fragment>
            <div>
                {visibleEvidence.map(evidence => (
                    <Evidence key={evidence.paper.pid}>
                        {evidence.sentences.map(sentence => (
                            <AgentListItemContent
                                key={`${evidence.paper.pid}-${sentence.sentence_id}`}
                            >
                                <Sentence
                                    sentence={sentence}
                                    interactingAgent={interaction.agent}
                                />
                            </AgentListItemContent>
                        ))}
                        <PaperInfo paper={evidence.paper} />
                    </Evidence>
                ))}
            </div>
            {interaction.evidence.length > 3 ? (
                <BodySmall>
                    <ToggleShowAllButton
                        onClick={() => toggleShowAll(!showAll)}
                    >
                        {buttonText}
                    </ToggleShowAllButton>
                </BodySmall>
            ) : null}
        </Fragment>
    );
};

const ToggleShowAllButton = styled.a`
    display: block;
    background: transparent;
    padding: ${({ theme }) => theme.spacing.md};
    border-top: 1px solid ${({ theme }) => theme.palette.border.main};
    text-align: center;
`;

const Evidence = styled.div`
    margin: ${({ theme }) => theme.spacing.md} 0;
    padding: 0 0 ${({ theme }) => theme.spacing.md};
    border-bottom: 1px solid ${({ theme }) => theme.palette.border.main};

    &:first-child {
        border-top: 1px solid ${({ theme }) => theme.palette.border.main};
    }

    &:last-child {
        border-bottom: none;
        margin-bottom: 0;
    }
`;

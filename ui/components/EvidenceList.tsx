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
    const [visibleIdx, setVisibleIdx] = useState(3);
    const amountLeft = interaction.evidence.length - visibleIdx;
    const visibleEvidence = interaction.evidence.slice(0, visibleIdx);

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
            {amountLeft > 0 ? (
                <BodySmall>
                    <ToggleShowAllButton
                        onClick={() =>
                            setVisibleIdx(visibleIdx + Math.min(3, amountLeft))
                        }
                    >
                        Show More
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

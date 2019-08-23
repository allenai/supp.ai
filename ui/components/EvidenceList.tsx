import { useState, Fragment } from "react";
import styled from "styled-components";
import { BodySmall } from "@allenai/varnish/components/typography";

import { model } from "../api";
import { AgentListItemContent } from "./AgentList";
import { Sentence } from "./Sentence";
import { PaperInfo } from "./PaperInfo";

interface Props {
    agentsById: { [k: string]: model.Agent };
    evidence: model.Evidence[];
    sentencePageSize?: number;
}

export const EvidenceList = ({
    agentsById,
    evidence,
    sentencePageSize
}: Props) => {
    const pageSize = sentencePageSize !== undefined ? sentencePageSize : 3;
    const [visibleIdx, setVisibleIdx] = useState(pageSize);
    const amountLeft = evidence.length - visibleIdx;
    const visibleEvidence = evidence.slice(0, visibleIdx);

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
                                    agentsById={agentsById}
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
                            setVisibleIdx(
                                visibleIdx + Math.min(pageSize, amountLeft)
                            )
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

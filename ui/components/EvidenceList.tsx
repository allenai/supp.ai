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
    max?: number;
}

export const EvidenceList = ({
    agentsById,
    evidence,
    sentencePageSize,
    max
}: Props) => {
    const resolvedMax = max ? max : Infinity;
    const pageSize = sentencePageSize !== undefined ? sentencePageSize : 3;
    const [visibleIdx, setVisibleIdx] = useState(pageSize);
    const amountLeft = evidence.length - visibleIdx;
    const visibleEvidence = evidence.slice(
        0,
        Math.min(visibleIdx, resolvedMax)
    );

    return (
        <Fragment>
            <div>
                {visibleEvidence.map(evidence => (
                    <Evidence
                        key={evidence.paper.pid}
                        withBottomBorder={resolvedMax !== Infinity}
                    >
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
            {amountLeft > 0 && resolvedMax === Infinity ? (
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

const Evidence = styled.div<{ withBottomBorder?: boolean }>`
    margin: ${({ theme }) => theme.spacing.md} 0;
    padding: 0 0 ${({ theme }) => theme.spacing.md};
    border-bottom: 1px solid ${({ theme }) => theme.palette.border.main};

    &:first-child {
        border-top: 1px solid ${({ theme }) => theme.palette.border.main};
    }

    ${({ withBottomBorder, theme }) =>
        !withBottomBorder
            ? `&:last-child {
            border-bottom: none;
            margin-bottom: 0;
        }`
            : `&:last-child {
            margin-bottom: ${theme.spacing.lg};
        }`}
`;

import React from "react";
import styled from "styled-components";

import { model } from "../api";
import { pluralize } from "../util";
import {
    AgentList,
    AgentListItem,
    AgentListItemContent,
    AgentListItemTitle
} from "./AgentList";
import { WithAgentDefinitionPopover } from "./WithAgentDefinitionPopover";
import { AgentLink } from "./AgentLink";
import { Synonyms } from "./Synonyms";

interface Props {
    response: model.SearchResponse;
}

export const SearchResults = ({ response }: Props) => (
    <React.Fragment>
        <Summary total={response.total} />
        <AgentList>
            {response.results.map(result => (
                <AgentListItem key={result.agent.cui} agent={result.agent}>
                    <AgentListItemTitle>
                        <AgentLink agent={result.agent} query={response.query}>
                            <WithAgentDefinitionPopover agent={result.agent}>
                                {result.agent.preferred_name}
                            </WithAgentDefinitionPopover>
                        </AgentLink>
                        <InteractionCount>
                            {result.interacts_with_count}{" "}
                            {pluralize(
                                "Interaction",
                                result.interacts_with_count
                            )}
                        </InteractionCount>
                    </AgentListItemTitle>
                    <AgentListItemContent>
                        <Synonyms synonyms={result.agent.synonyms} />
                    </AgentListItemContent>
                    <AgentLink agent={result.agent} query={response.query}>
                        View {result.interacts_with_count}{" "}
                        {pluralize("Interaction", result.interacts_with_count)}
                    </AgentLink>
                </AgentListItem>
            ))}
        </AgentList>
    </React.Fragment>
);

const Summary = ({ total }: { total: number }) => {
    const label = pluralize(
        "supplement and/or drug",
        total,
        "supplements and/or drugs"
    );
    const text =
        total > 0
            ? `We found ${total} matching ${label}:`
            : "No matching agents";
    return <SummaryText>{text}</SummaryText>;
};

const SummaryText = styled.h3`
    font-family: ${({ theme }) => theme.typography.fontFamily};
    font-weight: 400;
`;

const InteractionCount = styled.div`
    margin-left: auto;
`;

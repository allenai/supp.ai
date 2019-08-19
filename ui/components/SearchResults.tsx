import React from "react";
import styled from "styled-components";
import { List } from "antd";
import { useRouter } from "next/router";
import { encode } from "querystring";

import { model } from "../api";
import { pluralize, formatNumber } from "../util";
import {
    AgentListItem,
    AgentListItemContent,
    AgentListItemTitle
} from "./AgentList";
import { WithAgentDefinitionPopover } from "./WithAgentDefinitionPopover";
import { AgentLink } from "./AgentLink";
import { Synonyms } from "./Synonyms";

/* Algolia, the backing search index, will return an accurate count of
   the number of matching results, but only allows up to 1,000 results to
   actually be retrieved. */
const MAX_ALGOLIA_RESULT_SIZE = 1000;

interface Props {
    response: model.SearchResponse;
}

export const SearchResults = ({ response }: Props) => {
    const router = useRouter();
    const onPageChanged = async (nextPage: number) => {
        await router.push(`/?${encode({ q: response.query.q, p: nextPage })}`);
        window.scrollTo(0, 0);
    };
    return (
        <React.Fragment>
            {response.total_results > 0 ? (
                <Summary total={response.total_results} />
            ) : null}
            <List
                pagination={{
                    // Algolia's pagination API is zero-indexed, while the
                    // Antd pagination control starts at 1, so we offset this
                    // value by one
                    current: response.query.p + 1,
                    total: Math.min(
                        MAX_ALGOLIA_RESULT_SIZE,
                        response.total_results
                    ),
                    onChange: onPageChanged,
                    pageSize: response.num_per_page,
                    hideOnSinglePage: true
                }}
                bordered={false}
                dataSource={response.results}
                renderItem={agent => (
                    <AgentListItem key={agent.cui} agent={agent}>
                        <AgentListItemTitle>
                            <AgentLink agent={agent} query={response.query}>
                                <WithAgentDefinitionPopover agent={agent}>
                                    {agent.preferred_name}
                                </WithAgentDefinitionPopover>
                            </AgentLink>
                            <InteractionCount>
                                {formatNumber(agent.interacts_with_count)}{" "}
                                {pluralize(
                                    "Interaction",
                                    agent.interacts_with_count
                                )}
                            </InteractionCount>
                        </AgentListItemTitle>
                        {agent.synonyms.length > 0 ? (
                            <AgentListItemContent>
                                <Synonyms synonyms={agent.synonyms} />
                            </AgentListItemContent>
                        ) : null}
                        <AgentLink agent={agent} query={response.query}>
                            View {agent.interacts_with_count}{" "}
                            {pluralize(
                                "Interaction",
                                agent.interacts_with_count
                            )}
                        </AgentLink>
                    </AgentListItem>
                )}
            />
        </React.Fragment>
    );
};

const Summary = ({ total }: { total: number }) => {
    const label = pluralize(
        "supplement and/or drug",
        total,
        "supplements and/or drugs"
    );
    return (
        <SummaryText>
            We found {formatNumber(total)} matching {label}:
        </SummaryText>
    );
};

const SummaryText = styled.h3`
    font-family: ${({ theme }) => theme.typography.fontFamily};
    font-weight: 400;
`;

const InteractionCount = styled.div`
    margin-left: auto;
`;

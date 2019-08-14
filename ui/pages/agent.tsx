import React from "react";
import styled from "styled-components";
import { DocumentContext } from "next/document";

import { fetchAgent, fetchIndexMeta, model } from "../api";
import {
    AgentList,
    AgentListItem,
    AgentListItemContent,
    AgentListItemTitle,
    AgentLink,
    DefaultLayout,
    SearchForm,
    Sentence,
    PaperInfo,
    WithAgentDefinitionPopover,
    Synonyms
} from "../components";
import { pluralize, formatNumber } from "../util";

interface Props {
    agent: model.Agent;
    meta: model.IndexMeta;
    defaultQueryText?: string;
    interacts_with: model.InteractingAgent[];
    interacts_with_count: number;
}

export default class AgentDetail extends React.PureComponent<Props> {
    static async getInitialProps({ query }: DocumentContext): Promise<Props> {
        const cui = Array.isArray(query.cui) ? query.cui.shift() : query.cui;
        if (cui === undefined) {
            // TODO: Handle this.
            throw new Error("CUI must be set.");
        }
        const [searchResp, meta] = await Promise.all([
            fetchAgent(cui),
            fetchIndexMeta()
        ]);
        return {
            ...searchResp,
            meta,
            defaultQueryText: SearchForm.queryTextFromQueryString(query)
        };
    }
    render() {
        return (
            <DefaultLayout>
                <SearchForm
                    meta={this.props.meta}
                    defaultQueryText={this.props.defaultQueryText}
                    autoFocus={false}
                />
                <Section>
                    <AgentName>
                        <WithAgentDefinitionPopover agent={this.props.agent}>
                            {this.props.agent.preferred_name}
                        </WithAgentDefinitionPopover>
                    </AgentName>
                    <Synonyms synonyms={this.props.agent.synonyms} />
                </Section>
                <Section>
                    <h3>
                        {formatNumber(this.props.interacts_with_count)}{" "}
                        {pluralize(
                            "Interaction",
                            this.props.interacts_with_count
                        )}
                        :
                    </h3>
                    <AgentList>
                        {this.props.interacts_with.map(interaction => (
                            <AgentListItem
                                key={`${interaction.agent.cui}`}
                                agent={interaction.agent}
                            >
                                <AgentListItemTitle>
                                    <AgentLink agent={interaction.agent}>
                                        <WithAgentDefinitionPopover
                                            agent={interaction.agent}
                                        >
                                            {interaction.agent.preferred_name}
                                        </WithAgentDefinitionPopover>
                                    </AgentLink>
                                </AgentListItemTitle>
                                {interaction.evidence.map(evidence => (
                                    <Evidence key={evidence.paper.pid}>
                                        {evidence.sentences.map(sentence => (
                                            <AgentListItemContent
                                                key={`${evidence.paper.pid}-${sentence.sentence_id}`}
                                            >
                                                <Sentence
                                                    sentence={sentence}
                                                    target={interaction.agent}
                                                />
                                            </AgentListItemContent>
                                        ))}
                                        <PaperInfo paper={evidence.paper} />
                                    </Evidence>
                                ))}
                            </AgentListItem>
                        ))}
                    </AgentList>
                </Section>
            </DefaultLayout>
        );
    }
}

const Evidence = styled.div`
    margin: ${({ theme }) => theme.spacing.md} 0;
    padding: 0 0 ${({ theme }) => theme.spacing.md};
    border-bottom: 1px solid ${({ theme }) => theme.palette.border.main};

    &:last-child {
        border-bottom: none;
        padding-bottom: 0;
        margin-bottom: 0;
    }
`;

const AgentName = styled.h1`
    margin: 0;
`;

const Section = styled.section`
    margin: 0 0 ${({ theme }) => theme.spacing.lg};
`;

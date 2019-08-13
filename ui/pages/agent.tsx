import React from "react";
import styled from "styled-components";
import { DocumentContext } from "next/document";

import { fetchAgent, model } from "../api";
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
import { pluralize } from "../util";

interface Props {
    agent: model.Agent;
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
        const resp = await fetchAgent(cui);
        return {
            ...resp,
            defaultQueryText: SearchForm.queryTextFromQueryString(query)
        };
    }
    render() {
        return (
            <DefaultLayout>
                <SearchForm defaultQueryText={this.props.defaultQueryText} />
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
                        {this.props.interacts_with_count}{" "}
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
    text-transform: capitalize;
    margin: 0;
`;

const Section = styled.section`
    margin: 0 0 ${({ theme }) => theme.spacing.lg};
`;

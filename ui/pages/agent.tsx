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
                                {interaction.sentences.map(sentence => (
                                    <AgentListItemContent>
                                        <Sentence
                                            sentence={sentence}
                                            target={interaction.agent}
                                        />
                                    </AgentListItemContent>
                                ))}
                            </AgentListItem>
                        ))}
                    </AgentList>
                </Section>
            </DefaultLayout>
        );
    }
}

const AgentName = styled.h1`
    text-transform: capitalize;
`;

const Section = styled.section`
    margin: 0 0 ${({ theme }) => theme.spacing.lg};
`;

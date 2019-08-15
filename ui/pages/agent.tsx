import React from "react";
import styled from "styled-components";
import { DocumentContext } from "next/document";
import Head from "next/head";

import { fetchAgent, fetchIndexMeta, model } from "../api";
import {
    AgentList,
    AgentListItem,
    AgentListItemTitle,
    AgentListItemContent,
    AgentLink,
    DefaultLayout,
    SearchForm,
    WithAgentDefinitionPopover,
    EvidenceList,
    Synonyms,
    hasDismissedDisclaimer
} from "../components";
import { pluralize, formatNumber } from "../util";

interface Props {
    agent: model.Agent;
    meta: model.IndexMeta;
    defaultQueryText?: string;
    interacts_with: model.InteractingAgent[];
    interacts_with_count: number;
    hideDisclaimer: boolean;
}

export default class AgentDetail extends React.PureComponent<Props> {
    static async getInitialProps(context: DocumentContext): Promise<Props> {
        const { query } = context;
        const cui = Array.isArray(query.cui) ? query.cui.shift() : query.cui;
        if (cui === undefined) {
            // TODO: Handle this.
            throw new Error("CUI must be set.");
        }
        const [searchResp, meta] = await Promise.all([
            fetchAgent(cui),
            fetchIndexMeta()
        ]);
        const hideDisclaimer = hasDismissedDisclaimer(context);
        return {
            ...searchResp,
            meta,
            hideDisclaimer,
            defaultQueryText: SearchForm.queryTextFromQueryString(query)
        };
    }
    render() {
        return (
            <DefaultLayout>
                <Head>
                    <title>
                        {this.props.agent.preferred_name} - SUPP.AI by AI2
                    </title>
                </Head>
                <SearchForm
                    meta={this.props.meta}
                    defaultQueryText={this.props.defaultQueryText}
                    autoFocus={false}
                    hideDisclaimer={this.props.hideDisclaimer}
                />
                <Section>
                    <AgentName>
                        <WithAgentDefinitionPopover agent={this.props.agent}>
                            {this.props.agent.preferred_name}
                        </WithAgentDefinitionPopover>
                    </AgentName>
                    {this.props.agent.synonyms.length > 0 ? (
                        <Synonyms synonyms={this.props.agent.synonyms} />
                    ) : null}
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
                                {interaction.agent.synonyms.length > 0 ? (
                                    <AgentListItemContent>
                                        <Synonyms
                                            synonyms={
                                                interaction.agent.synonyms
                                            }
                                        />
                                    </AgentListItemContent>
                                ) : null}
                                <EvidenceList interaction={interaction} />
                            </AgentListItem>
                        ))}
                    </AgentList>
                </Section>
            </DefaultLayout>
        );
    }
}

const AgentName = styled.h1`
    margin: 0 0 ${({ theme }) => theme.spacing.sm};
`;

const Section = styled.section`
    margin: 0 0 ${({ theme }) => theme.spacing.lg};
`;

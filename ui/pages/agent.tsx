import React from "react";
import styled from "styled-components";
import { DocumentContext } from "next/document";
import Head from "next/head";
import Router from "next/router";
import { List } from "antd";
import { encode } from "querystring";

import { fetchAgent, fetchIndexMeta, model, fetchInteractions } from "../api";
import {
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
    interactionsPage: model.InteractionsPage;
    hideDisclaimer: boolean;
}

export default class AgentDetail extends React.PureComponent<Props> {
    static async getInitialProps(context: DocumentContext): Promise<Props> {
        if (Array.isArray(context.query.cui)) {
            throw new Error("Invalid CUI.");
        }
        const maybeQuery = SearchForm.queryFromQueryString(context.query);
        const { cui } = context.query;
        if (cui === undefined) {
            throw new Error("CUI must be set.");
        }
        const [agent, interactionsPage, meta] = await Promise.all([
            fetchAgent(cui),
            fetchInteractions(cui, maybeQuery ? maybeQuery.p : 0),
            fetchIndexMeta()
        ]);
        const hideDisclaimer = hasDismissedDisclaimer(context);
        return {
            agent,
            interactionsPage,
            meta,
            hideDisclaimer,
            defaultQueryText: maybeQuery ? maybeQuery.q : undefined
        };
    }
    render() {
        const onInteractionPageChanged = async (p: number) => {
            const { slug, cui } = this.props.agent;
            await Router.push(
                `/agent?${encode({ slug, cui, p })}`,
                `/a/${slug}/${cui}?${encode({ p })}`
            );
            window.scrollTo(0, 0);
        };
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
                        {formatNumber(this.props.agent.interacts_with_count)}{" "}
                        {pluralize(
                            "Interaction",
                            this.props.agent.interacts_with_count
                        )}
                        :
                    </h3>
                    <List
                        pagination={{
                            current: this.props.interactionsPage.page,
                            total: this.props.agent.interacts_with_count,
                            onChange: onInteractionPageChanged,
                            pageSize: this.props.interactionsPage
                                .interactions_per_page,
                            hideOnSinglePage: true
                        }}
                        dataSource={this.props.interactionsPage.interactions}
                        renderItem={interaction => (
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
                        )}
                    />
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

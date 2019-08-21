import React from "react";
import styled from "styled-components";
import { DocumentContext } from "next/document";
import Head from "next/head";
import Router from "next/router";
import { Icon, List } from "antd";
import { encode } from "querystring";

import { fetchAgent, fetchIndexMeta, model, fetchInteractions } from "../api";
import {
    AgentListItem,
    AgentListItemTitle,
    AgentListItemContent,
    DefaultLayout,
    SearchForm,
    WithAgentDefinitionPopover,
    EvidenceList,
    Disclaimer,
    Synonyms,
    PageHeader,
    icon
} from "../components";
import { pluralize, formatNumber } from "../util";

interface Props {
    agent: model.Agent;
    origin: string;
    meta: model.IndexMeta;
    defaultQueryText?: string;
    interactionsPage: model.InteractionsPage;
}

interface State {
    expandedInteractionIds: { [k: string]: boolean };
}

export default class AgentDetail extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { expandedInteractionIds: {} };
    }
    static async getInitialProps(
        context: DocumentContext
    ): Promise<Props | undefined> {
        if (Array.isArray(context.query.cui)) {
            throw new Error("Invalid CUI.");
        }
        const { cui, slug } = context.query;
        if (cui === undefined) {
            throw new Error("CUI must be set.");
        }
        const maybeQuery = SearchForm.queryFromQueryString(context.query);
        const [agent, interactionsPage, meta] = await Promise.all([
            fetchAgent(cui),
            fetchInteractions(cui, maybeQuery ? maybeQuery.p : 0),
            fetchIndexMeta()
        ]);
        if (agent.slug !== slug) {
            const canonicalUrl = `/a/${agent.slug}/${agent.cui}`;
            if (context.res) {
                context.res.writeHead(301, { Location: canonicalUrl });
                context.res.end();
            } else {
                Router.push(canonicalUrl);
            }
            return;
        }
        const isClient = typeof window !== "undefined";
        const origin = !isClient
            ? process.env.SUPP_AI_CANONICAL_ORIGIN
            : document.location.origin;
        if (!origin) {
            throw new Error(
                "Invalid environment, missing SUPP_AI_CANONICAL_ORIGIN."
            );
        }
        return {
            agent,
            interactionsPage,
            meta,
            origin,
            defaultQueryText: maybeQuery ? maybeQuery.q : undefined
        };
    }
    onInteractionPageChanged = async (p: number) => {
        const { slug, cui } = this.props.agent;
        await Router.push(
            `/agent?${encode({ slug, cui, p })}`,
            `/a/${slug}/${cui}?${encode({ p })}`
        );
        window.scrollTo(0, 0);
    };
    render() {
        const canonicalUrl = `${this.props.origin}/a/${this.props.agent.slug}/${this.props.agent.cui}`;
        let interactionLabel = null;
        switch (this.props.agent.ent_type) {
            case model.AgentType.SUPPLEMENT:
                interactionLabel = " drug ";
                break;
            case model.AgentType.DRUG:
                interactionLabel = " supplement ";
                break;
        }
        return (
            <DefaultLayout>
                <Head>
                    <title>
                        {this.props.agent.preferred_name} - SUPP.AI by AI2
                    </title>
                    <link rel="canonical" href={canonicalUrl} />
                </Head>
                <Disclaimer />
                <SearchForm
                    meta={this.props.meta}
                    defaultQueryText={this.props.defaultQueryText}
                    autoFocus={false}
                    autocomplete
                />
                <Section>
                    <AgentType>{this.props.agent.ent_type}:</AgentType>
                    <AgentName>
                        <icon.AgentTypeIcon type={this.props.agent.ent_type} />
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
                        {interactionLabel}
                        {pluralize(
                            "interaction",
                            this.props.agent.interacts_with_count
                        )}
                        :
                    </h3>
                    <List
                        pagination={{
                            current: this.props.interactionsPage.page,
                            total: this.props.agent.interacts_with_count,
                            onChange: this.onInteractionPageChanged,
                            pageSize: this.props.interactionsPage
                                .interactions_per_page,
                            hideOnSinglePage: true
                        }}
                        dataSource={this.props.interactionsPage.interactions}
                        renderItem={interaction => {
                            const isExpanded =
                                this.state.expandedInteractionIds[
                                    interaction.interaction_id
                                ] === true;
                            return (
                                <AgentListItem
                                    key={`${interaction.agent.cui}`}
                                    agent={interaction.agent}
                                >
                                    <AgentListItemTitle>
                                        <WithAgentDefinitionPopover
                                            agent={interaction.agent}
                                        >
                                            {interaction.agent.preferred_name}
                                        </WithAgentDefinitionPopover>
                                        <ToggleDetailsButton
                                            onClick={() => {
                                                let delta: {
                                                    [k: string]: boolean;
                                                } = {};
                                                delta[
                                                    interaction.interaction_id
                                                ] = !isExpanded;
                                                this.setState({
                                                    expandedInteractionIds: {
                                                        ...this.state
                                                            .expandedInteractionIds,
                                                        ...delta
                                                    }
                                                });
                                            }}
                                        >
                                            <Icon
                                                type={
                                                    isExpanded
                                                        ? "minus"
                                                        : "plus"
                                                }
                                            ></Icon>
                                        </ToggleDetailsButton>
                                    </AgentListItemTitle>
                                    {isExpanded ? (
                                        <React.Fragment>
                                            {interaction.agent.synonyms.length >
                                            0 ? (
                                                <AgentListItemContent>
                                                    <Synonyms
                                                        synonyms={
                                                            interaction.agent
                                                                .synonyms
                                                        }
                                                    />
                                                </AgentListItemContent>
                                            ) : null}
                                            <EvidenceList
                                                interaction={interaction}
                                            />
                                        </React.Fragment>
                                    ) : null}
                                </AgentListItem>
                            );
                        }}
                    />
                </Section>
            </DefaultLayout>
        );
    }
}

const AgentType = styled.div`
    font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
    text-transform: uppercase;
`;

const AgentName = styled(PageHeader)`
    margin: 0 0 ${({ theme }) => theme.spacing.xs};
    display: grid;
    grid-template-columns: min-content auto;
    grid-gap: ${({ theme }) => theme.spacing.sm};
    align-items: center;
    line-height: 1.2;
`;

const Section = styled.section`
    margin: 0 0 ${({ theme }) => theme.spacing.lg};
`;

const ToggleDetailsButton = styled.button`
    &&& {
        appearance: none;
        border: 1px solid ${({ theme }) => theme.palette.border.dark};
        cursor: pointer;
        width: 30px;
        height: 30px;
        text-align: center;
        padding: 0;
        font-size: 18px;
        border-radius: none;
        line-height: 30px;
        margin-left: auto;
    }
`;

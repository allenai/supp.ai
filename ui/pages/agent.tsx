import React from "react";
import styled from "styled-components";
import { DocumentContext } from "next/document";
import Head from "next/head";
import Router from "next/router";
import Link from "next/link";
import { Icon, List, Radio } from "antd";
import { RadioChangeEvent } from "antd/lib/radio";
import { encode } from "querystring";
import { Input } from "@allenai/varnish/components/form";

import { fetchAgent, fetchIndexMeta, model, fetchInteractions } from "../api";
import {
    ShareButtons,
    AgentListItem,
    AgentListItemTitle,
    AgentListItemContent,
    DefaultLayout,
    SearchForm,
    WithAgentDefinitionPopover,
    EvidenceList,
    Disclaimer,
    Synonyms,
    Tradenames,
    AgentInfo,
    Section
} from "../components";
import { pluralize, formatNumber, debounce } from "../util";

interface Props {
    agent: model.Agent;
    origin: string;
    canonicalUrl: string;
    meta: model.IndexMeta;
    defaultQueryText?: string;
    defaultInteractionQueryText?: string;
    interactionsPage: model.InteractionsPage;
}

enum ToggleAllState {
    EXPAND_ALL,
    COLLAPSE_ALL
}

interface State {
    expandedInteractionIds: { [k: string]: boolean };
    toggleState: ToggleAllState;
}

export default class AgentDetail extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            expandedInteractionIds: {},
            toggleState: ToggleAllState.COLLAPSE_ALL
        };
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
        const interactionsQuery = context.query.iq
            ? Array.isArray(context.query.iq)
                ? context.query.iq[0]
                : context.query.iq
            : undefined;
        const [agent, interactionsPage, meta] = await Promise.all([
            fetchAgent(cui),
            fetchInteractions(
                cui,
                maybeQuery ? maybeQuery.p : 0,
                interactionsQuery
            ),
            fetchIndexMeta()
        ]);
        const isClient = typeof window !== "undefined";
        const origin = !isClient
            ? process.env.SUPP_AI_CANONICAL_ORIGIN
            : document.location.origin;
        if (!origin) {
            throw new Error(
                "Invalid environment, missing SUPP_AI_CANONICAL_ORIGIN."
            );
        }
        const canonicalUrl = `/a/${agent.slug}/${agent.cui}`;
        if (agent.slug !== slug) {
            if (context.res) {
                context.res.writeHead(301, { Location: canonicalUrl });
                context.res.end();
            } else {
                Router.push(canonicalUrl);
            }
            return;
        }
        return {
            agent,
            interactionsPage,
            meta,
            origin,
            canonicalUrl,
            defaultQueryText: maybeQuery ? maybeQuery.q : undefined,
            defaultInteractionQueryText: interactionsQuery
        };
    }
    onInteractionPageChanged = async (p: number) => {
        const { slug, cui } = this.props.agent;
        const q = this.props.defaultQueryText;
        const iq = this.props.defaultInteractionQueryText;
        await Router.push(
            `/agent?${encode({ slug, cui, p, q, iq })}`,
            `/a/${slug}/${cui}?${encode({ p, q, iq })}`
        );
        window.scrollTo(0, 0);
    };
    onToggleAllChange = (event: RadioChangeEvent) => {
        const toggleState: ToggleAllState = event.target.value;
        const expandedInteractionIds: { [k: string]: boolean } = {};
        switch (toggleState) {
            case ToggleAllState.EXPAND_ALL:
                this.props.interactionsPage.interactions.forEach(intr => {
                    expandedInteractionIds[intr.interaction_id] = true;
                });
                break;
            case ToggleAllState.COLLAPSE_ALL:
                break;
        }
        this.setState({ expandedInteractionIds, toggleState });
    };
    onInteractionsQueryChange = debounce((query: string) => {
        const { slug, cui } = this.props.agent;
        const p = 1;
        const q = this.props.defaultQueryText;
        const iq = query;
        Router.push(
            `/agent?${encode({ slug, cui, p, q, iq })}`,
            `/a/${slug}/${cui}?${encode({ p, q, iq })}`
        );
    });
    render() {
        const canonicalUrl = `${this.props.origin}${this.props.canonicalUrl}`;
        let interactionLabel =
            this.props.agent.ent_type === model.AgentType.SUPPLEMENT
                ? "drugs"
                : "supplements";
        let interactionLabelAgentPage =
            this.props.agent.ent_type === model.AgentType.SUPPLEMENT
                ? "drugs and supplements"
                : "supplements";
        const description =
            `Explore the ${formatNumber(
                this.props.agent.interacts_with_count
            )} ` +
            `possible ${interactionLabel} ${pluralize(
                "interaction",
                this.props.agent.interacts_with_count
            )} ` +
            `for ${this.props.agent.preferred_name} and the research papers that ` +
            "mention these interactions.";
        return (
            <DefaultLayout>
                <Head>
                    <title>
                        {this.props.agent.preferred_name} - SUPP.AI by AI2
                    </title>
                    <link rel="canonical" href={canonicalUrl} />
                    <meta name="description" content={description} />
                </Head>
                <Disclaimer />
                <Section>
                    <SearchForm
                        meta={this.props.meta}
                        defaultQueryText={this.props.defaultQueryText}
                    />
                </Section>
                <Section>
                    <ShareButtonsBox>
                        <ShareButtons
                            link={canonicalUrl}
                            twitterMessage={description}
                        />
                    </ShareButtonsBox>
                    <AgentInfo agent={this.props.agent} />
                </Section>
                <Section>
                    {this.props.agent.interacts_with_count > 0 ? (
                        <InteractionListTitle>
                            {formatNumber(
                                this.props.agent.interacts_with_count
                            )}
                            {" possible "}
                            {pluralize(
                                "interaction",
                                this.props.agent.interacts_with_count
                            )}
                            {` between ${this.props.agent.preferred_name} and the following ${interactionLabelAgentPage}`}
                            :
                        </InteractionListTitle>
                    ) : (
                        <InteractionListTitle>
                            No interactions found.
                        </InteractionListTitle>
                    )}
                    <Controls>
                        <Input
                            size="small"
                            placeholder="Filter interactions…"
                            defaultValue={
                                this.props.defaultInteractionQueryText
                            }
                            onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                            ) => {
                                const text = event.currentTarget.value.trim();
                                this.onInteractionsQueryChange(text);
                            }}
                        />
                        <Group
                            size="large"
                            value={this.state.toggleState}
                            onChange={this.onToggleAllChange}
                        >
                            <Radio.Button value={ToggleAllState.EXPAND_ALL}>
                                Expand
                            </Radio.Button>
                            <Radio.Button value={ToggleAllState.COLLAPSE_ALL}>
                                Collapse
                            </Radio.Button>
                        </Group>
                    </Controls>
                    <List
                        pagination={{
                            current: this.props.interactionsPage.page,
                            total: this.props.interactionsPage.total,
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
                            const agentsById = [
                                this.props.agent,
                                interaction.agent
                            ].reduce(
                                (byId, agent) => {
                                    byId[agent.cui] = agent;
                                    return byId;
                                },
                                {} as { [k: string]: model.Agent }
                            );
                            const evidenceCount = interaction.evidence.length;
                            return (
                                <AgentListItem
                                    key={`${interaction.agent.cui}`}
                                    agent={interaction.agent}
                                >
                                    <AgentListItemTitle>
                                        <Link
                                            as={`/i/${interaction.slug}/${interaction.interaction_id}`}
                                            href={`/interaction?${encode({
                                                slug: interaction.slug,
                                                interaction_id:
                                                    interaction.interaction_id
                                            })}`}
                                        >
                                            <a>
                                                <WithAgentDefinitionPopover
                                                    agent={interaction.agent}
                                                >
                                                    {
                                                        interaction.agent
                                                            .preferred_name
                                                    }
                                                </WithAgentDefinitionPopover>
                                            </a>
                                        </Link>
                                        <FlexRight>
                                            <PaperCount>
                                                {formatNumber(evidenceCount)}{" "}
                                                {pluralize(
                                                    "Paper",
                                                    evidenceCount
                                                )}
                                            </PaperCount>
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
                                        </FlexRight>
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
                                                    <Tradenames
                                                        tradenames={
                                                            interaction.agent
                                                                .tradenames
                                                        }
                                                    />
                                                </AgentListItemContent>
                                            ) : null}
                                            <EvidenceList
                                                agentsById={agentsById}
                                                evidence={interaction.evidence}
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

const PaperCount = styled.div`
    color: ${({ theme }) => theme.color.N6};
    white-space: nowrap;
    font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
`;

const FlexRight = styled.div`
    display: flex;
    align-items: center;
    margin-left: auto;
    padding-left: ${({ theme }) => theme.spacing.md};
`;

const ToggleDetailsButton = styled.button`
    &&& {
        appearance: none;
        background: #fff;
        border: 1px solid ${({ theme }) => theme.palette.border.dark};
        cursor: pointer;
        width: 30px;
        height: 30px;
        text-align: center;
        padding: 0;
        font-size: 18px;
        border-radius: none;
        line-height: 30px;
        margin-left: ${({ theme }) => theme.spacing.md};
    }
`;

const Controls = styled.div`
    display: grid;
    align-items: flex-end;
    grid-template-columns: auto min-content;
    grid-gap: ${({ theme }) => theme.spacing.lg};

    @media screen and (max-width: 640px) {
        grid-template-columns: auto;
    }
`;

const Group = styled(Radio.Group)`
    display: grid;
    grid-template-columns: repeat(2, auto);

    label {
        padding: ${({ theme }) => `${theme.spacing.sm} ${theme.spacing.md}`};
        font-size: ${({ theme }) => theme.typography.body.fontSize};
        line-height: 1 !important;
        height: auto !important;
        font-weight: 700 !important;
        text-align: center;
    }
`;

const ShareButtonsBox = styled.div`
    display: flex;
    justify-content: flex-end;
    margin: 0 0 ${({ theme }) => theme.spacing.md};
`;

const InteractionListTitle = styled.h3``;

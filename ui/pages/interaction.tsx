import React from "react";
import { DocumentContext } from "next/document";
import Head from "next/head";
import Router from "next/router";
import styled from "styled-components";

import {
    Disclaimer,
    DefaultLayout,
    SearchForm,
    PageHeader,
    EvidenceList,
    Section,
    AgentInfo,
    ShareButtons
} from "../components";
import { model, fetchIndexMeta, fetchInteraction } from "../api";
import { formatNumber, pluralize } from "../util";

interface Props {
    meta: model.IndexMeta;
    canonicalUrl: string;
    origin: string;
    interaction: model.InteractionDefinition;
}

export default class InteractionDetail extends React.PureComponent<Props> {
    static async getInitialProps({
        query,
        res
    }: DocumentContext): Promise<Props | undefined> {
        if (!query.interaction_id || Array.isArray(query.interaction_id)) {
            throw new Error("Invalid interaction id.");
        }
        if (!query.slug || Array.isArray(query.slug)) {
            throw new Error("Invalid slug.");
        }
        const [meta, interaction] = await Promise.all([
            fetchIndexMeta(),
            fetchInteraction(query.interaction_id)
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
        const canonicalUrl = `/i/${interaction.slug}/${interaction.interaction_id}`;
        if (query.slug !== interaction.slug) {
            if (res) {
                res.writeHead(301, { Location: canonicalUrl });
                res.end();
            } else {
                Router.push(canonicalUrl);
            }
            return;
        }
        return { meta, interaction, origin, canonicalUrl };
    }
    render() {
        const [first, second] = this.props.interaction.agents;
        const description =
            `Explore the ${formatNumber(
                this.props.interaction.evidence.length
            )} ` +
            `${pluralize("paper", this.props.interaction.evidence.length)} ` +
            `that mention a possible interaction between ${first.preferred_name} ` +
            `and ${second.preferred_name}.`;
        return (
            <DefaultLayout>
                <Head>
                    <title>
                        Possible Interaction: {first.preferred_name} and{" "}
                        {second.preferred_name} - SUPP.AI by AI2
                    </title>
                    <meta name="description" content={description} />
                </Head>
                <Disclaimer />
                <SearchForm meta={this.props.meta} autoFocus={false} />
                <Section>
                    <TitleRow>
                        <PageHeaderWithNoMargin>
                            Possible Interaction: {first.preferred_name} and{" "}
                            {second.preferred_name}
                        </PageHeaderWithNoMargin>
                        <ShareButtons
                            twitterMessage={description}
                            link={`${this.props.origin}${this.props.canonicalUrl}`}
                        />
                    </TitleRow>
                </Section>
                <Section>
                    <AgentInfoList>
                        <AgentInfoListItem>
                            <AgentInfo
                                agent={first}
                                headerTag="h2"
                                link
                                hideSyononyms
                            />
                        </AgentInfoListItem>
                        <AgentInfoListItem>
                            <AgentInfo
                                agent={second}
                                headerTag="h2"
                                link
                                hideSyononyms
                            />
                        </AgentInfoListItem>
                    </AgentInfoList>
                </Section>
                <h3>Research Papers that Mention the Interaction</h3>
                <EvidenceList
                    interaction={{
                        interaction_id: this.props.interaction.interaction_id,
                        slug: this.props.interaction.slug,
                        agent: second,
                        evidence: this.props.interaction.evidence
                    }}
                    sentencePageSize={10}
                />
            </DefaultLayout>
        );
    }
}

const PageHeaderWithNoMargin = styled(PageHeader)`
    margin: 0;
`;

const TitleRow = styled.div`
    display: grid;
    align-items: baseline;
    grid-gap: ${({ theme }) => theme.spacing.xs};
    grid-template-columns: auto min-content;
`;

const AgentInfoList = styled.div`
    display: grid;
    grid-gap: ${({ theme }) => theme.spacing.lg};
    grid-template-columns: 1fr 1fr;
    margin: 0 0 ${({ theme }) => theme.spacing.xxl};

    @media screen and (max-width: 640px) {
        grid-template-columns: auto;
    }
`;

const AgentInfoListItem = styled.div`
    padding: ${({ theme }) => theme.spacing.md};
    border-radius: 4px;
    border: 1px solid ${({ theme }) => theme.palette.border.main};
`;

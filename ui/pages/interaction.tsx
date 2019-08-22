import React from "react";
import { DocumentContext } from "next/document";
import Head from "next/head";
import Router from "next/router";

import {
    Disclaimer,
    DefaultLayout,
    SearchForm,
    PageHeader,
    EvidenceList,
    Section,
    AgentInfo
} from "../components";
import { model, fetchIndexMeta, fetchInteraction } from "../api";

interface Props {
    meta: model.IndexMeta;
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
        if (query.slug !== interaction.slug) {
            const canonicalUrl = `/i/${interaction.slug}/${interaction.interaction_id}`;
            if (res) {
                res.writeHead(301, { Location: canonicalUrl });
                res.end();
            } else {
                Router.push(canonicalUrl);
            }
            return;
        }
        return { meta, interaction };
    }
    render() {
        const [first, second] = this.props.interaction.agents;
        return (
            <DefaultLayout>
                <Head>
                    <title>
                        Possible Interaction: {first.preferred_name} and{" "}
                        {second.preferred_name} - SUPP.AI by AI2
                    </title>
                </Head>
                <Disclaimer />
                <SearchForm meta={this.props.meta} autoFocus={true} />
                <Section>
                    <PageHeader>
                        Possible Interaction: {first.preferred_name} and{" "}
                        {second.preferred_name}
                    </PageHeader>
                </Section>
                <h3>Details</h3>
                <Section>
                    <AgentInfo agent={first} headerTag="h2" link />
                </Section>
                <Section>
                    <AgentInfo agent={second} headerTag="h2" link />
                </Section>
                <h3>Mentions in Research Papers</h3>
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

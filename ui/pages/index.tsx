import React from "react";
import Head from "next/head";
import styled from "styled-components";

import { model, fetchIndexMeta } from "../api";
import {
    Disclaimer,
    SearchForm,
    DefaultLayout,
    Feedback,
    Section
} from "../components";
import { AuthorList } from "../components/AuthorList";

import { formatNumber } from "../util";

interface Props {
    meta: model.IndexMeta;
}

export default class Home extends React.PureComponent<Props> {
    static async getInitialProps(): Promise<Props> {
        const meta = await fetchIndexMeta();
        return { meta };
    }
    render() {
        const title = "SUPP.AI by AI2";
        /* TODO: Query agent count by type. */
        const description =
            "Search our AI curated corpus of " +
            `${formatNumber(this.props.meta.supp_count)} supplements, ` +
            `${formatNumber(this.props.meta.drug_count)} drugs and ` +
            `${formatNumber(this.props.meta.interaction_count)} ` +
            "interactions and explore the related research. Our work " +
            "is not influenced by third parties. Supp.AI is a free service " +
            "of the non-profit";
        return (
            <DefaultLayout hideFeedback={true} hideSubtitle={true}>
                <Head>
                    <title>{title}</title>
                    <meta name="description" content={description} />
                </Head>
                <Section>
                    <H1>Discover Supplement-Drug Interactions</H1>
                    <p>
                        {description}{" "}
                        <a href="https://allenai.org">Allen Institute for AI</a>
                        .
                    </p>
                    <Disclaimer />
                </Section>
                <Section>
                    <H2>Search</H2>
                    <SearchForm meta={this.props.meta} autofocus={true} />
                    <Feedback />
                </Section>
                <Section>
                    <H2>About</H2>
                    <p>
                        Dietary and herbal supplements are popular but
                        unregulated. Supplements can interact or interfere with
                        the action of prescription or over-the-counter
                        medications. Currently, it is difficult to find accurate
                        and timely scientific evidence for these interactions.
                    </p>
                    <p>
                        To solve this problem, Supp.AI automatically extracts
                        evidence of supplement and drug interactions from the
                        scientific literature and presents them here.
                    </p>
                    <p>
                        To find out more about this work, please read{" "}
                        <a href="https://arxiv.org/abs/1909.08135">
                            our publication
                        </a>
                        .
                    </p>
                </Section>
                <Section>
                    <H2>Data & API</H2>
                    <p>
                        Our dataset is public and available for download{" "}
                        <a href="https://api.semanticscholar.org/supp/legal/">
                            here
                        </a>
                        . An API is also available <a href="docs/api">here</a>{" "}
                        for automated data access.
                    </p>
                </Section>
                <Section>
                    <H2>Team</H2>
                    <AuthorList />
                </Section>
            </DefaultLayout>
        );
    }
}

const H1 = styled.h1`
    font-size: ${({ theme }) => theme.typography.h2.fontSize};
    line-height: ${({ theme }) => theme.typography.h2.lineHeight};
`;

const H2 = styled.h2`
    font-size: ${({ theme }) => theme.typography.h3.fontSize};
    line-height: ${({ theme }) => theme.typography.h3.lineHeight};
`;

import React from "react";
import Head from "next/head";

import { model, fetchIndexMeta } from "../api";
import { Disclaimer, SearchForm, DefaultLayout } from "../components";
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
        const description =
            "Search our AI curated corpus of " +
            `${formatNumber(this.props.meta.agent_count)} agents and ` +
            `${formatNumber(this.props.meta.interaction_count)} ` +
            "interactions and explore the related research. Our results " +
            "are automatically derived from peer-reviewed publications, and " +
            "are not influenced by third parties. This tool is offered as a " +
            "free service to all users.";
        return (
            <DefaultLayout>
                <Head>
                    <title>{title}</title>
                    <meta name="description" content={description} />
                </Head>
                <p>
                    Dietary and herbal supplements are taken by a large
                    percentage of the population. In some cases, supplements can
                    interact or interfere with the action of prescription or
                    over-the-counter medications. Currently, it can be difficult
                    to find accurate and timely scientific evidence for these
                    interactions.
                </p>
                <p>
                    Our goal is to automatically detect and extract evidence of
                    supplement and drug interactions from the scientific
                    literature, and present this information in one place. We
                    hope that users can leverage this evidence to make the most
                    informed decisions and recommendations about supplement use.
                </p>
                <p>{description}</p>
                <Disclaimer />
                <SearchForm meta={this.props.meta} />
                <AuthorList />
            </DefaultLayout>
        );
    }
}

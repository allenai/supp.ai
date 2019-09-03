import React from "react";
import Head from "next/head";

import { model, fetchIndexMeta } from "../api";
import { Disclaimer, SearchForm, DefaultLayout } from "../components";

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
            "are automatically derived from peer-reviewed research, and " +
            "are not influenced by the supplement industry."
        return (
            <DefaultLayout>
                <Head>
                    <title>{title}</title>
                    <meta name="description" content={description} />
                </Head>
                <Disclaimer />
                <SearchForm meta={this.props.meta} />
                <p>{description}</p>
            </DefaultLayout>
        );
    }
}

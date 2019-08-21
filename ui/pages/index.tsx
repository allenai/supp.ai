import React from "react";
import Head from "next/head";

import { model, fetchIndexMeta } from "../api";
import {
    Disclaimer,
    SearchForm,
    DefaultLayout,
    PageHeader
} from "../components";

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
        return (
            <DefaultLayout>
                <Head>
                    <title>{title}</title>
                </Head>
                <Disclaimer />
                <PageHeader>Discover supplement-drug interactions</PageHeader>
                <p>
                    Search our AI curated corpus of{" "}
                    {formatNumber(this.props.meta.interaction_count)}{" "}
                    interactions and explore the related research. Our corpus is
                    purely derived from examining peer-reviewed research and is
                    free of any marketing or advertising driven agendas.
                </p>
                <SearchForm meta={this.props.meta} autocomplete />
            </DefaultLayout>
        );
    }
}

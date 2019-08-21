import React from "react";
import Head from "next/head";

import { model, fetchIndexMeta } from "../api";
import {
    Disclaimer,
    SearchForm,
    DefaultLayout,
    PageHeader
} from "../components";

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
                    We are a non-profit and do not receive any external
                    compensation. This tool does not endorse any drugs or
                    supplements, diagnose patients or recommend therapy.
                </p>
                <SearchForm meta={this.props.meta} autocomplete />
            </DefaultLayout>
        );
    }
}

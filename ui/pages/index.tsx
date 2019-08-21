import React from "react";
import { DocumentContext } from "next/document";
import Head from "next/head";

import { model, fetchIndexMeta } from "../api";
import {
    SearchForm,
    DefaultLayout,
    hasDismissedDisclaimer
} from "../components";

interface Props {
    meta: model.IndexMeta;
    hideDisclaimer: boolean;
}

export default class Home extends React.PureComponent<Props> {
    static async getInitialProps(context: DocumentContext): Promise<Props> {
        const hideDisclaimer = hasDismissedDisclaimer(context);
        const meta = await fetchIndexMeta();
        return { meta, hideDisclaimer };
    }
    render() {
        const title = "SUPP.AI by AI2";
        return (
            <DefaultLayout>
                <Head>
                    <title>{title}</title>
                </Head>
                <SearchForm
                    meta={this.props.meta}
                    hideDisclaimer={this.props.hideDisclaimer}
                />
            </DefaultLayout>
        );
    }
}

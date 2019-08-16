import React from "react";
import { DocumentContext } from "next/document";
import Head from "next/head";

import { model, fetchIndexMeta, searchForAgents } from "../api";
import {
    SearchForm,
    SearchResults,
    DefaultLayout,
    hasDismissedDisclaimer
} from "../components";

enum View {
    DEFAULT,
    RESULTS
}

interface Props {
    meta: model.IndexMeta;
    queryText?: string;
    searchResponse?: model.SearchResponse;
    view: View;
    hideDisclaimer: boolean;
}

export default class Home extends React.PureComponent<Props> {
    static async getInitialProps(context: DocumentContext): Promise<Props> {
        const query = SearchForm.queryFromQueryString(context.query);
        const hideDisclaimer = hasDismissedDisclaimer(context);
        if (query.q.length > 0) {
            const [meta, response] = await Promise.all([
                fetchIndexMeta(),
                // Algolia's pagination API is zero-indexed, while the
                // Antd pagination control starts at 1, so we offset this
                // value by one
                searchForAgents(query.q, query.p - 1)
            ]);
            return {
                meta,
                hideDisclaimer,
                queryText: query.q,
                searchResponse: response,
                view: View.RESULTS
            };
        } else {
            const meta = await fetchIndexMeta();
            return { meta, hideDisclaimer, view: View.DEFAULT };
        }
    }
    render() {
        const title =
            this.props.view != View.RESULTS
                ? "SUPP.AI by AI2"
                : `${this.props.queryText} - SUPP.AI by AI2`;
        return (
            <DefaultLayout>
                <Head>
                    <title>{title}</title>
                </Head>
                <SearchForm
                    meta={this.props.meta}
                    defaultQueryText={this.props.queryText}
                    hideDisclaimer={this.props.hideDisclaimer}
                />
                {this.props.view === View.RESULTS &&
                this.props.searchResponse ? (
                    <SearchResults response={this.props.searchResponse} />
                ) : null}
            </DefaultLayout>
        );
    }
}

import React from "react";
import { DocumentContext } from "next/document";

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
        const { query } = context;
        const queryText = SearchForm.queryTextFromQueryString(query);
        const hideDisclaimer = hasDismissedDisclaimer(context);
        if (queryText !== undefined) {
            const [meta, response] = await Promise.all([
                fetchIndexMeta(),
                searchForAgents(queryText)
            ]);
            return {
                meta,
                hideDisclaimer,
                queryText: queryText,
                searchResponse: response,
                view: View.RESULTS
            };
        } else {
            const meta = await fetchIndexMeta();
            return { meta, hideDisclaimer, view: View.DEFAULT };
        }
    }
    render() {
        return (
            <DefaultLayout>
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

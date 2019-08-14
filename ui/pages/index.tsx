import React from "react";
import { DocumentContext } from "next/document";

import { model, fetchIndexMeta, searchForAgents } from "../api";
import { SearchForm, SearchResults, DefaultLayout } from "../components";

enum View {
    DEFAULT,
    RESULTS
}

interface Props {
    meta: model.IndexMeta;
    queryText?: string;
    searchResponse?: model.SearchResponse;
    view: View;
}

export default class Home extends React.PureComponent<Props> {
    static async getInitialProps(context: DocumentContext): Promise<Props> {
        const { query } = context;
        const queryText = SearchForm.queryTextFromQueryString(query);
        if (queryText !== undefined) {
            const [meta, response] = await Promise.all([
                fetchIndexMeta(),
                searchForAgents(queryText)
            ]);
            return {
                meta,
                queryText: queryText,
                searchResponse: response,
                view: View.RESULTS
            };
        } else {
            const meta = await fetchIndexMeta();
            return { meta, view: View.DEFAULT };
        }
    }
    render() {
        const { format } = Intl.NumberFormat();
        const placeholder =
            "Enter the name of a supplement or drug to search " +
            `${format(this.props.meta.interaction_count)} interactions…`;
        return (
            <DefaultLayout>
                <SearchForm
                    placeholder={placeholder}
                    defaultQueryText={this.props.queryText}
                />
                {this.props.view === View.RESULTS &&
                this.props.searchResponse ? (
                    <SearchResults response={this.props.searchResponse} />
                ) : null}
            </DefaultLayout>
        );
    }
}

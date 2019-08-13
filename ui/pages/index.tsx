import React from "react";
import styled from "styled-components";
import { DocumentContext } from "next/document";
import Router from "next/router";
import { Icon } from "@allenai/varnish/components/icon";

import { model, fetchIndexMeta, searchForAgents } from "../api";
import {
    Disclaimer,
    SearchForm,
    SearchResults,
    DefaultLayout
} from "../components";

interface Props {
    meta: model.IndexMeta;
    defaultQueryText?: string;
    defaultSearchResponse?: model.SearchResponse;
}

enum View {
    DEFAULT,
    SEARCHING,
    RESULTS
}

interface State {
    view: View;
    queryText?: string;
    searchResponse?: model.SearchResponse;
}

export default class Home extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            view: props.defaultSearchResponse ? View.RESULTS : View.DEFAULT,
            queryText: props.defaultQueryText,
            searchResponse: props.defaultSearchResponse
        };
    }
    static async getInitialProps({ query }: DocumentContext): Promise<Props> {
        const queryText = SearchForm.queryTextFromQueryString(query);
        if (queryText !== undefined) {
            const [meta, response] = await Promise.all([
                fetchIndexMeta(),
                searchForAgents(queryText)
            ]);
            return {
                meta,
                defaultQueryText: queryText,
                defaultSearchResponse: response
            };
        } else {
            const meta = await fetchIndexMeta();
            return { meta };
        }
    }
    componentDidUpdate() {
        const { router } = Router;
        if (router != null) {
            const queryText = SearchForm.queryTextFromQueryString(router.query);
            if (queryText === undefined) {
                this.setState({
                    view: View.DEFAULT,
                    searchResponse: undefined,
                    queryText
                });
            } else if (
                !this.state.queryText ||
                this.state.queryText !== queryText
            ) {
                this.setState({ view: View.SEARCHING, queryText }, async () => {
                    const searchResponse = await searchForAgents(queryText);
                    this.setState(state => {
                        if (state.queryText !== searchResponse.query.q) {
                            return null;
                        }
                        return { view: View.RESULTS, searchResponse };
                    });
                });
            }
        }
    }
    render() {
        const { format } = Intl.NumberFormat();
        const placeholder =
            "Enter the name of a supplement or drug to search " +
            `${format(this.props.meta.interaction_count)} interactions…`;

        let main = null;
        switch (this.state.view) {
            case View.SEARCHING:
                main = <Loading />;
                break;
            case View.RESULTS: {
                if (this.state.searchResponse) {
                    main = (
                        <SearchResults response={this.state.searchResponse} />
                    );
                    break;
                }
            }
        }
        return (
            <DefaultLayout>
                <SearchForm
                    placeholder={placeholder}
                    defaultQueryText={this.props.defaultQueryText}
                />
                {main}
                <Disclaimer />
            </DefaultLayout>
        );
    }
}

export const Loading = styled(Icon).attrs({ type: "loading" })``;

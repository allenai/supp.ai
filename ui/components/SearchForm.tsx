import React from "react";
import styled, { createGlobalStyle } from "styled-components";
import Router from "next/router";
import { ParsedUrlQuery, encode } from "querystring";
import { AutoComplete } from "antd";
import { SelectValue } from "antd/lib/select";
import { BodySmall } from "@allenai/varnish/components/typography";
import { Input } from "@allenai/varnish/components/form";
import Link from "next/link";

import { debounce, formatNumber, pluralize } from "../util";
import { model, fetchSuggestions } from "../api";
import * as icon from "./icon";

interface Props {
    defaultQueryText?: string;
    meta: model.IndexMeta;
}

interface State {
    queryText: string;
    results: model.Agent[];
    isLoading: boolean;
}

const SAMPLE_QUERIES = [
    { cui: "C3531686", slug: "ginkgo-biloba-whole", name: "Ginkgo" },
    { cui: "C0813171", slug: "hypericum-perforatum", name: "St Johns Wort" },
    { cui: "C0025677", slug: "methotrexate", name: "Methotrexate" }
];

export class SearchForm extends React.PureComponent<Props, State> {
    static queryFromQueryString(args: ParsedUrlQuery): model.Query {
        const queryText = (Array.isArray(args.q)
            ? args.q.join(" ")
            : args.q || ""
        ).trim();
        const rawPage = parseInt(
            Array.isArray(args.p) ? args.p.join() : args.p
        );
        const page = !isNaN(rawPage) ? rawPage : 1;
        return { q: queryText, p: page };
    }
    constructor(props: Props) {
        super(props);
        this.state = {
            results: [],
            queryText: props.defaultQueryText || "",
            isLoading: false
        };
    }
    searchForAgents = (value: SelectValue) => {
        if (typeof value === "string") {
            const queryText = value.trim();
            this.setState(
                { queryText: value, isLoading: true },
                debounce(async () => {
                    if (queryText === "") {
                        this.setState({ results: [], isLoading: false });
                    } else {
                        const resp = await fetchSuggestions(queryText);
                        this.setState(state => {
                            if (state.queryText !== resp.query.q) {
                                return null;
                            }
                            return { results: resp.results, isLoading: false };
                        });
                    }
                })
            );
        }
    };
    goToSelectedAgent = (cui: SelectValue) => {
        if (typeof cui === "string") {
            const selected = this.state.results.find(
                suggestion => suggestion.cui === cui
            );
            if (selected) {
                Router.push(`/a/${selected.slug}/${selected.cui}`);
            }
        }
    };
    render() {
        const placeholder = "Enter the name of a supplement or drug";
        let results;
        if (this.state.results.length > 0) {
            results = asAutocompleteResults(this.state.results);
        } else if (
            this.state.queryText.trim().length > 0 &&
            !this.state.isLoading
        ) {
            results = [
                <AutoComplete.Option
                    value=""
                    key="no-results"
                    className="supp-autocomplete-option supp-autocomplete-no-results-option"
                >
                    No matching supplements or drugs.
                </AutoComplete.Option>
            ];
        }
        return (
            <React.Fragment>
                <FormContainer>
                    <AutoCompleteStyles />
                    <SearchInputWithAutoComplete
                        dataSource={results}
                        onSelect={this.goToSelectedAgent}
                        onSearch={this.searchForAgents}
                        optionLabelProp="title"
                        transitionName="none"
                        value={this.state.queryText}
                    >
                        <Input type="search" placeholder={placeholder} />
                    </SearchInputWithAutoComplete>
                    <Samples>
                        <SampleLabel>Try:</SampleLabel>{" "}
                        {SAMPLE_QUERIES.map((sample, idx) => (
                            <React.Fragment key={sample.cui}>
                                {idx === 0 ? " " : ", "}
                                <Link
                                    href={`/agent?${encode({
                                        cui: sample.cui,
                                        slug: sample.slug
                                    })}`}
                                    as={`/a/${sample.slug}/${sample.cui}`}
                                >
                                    <a>{sample.name}</a>
                                </Link>
                            </React.Fragment>
                        ))}
                    </Samples>
                </FormContainer>
            </React.Fragment>
        );
    }
}

function asAutocompleteResults(results: model.Agent[]) {
    return results.map(suggestion => (
        <AutoComplete.Option
            key={suggestion.cui}
            value={suggestion.cui}
            className="supp-autocomplete-option"
            title={suggestion.preferred_name}
        >
            <span>
                <icon.AgentTypeIcon type={suggestion.ent_type} />
            </span>
            <span>{suggestion.preferred_name}</span>
            <BodySmall>
                {formatNumber(suggestion.interacts_with_count)}{" "}
                {pluralize("interaction", suggestion.interacts_with_count)}
            </BodySmall>
        </AutoComplete.Option>
    ));
}

const Samples = styled.div`
    margin: ${({ theme }) => theme.spacing.sm} 0;
    font-size: 1rem;
    padding: 0 ${({ theme }) => theme.spacing.md};
`;

const SampleLabel = styled.label`
    font-weight: 700;

    && {
        font-size: 1rem;
    }
`;

const FormContainer = styled.div`
    margin: ${({ theme }) => theme.spacing.lg} 0;
`;

const SearchInputWithAutoComplete = styled(AutoComplete)`
    width: 100%;

    // TODO: These styles are hacks. Remove them once Varnish's base elements
    // handle this case better / can be restyled.
    input {
        padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
        transition: none !important;
        line-height: 1.8 !important;
        height: auto !important;
        font-size: ${({ theme }) => theme.typography.body.fontSize} !important;
    }
`;

const AutoCompleteStyles = createGlobalStyle`
    // We style the autocomplete like so as using the styled() route doesn't
    // work with Ant's autocomplete options.
    .supp-autocomplete-option {
        font-size: 1rem;
        display: grid;
        grid-template-columns: min-content auto min-content;
        grid-gap: 8px;
        align-items: center;

        img {
            width: 16px;
            height: 16px;
        }
    }

    .ant-select-dropdown-menu-item-active {
        font-weight: 700;
    }

    .supp-autocomplete-no-results-option {
        display: block;
    }

    .supp-autocomplete-no-results-option.ant-select-dropdown-menu-item-active {
        background: #fff !important;
        font-weight: 400 !important;
    }
`;

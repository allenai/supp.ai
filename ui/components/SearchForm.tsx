import React from "react";
import styled, { createGlobalStyle } from "styled-components";
import Router from "next/router";
import { ParsedUrlQuery, encode } from "querystring";
import { AutoComplete, Form } from "antd";
import { SelectValue } from "antd/lib/select";
import { BodySmall } from "@allenai/varnish/components/typography";
import { Input } from "@allenai/varnish/components/form";
import { Button } from "@allenai/varnish/components/button";
import { Key } from "ts-keycode-enum";

import { debounce, formatNumber, pluralize } from "../util";
import { model, fetchSuggestions } from "../api";
import * as icon from "./icon";
import { Disclaimer } from "../components";

interface Props {
    defaultQueryText?: string;
    autoFocus?: boolean;
    meta: model.IndexMeta;
    hideDisclaimer?: boolean;
}

interface State {
    locked?: boolean;
    queryText: string;
    suggestions: model.SuggestedAgent[];
}

export class SearchForm extends React.PureComponent<Props, State> {
    static queryTextFromQueryString(query: ParsedUrlQuery): string | undefined {
        if (typeof query.q === "undefined") {
            return undefined;
        }
        const value = (Array.isArray(query.q)
            ? query.q.join(" ")
            : query.q
        ).trim();
        return value || undefined;
    }
    private hasSelectedItem: boolean = false;
    constructor(props: Props) {
        super(props);
        this.state = {
            suggestions: [],
            queryText: props.defaultQueryText || ""
        };
    }
    onQueryChanged = (value: SelectValue) => {
        if (typeof value === "string") {
            const queryText = value.trim();
            this.setState(
                { queryText: value },
                debounce(async () => {
                    if (queryText === "") {
                        this.setState({ suggestions: [] });
                    } else {
                        const resp = await fetchSuggestions(queryText);
                        this.setState(state => {
                            if (state.queryText !== resp.query.q) {
                                return null;
                            }
                            return { suggestions: resp.results };
                        });
                    }
                })
            );
        }
    };
    onSuggestionSelected = (cui: SelectValue) => {
        if (typeof cui === "string") {
            this.hasSelectedItem = true;
            const selected = this.state.suggestions.find(
                suggestion => suggestion.cui === cui
            );
            if (selected) {
                Router.push(`/a/${selected.slug}/${selected.cui}`);
            }
        }
    };
    onFormSubmitted = (event?: React.FormEvent<HTMLElement>) => {
        if (event) {
            event.preventDefault();
        }
        const queryText = this.state.queryText.trim();
        this.setState({ queryText }, () => {
            if (queryText) {
                Router.push(`/?${encode({ q: queryText })}`);
            } else {
                Router.push(`/`);
            }
        });
    };
    onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
        if (!this.hasSelectedItem && event.keyCode == Key.Enter) {
            this.hasSelectedItem = false;
            this.onFormSubmitted();
        }
    };
    render() {
        const placeholder =
            "Enter the name of a supplement or drug to search " +
            `${formatNumber(this.props.meta.agent_count)} agents and ` +
            `${formatNumber(this.props.meta.interaction_count)} interactions…`;
        const suggestions = this.state.suggestions.map(suggestion => (
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
        return (
            <React.Fragment>
                {!this.props.hideDisclaimer ? <Disclaimer /> : null}
                <Form onSubmit={this.onFormSubmitted}>
                    <AutoCompleteStyles />
                    <SearchInputWithAutoComplete
                        defaultActiveFirstOption={false}
                        dataSource={suggestions}
                        onSelect={this.onSuggestionSelected}
                        onSearch={this.onQueryChanged}
                        optionLabelProp="title"
                        transitionName="none"
                        value={this.state.queryText}
                    >
                        <Input
                            type="search"
                            autoFocus={
                                this.props.autoFocus !== false &&
                                this.state.queryText === ""
                            }
                            placeholder={placeholder}
                            onKeyDown={this.onKeyDown}
                            size="large"
                            addonAfter={
                                <SearchButton
                                    variant="primary"
                                    onClick={() => this.onFormSubmitted()}
                                >
                                    Search
                                </SearchButton>
                            }
                        />
                    </SearchInputWithAutoComplete>
                </Form>
            </React.Fragment>
        );
    }
}

const SearchInputWithAutoComplete = styled(AutoComplete)`
    width: 100%;
    margin: ${({ theme }) => theme.spacing.lg} 0;

    .ant-select-search__field {
        padding: 0 !important;
    }

    .ant-input-group-addon {
        border: 0;
    }

    // TODO: These styles are hacks. Remove them once Varnish's base elements
    // handle this case better / can be restyled.
    input {
        padding: 0 ${({ theme }) => theme.spacing.md};
        border-top-right-radius: 0;
        border-bottom-right-radius: 0;
        border-right: 0;
        transition: none !important;

        &:focus {
            box-shadow: none;
        }
    }

    button,
    input {
        height: 40px !important;
    }
`;

const SearchButton = styled(Button)`
    border-top-left-radius: 0;
    border-bottom-left-radius: 0;
    box-shadow: none;

    &&,
    &&:hover {
        padding: 0 ${({ theme }) => theme.spacing.lg};
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
`;

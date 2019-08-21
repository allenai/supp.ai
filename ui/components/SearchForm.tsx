import React from "react";
import styled, { createGlobalStyle } from "styled-components";
import Router from "next/router";
import { ParsedUrlQuery, encode } from "querystring";
import { AutoComplete, List } from "antd";
import { SelectValue } from "antd/lib/select";
import { BodySmall } from "@allenai/varnish/components/typography";
import { Input } from "@allenai/varnish/components/form";
import Link from "next/link";

import {
    AgentListItem,
    AgentListItemContent,
    AgentListItemTitle
} from "./AgentList";
import { AgentLink } from "./AgentLink";
import { Synonyms } from "./Synonyms";
import { WithAgentDefinitionPopover } from "./WithAgentDefinitionPopover";
import { debounce, formatNumber, pluralize } from "../util";
import { model, fetchSuggestions } from "../api";
import * as icon from "./icon";

interface Props {
    defaultQueryText?: string;
    autoFocus?: boolean;
    meta: model.IndexMeta;
    autocomplete?: boolean;
}

interface State {
    queryText: string;
    results: model.Agent[];
}

const SAMPLE_QUERIES = [
    { cui: "C0043031", slug: "warfarin", name: "Warfarin" },
    { cui: "C3531686", slug: "ginkgo-biloba-whole", name: "Ginkgo" }
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
            queryText: props.defaultQueryText || ""
        };
    }
    searchForAgents = (value: SelectValue) => {
        if (typeof value === "string") {
            const queryText = value.trim();
            this.setState(
                { queryText: value },
                debounce(async () => {
                    if (queryText === "") {
                        this.setState({ results: [] });
                    } else {
                        const resp = await fetchSuggestions(queryText);
                        this.setState(state => {
                            if (state.queryText !== resp.query.q) {
                                return null;
                            }
                            return { results: resp.results };
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
        const placeholder =
            "Enter the name of a supplement or drug to search " +
            `${formatNumber(this.props.meta.agent_count)} agents and ` +
            `${formatNumber(this.props.meta.interaction_count)} interactions…`;
        return (
            <React.Fragment>
                <FormContainer>
                    <AutoCompleteStyles />
                    {this.props.autocomplete ? (
                        <SearchInputWithAutoComplete
                            dataSource={asAutocompleteResults(
                                this.state.results
                            )}
                            onSelect={this.goToSelectedAgent}
                            onSearch={this.searchForAgents}
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
                            />
                        </SearchInputWithAutoComplete>
                    ) : (
                        <SearchInput
                            type="search"
                            autoFocus={
                                this.props.autoFocus !== false &&
                                this.state.queryText === ""
                            }
                            placeholder={placeholder}
                            onChange={(
                                event: React.ChangeEvent<HTMLInputElement>
                            ) => this.searchForAgents(event.target.value)}
                        />
                    )}
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
                {!this.props.autocomplete && this.state.results.length > 0 ? (
                    <List
                        bordered={false}
                        dataSource={this.state.results}
                        renderItem={agent => (
                            <AgentListItem key={agent.cui} agent={agent}>
                                <AgentListItemTitle>
                                    <AgentLink agent={agent}>
                                        <WithAgentDefinitionPopover
                                            agent={agent}
                                        >
                                            {agent.preferred_name}
                                        </WithAgentDefinitionPopover>
                                    </AgentLink>
                                    <InteractionCount>
                                        {formatNumber(
                                            agent.interacts_with_count
                                        )}{" "}
                                        {pluralize(
                                            "Interaction",
                                            agent.interacts_with_count
                                        )}
                                    </InteractionCount>
                                </AgentListItemTitle>
                                {agent.synonyms.length > 0 ? (
                                    <AgentListItemContent>
                                        <Synonyms synonyms={agent.synonyms} />
                                    </AgentListItemContent>
                                ) : null}
                                <AgentLink agent={agent}>
                                    View {agent.interacts_with_count}{" "}
                                    {pluralize(
                                        "Interaction",
                                        agent.interacts_with_count
                                    )}
                                </AgentLink>
                            </AgentListItem>
                        )}
                    />
                ) : null}
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

const SearchInput = styled(Input)`
    line-height: 1.8 !important;
    padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.md}`};
    font-size: ${({ theme }) => theme.typography.body.fontSize};
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

const InteractionCount = styled.div`
    margin-left: auto;
    white-space: nowrap;
`;

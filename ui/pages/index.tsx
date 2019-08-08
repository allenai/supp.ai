import React from "react";
import styled from "styled-components";
import { Header, HeaderTitle } from "@allenai/varnish/components/Header";

import { PaddedContent, Page } from "@allenai/varnish/components/shared";
import { Input } from "@allenai/varnish/components/form";
import { Icon } from "@allenai/varnish/components/icon";
import { DocumentContext } from "next/document";
import Router from "next/router";

import * as api from "../api";
import { debounce, pluralize } from "../util";

interface Props {
    meta: api.model.IndexMeta;
    defaultQueryText?: string;
    defaultSearchResponse?: api.model.SearchResponse;
}

interface State {
    isSearching: boolean;
    queryText: string;
    searchResponse?: api.model.SearchResponse;
}

/**
 * TODO:
 *  - [ ] Break this out a bit, it's too much in one file.
 *  - [ ] Use the Footer. I'll need to modify Varnish, as it relies upon
 *        a client side Router. This will take a bit of thought.
 */

export default class Home extends React.PureComponent<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = {
            isSearching: false,
            queryText: props.defaultQueryText || "",
            searchResponse: props.defaultSearchResponse
        };
    }
    static async getInitialProps({ query }: DocumentContext): Promise<Props> {
        if (query.q) {
            const queryText = Array.isArray(query.q)
                ? query.q.join(" ")
                : query.q;
            const [meta, response] = await Promise.all([
                api.fetchIndexMeta(),
                api.searchByName(queryText)
            ]);
            return {
                meta,
                defaultQueryText: queryText,
                defaultSearchResponse: response
            };
        } else {
            const meta = await api.fetchIndexMeta();
            return { meta };
        }
    }
    search = debounce(async () => {
        const queryText = this.state.queryText.trim();
        if (queryText) {
            // We don't watch to show the loading indicator immediately, as
            // if the search response is retrieved quickly the UI changes states
            // too fast (which feels clunky to the end user).
            const showLoadingTmr = setTimeout(
                () => this.setState({ isSearching: true }),
                100
            );
            Router.push(`/?q=${encodeURIComponent(queryText)}`);
            const searchResponse = await api.searchByName(queryText);
            clearTimeout(showLoadingTmr);
            this.setState({ isSearching: false, searchResponse });
        } else {
            Router.push(`/`);
            this.setState({ isSearching: false, searchResponse: undefined });
        }
    });
    handleChange = (event: React.SyntheticEvent<HTMLInputElement>) => {
        this.setState({ queryText: event.currentTarget.value }, this.search);
    };
    render() {
        const { format } = Intl.NumberFormat();
        const placeholder =
            "Enter the name of a supplement or drug to search " +
            `${format(this.props.meta.interaction_count)} interactions…`;
        return (
            <React.Fragment>
                <Header>
                    <HeaderTitle>💊 supp.ai</HeaderTitle>
                </Header>
                <PaddedContent>
                    <Page>
                        <LimitWidth>
                            <Input
                                type="text"
                                autoFocus={!this.state.queryText}
                                value={this.state.queryText}
                                placeholder={placeholder}
                                onChange={this.handleChange}
                            />
                            <Results>
                                {this.state.isSearching ? (
                                    <Loading />
                                ) : this.state
                                      .searchResponse /* TODO: Fixup, nested ternary == bad coder, no cookie */ ? (
                                    <React.Fragment>
                                        <ResultsText
                                            totalResults={
                                                this.state.searchResponse.total
                                            }
                                        />
                                        <ResultList>
                                            {this.state.searchResponse.results.map(
                                                result => (
                                                    <Result
                                                        key={result.agent.cui}
                                                    >
                                                        <Agent
                                                            agent={result.agent}
                                                        />
                                                        <Interactions
                                                            interactions={
                                                                result.interacts_with
                                                            }
                                                            count={
                                                                result
                                                                    .interacts_with
                                                                    .length
                                                            }
                                                        />
                                                    </Result>
                                                )
                                            )}
                                        </ResultList>
                                    </React.Fragment>
                                ) : null}
                            </Results>
                        </LimitWidth>
                    </Page>
                </PaddedContent>
            </React.Fragment>
        );
    }
}

const Agent = ({ agent }: { agent: api.model.Agent }) => (
    <React.Fragment>
        <AgentName>{agent.preferred_name}</AgentName>
        <p>
            <em>{agent.synonyms.join(", ")}</em>
        </p>
        <p>{agent.definition}</p>
    </React.Fragment>
);

const Interactions = ({
    interactions,
    count
}: {
    interactions: api.model.InteractingAgent[];
    count: number;
}) => (
    <React.Fragment>
        <h4>{`${count} ${pluralize("interaction", count)}:`}</h4>
        <InteractionList>
            {interactions.map(interaction => (
                <Interaction key={interaction.agent.cui}>
                    <InteractionName>
                        {interaction.agent.preferred_name}
                    </InteractionName>
                    <SentenceList>
                        {interaction.sentences.map(sentence => (
                            <Sentence key={sentence.uid}>
                                <WithMentions
                                    sentence={sentence}
                                    target={interaction.agent}
                                />
                                <a
                                    href={`https://semanticscholar.org/paper/${sentence.paper_id}`}
                                >
                                    Paper
                                </a>
                            </Sentence>
                        ))}
                    </SentenceList>
                </Interaction>
            ))}
        </InteractionList>
    </React.Fragment>
);

const WithMentions = ({
    sentence,
    target
}: {
    sentence: api.model.SupportingSentence;
    target: api.model.Agent;
}) => {
    const orderedBySentenceIdx = [sentence.arg1, sentence.arg2].sort((a, b) => {
        return a.span[0] - b.span[0];
    });
    const [first, second] = orderedBySentenceIdx;
    const spans: [[number, number], string | undefined][] = [
        [[0, first.span[0]], undefined],
        [first.span, first.cui],
        [[first.span[1], second.span[0]], undefined],
        [second.span, second.cui],
        [[second.span[1], sentence.sentence.length], undefined]
    ];
    return (
        <div>
            “
            {spans.map(([[start, end], mentioned], idx) => {
                const spanText = sentence.sentence.substring(start, end);
                const variant =
                    mentioned == target.cui ? Variant.TARGET : Variant.SUBJECT;
                return (
                    <React.Fragment>
                        {idx > 0 ? " " : null}
                        {mentioned ? (
                            <Mention variant={variant}>{spanText}</Mention>
                        ) : (
                            spanText
                        )}
                    </React.Fragment>
                );
            })}
            ”
        </div>
    );
};

const ResultsText = ({ totalResults }: { totalResults: number }) => (
    <strong>
        {totalResults > 0
            ? `We found ${totalResults} matching ${pluralize(
                  "agent",
                  totalResults
              )}:`
            : "No matching agents"}
    </strong>
);

const LimitWidth = styled.form`
    max-width: 80ch;
`;

const Results = styled.div`
    margin: ${({ theme }) => theme.spacing.lg} 0 0;
`;

const ResultList = styled.ul`
    list-style-type: none;
    padding: 0;
    margin: 0;
`;

const InteractionList = styled.ul`
    list-style-type: none;
    padding: 0 ${({ theme }) => theme.spacing.lg};
    margin: 0;
`;

const SentenceList = styled.ul`
    padding: 0 ${({ theme }) => theme.spacing.md};
    margin: 0 ${({ theme }) => theme.spacing.md};
`;

enum Variant {
    SUBJECT,
    TARGET
}

const Mention = styled.strong<{ variant: Variant }>`
    font-weight: 700;
    padding: 1px 3px;
    border-radius: 4px;
    color: ${({ variant, theme }) =>
        theme.color[variant == Variant.SUBJECT ? "B8" : "G8"].hex};
    background: ${({ variant, theme }) =>
        theme.color[variant == Variant.SUBJECT ? "B2" : "G2"].hex};
`;

const AgentName = styled.h3`
    margin: 0;
    color: ${({ theme }) => theme.color.B8.hex};
`;

const Result = styled.li`
    border-radius: 4px;
    border: 1px solid ${({ theme }) => theme.palette.border.main};
    margin: ${({ theme }) => theme.spacing.xl} 0;
    padding: ${({ theme }) => theme.spacing.lg};
`;

const Interaction = styled.li`
    margin: ${({ theme }) => theme.spacing.md} 0;
`;

const InteractionName = styled.strong`
    color: ${({ theme }) => theme.color.G8.hex};
`;

const Sentence = styled.li`
    margin: ${({ theme }) => theme.spacing.sm} 0;
    font-family: ${({ theme }) => theme.typography.attributionFontFamily};
`;

export const Loading = styled(Icon).attrs({ type: "loading" })``;

import React from "react";
import styled from "styled-components";
import Router from "next/router";
import { Input } from "antd";
import { encode } from "querystring";

import { ParsedUrlQuery } from "querystring";

interface Props {
    defaultQueryText?: string;
    placeholder?: string;
}

export class SearchForm extends React.PureComponent<Props> {
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
    onSearch = (value: string) => {
        const queryText = value.trim();
        if (queryText) {
            Router.push(`/?${encode({ q: queryText })}`);
        } else {
            Router.push(`/`);
        }
    };
    render() {
        return (
            <SearchInput
                autoFocus={!this.props.defaultQueryText}
                defaultValue={this.props.defaultQueryText}
                placeholder={this.props.placeholder}
                onSearch={this.onSearch}
                size="large"
                enterButton={"Search"}
            />
        );
    }
}

const SearchInput = styled(Input.Search)`
    max-width: 600px;
    margin: 0 0 ${({ theme }) => theme.spacing.xl};

    input,
    button {
        padding: 0 ${({ theme }) => theme.spacing.sm};
    }
`;

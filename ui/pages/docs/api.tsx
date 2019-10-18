import React from "react";
import Head from "next/head";

import { DefaultLayout, Section } from "../../components";
import { Endpoint, DataType } from "../../components/docs";

enum DataTypeIds {
    SearchResponse = "search-response",
    Agent = "agent",
    Query = "query"
}

const dataTypes = [
    {
        name: "SearchResponse",
        id: DataTypeIds.SearchResponse,
        description: "The result of a search request.",
        fields: [
            {
                name: "results",
                type: (
                    <React.Fragment>
                        List[<a href={`#${DataTypeIds.Agent}`}>Agent</a>]
                    </React.Fragment>
                ),
                description:
                    "The agents matching the search query, in descending order " +
                    "by the strength of the match."
            },
            {
                name: "query",
                type: (
                    <React.Fragment>
                        <a href={`#${DataTypeIds.Query}`}>Query</a>
                    </React.Fragment>
                ),
                description: "The original search query."
            },
            {
                name: "total_pages",
                type: "number",
                description: "The total number of result pages."
            },
            {
                name: "total_results",
                type: "number",
                description: "The total number of results."
            },
            {
                name: "num_per_page",
                type: "number",
                description: "The number of results per results page."
            }
        ]
    },
    {
        name: "Query",
        id: DataTypeIds.Query,
        description: "A search query",
        fields: [
            {
                name: "q",
                type: "string",
                description: "The full text search query."
            },
            {
                name: "p",
                type: "number",
                description: "The requested page of results, zero indexed."
            }
        ]
    },
    {
        name: "Agent",
        id: DataTypeIds.Agent,
        description: "A drug or supplement.",
        fields: [
            {
                name: "cui",
                type: "string",
                description: "A unique identifier, derived from ???" // TODO: @lucyw - can you clarify?
            },
            {
                name: "preferred_name",
                type: "string",
                description: "The agent's common name."
            },
            {
                name: "synonyms",
                type: "List[string]",
                description: "A list of alternative names for the agent."
            },
            {
                name: "tradenames",
                type: "List[string]",
                description: "A list of trade names for the agent."
            },
            {
                name: "definition",
                type: "string",
                description: "A description of the agent."
            },
            {
                name: "slug",
                type: "string",
                description: "A url safe version of the agent's name."
            },
            {
                name: "ent_type",
                type: "string",
                description:
                    'The type of agent. One of "supplement", "drug", or "other"'
            },
            {
                name: "interacts_with_count",
                type: "number",
                description:
                    "The number of interactions we found between the agent and others in our corpus."
            },
            {
                name: "matches",
                type: "Map[string,string]",
                description:
                    "If the agent is being returned in response to a search query, " +
                    "this map contains the name of each field and the text from that " +
                    "field that matched the query. This is typically used to highlight " +
                    "the matching items."
            }
        ]
    }
];

const endpoints = [
    {
        id: "agent-search",
        name: "Search",
        description:
            "The search endpoint executes a full text search query and " +
            "returns agents (supplments and drugs) that best match the provided " +
            "query. Results are paginated, with a maximum of 10 results " +
            "being returned with each request.",
        urlString: "GET https://supp.ai/api/agent/search?q=$query[&p=$page]",
        parameters: [
            {
                name: "q",
                type: "string",
                isRequired: true,
                description:
                    "Text to search for. The agent name, description and synonyms are searched."
            },
            {
                name: "p",
                type: "number",
                isRequired: false,
                defaultValue: "0",
                description: "The result page number, beginning from zero."
            }
        ],
        example: `~ curl "https://supp.ai/api/agent/search?q=ginkgo"
{
    "results": [ ... ],
    "query": { q": "ginkgo", "p": 0 },
    "total_pages": 1,
    "total_results": 8,
    "num_per_page": 10
}`,
        returns: (
            <React.Fragment>
                Returns a single{" "}
                <a href={`#${DataTypeIds.SearchResponse}`}>
                    <code>SearchResponse</code>
                </a>
                .
            </React.Fragment>
        )
    }
];

export default class ApiDocs extends React.PureComponent {
    render() {
        const description =
            "Our free API allows one to query a corpus of drugs, supplements " +
            "and their interactions. The corpus is derived via automated extraction " +
            "executed against the Semantic Scholar corpus and is free of any influence " +
            "from the supplement or pharmaceutical industries.";
        return (
            <DefaultLayout hideSubtitle={true}>
                <Head>
                    <title>API Documentation - SUPP.AI by AI2</title>
                    <meta name="description" content={description} />
                </Head>
                <Section>
                    <h1>API Documentation</h1>
                    <p>
                        SUPP.AI's API is free for sure, provided you comply with
                        the{" "}
                        <a href="https://api.semanticscholar.org/supp/legal/">
                            Semantic Scholar Dataset License Agreement
                        </a>
                        .
                    </p>
                    <h2>Endpoints</h2>
                    <p>
                        <ul>
                            {endpoints.map(endpoint => (
                                <li key={endpoint.id}>
                                    <a href={`#${endpoint.id}`}>
                                        {endpoint.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </p>
                    <h2>Data Types</h2>
                    <p>
                        <ul>
                            {dataTypes.map(dataType => (
                                <li key={dataType.id}>
                                    <a href={`#${dataType.id}`}>
                                        {dataType.name}
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </p>
                </Section>
                {endpoints.map(endpoint => (
                    <Endpoint key={endpoint.id} {...endpoint} />
                ))}
                {dataTypes.map(dataType => (
                    <DataType key={dataType.id} {...dataType} />
                ))}
            </DefaultLayout>
        );
    }
}

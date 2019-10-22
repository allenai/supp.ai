import React from "react";
import Head from "next/head";

import { DefaultLayout, Section } from "../../components";
import { Endpoint, DataType } from "../../components/docs";

enum DataTypeIds {
    SearchResponse = "search-response",
    Agent = "agent",
    Query = "query",
    AgentInteractionResponse = "agent-interaction-response",
    Interaction = "interaction",
    Evidence = "evidence",
    Paper = "paper",
    Author = "author",
    Sentence = "sentence",
    Span = "span"
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
                    "The supplement and drug entities matching the search query, in " +
                    "descending order by the likelihood of the match."
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
                description: "The query text."
            },
            {
                name: "p",
                type: "number",
                description:
                    "The requested page number of results, zero indexed."
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
                description:
                    "A unique identifier, derived from " +
                    '<a href="https://www.nlm.nih.gov/research/umls/index.html">UMLS</a>'
            },
            {
                name: "preferred_name",
                type: "string",
                description: "The agent's canonical name."
            },
            {
                name: "synonyms",
                type: "List[string]",
                description: "A list of alternative names for the agent."
            },
            {
                name: "tradenames",
                type: "List[string]",
                description:
                    "A list of tradenames (brand names) for the agent (only available for drugs)."
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
                    'The type of agent. One of "supplement", "drug", or "other."'
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
    },
    {
        name: "AgentInteractionResponse",
        id: DataTypeIds.AgentInteractionResponse,
        description: "The result of a agent interactions request.",
        fields: [
            {
                name: "page",
                type: "number",
                description: "The page number of the results."
            },
            {
                name: "interactions",
                type: (
                    <React.Fragment>
                        <a href={`#${DataTypeIds.Interaction}`}>Interaction</a>
                    </React.Fragment>
                ),
                description: "The original search query."
            },
            {
                name: "interactions_per_page",
                type: "number",
                description: "The number of results per results page."
            },
            {
                name: "total",
                type: "number",
                description: "The total number of results."
            }
        ]
    },
    {
        name: "Interaction",
        id: DataTypeIds.Interaction,
        description:
            "One interaction between two agents supported by evidence.",
        fields: [
            {
                name: "interaction_id",
                type: "string",
                description:
                    "The interaction id between two agents, takes the form [CUI1-CUI2]."
            },
            {
                name: "slug",
                type: "string",
                description: "A url safe version of the interaction name."
            },
            {
                name: "agent",
                type: (
                    <React.Fragment>
                        <a href={`#${DataTypeIds.Agent}`}>Agent</a>
                    </React.Fragment>
                ),
                description: "The agent interacting with the queried agent."
            },
            {
                name: "evidence",
                type: (
                    <React.Fragment>
                        List[<a href={`#${DataTypeIds.Evidence}`}>Evidence</a>]
                    </React.Fragment>
                ),
                description:
                    "A list of evidence sentences supporting the interaction."
            }
        ]
    },
    {
        name: "Evidence",
        id: DataTypeIds.Evidence,
        description: "Evidence sentences supporting an interaction",
        fields: [
            {
                name: "paper",
                type: (
                    <React.Fragment>
                        <a href={`#${DataTypeIds.Paper}`}>Paper</a>
                    </React.Fragment>
                ),
                description: "The paper from which the evidence was derived."
            },
            {
                name: "sentences",
                type: (
                    <React.Fragment>
                        List[<a href={`#${DataTypeIds.Sentence}`}>Sentence</a>]
                    </React.Fragment>
                ),
                description:
                    "List of sentences from the paper with labeled supplement and drug spans."
            }
        ]
    },
    {
        name: "Paper",
        id: DataTypeIds.Paper,
        description: "Metadata about a scientific paper",
        fields: [
            {
                name: "pid",
                type: "string",
                description: "Unique identifier for a paper."
            },
            {
                name: "title",
                type: "string",
                description: "Title of paper."
            },
            {
                name: "authors",
                type: (
                    <React.Fragment>
                        List[<a href={`#${DataTypeIds.Author}`}>Author</a>]
                    </React.Fragment>
                ),
                description: "Authors of paper."
            },
            {
                name: "year",
                type: "number",
                description: "Publication year of paper."
            },
            {
                name: "venue",
                type: "string",
                description: "Publication venue of paper."
            },
            {
                name: "doi",
                type: "string",
                description: "DOI of paper."
            },
            {
                name: "pmid",
                type: "number",
                description: "PubMed identifier of paper."
            },
            {
                name: "fields_of_study",
                type: "List[string]",
                description: "Fields of study of paper."
            },
            {
                name: "animal_study",
                type: "boolean",
                description: "Whether the paper documents an animal study."
            },
            {
                name: "human_study",
                type: "boolean",
                description: "Whether the paper documents a human study."
            },
            {
                name: "clinical_study",
                type: "boolean",
                description: "Whether the paper documents a clinical study."
            },
            {
                name: "retraction",
                type: "boolean",
                description: "Whether the paper has been retracted."
            }
        ]
    },
    {
        name: "Author",
        id: DataTypeIds.Author,
        description: "Author metadata",
        fields: [
            {
                name: "first",
                type: "string",
                description: "Author first name."
            },
            {
                name: "middle",
                type: "string",
                description: "Author middle names."
            },
            {
                name: "last",
                type: "string",
                description: "Author last name."
            },
            {
                name: "suffix",
                type: "string",
                description: "Author name suffixes."
            }
        ]
    },
    {
        name: "Sentence",
        id: DataTypeIds.Sentence,
        description: "Evidence sentence",
        fields: [
            {
                name: "uid",
                type: "number",
                description: "Sentence unique identifier."
            },
            {
                name: "confidence",
                type: "number",
                description: "Confidence of prediction (currently NULL)."
            },
            {
                name: "paper_id",
                type: "string",
                description:
                    "Unique ID of paper from which evidence was derived."
            },
            {
                name: "sentence_id",
                type: "number",
                description: "Sentence number in abstract of source paper."
            },
            {
                name: "spans",
                type: (
                    <React.Fragment>
                        List[<a href={`#${DataTypeIds.Span}`}>Span</a>]
                    </React.Fragment>
                ),
                description: "Sentence containing interaction evidence."
            }
        ]
    },
    {
        name: "Span",
        id: DataTypeIds.Span,
        description: "Sentence span",
        fields: [
            {
                name: "text",
                type: "string",
                description: "Span text."
            },
            {
                name: "cui",
                type: "string",
                description: "Associated agent CUI (Null if none associated)."
            }
        ]
    }
];

const endpoints = [
    {
        id: "agent-search",
        name: "Search",
        description:
            "The search endpoint executes a search query and " +
            "returns agents (supplements and drugs) that best match the provided " +
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
    "query": { "q": "ginkgo", "p": 0 },
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
    },
    {
        id: "agent-metadata",
        name: "Agent",
        description:
            "The agent endpoint returns metadata associated with a particular CUI.",
        urlString: "GET https://supp.ai/api/agent/<string:CUI>",
        parameters: [],
        example: `~ curl "https://supp.ai/api/agent/C3531686"
{
    "cui": "C3531686",
    "preferred_name": "Ginkgo Biloba Whole",
    "synonyms": [
        "Ginkgo biloba",
        "ginkgo",
        "maidenhair tree",
        "Salisburia ginkgo"
    ],
    "tradenames": [ ],
    "definition": "A tree native to China. Substances taken from the leaves and seeds have been used in some cultures to treat certain medical problems...",
    "ent_type": "supplement",
    "slug": "ginkgo-biloba-whole",
    "interacts_with_count": 140,
    "matches": { }
}`,
        returns: (
            <React.Fragment>
                Returns a single{" "}
                <a href={`#${DataTypeIds.Agent}`}>
                    <code>Agent</code>
                </a>
                .
            </React.Fragment>
        )
    },
    {
        id: "agent-interaction",
        name: "AgentInteraction",
        description:
            "The agent interactions endpoint returns all interaction IDs associated " +
            "with a particular CUI.",
        urlString:
            "GET https://supp.ai/api/agent/<string:CUI>/interactions?[p=$page]",
        parameters: [
            {
                name: "p",
                type: "number",
                isRequired: false,
                defaultValue: "1",
                description: "The result page number, beginning from one."
            }
        ],
        example: `~ curl "https://supp.ai/api/agent/C3531686/interactions?p=1"
{
    "page": 1,
    "interactions": [ ... ],
    "interactions_per_page": 50,
    "total": 140
}`,
        returns: (
            <React.Fragment>
                Returns a single{" "}
                <a href={`#${DataTypeIds.AgentInteractionResponse}`}>
                    <code>AgentInteractionResponse</code>
                </a>
                .
            </React.Fragment>
        )
    },
    {
        id: "interaction-evidence",
        name: "InteractionEvidence",
        description:
            "The interaction-evidence endpoint returns the interaction evidence" +
            " sentences between a pair of CUIs.",
        urlString: "GET https://supp.ai/api/interaction/<string:IID>",
        parameters: [],
        example: `~ curl "https://supp.ai/api/interaction/C0043031-C3531686"
{
    "interaction_id": "C0043031-C3531686",
    "slug": "warfarin-ginkgo-biloba-whole",
    "agents": [ ... ],
    "evidence": [ ... ]
}`,
        returns: (
            <React.Fragment>
                Returns a single{" "}
                <a href={`#${DataTypeIds.Interaction}`}>
                    <code>Interaction</code>
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
                        SUPP.AI's API is free to use, provided you comply with
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

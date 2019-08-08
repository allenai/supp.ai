export interface IndexMeta {
    version: string;
    interaction_count: number;
    agent_count: number;
}

export interface Query {
    name: string;
}

export interface Agent {
    cui: string;
    preferred_name: string;
    synonyms: string[];
    definition: string;
    is_supp: boolean;
}

export interface SupportingSentenceArg {
    cui: string;
    span: [number, number];
}

export interface SupportingSentence {
    uid: number;
    confidence?: number;
    paper_id: string;
    sentence_id: number;
    sentence: string;
    arg1: SupportingSentenceArg;
    arg2: SupportingSentenceArg;
}

export interface InteractingAgent {
    agent: Agent;
    sentences: SupportingSentence[];
}

export interface Interactions {
    agent: Agent;
    interacts_with: InteractingAgent[];
}

export interface SearchResponse {
    query: Query;
    total: number;
    results: Interactions[];
}

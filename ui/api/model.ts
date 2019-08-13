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
    slug: string;
    is_supp: boolean;
}

export interface SupportingSentenceSpan {
    cui?: string;
    text: string;
}

export interface SupportingSentence {
    uid: number;
    confidence?: number;
    paper_id: string;
    sentence_id: number;
    spans: SupportingSentenceSpan[];
}

export interface InteractingAgent {
    agent: Agent;
    sentences: SupportingSentence[];
}

export interface AgentWithInteractions {
    agent: Agent;
    interacts_with: InteractingAgent[];
    interacts_with_count: number;
}

export interface SearchResponse {
    query: Query;
    total: number;
    results: AgentWithInteractions[];
}

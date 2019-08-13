export interface IndexMeta {
    version: string;
    interaction_count: number;
    agent_count: number;
}

export interface Query {
    q: string;
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

export interface Paper {
    pid: string;
    title: string;
    year?: number;
    venue?: number;
}

export interface Evidence {
    paper: Paper;
    sentences: SupportingSentence[];
}

export interface InteractingAgent {
    agent: Agent;
    evidence: Evidence[];
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

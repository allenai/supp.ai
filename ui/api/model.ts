export interface IndexMeta {
    version: string;
    interaction_count: number;
    agent_count: number;
    data_updated_on: string;
}

export interface Query {
    q: string;
    p: number;
}

export enum AgentType {
    SUPPLEMENT = "supplement",
    DRUG = "drug",
    OTHER = "other"
}

export interface Agent {
    cui: string;
    preferred_name: string;
    synonyms: string[];
    tradenames: string[];
    definition: string;
    slug: string;
    ent_type: AgentType;
    interacts_with_count: number;
    matches: { [fieldName: string]: string };
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
    animal_study: boolean;
    human_study: boolean;
    clinical_study: boolean;
    retraction: boolean;
}

export interface Evidence {
    paper: Paper;
    sentences: SupportingSentence[];
}

export interface InteractingAgent {
    interaction_id: string;
    slug: string;
    agent: Agent;
    evidence: Evidence[];
}

export interface AgentWithInteractions extends Agent {
    interacts_with: InteractingAgent[];
    interactions_per_page: number;
}

export interface InteractionsPage {
    page: number;
    interactions: InteractingAgent[];
    interactions_per_page: number;
}

export interface SearchResponse {
    results: Agent[];
    query: Query;
    total_pages: number;
    total_results: number;
    num_per_page: number;
}

export interface SuggestResponse {
    query: Query;
    total: number;
    results: Agent[];
}

export interface InteractionDefinition {
    interaction_id: string;
    slug: string;
    agents: [Agent, Agent];
    evidence: Evidence[];
}

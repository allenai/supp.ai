export interface IndexMeta {
    version: string;
    interaction_count: number;
    agent_count: number;
}

export interface Query {
    q: string;
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
    definition: string;
    slug: string;
    ent_type: AgentType;
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

export enum StudyType {
    CLINICAL_TRIAL = "clinical trial",
    CASE_REPORT = "case report",
    SURVEY = "survey",
    ANIMAL_STUDY = "animal_study",
    IN_VITRO = "in vitro",
    UNKNOWN = "unknown"
}

export interface Paper {
    pid: string;
    title: string;
    year?: number;
    venue?: number;
    study_type: StudyType;
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

export interface SuggestedAgent {
    cui: string;
    preferred_name: string;
    ent_type: AgentType;
    interacts_with_count: number;
    slug: string;
}

export interface SuggestResponse {
    query: Query;
    total: number;
    results: SuggestedAgent[];
}

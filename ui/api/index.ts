import axios from "axios";

import * as model from "./model";

// Client requests are made relative to the resolved URL (as desired). Server
// requests need to be made to the local proxy, as to avoid extra latency
// associated with making a request to the resolved hostname (which would be
// routed back through the public ingress point).
const isClient = typeof window !== "undefined";
const API_ORIGIN = isClient
    ? ""
    : process.env.SUPP_AI_API_ORIGIN || "http://proxy:80";

export { model };

const clientId = "supp-ai-ui";

export async function fetchIndexMeta(): Promise<model.IndexMeta> {
    return axios
        .get<model.IndexMeta>(`${API_ORIGIN}/api/meta`, {
            params: { clientId }
        })
        .then(resp => resp.data);
}

export async function fetchAgent(cui: string): Promise<model.Agent> {
    return axios
        .get<model.Agent>(`${API_ORIGIN}/api/agent/${cui}`, {
            params: { clientId }
        })
        .then(resp => resp.data);
}

export async function searchForAgents(
    q: string,
    p: number = 0
): Promise<model.SearchResponse> {
    return axios
        .get<model.SearchResponse>(`${API_ORIGIN}/api/agent/search`, {
            params: { q, p, clientId }
        })
        .then(resp => resp.data);
}

export async function fetchSuggestions(
    q: string
): Promise<model.SuggestResponse> {
    return axios
        .get<model.SuggestResponse>(`${API_ORIGIN}/api/agent/suggest`, {
            params: { q, clientId }
        })
        .then(resp => resp.data);
}

export async function fetchInteractions(
    cui: string,
    p: number = 0,
    q: string | undefined = undefined
): Promise<model.InteractionsPage> {
    const params: { p: number; q?: string; clientId: string } = { p, clientId };
    if (q !== undefined) {
        params.q = q;
    }
    return axios
        .get<model.InteractionsPage>(
            `${API_ORIGIN}/api/agent/${cui}/interactions`,
            { params }
        )
        .then(resp => resp.data);
}

export async function fetchInteraction(
    interaction_id: string
): Promise<model.InteractionDefinition> {
    return axios
        .get<model.InteractionDefinition>(
            `${API_ORIGIN}/api/interaction/${interaction_id}`,
            { params: { clientId } }
        )
        .then(resp => resp.data);
}

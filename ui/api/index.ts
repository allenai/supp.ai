import axios from "axios";

import * as model from "./model";

// Client requests are made relative to the resolved URL (as desired). Server
// requests need to be made to the local proxy, as to avoid extra latency
// associated with making a request to the resolved hostname (which would be
// routed back through the public ingress point).
const isClient = typeof window !== "undefined";
const API_ORIGIN = isClient
    ? ""
    : process.env.SUPP_AI_ORIGIN || "http://proxy:80";

export { model };

export async function fetchIndexMeta(): Promise<model.IndexMeta> {
    return axios
        .get<model.IndexMeta>(`${API_ORIGIN}/api/meta`)
        .then(resp => resp.data);
}

export async function fetchAgent(
    cui: string
): Promise<model.AgentWithInteractions> {
    return axios
        .get<model.AgentWithInteractions>(`${API_ORIGIN}/api/agent/${cui}`)
        .then(resp => resp.data);
}

export async function searchByName(
    name: string
): Promise<model.SearchResponse> {
    return axios
        .get<model.SearchResponse>(`${API_ORIGIN}/api/agent/search`, {
            params: { name }
        })
        .then(resp => resp.data);
}

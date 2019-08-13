import React from "react";
import Link from "next/link";
import { encode } from "querystring";

import { model } from "../api";

interface Props {
    agent: model.Agent;
    children: React.ReactNode;
    query?: model.Query;
}

export const AgentLink = ({ agent, children, query }: Props) => {
    const args = {
        slug: agent.slug,
        cui: agent.cui
    };
    const queryArgs = query && query.q.trim().length > 0 ? { q: query.q } : {};
    const encodedQueryArgs =
        Object.keys(queryArgs).length > 0 ? `?${encode(queryArgs)}` : "";
    return (
        <Link
            href={`/agent?${encode({ ...args, ...queryArgs })}`}
            as={`/a/${agent.slug}/${agent.cui}${encodedQueryArgs}`}
        >
            <a>{children}</a>
        </Link>
    );
};

import React from "react";
import Link from "next/link";

import { model } from "../api";

interface Props {
    agent: model.Agent;
    children: React.ReactNode;
    query?: string;
}

export const AgentLink = ({ agent, children, query }: Props) => (
    <Link
        href={`/agent?slug=${agent.slug}&cui=${agent.cui}&q=${query}`}
        as={`/a/${agent.slug}/${agent.cui}?q=${query}`}
    >
        <a>{children}</a>
    </Link>
);

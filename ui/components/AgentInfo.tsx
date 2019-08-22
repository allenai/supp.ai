import styled from "styled-components";

import {
    icon,
    Synonyms,
    WithAgentDefinitionPopover,
    PageHeader,
    AgentLink
} from "../components";
import { model } from "../api";

interface Props {
    agent: model.Agent;
    headerTag?: "h1" | "h2" | "h3";
    link?: boolean;
    hideSyononyms?: boolean;
}

export const AgentInfo = ({ agent, headerTag, link, hideSyononyms }: Props) => {
    const name = (
        <AgentName as={headerTag || "h1"}>
            <icon.AgentTypeIcon type={agent.ent_type} />
            <WithAgentDefinitionPopover agent={agent}>
                {agent.preferred_name}
            </WithAgentDefinitionPopover>
        </AgentName>
    );
    return (
        <div>
            <AgentType>{agent.ent_type}:</AgentType>
            {link ? <AgentLink agent={agent}>{name}</AgentLink> : name}
            {agent.synonyms.length > 0 && !hideSyononyms ? (
                <Synonyms synonyms={agent.synonyms} />
            ) : null}
        </div>
    );
};

const AgentType = styled.div`
    font-size: ${({ theme }) => theme.typography.bodySmall.fontSize};
    text-transform: uppercase;
`;

const AgentName = styled(PageHeader)`
    margin: 0 0 ${({ theme }) => theme.spacing.xs};
    display: grid;
    grid-template-columns: min-content auto;
    grid-gap: ${({ theme }) => theme.spacing.sm};
    align-items: baseline;
    line-height: 1.244444;
`;
